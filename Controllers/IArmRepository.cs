using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace ARMExplorer.Controllers
{
    public interface IArmRepository
    {
        Task<IList<string>> GetSubscriptionIdsAsync(HttpRequestMessage requestMessage);
        Task<HashSet<string>> GetproviderNamesFor(HttpRequestMessage requestMessage, string subscriptionId);
        Task<Dictionary<string, Dictionary<string, HashSet<string>>>> GetProvidersFor(HttpRequestMessage requestMessage, string subscriptionId);
        Task<HttpResponseMessage> InvokeAsync(HttpRequestMessage requestMessage, HttpRequestMessage info);
    }
}