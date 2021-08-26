using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;

namespace ARMExplorer.Controllers
{
    public static class Utils
    {
        public const string X_MS_OAUTH_TOKEN = "X-MS-OAUTH-TOKEN";
        public const string X_MS_Ellapsed = "X-MS-Ellapsed";
        public const string AntaresApiVersion = "2014-06-01";
        public const string CSMApiVersion = "2014-04-01";

        public const string ResourcesTemplate = "{0}/subscriptions/{1}/resources?api-version={2}";
        public const string SubscriptionTemplate = "{0}/subscriptions/{1}?api-version={2}";
        public const string AllSubscriptionsTemplate = "{0}/subscriptions?api-version={1}";

        public static string GetApiVersion(string path)
        {
            if (path.IndexOf("/Microsoft.Web/", StringComparison.OrdinalIgnoreCase) > 0)
            {
                return AntaresApiVersion;
            }

            return CSMApiVersion;
        }

        public static async Task<HttpResponseMessage> Execute(Task<HttpResponseMessage> task)
        {
            var watch = new Stopwatch();
            watch.Start();
            var response = await task;
            watch.Stop();
            response.Headers.Add(X_MS_Ellapsed, watch.ElapsedMilliseconds + "ms");
            return response;
        }

        private const string ApiNextHost = "api-next.resources.windows-int.net";
        private const string ApiCurrentHost = "api-current.resources.windows-int.net";
        private const string DogfoodHost = "api-dogfood.resources.windows-int.net";
        private const string ArmHost = "management.azure.com";

        private static readonly HashSet<string> SupportedHosts = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ApiNextHost,
            ApiCurrentHost,
            DogfoodHost,
            ArmHost
        };

        public static bool IsSupportedHost(string host)
        {
            return SupportedHosts.Contains(host);
        }

        public static string GetCSMUrl(string host)
        {
            if (host.EndsWith(".antares-int.windows-int.net", StringComparison.OrdinalIgnoreCase))
            {
                return $"https://{ApiNextHost}";
            }
            else if (host.EndsWith(".antares-test.windows-int.net", StringComparison.OrdinalIgnoreCase))
            {
                return $"https://{ApiCurrentHost}";
            }
            else if (host.EndsWith(".ant-intapp.windows-int.net", StringComparison.OrdinalIgnoreCase))
            {
                return $"https://{DogfoodHost}";
            }
            else if (host.EndsWith(".waws-ppedf.windows-int.net", StringComparison.OrdinalIgnoreCase))
            {
                return $"https://{DogfoodHost}";
            }

            return $"https://{ArmHost}";
        }
    }
}