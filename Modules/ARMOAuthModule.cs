using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IdentityModel.Selectors;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Web;

namespace ManagePortal.Modules
{
    public class ARMOAuthModule : IHttpModule
    {
        public const string ManagementResource = "https://management.core.windows.net/";
        public const string TenantIdClaimType = "http://schemas.microsoft.com/identity/claims/tenantid";
        public const string NonceClaimType = "nonce";
        public const string OAuthTokenCookie = "OAuthToken";
        public const string DeleteCookieFormat = "{0}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        public const int CookieChunkSize = 2000;

        public static string AADClientId
        {
            get { return Environment.GetEnvironmentVariable("AADClientId"); }
        }

        public static string AADClientSecret
        {
            get { return Environment.GetEnvironmentVariable("AADClientSecret"); }
        }

        public void Dispose()
        {
        }

        public void Init(HttpApplication context)
        {
            context.AuthenticateRequest += AuthenticateRequest;
        }

        public void AuthenticateRequest(object sender, EventArgs e)
        {
            ClaimsPrincipal principal = null;
            var application = (HttpApplication)sender;
            var request = application.Request;
            var response = application.Response;

            // only perform authentication if localhost
            if (!request.Url.IsLoopback)
            {
                principal = new ClaimsPrincipal(new ClaimsIdentity("SCM"));
                HttpContext.Current.User = principal;
                Thread.CurrentPrincipal = principal;
                return;
            }

            if (request.Url.Scheme != "https")
            {
                response.Redirect(String.Format("https://{0}{1}", request.Url.Authority, request.Url.PathAndQuery), endResponse: true);
                return;
            }

            if (request.Url.PathAndQuery.StartsWith("/logout", StringComparison.OrdinalIgnoreCase))
            {
                RemoveSessionCookie(application);

                var logoutUrl = GetLogoutUrl(application);
                response.Redirect(logoutUrl, endResponse: true);
                return;
            }

            string tenantId;
            if (SwitchTenant(application, out tenantId))
            {
                RemoveSessionCookie(application);

                var loginUrl = GetLoginUrl(application, tenantId, "/token");
                response.Redirect(loginUrl, endResponse: true);
                return;
            }

            var id_token = request.Form["id_token"];
            var code = request.Form["code"];
            var state = request.Form["state"];

            if (!String.IsNullOrEmpty(id_token) && !String.IsNullOrEmpty(code))
            {
                principal = AuthenticateIdToken(application, id_token);
                var tenantIdClaim = principal.Claims.FirstOrDefault(c => c.Type == TenantIdClaimType);
                if (tenantIdClaim == null)
                {
                    throw new InvalidOperationException("Missing tenantid claim");
                }

                var base_uri = request.Url.GetLeftPart(UriPartial.Authority);
                var redirect_uri = base_uri + "/manage";
                var token = AADOAuth2AccessToken.GetAccessTokenByCode(tenantIdClaim.Value, code, redirect_uri);
                WriteOAuthTokenCookie(application, token);
                response.Redirect(base_uri + state, endResponse: true);
                return;
            }
            else
            {
                var token = ReadOAuthTokenCookie(application);
                if (token != null)
                {
                    if (!token.IsValid())
                    {
                        token = AADOAuth2AccessToken.GetAccessTokenByRefreshToken(token.TenantId, token.refresh_token, ManagementResource);
                        WriteOAuthTokenCookie(application, token);
                    }
                    
                    principal = new ClaimsPrincipal(new ClaimsIdentity("AAD"));
                    request.ServerVariables["HTTP_X_MS_OAUTH_TOKEN"] = token.access_token;
                }
            }

            if (principal == null)
            {
                var loginUrl = GetLoginUrl(application);
                response.Redirect(loginUrl, endResponse: true);
                return;
            }

            HttpContext.Current.User = principal;
            Thread.CurrentPrincipal = principal;
        }

        public static string GetLoginUrl(HttpApplication application, string tenantId = null, string state = null)
        {
            const string scope = "user_impersonation openid";
            const string site_id = "500879";

            var config = OpenIdConfiguration.Current;
            var request = application.Context.Request;
            var response_type = "id_token code";
            var issuerAddress = config.GetAuthorizationEndpoint(tenantId);
            var redirect_uri = request.Url.GetLeftPart(UriPartial.Authority) + "/manage";
            var client_id = AADClientId;
            var nonce = GenerateNonce();
            var response_mode = "form_post";

            StringBuilder strb = new StringBuilder();
            strb.Append(issuerAddress);
            strb.AppendFormat("?response_type={0}", WebUtility.UrlEncode(response_type));
            strb.AppendFormat("&redirect_uri={0}", WebUtility.UrlEncode(redirect_uri));
            strb.AppendFormat("&client_id={0}", WebUtility.UrlEncode(client_id));
            strb.AppendFormat("&resource={0}", WebUtility.UrlEncode(ManagementResource));
            strb.AppendFormat("&scope={0}", WebUtility.UrlEncode(scope));
            strb.AppendFormat("&nonce={0}", WebUtility.UrlEncode(nonce));
            strb.AppendFormat("&site_id={0}", WebUtility.UrlEncode(site_id));
            strb.AppendFormat("&response_mode={0}", WebUtility.UrlEncode(response_mode));
            strb.AppendFormat("&state={0}", WebUtility.UrlEncode(state ?? request.Url.PathAndQuery));

            return strb.ToString();
        }

        public static string GetLogoutUrl(HttpApplication application)
        {
            var config = OpenIdConfiguration.Current;
            var request = application.Context.Request;
            //var redirect_uri = new Uri(request.Url, LogoutComplete);

            StringBuilder strb = new StringBuilder();
            strb.Append(config.EndSessionEndpoint);
            //strb.AppendFormat("?post_logout_redirect_uri={0}", WebUtility.UrlEncode(redirect_uri.AbsoluteUri));

            return strb.ToString();
        }

