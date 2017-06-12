using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace ARMExplorer.Controllers
{
    public interface IHttpClientWrapper
    {
        Task<HttpResponseMessage> SendAsync(HttpRequestMessage requestMessage, HttpRequestMessage sendRequest);
        Task<HttpResponseMessage> ExecuteAsync(HttpRequestMessage requestMessage, HttpRequestMessage executeRequest);
    }
}