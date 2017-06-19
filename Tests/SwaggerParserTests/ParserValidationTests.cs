using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ARMExplorer.Controllers;
using ARMExplorer.SwaggerParser;
using ARMExplorer.SwaggerParser.Model;
using Xunit;

namespace Tests.SwaggerParserTests
{
    public class ParserValidationTests
    {
        private readonly ServiceDefinition _serviceDefinition;

        public ParserValidationTests()
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

        private class UniqueOperation
        {
            public string Url { get; }
            private readonly string _httpMethod;

            public UniqueOperation(string url, string httpMethod)
            {
                Url = url;
                _httpMethod = httpMethod;
            }

            public override bool Equals(object obj)
            {
                var other = obj as UniqueOperation;
                return other != null && 
                    other._httpMethod == this._httpMethod &&
                    other.Url == this.Url;
            }

            public override int GetHashCode()
            {
                return _httpMethod.GetHashCode() ^ Url.GetHashCode();
            }
        }

        [Fact]
        public void IdentifyDuplicatePaths()
        {
            // these swagger operations have more than 1 version of it. ( usually because they come from different providers)
            // client will pick the last swagger definition it sees and use that.
            var knownDuplicates = new HashSet<string>();
            knownDuplicates.Add(
                "https://management.azure.com/Subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.RecoveryServices/operations");
            knownDuplicates.Add(
                "https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/moveResources");

            var root = new DirectoryInfo(Directory.GetCurrentDirectory()).Parent.Parent.Parent;
            var fileRelative = Path.Combine("App_Data","SwaggerSpecs");
            var swaggerDirectory = Path.Combine(root.FullName, fileRelative);
            var metadataObjects = new List<MetadataObject>();
            foreach (var directory in Directory.GetDirectories(swaggerDirectory))
            {
                foreach (var swaggerFile in Directory.GetFiles(directory))
                {
                    var serviceDefinition = SwaggerParser.Load(swaggerFile, new FileSystem());
                    var builder = new MetaDataObjectBuilder(serviceDefinition);
                    metadataObjects.AddRange(builder.GetMetaDataObjects());
                }
            }

            Assert.NotEmpty(metadataObjects);
            var speclessMetadataObjects = HyakUtils.GetSpeclessCsmOperations().ToList();
            Assert.NotEmpty(speclessMetadataObjects);
            metadataObjects.AddRange(speclessMetadataObjects);

            var operationsCount = new Dictionary<UniqueOperation, HashSet<string>>();
            foreach (var metadataObject in metadataObjects)
            {
                var uniqueOperation = new UniqueOperation(metadataObject.Url, metadataObject.HttpMethod);
                if (!operationsCount.ContainsKey(uniqueOperation))
                {
                    operationsCount[uniqueOperation] = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                }
                operationsCount[uniqueOperation].Add(metadataObject.ApiVersion);
            }
            foreach (var oCount in operationsCount)
            {
                if (oCount.Value.Count > 1)
                {
                    Assert.True(knownDuplicates.Contains(oCount.Key.Url));
                }
            }
        }
    }
}
