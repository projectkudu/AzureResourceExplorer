using Newtonsoft.Json.Linq;

namespace ARMExplorer.Controllers
{
    public class OperationInfo
    {
        public string HttpMethod { get; set; }
        public JObject RequestBody { get; set; }
        public string Url { get; set; }
    }
}