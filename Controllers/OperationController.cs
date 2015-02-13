using System;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.Azure.Management.Compute;
using Microsoft.Azure.Management.Network;
using Microsoft.Azure.Management.Storage;
using Microsoft.Azure.Management.WebSites;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace ARMExplorer.Controllers
{
    public class OperationController : ApiController
    {
        [Authorize]
        public async Task<HttpResponseMessage> Get(bool hidden = false)
        {
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);

            var watch = new Stopwatch();
            watch.Start();
            var arrayList = new List<JArray>();
            var webSitesJson = (JArray)await HyakUtils.GetOperationsAsync<WebSiteManagementClient>(hidden);
            var networkJson = (JArray) await HyakUtils.GetOperationsAsync<NetworkResourceProviderClient>(hidden);
            var computerJson = (JArray)await HyakUtils.GetOperationsAsync<ComputeManagementClient>(hidden);
            var storageJson = (JArray)await HyakUtils.GetOperationsAsync<SrpManagementClient>(hidden);
            var json = new JArray(webSitesJson.Union(networkJson).Union(computerJson).Union(storageJson));
            watch.Stop();
            var response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
            response.Headers.Add(Utils.X_MS_Ellapsed, watch.ElapsedMilliseconds + "ms");
            return response;
        }

        [Authorize]
        public async Task<HttpResponseMessage> GetProviders(string subscriptionId)
        {
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);

            using (var client = GetClient(Utils.GetCSMUrl(Request.RequestUri.Host)))
            {
                var request = new HttpRequestMessage(HttpMethod.Get, string.Format(Utils.resourcesTemplate, HyakUtils.CSMUrl, subscriptionId, Utils.CSMApiVersion));
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                dynamic resources = await response.Content.ReadAsAsync<JObject>();
                JArray values = resources.value;
                var result = new Dictionary<string, HashSet<string>>();
                foreach (dynamic value in values)
                {
                    string id = value.id;
                    var match = Regex.Match(id, "/subscriptions/.*?/resourceGroups/(.*?)/providers/(.*?)/");
                    if (match.Success)
                    {
                        if (!result.ContainsKey(match.Groups[1].Value))
                        {
                            result.Add(match.Groups[1].Value, new HashSet<string>());
                        }
                        result[match.Groups[1].Value].Add(match.Groups[2].Value);
                    }
                }
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
        }

        [Authorize]
        public async Task<HttpResponseMessage> Invoke(OperationInfo info)
        {
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);

            using (var client = GetClient(Utils.GetCSMUrl(Request.RequestUri.Host)))
            {
                var request = new HttpRequestMessage(new System.Net.Http.HttpMethod(info.HttpMethod), info.Url + (info.Url.IndexOf("?api-version=") != -1 ? string.Empty : "?api-version=" + info.ApiVersion));
                if (info.RequestBody != null)
                {
                    request.Content = new StringContent(info.RequestBody.ToString(), Encoding.UTF8, "application/json");
                }

                return await Utils.Execute(client.SendAsync(request));
            }
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