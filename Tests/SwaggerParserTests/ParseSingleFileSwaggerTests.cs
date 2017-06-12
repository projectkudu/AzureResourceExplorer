using System.Collections.Generic;
using System.IO;
using System.Linq;
using ARMExplorer.Controllers;
using ARMExplorer.SwaggerParser;
using ARMExplorer.SwaggerParser.Model;
using Xunit;

namespace Tests.SwaggerParserTests
{
    public class ParseSingleFileSwaggerTests
    {
        private readonly ServiceDefinition _serviceDefinition;

        public ParseSingleFileSwaggerTests()
        {
            var resourceRoot = new DirectoryInfo(Directory.GetCurrentDirectory()).Parent.Parent;
            var fileRelativePath = Path.Combine("Resource", "arm-storage", "2017-06-01", "swagger", "storage.json");
            var filePath = Path.Combine(resourceRoot.FullName, fileRelativePath);
            _serviceDefinition = SwaggerParser.Load(filePath, new FileSystem());
        }

        [Fact]
        public void ParseSwaggerElements()
        {
            var paths = _serviceDefinition.Paths;
            Assert.Equal(10, paths.Count);
            Assert.True(paths.ContainsKey("/providers/Microsoft.Storage/operations"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/providers/Microsoft.Storage/checkNameAvailability"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/providers/Microsoft.Storage/storageAccounts"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}/listKeys"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}/regenerateKey"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/providers/Microsoft.Storage/usages"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}/ListAccountSas"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}/ListServiceSas"));

            Dictionary<string, Operation> checkNameAvailabilityPath = paths["/subscriptions/{subscriptionId}/providers/Microsoft.Storage/checkNameAvailability"];
            var operation = checkNameAvailabilityPath[checkNameAvailabilityPath.Keys.First()];
            Assert.Equal(3, operation.Parameters.Count);

            var bodyParameter = operation.Parameters.FirstOrDefault(parameter => parameter.In.Equals(ParameterLocation.Body));
            Assert.NotNull(bodyParameter);
            Assert.NotNull(bodyParameter.Schema);
            Assert.Equal("#/definitions/StorageAccountCheckNameAvailabilityParameters", bodyParameter.Schema.Reference);

            Assert.Equal(34, _serviceDefinition.Definitions.Count);

            var definition = _serviceDefinition.Definitions["StorageAccountCheckNameAvailabilityParameters"];
            Assert.Equal(2, definition.Properties.Count);
            Assert.True(definition.Properties.ContainsKey("name"));
            Assert.True(definition.Properties.ContainsKey("type"));
        }

        [Fact]
        public void GetRequestBodyForOperation()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var checkAvailabilityPostOperation = _serviceDefinition.Paths["/subscriptions/{subscriptionId}/providers/Microsoft.Storage/checkNameAvailability"]["post"];
            var requestBody = builder.GetRequestBodyForOperation(checkAvailabilityPostOperation, false);
            Assert.NotNull(requestBody);
            Assert.Equal(2,requestBody.Count);
            Assert.Equal("\"name\": \"(String)\"", requestBody.First.ToString());
            Assert.Equal("\"type\": \"(String)\"", requestBody.Last.ToString());
        }

        [Fact]
        public void GetRequestBodyDocForOperation()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var checkAvailabilityPostOperation = _serviceDefinition.Paths["/subscriptions/{subscriptionId}/providers/Microsoft.Storage/checkNameAvailability"]["post"];
            var requestBody = builder.GetRequestBodyForOperation(checkAvailabilityPostOperation, true);
            Assert.NotNull(requestBody);
            Assert.Equal(2, requestBody.Count);
            Assert.Equal("\"name\": \"The storage account name.\"", requestBody.First.ToString());
            Assert.Equal("\"type\": \"The type of resource, Microsoft.Storage/storageAccounts\"", requestBody.Last.ToString());
        }

        [Fact]
        public void GetApiVersion()
        {
            Assert.Equal("2017-06-01", _serviceDefinition.Info.Version);
        }

        [Fact]
        public void VerifyUrlsInMetadataObject()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var metaDataObjects = builder.GetMetaDataObjects();
            var metadataObjects = metaDataObjects as IList<MetadataObject> ?? metaDataObjects.ToList();
            Assert.Equal(13, metadataObjects.Count);
            var urls = metadataObjects.Select(metaDataObject => metaDataObject.Url.Replace("https://", string.Empty)).ToList();

            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/providers/Microsoft.Storage/operations")));
            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Storage/checkNameAvailability")));
            Assert.Equal(4,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}")));
            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Storage/storageAccounts")));
            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts")));
            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}/listKeys")));
            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}/regenerateKey")));
            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}/ListAccountSas")));
            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}/ListServiceSas")));
            Assert.Equal(1,urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Storage/usages")));
        }

        [Fact]
        public void VerifyMetadataObject()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var metaDataObjects = builder.GetMetaDataObjects();
            var metadataObjects = metaDataObjects as IList<MetadataObject> ?? metaDataObjects.ToArray();
            var metadataObject = metadataObjects[3];
            Assert.Equal("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Storage/storageAccounts/{accountName}", 
                metadataObject.Url.Replace("https://", string.Empty));
            Assert.Equal("DELETE", metadataObject.HttpMethod);
            Assert.Equal("Delete", metadataObject.MethodName);
            Assert.Equal("2017-06-01", metadataObject.ApiVersion);
            Assert.Null(metadataObject.RequestBody);
            Assert.Null(metadataObject.RequestBodyDoc);
        }
    }
}
