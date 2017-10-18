using System.Collections.ObjectModel;

namespace ARMExplorer.Model
{
    public class ArmResourceListResult
    {
        [Newtonsoft.Json.JsonProperty("value", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public Collection<ArmResource> Value { get; set; }

        [Newtonsoft.Json.JsonProperty("nextLink", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public string NextLink { get; set; }
    }
}