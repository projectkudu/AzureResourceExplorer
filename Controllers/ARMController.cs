using System;
using System.Collections.Generic;
using System.Globalization;
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
        private const char base64Character62 = '+';
        private const char base64Character63 = '/';
        private const char base64UrlCharacter62 = '-';
        private const char base64UrlCharacter63 = '_';

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

        [Authorize]
        [HttpGet]
        public async Task<List<JObject>> Search(string keyword)
        {
            var armBaseUri = Utils.GetCSMUrl(Request.RequestUri.Host);
            using (var client = GetClient(armBaseUri))
            {
                HttpResponseMessage subscriptionResponse = await client.GetAsync(string.Format(CultureInfo.InvariantCulture, "/subscriptions?api-version={0}", Utils.CSMApiVersion));
                if (!subscriptionResponse.IsSuccessStatusCode) return null;

                string stringContent = await subscriptionResponse.Content.ReadAsStringAsync();
                dynamic subscriptions = await subscriptionResponse.Content.ReadAsAsync<JObject>();
                if (subscriptions.value.Count == 0) return null;

                List<JObject> results = new List<JObject>();
                List<Task<HttpResponseMessage>> queryTasks = new List<Task<HttpResponseMessage>>();
                List<Task<JObject>> readContentTasks = new List<Task<JObject>>();

                foreach (var item in subscriptions.value)
                {
                    string subscriptionId = item.subscriptionId;

                    // ARM not support to filter by resource name, support will come end of March 2015
                    // current support filter: https://msdn.microsoft.com/en-us/library/azure/dn790569.aspx
                    string requestUri = null;

                    if (string.IsNullOrWhiteSpace(keyword))
                    {
                        requestUri = string.Format(CultureInfo.InvariantCulture, "/subscriptions/{0}/resources?$top=1000&api-version={1}", subscriptionId, "2015-01-01");
                    }
                    else
                    {
                        // TODO: update to perform filter by resource name once ARM API has support
                        requestUri = string.Format(CultureInfo.InvariantCulture, "/subscriptions/{0}/resources?$filter=tagname  eq '{1}'&$top=1000&api-version={2}", subscriptionId, keyword, "2015-01-01");
                    }

                    queryTasks.Add(client.GetAsync(requestUri));
                }

                await Task.WhenAll(queryTasks);

                foreach (var item in queryTasks)
                {
                    readContentTasks.Add(item.Result.Content.ReadAsAsync<JObject>());
                }

                await Task.WhenAll(readContentTasks);

                foreach (var item in readContentTasks)
                {
                    dynamic content = item.Result;
                    results.AddRange(content.value.ToObject<List<JObject>>());
                }

                return results;
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

                        var tenantsString = await response.Content.ReadAsStringAsync();
                        var tenants = JArray.Parse(tenantsString);
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

                        var tenantsString = await response.Content.ReadAsStringAsync();
                        var tenants = (JArray)(JObject.Parse(tenantsString))["value"];
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

            // decode url escape char
            base64 = base64.Replace(base64UrlCharacter62, base64Character62);
            base64 = base64.Replace(base64UrlCharacter63, base64Character63);

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