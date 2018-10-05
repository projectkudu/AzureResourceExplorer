using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ARMExplorer.Model;

namespace ARMExplorer.Controllers
{
    public class ArmRepository : IArmRepository 
    {
        private readonly IHttpClientWrapper _clientWrapper;
        private readonly int _maxNextLinkDepth = 5;

        public ArmRepository(IHttpClientWrapper clientWrapper)
        {
            _clientWrapper = clientWrapper;
        }

        public async Task<IList<string>> GetSubscriptionIdsAsync(HttpRequestMessage requestMessage)
        {
            var initialGetResourcesUrl = string.Format(Utils.AllSubscriptionsTemplate, HyakUtils.CSMUrl, Utils.CSMApiVersion);
            var resources = await GetResources(requestMessage, initialGetResourcesUrl);
            return resources.Select(r => r.SubscriptionId).ToList();
        }

        private static bool AddResourceToList(IEnumerable<ArmResource> resources, ISet<ArmResource> allResources)
        {
            var initalCount = allResources.Count;

            foreach (var resource in resources)
            {
                allResources.Add(resource);
            }

            var updatedCount = allResources.Count;

            return updatedCount > initalCount;
        }

        private async Task<HashSet<ArmResource>> GetResources(HttpRequestMessage requestMessage, string getResourcesUrl)
        {
            var allResources = new HashSet<ArmResource>();
            var currentNextLinkDepth = 0;

            while (!string.IsNullOrEmpty(getResourcesUrl))
            {
                var response = await GetAsync(requestMessage, getResourcesUrl);
                response.EnsureSuccessStatusCode();
                var armResourceListResult = await response.Content.ReadAsAsync<ArmResourceListResult>();

                var newResourceFound = AddResourceToList(armResourceListResult.Value, allResources);

                // ARM API returns the same skiptoken and resources repeatedly when there are no more resources. To avoid infinite cycle break when
                // 1. No new resource was found in the current response or
                // 2. Limit the max number of links to follow to _maxNextLinkDepth or
                // 3. When nextLink is empty

                if (!newResourceFound)
                {
                    break;
                }

                if (currentNextLinkDepth++ > _maxNextLinkDepth)
                {
                    break;
                }

                getResourcesUrl = armResourceListResult.NextLink;
            }

            return allResources;
        }

        public async Task<HashSet<string>> GetProviderNamesFor(HttpRequestMessage requestMessage, string subscriptionId)
        {
            var initialGetResourcesUrl = string.Format(Utils.ResourcesTemplate, HyakUtils.CSMUrl, subscriptionId, Utils.CSMApiVersion);
            var resources = await GetResources(requestMessage, initialGetResourcesUrl);
            var uniqueProviders = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var resource in resources)
            {
                var match = Regex.Match(resource.Id, "/subscriptions/.*?/resourceGroups/(.*?)/providers/(.*?)/(.*?)/");
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
            var initialGetResourcesUrl = string.Format(Utils.ResourcesTemplate, HyakUtils.CSMUrl, subscriptionId, Utils.CSMApiVersion);
            var resources = await GetResources(requestMessage, initialGetResourcesUrl);
            var result = new Dictionary<string, Dictionary<string, HashSet<string>>>();

            foreach (var resource in resources)
            {
                string id = resource.Id;
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

        private async Task<HttpResponseMessage> GetAsync(HttpRequestMessage requestMessage, string url)
        {
            var sendRequest = new HttpRequestMessage(HttpMethod.Get, url);
            return await _clientWrapper.ExecuteAsync(requestMessage, sendRequest);
        }
    }
}