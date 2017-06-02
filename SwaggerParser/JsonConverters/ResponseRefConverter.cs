using System;
using ARMExplorer.SwaggerParser.Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ARMExplorer.SwaggerParser.JsonConverters
{
    public class ResponseRefConverter : SwaggerJsonConverter
    {
        public ResponseRefConverter(string json)
        {
            Document = JObject.Parse(json);
        }

        public override bool CanConvert(System.Type objectType)
        {
            return (objectType == typeof(OperationResponse));
        }

        public override object ReadJson(JsonReader reader, System.Type objectType, object existingValue,
            JsonSerializer serializer)
        {
            JObject jo = JObject.Load(reader);
            string referencePath = null;
            // Unwrap if it's a reference object
            if ((jo.First != null) && (jo.First.Path == "$ref"))
            {
                referencePath = jo.GetValue("$ref", StringComparison.Ordinal).ToString();
                // Shorthand notation
                if (!referencePath.StartsWith("#/responses", StringComparison.Ordinal))
                {
                    referencePath = "#/responses/" + referencePath;
                }
                jo = Document.SelectToken(referencePath.Replace("#/", "").Replace("/", ".")) as JObject;
            }

            OperationResponse swaggerResponse = JsonConvert.DeserializeObject<OperationResponse>(jo.ToString(),
                GetSettings(serializer));
            return swaggerResponse;
        }
    }
}