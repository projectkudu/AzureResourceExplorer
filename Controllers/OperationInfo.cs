using Newtonsoft.Json.Linq;

namespace ARMOAuth.Controllers
{
    public class OperationInfo
    {
        public string HttpMethod { get; set; }
        public JObject RequestBody { get; set; }
        public string Url { get; set; }
    }
}