namespace ARMExplorer.SwaggerParser.Model
{
    public abstract class ObjectPathPart
    {
        public abstract string JsonPointer { get; }

        public abstract string JsonPath { get; }

        public abstract string ReadablePath { get; }

        public abstract object RawPath { get; }

    }
}