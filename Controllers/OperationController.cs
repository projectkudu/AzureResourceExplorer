using System;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.Azure.Management.WebSites;
using Newtonsoft.Json.Linq;

namespace ManagePortal.Controllers
{
    public class OperationController : ApiController
    {
        [Authorize]
        public HttpResponseMessage Get(bool hidden = false)
        {
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);

            var watch = new Stopwatch();
            watch.Start();

            var json = (JArray) HyakUtils.GetOperations<WebSiteManagementClient>(hidden).DeepClone();
            json.AddFirst(JObject.FromObject(new
            {
                MethodName = "Get",
                HttpMethod = "GET",
                Url = HyakUtils.CSMUrl + "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}"
            }));
            json.AddFirst(JObject.FromObject(new
            {
                MethodName = "Get",
                HttpMethod = "GET",
                Url = HyakUtils.CSMUrl + "/subscriptions/{subscriptionId}/resourceGroups"
            }));
            json.AddFirst(JObject.FromObject(new
            {
                MethodName = "Get",
                HttpMethod = "GET",
                Url = HyakUtils.CSMUrl + "/subscriptions"
            }));
            json.AddFirst(JObject.FromObject(new
            {
                MethodName = "Get",
                HttpMethod = "GET",
                Url = HyakUtils.CSMUrl + "/subscriptions/{subscriptionId}"
            }));
            watch.Stop();
            var response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
            response.Headers.Add(Utils.X_MS_Ellapsed, watch.ElapsedMilliseconds + "ms");
            return response;
        }

        [Authorize]
        public async Task<HttpResponseMessage> Invoke(OperationInfo info)
        {
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);

            using (var client = GetClient(Utils.GetCSMUrl(Request.RequestUri.Host)))
            {
                var apiVersion = Utils.GetApiVersion(info.Url);
                var request = new HttpRequestMessage(new System.Net.Http.HttpMethod(info.HttpMethod), info.Url + "?api-version=" + apiVersion);
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