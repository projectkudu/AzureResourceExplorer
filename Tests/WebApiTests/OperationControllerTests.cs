using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using ARMExplorer.Controllers;
using Newtonsoft.Json;
using Xunit;

namespace Tests.WebApiTests
{
    public class OperationControllerTests
    {
        [Fact]
        public void TestGetAllProviders()
        {
            var operationController = new OperationController(new ArmRepository(new MockHttpClientWrapper()))
            {
                Request = new HttpRequestMessage {RequestUri = new Uri("https://localhost:44300/api/providers")},
                Configuration = new HttpConfiguration()
            };

            var response = operationController.GetAllProviders().Result;

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Assert.NotNull(response.Content);
            var objectContent = response.Content as ObjectContent;
            Assert.NotNull(objectContent);
            var providers = objectContent.Value as HashSet<string>;
            Assert.NotNull(providers);
            Assert.Equal(12, providers.Count);
        }

        [Fact]
        public void TestGetProviders()
        {
            var operationController = new OperationController(new ArmRepository(new MockHttpClientWrapper()))
            {
                Request = new HttpRequestMessage { RequestUri = new Uri("https://localhost:44300/api/operations/providers/00000000-0000-0000-0000-000000000003") },
                Configuration = new HttpConfiguration()
            };

            var response = operationController.GetProviders("00000000-0000-0000-0000-000000000003").Result;

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Assert.NotNull(response.Content);
            var objectContent = response.Content as ObjectContent;
            Assert.NotNull(objectContent);
            var providers = objectContent.Value as Dictionary<string, Dictionary<string, HashSet<string>>>;

            var expectedProviderKeys = new HashSet<string>
            {
                "CONTOSOADS-CENTRALRESOURCES", "CONTOSOADSTESTDEPLOY", "DEFAULT-STORAGE-CENTRALUS", "DEFAULT-STORAGE-SOUTHINDIA",
                "DEFAULT-STORAGE-WESTEUROPE", "SECURITYDATA", "DASHBOARDS"
            };

            Assert.NotNull(providers);
            Assert.Equal(expectedProviderKeys.Count, providers.Count);

            Assert.True(expectedProviderKeys.All(s => providers.ContainsKey(s)));
            var dictionary = providers["CONTOSOADS-CENTRALRESOURCES"];
            Assert.Equal(7, dictionary.Keys.Count);

            var expectedProviderNames = new HashSet<string>()
            {
                "MICROSOFT.EVENTHUB", "MICROSOFT.INSIGHTS" , "MICROSOFT.KEYVAULT" , "MICROSOFT.SQL" , "MICROSOFT.STORAGE" ,
                "MICROSOFT.WEB", "MICROSOFT.RESOURCES"
            };
            Assert.True(expectedProviderNames.All(s => dictionary.ContainsKey(s)));

            var hashSet = dictionary["MICROSOFT.WEB"];
            Assert.Equal(2, hashSet.Count);
            Assert.True(hashSet.Contains("SERVERFARMS"));
            Assert.True(hashSet.Contains("SITES"));
        }

        [Fact]
        public void TestGetPost()
        {
            var operationController = new OperationController(new ArmRepository(new MockHttpClientWrapper()))
            {
                Request = new HttpRequestMessage
                {
                    RequestUri =
                        new Uri("https://localhost:44300/api/all-operations/providers/00000000-0000-0000-0000-000000000003")
                },
                Configuration = new HttpConfiguration()
            };

            var providersList = new List<string>
            {
                "MICROSOFT.CLASSICSTORAGE",
                "MICROSOFT.CLASSICCOMPUTE",
                "MICROSOFT.NETWORK",
                "MICROSOFT.STORAGE",
                "MICROSOFT.WEB",
                "MICROSOFT.COMPUTE",
                "MICROSOFT.EVENTHUB",
                "MICROSOFT.INSIGHTS",
                "MICROSOFT.KEYVAULT",
                "MICROSOFT.SQL",
                "MICROSOFT.PORTAL",
                "MICROSOFT.RESOURCES"
            };
            var response = operationController.GetPost(providersList);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Assert.NotNull(response.Content);
            Assert.NotNull(response.Content as StringContent);
            var metadataObjects = JsonConvert.DeserializeObject<List<MetadataObject>>(((StringContent) response.Content).ReadAsStringAsync().Result);
            Assert.NotEmpty(metadataObjects);
            Assert.True(metadataObjects.Any(o => o.Url.Equals("https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}/InstanceView")));
        }
    }
}
