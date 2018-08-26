namespace ARMExplorer.SwaggerParser.Model
{
    public class ObjectPathPartIndex : ObjectPathPart
    {
        public ObjectPathPartIndex(int index)
        {
            Index = index;
        }

        public int Index { get; }

        public override string JsonPointer => $"/{Index + 1}";

        public override string JsonPath => $"[{Index + 1}]";

        public override string ReadablePath => JsonPath;

        public override object RawPath => Index;

    }
}