namespace ARMExplorer.SwaggerParser.Model
{
    /// <summary>
    /// Represents a Swagger Tag
    /// </summary>
    public class Tag : SwaggerBase
    {
        private string _description;
        public string Name { get; set; }

        public string Description
        {
            get { return _description; }
            set { _description = value.StripControlCharacters(); }
        }

        public ExternalDoc ExternalDoc { get; set; }
    }
}