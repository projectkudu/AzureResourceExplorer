using System;
using Newtonsoft.Json.Linq;

namespace ARMExplorer.Controllers
{
    public class OperationInfo
    {
        public string HttpMethod { get; set; }
        public JObject RequestBody { get; set; }
        public string Url { get; set; }
        public string ApiVersion { get; set;}
        public string QueryString { get; set; }

        public bool TryFixUrl(string requestHost)
        {
            // escaping "#" as it may appear in some resource names
            Url = Url.Replace("#", "%23");
            Url = Utils.GetAbsoluteArmUrl(Url, requestHost);
            return !string.IsNullOrEmpty(Url);
        }

        public bool IsValidHost()
        {
            Uri uri;
            return Uri.TryCreate(Url, UriKind.Absolute, out uri) && uri != null && Utils.IsSupportedHost(uri.Host);
        }
    }
}