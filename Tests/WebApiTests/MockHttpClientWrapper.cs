using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using ARMExplorer.Controllers;

namespace Tests.WebApiTests
{
    class MockHttpClientWrapper : IHttpClientWrapper
    {
        public Task<HttpResponseMessage> SendAsync(HttpRequestMessage requestMessage, HttpRequestMessage sendRequest)
        {
            var responseMessage = new HttpResponseMessage(HttpStatusCode.OK);
            string filePath;
            if (sendRequest.RequestUri.ToString().Contains("resources"))
            {
                filePath = Path.Combine(new DirectoryInfo(Directory.GetCurrentDirectory()).FullName, Path.Combine("WebApiTests", "data", "resourcesForsubscription.json"));
            }
            else
            {
                filePath = Path.Combine(new DirectoryInfo(Directory.GetCurrentDirectory()).FullName, Path.Combine("WebApiTests", "data", "subscriptions.json"));
            }
            responseMessage.Content = new StringContent(File.ReadAllText(filePath), Encoding.UTF8, "application/json");
            var response = new TaskCompletionSource<HttpResponseMessage>();
            response.SetResult(responseMessage);
            return response.Task;
        }

        public Task<HttpResponseMessage> ExecuteAsync(HttpRequestMessage requestMessage, HttpRequestMessage executeRequest)
        {
            throw new NotImplementedException();
        }
    }
}