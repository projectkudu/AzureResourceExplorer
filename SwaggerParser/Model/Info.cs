using Newtonsoft.Json;

namespace ARMExplorer.SwaggerParser.Model
{
    /// <summary>
    /// The object provides metadata about the API. 
    /// The metadata can be used by the clients if needed, and can be presented 
    /// in the Swagger-UI for convenience.
    /// </summary>
    public class Info : SpecObject
    {
        private string _description;
        public string Title { get; set; }

        public string Description
        {
            get { return _description; }
            set
            {
                if (string.IsNullOrWhiteSpace(_description))
                {
                    _description = value.StripControlCharacters();
                }
            }
        }

        public string TermsOfService { get; set; }

        public Contact Contact { get; set; }

        public License License { get; set; }

        public string Version { get; set; }

        [JsonProperty("x-ms-code-generation-settings")]
        public CodeGenerationSettings CodeGenerationSettings { get; set; }
    }
}