        public static ClaimsPrincipal AuthenticateIdToken(HttpApplication application, string id_token)
        {
            var config = OpenIdConfiguration.Current;
            var handler = new JwtSecurityTokenHandler();
            handler.CertificateValidator = X509CertificateValidator.None;
            if (!handler.CanReadToken(id_token))
            {
                throw new InvalidOperationException("No SecurityTokenHandler can authenticate this id_token!");
            }

            var parameters = new TokenValidationParameters();
            parameters.AllowedAudience = AADClientId;
            // this is just for Saml
            // paramaters.AudienceUriMode = AudienceUriMode.Always;
            parameters.ValidateIssuer = false;

            var tokens = new List<SecurityToken>();
            foreach (var key in config.IssuerKeys.Keys)
            {
                tokens.AddRange(key.GetSecurityTokens());
            }
            parameters.SigningTokens = tokens;

            // validate
            var principal = (ClaimsPrincipal)handler.ValidateToken(id_token, parameters);

            // verify nonce
            VerifyNonce(principal.FindFirst(NonceClaimType).Value);

            return principal;
        }

        public static bool SwitchTenant(HttpApplication application, out string tenantId)
        {
            tenantId = null;

            var request = application.Request;
            if (request.Url.PathAndQuery.StartsWith("/api/tenants", StringComparison.OrdinalIgnoreCase))
            {
                var parts = request.Url.PathAndQuery.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length >= 3)
                {
                    tenantId = parts[2];
                }
            }

            return tenantId != null;
        }

        // NOTE: secure the cookie
        public static byte[] EncryptAndSignCookie(AADOAuth2AccessToken oauthToken)
        {
            return oauthToken.ToBytes();
        }

        // NOTE: secure the cookie
        public static AADOAuth2AccessToken DecryptAndVerifySignatureCookie(byte[] bytes)
        {
            return AADOAuth2AccessToken.FromBytes(bytes);
        }

        // NOTE: generate nonce
        public static string GenerateNonce()
        {
            return Guid.NewGuid().ToString();
        }

        // NOTE: verify nonce
        public static void VerifyNonce(string nonce)
        {
        }

        public static AADOAuth2AccessToken ReadOAuthTokenCookie(HttpApplication application)
        {
            var request = application.Context.Request;

            // read oauthtoken cookie
            var cookies = request.Cookies;
            var strb = new StringBuilder();
            int index = 0;
            while (true)
            {
                var cookieName = OAuthTokenCookie;
                if (index > 0)
                {
                    cookieName += index.ToString(CultureInfo.InvariantCulture);
                }

                var cookie = cookies[cookieName];
                if (cookie == null)
                {
                    break;
                }

                strb.Append(cookie.Value);
                ++index;
            }

            if (strb.Length == 0)
            {
                return null;
            }

            var bytes = Convert.FromBase64String(strb.ToString());
            var oauthToken = DecryptAndVerifySignatureCookie(bytes);
            if (!oauthToken.IsValid())
            {
                try
                {
                    oauthToken = AADOAuth2AccessToken.GetAccessTokenByRefreshToken(oauthToken.TenantId, oauthToken.refresh_token, oauthToken.resource);
                }
                catch (Exception)
                {
                    oauthToken = null;
                }

                if (oauthToken == null)
                {
                    RemoveSessionCookie(application);

                    return null;
                }

                WriteOAuthTokenCookie(application, oauthToken);
            }

            return oauthToken;
        }

        public static void WriteOAuthTokenCookie(HttpApplication application, AADOAuth2AccessToken oauthToken)
        {
            var request = application.Context.Request;
            var response = application.Context.Response;

            var bytes = EncryptAndSignCookie(oauthToken);
            var cookie = Convert.ToBase64String(bytes);
            var chunkCount = cookie.Length / CookieChunkSize + (cookie.Length % CookieChunkSize == 0 ? 0 : 1);
            for (int i = 0; i < chunkCount; ++i)
            {
                var setCookie = new StringBuilder();
                setCookie.Append(OAuthTokenCookie);
                if (i > 0)
                {
                    setCookie.Append(i.ToString(CultureInfo.InvariantCulture));
                }

                setCookie.Append('=');

                int startIndex = i * CookieChunkSize;
                setCookie.Append(cookie.Substring(startIndex, Math.Min(CookieChunkSize, cookie.Length - startIndex)));
                setCookie.Append("; path=/; secure; HttpOnly");
                response.Headers.Add("Set-Cookie", setCookie.ToString());
            }

            var cookies = request.Cookies;
            var index = chunkCount;
            while (true)
            {
                var cookieName = OAuthTokenCookie;
                if (index > 0)
                {
                    cookieName += index.ToString(CultureInfo.InvariantCulture);
                }

                if (cookies[cookieName] == null)
                {
                    break;
                }

                // remove old cookie
                response.Headers.Add("Set-Cookie", String.Format(DeleteCookieFormat, cookieName));
                ++index;
            }
        }

        public static void RemoveSessionCookie(HttpApplication application)
        {
            var request = application.Context.Request;
            var response = application.Context.Response;

            var cookies = request.Cookies;
            foreach (string name in new[] { OAuthTokenCookie })
            {
                int index = 0;
                while (true)
                {
                    string cookieName = name;
                    if (index > 0)
                    {
                        cookieName += index.ToString(CultureInfo.InvariantCulture);
                    }

                    if (cookies[cookieName] == null)
                    {
                        break;
                    }

                    // remove old cookie
                    response.Headers.Add("Set-Cookie", String.Format(DeleteCookieFormat, cookieName));
                    ++index;
                }
            }
        }
    }
}