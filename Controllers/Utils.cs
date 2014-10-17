using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;

namespace ARMOAuth.Controllers
{
    public class Utils
    {
        public const string X_MS_OAUTH_TOKEN = "X-MS-OAUTH-TOKEN";
        public const string X_MS_Ellapsed = "X-MS-Ellapsed";

        public static async Task<HttpResponseMessage> Execute(Task<HttpResponseMessage> task)
        {
            var watch = new Stopwatch();
            watch.Start();
            var response = await task;
            watch.Stop();
            response.Headers.Add(Utils.X_MS_Ellapsed, watch.ElapsedMilliseconds + "ms");
            return response;
        }
    }
}