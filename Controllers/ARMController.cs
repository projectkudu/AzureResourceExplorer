using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Routing;

namespace ARMOAuth.Controllers
{
    public class ARMController : ApiController
    {
        const string JwtToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjVUa0d0S1JrZ2FpZXpFWTJFc0xDMmdPTGpBNCJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLXBwZS5uZXQvODNhYmU1Y2QtYmNjMy00NDFhLWJkODYtZTZhNzUzNjBjZWNjLyIsImlhdCI6MTQxMjI3Nzc0MiwibmJmIjoxNDEyMjc3NzQyLCJleHAiOjE0MTIyODE2NDIsInZlciI6IjEuMCIsInRpZCI6IjgzYWJlNWNkLWJjYzMtNDQxYS1iZDg2LWU2YTc1MzYwY2VjYyIsImFtciI6WyJwd2QiXSwiYWx0c2VjaWQiOiIxOmxpdmUuY29tOjAwMDNCRkZEQzNGODYxMzEiLCJpZHAiOiJsaXZlLmNvbSIsIm9pZCI6ImE4NTc3NjUyLTU4ZWMtNGQ3Ny05NDI0LThmZTU1ODQ0MTE4OSIsInN1YiI6ImdmVC1pYkUwdGJTTy1aVTA1WFVueTFmSUlYM3dyQ2o1eTNWYXE5WDhhUWsiLCJlbWFpbCI6ImF1eHRtMDQzQGxpdmUuY29tIiwibmFtZSI6ImF1eHRtMDQzQGxpdmUuY29tIiwicHVpZCI6IjEwMDMwMDAwOEIwNDlDMEMiLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI2F1eHRtMDQzQGxpdmUuY29tIiwiYXBwaWQiOiIxOTUwYTI1OC0yMjdiLTRlMzEtYTljZi03MTc0OTU5NDVmYzIiLCJhcHBpZGFjciI6IjAiLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJhY3IiOiIxIn0.PDiR6Wmy54P9iVF9eFXiuZqUaYEUcoOjj0VhTlrHAT_jbswGQVPOBuYEUYW09ronO8pDGSN3wTvrT0JblKpk16tJyC4Gb9SkuBxaC_XAFaxGLAtvb7LhGC91U4D0ndZWFDly5nv39t94LpNldboXZvBuuu4T1Rp0woj5A7qaSkxCPUAwdvWnW5i5DrLANXHE8DyywkCf76rUYYHjU5TSpEFN3tytYGBwLYsXnxnXmvBRSNWoevhtJ9sO3nS1GS48R5AtE63tfqL5z2vL4mbOEyAGq87LN86lGMu4uSEnX0p0Rj5SeB1lPO1FHAn86uM6A4ZJ18TUolUBsiumTYQeRw";
        const string ScmUri = "https://armportal.scm.kudu1.antares-test.windows-int.net/";
        const string ArmUri = "https://api-current.resources.windows-int.net";

        static bool? _isLocalHost;

        static ARMController()
        {
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
        }

        public bool IsLocalHost
        {
            get 
            {
                if (!_isLocalHost.HasValue)
                {
                    _isLocalHost = Request.RequestUri.Authority.IndexOf("localhost", StringComparison.OrdinalIgnoreCase) >= 0;
                }

                return _isLocalHost.Value;
            }
        }

        public HttpResponseMessage GetToken()
        {
            var jwtToken = IsLocalHost ? JwtToken : Request.Headers.GetValues("X-MS-OAUTH-TOKEN").FirstOrDefault();
            var base64 = jwtToken.Split('.')[1];

            // fixup
            int mod4 = base64.Length % 4;
            if (mod4 > 0)
            {
                base64 += new string('=', 4 - mod4);
            }

            var json = Encoding.UTF8.GetString(Convert.FromBase64String(base64));
            var response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        public async Task<HttpResponseMessage> GetTenants(string id = null)
        {
            if (!String.IsNullOrEmpty(id))
            {
                if (IsLocalHost)
                {
                    throw new InvalidOperationException("Switch tenant is not supported for localhost");
                }

                // switch tenant
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Add("Set-Cookie", String.Format("OAuthTenant={0}; path=/; secure; HttpOnly", id));
                string fullyQualifiedUrl = Request.RequestUri.GetLeftPart(UriPartial.Authority);
                response.Headers.Location = new Uri(new Uri(fullyQualifiedUrl), GetRelativePath("token"));
                return response;
            }

            using (var client = GetClient(IsLocalHost ? ScmUri : Request.RequestUri.GetLeftPart(UriPartial.Authority)))
            {
                return await client.GetAsync("tenantdetails");
            }
        }

        public async Task<HttpResponseMessage> Get()
        {
            IHttpRouteData routeData = Request.GetRouteData();
            string path = routeData.Values["path"] as string;
            if (String.IsNullOrEmpty(path))
            {
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                string fullyQualifiedUrl = Request.RequestUri.GetLeftPart(UriPartial.Authority);
                response.Headers.Location = new Uri(new Uri(fullyQualifiedUrl), GetRelativePath("tenants"));
                return response;
            }

            using (var client = GetClient(IsLocalHost ? ArmUri : (Environment.GetEnvironmentVariable("ARM_URL") ?? "https://management.azure.com")))
            {
                return await client.GetAsync(path + "?api-version=2014-04-01");
            }
        }

        public string GetRelativePath(string path)
        {
            return IsLocalHost ? path : ("arm/" + path);
        }

        public HttpClient GetClient(string baseUri)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(baseUri);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", IsLocalHost ? JwtToken : Request.Headers.GetValues("X-MS-OAUTH-TOKEN").FirstOrDefault());
            return client;
        }
    }
}