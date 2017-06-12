using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ARMExplorer.Controllers
{
    public class ArmRepository : IArmRepository 
    {
        private readonly IHttpClientWrapper _clientWrapper;

        public ArmRepository(IHttpClientWrapper clientWrapper)
        {
            _clientWrapper = clientWrapper;
        }

        public async Task<IList<string>> GetSubscriptionIdsAsync(HttpRequestMessage requestMessage)
        {
            var response = await GetSubscriptionsAsync(requestMessage);
            response.EnsureSuccessStatusCode();

            dynamic resources = await response.Content.ReadAsAsync<JObject>();
            var subscriptionIds = new List<string>();

            for (var i = 0; i < ((JArray)resources.value).Count; i++)
            {
                var subscription = JsonConvert.DeserializeObject(((JArray)resources.value)[i].ToString()) as JObject;
                if (subscription != null)
                {
                    var subscriptionIdPath = subscription["id"].ToString();
                    subscriptionIds.Add(subscriptionIdPath.Substring(subscriptionIdPath.LastIndexOf("/", StringComparison.Ordinal) + 1));
                }
            }
            return subscriptionIds;
        }

        public async Task<HashSet<string>> GetproviderNamesFor(HttpRequestMessage requestMessage, string subscriptionId)
        {
            var response = await GetResourcesForAsync(requestMessage, subscriptionId);
            response.EnsureSuccessStatusCode();
            dynamic resources = await response.Content.ReadAsAsync<JObject>();
            JArray values = resources.value;
            var uniqueProviders = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (dynamic value in values)
            {
                string id = value.id;
                var match = Regex.Match(id, "/subscriptions/.*?/resourceGroups/(.*?)/providers/(.*?)/(.*?)/");
                if (match.Success)
                {
                    var provider = match.Groups[2].Value.ToUpperInvariant();
                    uniqueProviders.Add(provider);
                }
            }

            return uniqueProviders;
        }

        public async Task<Dictionary<string, Dictionary<string, HashSet<string>>>> GetProvidersFor(HttpRequestMessage requestMessage, string subscriptionId)
        {
            var response = await GetResourcesForAsync(requestMessage, subscriptionId);
            response.EnsureSuccessStatusCode();

            dynamic resources = await response.Content.ReadAsAsync<JObject>();
            JArray values = resources.value;
            var result = new Dictionary<string, Dictionary<string, HashSet<string>>>();
            foreach (dynamic value in values)
            {
                string id = value.id;
                var match = Regex.Match(id, "/subscriptions/.*?/resourceGroups/(.*?)/providers/(.*?)/(.*?)/");
                if (match.Success)
                {
                    var resourceGroup = match.Groups[1].Value.ToUpperInvariant();
                    var provider = match.Groups[2].Value.ToUpperInvariant();
                    var collection = match.Groups[3].Value.ToUpperInvariant();
                    if (!result.ContainsKey(resourceGroup))
                    {
                        result.Add(resourceGroup, new Dictionary<string, HashSet<string>>());
                    }
                    if (!result[resourceGroup].ContainsKey(provider))
                    {
                        result[resourceGroup].Add(provider, new HashSet<string>());
                    }
                    result[resourceGroup][provider].Add(collection);
                }
            }
            // Add Microsoft.Resources/deployments to the response
            // This makes the Microsoft.Resources provider show up for any groups that have other resources
            foreach (var group in result.Values)
            {
                group.Add(
                    "MICROSOFT.RESOURCES",
                    new HashSet<string>
                    {
                        "DEPLOYMENTS",
                    }
                );
            }

            return result;
        }

        public async Task<HttpResponseMessage> InvokeAsync(HttpRequestMessage requestMessage, HttpRequestMessage executeRequest)
        {
            return await _clientWrapper.ExecuteAsync(requestMessage, executeRequest);
        }

        private async Task<HttpResponseMessage> GetSubscriptionsAsync(HttpRequestMessage requestMessage)
        {
            var sendRequest = new HttpRequestMessage(HttpMethod.Get, string.Format(Utils.AllSubscriptionsTemplate, HyakUtils.CSMUrl, Utils.CSMApiVersion));
            return await _clientWrapper.SendAsync(requestMessage, sendRequest);
        }

        private async Task<HttpResponseMessage> GetResourcesForAsync(HttpRequestMessage requestMessage, string subscriptionId)
        {
            var sendRequest = new HttpRequestMessage(HttpMethod.Get, string.Format(Utils.ResourcesTemplate, HyakUtils.CSMUrl, subscriptionId, Utils.CSMApiVersion));
            return await _clientWrapper.SendAsync(requestMessage, sendRequest);
        }
    }
}