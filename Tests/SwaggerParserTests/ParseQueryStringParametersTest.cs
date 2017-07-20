using System.Collections.Generic;
using System.IO;
using System.Linq;
using ARMExplorer.Controllers;
using ARMExplorer.SwaggerParser;
using ARMExplorer.SwaggerParser.Model;
using Xunit;

namespace Tests.SwaggerParserTests
{
    public class ParseQueryStringParametersTest
    {
        private readonly ServiceDefinition _serviceDefinition;

        public ParseQueryStringParametersTest()
        {
            var resourceRoot = new DirectoryInfo(Directory.GetCurrentDirectory()).Parent.Parent;
            var fileRelativePath = Path.Combine("Resource", "arm-commerce", "2015-06-01-preview", "swagger", "commerce.json");
            var filePath = Path.Combine(resourceRoot.FullName, fileRelativePath);
            _serviceDefinition = SwaggerParser.Load(filePath, new FileSystem());
        }

        [Fact]
        public void GetRequiredQueryParameters()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var metaDataObjects = builder.GetMetaDataObjects() as List<MetadataObject>;
            Assert.Equal(2, metaDataObjects.Count);
            Assert.Equal(3, metaDataObjects[0].Query.Count());
            Assert.True(metaDataObjects[0].Query.Contains("reportedStartTime"));
            Assert.True(metaDataObjects[0].Query.Contains("reportedEndTime"));
            Assert.True(metaDataObjects[0].Query.Contains("api-version"));
            Assert.Equal(2, metaDataObjects[1].Query.Count());
            Assert.True(metaDataObjects[1].Query.Contains("api-version"));
            Assert.True(metaDataObjects[1].Query.Contains("$filter"));
        }
    }
}
