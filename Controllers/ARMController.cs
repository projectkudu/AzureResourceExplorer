using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Routing;

namespace ARMOAuth.Controllers
{
    public class ARMController : ApiController
    {
        static ARMController()
        {
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
        }

        public HttpResponseMessage GetToken()
        {
            var jwtToken = Request.Headers.GetValues("X-MS-OAUTH-TOKEN").FirstOrDefault();
            var base64 = jwtToken.Split('.')[1];

            // fixup
            int mod4 = base64.Length % 4;
            if (mod4 > 0)
            {
                base64 += new string('=', 4 - mod4);
            }

            var json = Encoding.UTF8.GetString(Convert.FromBase64String(base64));
            var response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        [Authorize]
        public async Task<HttpResponseMessage> Get()
        {
            IHttpRouteData routeData = Request.GetRouteData();
            string path = routeData.Values["path"] as string;
            if (String.IsNullOrEmpty(path))
            {
                var response = Request.CreateResponse(HttpStatusCode.Redirect);
                string fullyQualifiedUrl = Request.RequestUri.GetLeftPart(UriPartial.Authority);
                response.Headers.Location = new Uri(new Uri(fullyQualifiedUrl), "subscriptions");
                return response;
            }

            using (var client = GetClient("https://management.azure.com"))
            {
                return await client.GetAsync(path + "?api-version=2014-04-01");
            }
        }

        public HttpClient GetClient(string baseUri)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(baseUri);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Request.Headers.GetValues("X-MS-OAUTH-TOKEN").FirstOrDefault());
            return client;
        }
    }
}