using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Caching;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using ARMExplorer.SwaggerParser;
using Newtonsoft.Json;

namespace ARMExplorer.Controllers
{
    [UnhandledExceptionFilter]
    public class OperationController : ApiController
    {
        private readonly IArmRepository _armRepository;
        private static readonly MemoryCache SwaggerCache = new MemoryCache("SwaggerDefinitionCache");

        public OperationController(IArmRepository armRepository)
        {
            _armRepository = armRepository;
        }

        private static IEnumerable<MetadataObject> GetSpecFor(string providerName)
        {
            return GetOrLoadSpec(providerName, () => SwaggerSpecLoader.GetSpecFromSwagger(providerName).ToList());
        }

        private static IEnumerable<MetadataObject> GetOrLoadSpec(string providerName, Func<List<MetadataObject>> parserFunc)
        {
            var newValue = new Lazy<List<MetadataObject>>(parserFunc);
            // AddOrGetExisting covers a narrow case where 2 calls come in at the same time for the same provider then its swagger will be parsed twice. 
            // The Lazy pattern guarantees each swagger will ever be parsed only once and other concurrent accesses for the same providerkey will be blocked until the previous thread adds 
            // the value to cache.
            var existingValue = SwaggerCache.AddOrGetExisting(providerName, newValue, new CacheItemPolicy()) as Lazy<List<MetadataObject>>;
            var swaggerSpec = new List<MetadataObject>();
            if (existingValue != null)
            {
                swaggerSpec.AddRange(existingValue.Value);
            }
            else
            {
                try
                {
                    // If there was an error parsing , dont add it to the cache so the swagger can be retried on the next request instead of returning the error from cache. 
                    swaggerSpec.AddRange(newValue.Value);
                }
                catch
                {
                    SwaggerCache.Remove(providerName);
                }
            }
            return swaggerSpec;
        }

        private async Task<HashSet<string>> GetProviderNamesFor(HttpRequestMessage requestMessage, string subscriptionId)
        {
            try
            {
                return await _armRepository.GetProviderNamesFor(requestMessage, subscriptionId);
            }
            catch (Exception)
            {
                // Return empty set as fallback
                return new HashSet<string>();
            }
        }

        [Authorize]
        public async Task<HttpResponseMessage> GetAllProviders()
        {
            var watch = Stopwatch.StartNew();
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);

            var allProviders = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var tasks = new List<Task<HashSet<string>>>();
            foreach (var subscriptionId in await _armRepository.GetSubscriptionIdsAsync(Request))
            {
                tasks.Add(GetProviderNamesFor(Request, subscriptionId));
            }

            foreach (var hashSet in await Task.WhenAll(tasks))
            {
                allProviders.UnionWith(hashSet);
            }

            // This makes the Microsoft.Resources provider show up for any groups that have other resources
            allProviders.Add("MICROSOFT.RESOURCES");

            watch.Stop();

            var httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK, allProviders);
            httpResponseMessage.Headers.Add("TimeElapsedMs", watch.ElapsedMilliseconds.ToString());
            return httpResponseMessage;
        }

        [Authorize]
        [HttpPost]
        public HttpResponseMessage GetPost([FromBody] List<string> providersList)
        {
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);

            var response = Request.CreateResponse(HttpStatusCode.NoContent);

            if (providersList != null)
            {
                var watch = new Stopwatch();
                watch.Start();
                var swaggerSpecs = providersList.Select(GetSpecFor).SelectMany(objects => objects);
                var metadataObjects = HyakUtils.GetSpeclessCsmOperations().Concat(swaggerSpecs);
                watch.Stop();

                response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new StringContent(JsonConvert.SerializeObject(metadataObjects), Encoding.UTF8, "application/json");
                response.Headers.Add(Utils.X_MS_Ellapsed, watch.ElapsedMilliseconds + "ms");
            }

            return response;
        }

        [Authorize]
        public async Task<HttpResponseMessage> GetProviders(string subscriptionId)
        {
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);
            return Request.CreateResponse(HttpStatusCode.OK, await _armRepository.GetProvidersFor(Request, subscriptionId));
        }

        [Authorize]
        public async Task<HttpResponseMessage> Invoke(OperationInfo info)
        {
            HyakUtils.CSMUrl = HyakUtils.CSMUrl ?? Utils.GetCSMUrl(Request.RequestUri.Host);

            // escaping "#" as it may appear in some resource names
            info.Url = info.Url.Replace("#", "%23");

            var executeRequest = new HttpRequestMessage(new HttpMethod(info.HttpMethod), info.Url + info.QueryString);
            if (info.RequestBody != null)
            {
                executeRequest.Content = new StringContent(info.RequestBody.ToString(), Encoding.UTF8, "application/json");
            }

            return await _armRepository.InvokeAsync(Request, executeRequest);
        }
    }
}