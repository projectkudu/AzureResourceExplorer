using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Routing;
using Newtonsoft.Json.Linq;

namespace ARMExplorer.Controllers
{
    public class ARMController : ApiController
    {
        [Authorize]
        public HttpResponseMessage GetToken(bool plainText = false)
        {
            if (plainText)
            {
                var jwtToken = Request.Headers.GetValues(Utils.X_MS_OAUTH_TOKEN).FirstOrDefault();
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(jwtToken, Encoding.UTF8, "text/plain");
                return response;
            }
            else
            {
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(GetClaims().ToString(), Encoding.UTF8, "application/json");
                return response;
            }
        }

        [Authorize]
        public async Task<HttpResponseMessage> Get()
        {
            IHttpRouteData routeData = Request.GetRouteData();
            string path = routeData.Values["path"] as string;
            if (String.IsNullOrEmpty(path))
            {
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Location = new Uri(Path.Combine(Request.RequestUri.AbsoluteUri, "subscriptions"));
                return response;
            }

            if (path.StartsWith("tenants", StringComparison.OrdinalIgnoreCase))
            {
                return await GetTenants(path);
            }

            using (var client = GetClient(Utils.GetCSMUrl(Request.RequestUri.Host)))
            {
                var apiVersion = Utils.GetApiVersion(path);
                return await Utils.Execute(client.GetAsync(path + "?api-version=" + apiVersion));
            }
        }

        private async Task<HttpResponseMessage> GetTenants(string path)
        {
            var parts = path.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1)
            {
                if (!Request.RequestUri.IsLoopback)
                {
                    using (var client = GetClient(Request.RequestUri.GetLeftPart(UriPartial.Authority)))
                    {
                        var response = await Utils.Execute(client.GetAsync("tenantdetails"));
                        if (!response.IsSuccessStatusCode)
                        {
                            return response;
                        }

                        var tenants = await response.Content.ReadAsAsync<JArray>();
                        tenants = SetCurrentTenant(tenants);
                        response = Transfer(response);
                        response.Content = new StringContent(tenants.ToString(), Encoding.UTF8, "application/json");
                        return response;
                    }
                }
                else
                {
                    using (var client = GetClient(Utils.GetCSMUrl(Request.RequestUri.Host)))
                    {
                        var apiVersion = Utils.GetApiVersion(path);
                        var response = await Utils.Execute(client.GetAsync(path + "?api-version=" + apiVersion));
                        if (!response.IsSuccessStatusCode)
                        {
                            return response;
                        }

                        var tenants = (JArray)(await response.Content.ReadAsAsync<JObject>())["value"];
                        tenants = SetCurrentTenant(ToTenantDetails(tenants));
                        response = Transfer(response);
                        response.Content = new StringContent(tenants.ToString(), Encoding.UTF8, "application/json");
                        return response;
                    }
                }
            }
            else
            {
                // switch tenant
                var tenantId = Guid.Parse(parts[1]);
                var uri = Request.RequestUri.AbsoluteUri;
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                response.Headers.Add("Set-Cookie", String.Format("OAuthTenant={0}; path=/; secure; HttpOnly", tenantId));
                response.Headers.Location = new Uri(uri.Substring(0, uri.IndexOf("/api/" + parts[0], StringComparison.OrdinalIgnoreCase)));
                return response;
            }
        }

        private JObject GetClaims()
        {
            var jwtToken = Request.Headers.GetValues(Utils.X_MS_OAUTH_TOKEN).FirstOrDefault();
            var base64 = jwtToken.Split('.')[1];

            // fixup
            int mod4 = base64.Length % 4;
            if (mod4 > 0)
            {
                base64 += new string('=', 4 - mod4);
            }

            var json = Encoding.UTF8.GetString(Convert.FromBase64String(base64));
            return JObject.Parse(json);
        }

        private JArray ToTenantDetails(JArray tenants)
        {
            var result = new JArray();
            foreach (var tenant in tenants)
            {
                var value = new JObject();
                value["DisplayName"] = tenant["tenantId"];
                value["DomainName"] = tenant["tenantId"];
                value["TenantId"] = tenant["tenantId"];
                result.Add(value);
            }
            return result;
        }

        private HttpResponseMessage Transfer(HttpResponseMessage response)
        {
            var ellapsed = response.Headers.GetValues(Utils.X_MS_Ellapsed).First();
            response = Request.CreateResponse(response.StatusCode);
            response.Headers.Add(Utils.X_MS_Ellapsed, ellapsed);
            return response;
        }

        private JArray SetCurrentTenant(JArray tenants)
        {
            var tid = (string)GetClaims()["tid"];
            foreach (var tenant in tenants)
            {
                tenant["Current"] = (string)tenant["TenantId"] == tid;
            }
            return tenants;
        }

        private HttpClient GetClient(string baseUri)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(baseUri);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",
                Request.Headers.GetValues(Utils.X_MS_OAUTH_TOKEN).FirstOrDefault());
            client.DefaultRequestHeaders.Add("User-Agent", Request.RequestUri.Host);
            return client;
        }
    }
}