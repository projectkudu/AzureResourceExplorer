using System.Collections.Generic;
using System.IO;
using System.Linq;
using ARMExplorer.Controllers;
using ARMExplorer.SwaggerParser;
using ARMExplorer.SwaggerParser.Model;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Tests.SwaggerParserTests
{
    public class ParseMultiFileSwaggerTests
    {
        private readonly ServiceDefinition _serviceDefinition;

        public ParseMultiFileSwaggerTests()
        {
            var resourceRoot = new DirectoryInfo(Directory.GetCurrentDirectory()).Parent.Parent;
            var filePath = Path.Combine(resourceRoot.FullName, Path.Combine("Resource", "arm-network", "2017-03-01", "swagger", "routeTable.json"));
            _serviceDefinition = SwaggerParser.Load(filePath, new FileSystem());
        }

        [Fact]
        public void ParseSwaggerElements()
        {
            var paths = _serviceDefinition.Paths;
            Assert.Equal(5, paths.Count);
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/providers/Microsoft.Network/routeTables"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}/routes/{routeName}"));
            Assert.True(paths.ContainsKey("/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}/routes"));

            Dictionary<string, Operation> routeTableNamePath = paths["/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}"];
            var operation = routeTableNamePath["put"];
            Assert.Equal(5, operation.Parameters.Count);

            var bodyParameter = operation.Parameters.FirstOrDefault(parameter => parameter.In.Equals(ParameterLocation.Body));
            Assert.NotNull(bodyParameter);
            Assert.NotNull(bodyParameter.Schema);
            Assert.Equal("#/definitions/RouteTable", bodyParameter.Schema.Reference);

            Assert.Equal(33, _serviceDefinition.Definitions.Count);

            var definition = _serviceDefinition.Definitions["RouteTable"];
            Assert.Equal(2, definition.Properties.Count);
            Assert.NotNull(definition.AllOf);
        }

        [Fact]
        public void GetRequestBodyForOperation()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var putRouteTableOperation = _serviceDefinition.Paths["/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}"]["put"];
            var requestBody = builder.GetRequestBodyForOperation(putRouteTableOperation, false);
            Assert.NotNull(requestBody);
            Assert.Equal(7, requestBody.Count);
            Assert.Equal("(String)", requestBody.GetValue("id"));
            Assert.Equal("(String)", requestBody.GetValue("name"));
            Assert.Equal("(String)", requestBody.GetValue("type"));
            Assert.Equal("(String)", requestBody.GetValue("location"));
            Assert.False(requestBody.GetValue("tags").HasValues);
            Assert.Equal("(String)", requestBody.GetValue("etag"));
            var propertiesKey = requestBody.GetValue("properties");
            Assert.Equal("properties", propertiesKey.Path);
            Assert.Equal(3, propertiesKey.Children().Count());
            Assert.Equal("properties.routes", propertiesKey.First.Path);
            Assert.Equal(JTokenType.Array, propertiesKey.First.First.Type);
            Assert.Equal("properties.routes[0].id", propertiesKey.First.First.First.First.Path);
            Assert.Equal("properties.provisioningState", propertiesKey.Last.Path);
        }

        [Fact]
        public void GetRequestBodyDocForOperation()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var putRouteTableOperation = _serviceDefinition.Paths["/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}"]["put"];
            var requestBodyDoc = builder.GetRequestBodyForOperation(putRouteTableOperation, true);
            Assert.NotNull(requestBodyDoc);
            Assert.Equal(7, requestBodyDoc.Count);
            Assert.Equal("Resource ID.", requestBodyDoc.GetValue("id").ToString());
            Assert.Equal("Resource name.", requestBodyDoc.GetValue("name"));
            Assert.Equal("Resource type.", requestBodyDoc.GetValue("type"));
            Assert.Equal("Resource location.", requestBodyDoc.GetValue("location"));
            Assert.False(requestBodyDoc.GetValue("tags").HasValues);
            Assert.Equal("Gets a unique read-only string that changes whenever the resource is updated.", requestBodyDoc.GetValue("etag"));
        }

        [Fact]
        public void GetApiVersion()
        {
            Assert.Equal("2017-03-01", _serviceDefinition.Info.Version);
        }

        [Fact]
        public void VerifyUrlsInMetadataObject()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var metaDataObjects = builder.GetMetaDataObjects();
            var metadataObjects = metaDataObjects as IList<MetadataObject> ?? metaDataObjects.ToList();
            Assert.Equal(9, metadataObjects.Count);
            var urls = metadataObjects.Select(metaDataObject => metaDataObject.Url.Replace("https://", string.Empty)).ToList();

            Assert.Equal(3, urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}")));
            Assert.Equal(1, urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables")));
            Assert.Equal(1, urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Network/routeTables")));
            Assert.Equal(3, urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}/routes/{routeName}")));
            Assert.Equal(1, urls.Count(url => url.Equals("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}/routes")));
        }

        [Fact]
        public void VerifyMetadataObject()
        {
            var builder = new MetaDataObjectBuilder(_serviceDefinition);
            var metaDataObjects = builder.GetMetaDataObjects();
            var metadataObjects = metaDataObjects as IList<MetadataObject> ?? metaDataObjects.ToArray();
            var metadataObject = metadataObjects[7];
            Assert.Equal("management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Network/routeTables/{routeTableName}/routes/{routeName}",
                metadataObject.Url.Replace("https://", string.Empty));
            Assert.Equal("PUT", metadataObject.HttpMethod);
            Assert.Equal("CreateOrUpdate", metadataObject.MethodName);
            Assert.Equal("2017-03-01", metadataObject.ApiVersion);
            Assert.NotNull(metadataObject.RequestBody);
            Assert.NotNull(metadataObject.RequestBodyDoc);
        }

        [Fact]
        public void ApiVersionInPathOverridesApiVersionInSwaggerRoot()
        {
            var resourceRoot = new DirectoryInfo(Directory.GetCurrentDirectory()).Parent.Parent;
            var filePath = Path.Combine(resourceRoot.FullName, Path.Combine("Resource", "arm-network", "2017-03-01", "swagger", "vmssNetworkInterface.json"));
            var serviceDefinition = SwaggerParser.Load(filePath, new FileSystem());
            Assert.Equal("2017-03-01", serviceDefinition.Info.Version);

            var builder = new MetaDataObjectBuilder(serviceDefinition);
            var metaDataObjects = builder.GetMetaDataObjects();
            Assert.Equal(3, metaDataObjects.Count());
            foreach (var metaDataObject in metaDataObjects)
            {
                Assert.Equal("2016-09-01", metaDataObject.ApiVersion);
            }
        }
    }
}
