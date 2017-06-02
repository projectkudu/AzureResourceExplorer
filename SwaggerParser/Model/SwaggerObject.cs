using System.Collections.Generic;
using Newtonsoft.Json;

namespace ARMExplorer.SwaggerParser.Model
{

    public enum CollectionFormat
    {
        /// <summary>
        /// Default unspecified CollectionFormat.
        /// </summary>
        None,

        /// <summary>
        /// Comma separated values foo,bar
        /// </summary>
        Csv,

        /// <summary>
        /// Space separated values foo bar.
        /// </summary>
        Ssv,

        /// <summary>
        /// Tab separated values foo\tbar.
        /// </summary>
        Tsv,

        /// <summary>
        /// Pipe separated values foo|bar.
        /// </summary>
        Pipes,

        Multi
    }

    public abstract class SwaggerObject : SwaggerBase
    {
        private string _description;

        public virtual bool IsRequired { get; set; }

        public virtual DataType? Type { get; set; }

        public virtual string Format { get; set; }
        public virtual Schema Items { get; set; }

        [JsonProperty(PropertyName = "$ref")]
        public string Reference { get; set; }

        public virtual Schema AdditionalProperties { get; set; }

        public virtual string Description
        {
            get { return _description; }
            set { _description = value.StripControlCharacters(); }
        }

        public virtual CollectionFormat CollectionFormat { get; set; }
        public virtual string Default { get; set; }
        public virtual string MultipleOf { get; set; }
        public virtual string Maximum { get; set; }
        public virtual bool ExclusiveMaximum { get; set; }
        public virtual string Minimum { get; set; }
        public virtual bool ExclusiveMinimum { get; set; }
        public virtual string MaxLength { get; set; }
        public virtual string MinLength { get; set; }
        public virtual string Pattern { get; set; }
        public virtual string MaxItems { get; set; }
        public virtual string MinItems { get; set; }
        public virtual bool UniqueItems { get; set; }
        public virtual IList<string> Enum { get; set; }

    }
}