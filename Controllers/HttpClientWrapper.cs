using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;

namespace ARMExplorer.Controllers
{
    public class HttpClientWrapper : IHttpClientWrapper
    {
        private HttpClient GetHttpClient(HttpRequestMessage requestMessage)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(Utils.GetCSMUrl(requestMessage.RequestUri.Host));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",requestMessage.Headers.GetValues(Utils.X_MS_OAUTH_TOKEN).FirstOrDefault());
            client.DefaultRequestHeaders.Add("User-Agent", requestMessage.RequestUri.Host);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            return client;
        }


        public async Task<HttpResponseMessage> SendAsync(HttpRequestMessage requestMessage, HttpRequestMessage sendRequest)
        {
            using (var client = GetHttpClient(requestMessage))
            {
                return await client.SendAsync(sendRequest);
            }
        }

        public async Task<HttpResponseMessage> ExecuteAsync(HttpRequestMessage requestMessage, HttpRequestMessage executeRequest)
        {
            using (var client = GetHttpClient(requestMessage))
            {
                return await Utils.Execute(client.SendAsync(executeRequest));
            }
        }
    }
}