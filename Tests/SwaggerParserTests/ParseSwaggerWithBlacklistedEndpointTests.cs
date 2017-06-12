using System.IO;
using System.Linq;
using ARMExplorer.SwaggerParser;
using ARMExplorer.SwaggerParser.Model;
using Xunit;

namespace Tests.SwaggerParserTests
{
    public class ParseSwaggerWithBlacklistedEndpointTests
    {
        private readonly ServiceDefinition _serviceDefinition;

        public ParseSwaggerWithBlacklistedEndpointTests()
        {
            var resourceRoot = new DirectoryInfo(Directory.GetCurrentDirectory()).Parent.Parent;
            var fileRelativePath = Path.Combine("Resource", "arm-web", "2016-03-01", "swagger", "DeletedWebApps.json");
            var filePath = Path.Combine(resourceRoot.FullName, fileRelativePath);
            _serviceDefinition = SwaggerParser.Load(filePath, new FileSystem());
        }

        [Fact]
        public void ApiIncludesAllEndpoints()
        {
            var paths = _serviceDefinition.Paths;
            Assert.Equal(2, paths.Count);
            var pathsArray = paths.ToArray();
            Assert.Equal("/subscriptions/{subscriptionId}/providers/Microsoft.Web/deletedSites", pathsArray[0].Key);
            Assert.Equal("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Web/deletedSites", pathsArray[1].Key);
        }

        [Fact]
        public void MetadataObjectExcludesBlacklistedEndpoints()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var metaDataObjects = builder.GetMetaDataObjects();
            Assert.Empty(metaDataObjects);
        }
    }
}
