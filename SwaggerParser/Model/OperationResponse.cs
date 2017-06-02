using System.Collections.Generic;

namespace ARMExplorer.SwaggerParser.Model
{
    /// <summary>
    /// Describes a single response from an API Operation.
    /// </summary>
    public class OperationResponse : SwaggerBase
    {
        private string _description;

        public string Description
        {
            get { return _description; }
            set { _description = value.StripControlCharacters(); }
        }

        public Schema Schema { get; set; }

        public Dictionary<string, System.Runtime.Remoting.Messaging.Header> Headers { get; set; }

        public Dictionary<string, object> Examples { get; set; }

    }

}