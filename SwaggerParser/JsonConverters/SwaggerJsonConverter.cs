using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ARMExplorer.SwaggerParser.JsonConverters
{
    public abstract class SwaggerJsonConverter : JsonConverter
    {
        protected JObject Document { get; set; }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        protected JsonSerializerSettings GetSettings(JsonSerializer serializer)
        {
            if (serializer == null)
            {
                throw new ArgumentNullException("serializer");
            }

            var settings = new JsonSerializerSettings
            {
                TypeNameHandling = TypeNameHandling.None,
                MetadataPropertyHandling = MetadataPropertyHandling.Ignore
            };
            foreach (var converter in serializer.Converters)
            {
                if (converter != this)
                {
                    settings.Converters.Add(converter);
                }
            }
            return settings;
        }
    }
}