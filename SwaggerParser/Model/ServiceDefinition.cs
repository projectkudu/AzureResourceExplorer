using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace ARMExplorer.SwaggerParser.Model
{
    public enum DataDirection
    {
        None = 0,
        Request = 1,
        Response = 2,
        Both = 3
    }
    public enum TransferProtocolScheme
    {
        None,
        Http,
        Https,
        Ws,
        Wss
    }
    public class ServiceDefinition : SpecObject
    {
        public static ServiceDefinition Instance { get; set; }
        public ServiceDefinition()
        {
            Definitions = new Dictionary<string, Schema>();
            Schemes = new List<TransferProtocolScheme>();
            Consumes = new List<string>();
            Produces = new List<string>();
            Paths = new Dictionary<string, Dictionary<string, Operation>>();
            CustomPaths = new Dictionary<string, Dictionary<string, Operation>>();
            Parameters = new Dictionary<string, SwaggerParameter>();
            Responses = new Dictionary<string, OperationResponse>();
            SecurityDefinitions = new Dictionary<string, SecurityDefinition>();
            Security = new List<Dictionary<string, List<string>>>();
            Tags = new List<Tag>();
        }

        /// <summary>
        /// Specifies the Swagger Specification version being used. 
        /// </summary>
        public string Swagger { get; set; }

        /// <summary>
        /// Provides metadata about the API. The metadata can be used by the clients if needed.
        /// </summary>
        public Info Info { get; set; }

        /// <summary>
        /// The host (serviceTypeName or ip) serving the API.
        /// </summary>
        public string Host { get; set; }

        /// <summary>
        /// The base path on which the API is served, which is relative to the host.
        /// </summary>
        public string BasePath { get; set; }
        
        /// <summary>
        /// The transfer protocol of the API.
        /// </summary>
        public IList<TransferProtocolScheme> Schemes { get; set; }
        
        // Key is the object serviceTypeName and the value is swagger definition.
        public Dictionary<string, Schema> Definitions { get; set; }
        
        // A list of MIME types the service can consume.
        public IList<string> Consumes { get; set; }
        
        // A list of MIME types the APIs can produce.
        public IList<string> Produces { get; set; }

        // Key is actual path and the value is serializationProperty of http operations and operation objects.
        public Dictionary<string, Dictionary<string, Operation>> Paths { get; set; }

        // Key is actual path and the value is serializationProperty of http operations and operation objects.
        [JsonProperty("x-ms-paths")]
        public Dictionary<string, Dictionary<string, Operation>> CustomPaths { get; set; }

        /// <summary>
        /// Dictionary of parameters that can be used across operations.
        /// This property does not define global parameters for all operations.
        /// </summary>
        public Dictionary<string, SwaggerParameter> Parameters { get; set; }
        
        // Dictionary of responses that can be used across operations. The key indicates status code.
        public Dictionary<string, OperationResponse> Responses { get; set; }
        
        // Key is the object serviceTypeName and the value is swagger security definition.
        public Dictionary<string, SecurityDefinition> SecurityDefinitions { get; set; }
        /// <summary>
        /// A declaration of which security schemes are applied for the API as a whole. 
        /// The list of values describes alternative security schemes that can be used 
        /// (that is, there is a logical OR between the security requirements). Individual 
        /// operations can override this definition.
        /// </summary>

        public IList<Dictionary<string, List<string>>> Security { get; set; }

        /// <summary>
        /// A list of tags used by the specification with additional metadata. The order 
        /// of the tags can be used to reflect on their order by the parsing tools. Not all 
        /// tags that are used by the Operation Object must be declared. The tags that are 
        /// not declared may be organized randomly or based on the tools' logic. Each 
        /// tag name in the list MUST be unique.
        /// </summary>
        public IList<Tag> Tags { get; set; }

        /// <summary>
        /// Path to this Swagger.
        /// </summary>
        internal Uri FilePath { get; set; }


    }

    public enum DataType
    {
        None,
        String,
        Number,
        Integer,
        Boolean,
        Array,
        File,
        Object
    }
}