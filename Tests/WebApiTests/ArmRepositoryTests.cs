using System.Collections.Generic;
using System.Linq;
using ARMExplorer.Controllers;
using Xunit;

namespace Tests.WebApiTests
{
    public class ArmRepositoryTests
    {
        [Fact]
        public void TestGetSubscriptionIdsAsync()
        {
            var armRepository = new ArmRepository(new MockHttpClientWrapper());
            var subscriptionIds = armRepository.GetSubscriptionIdsAsync(null).Result;
            Assert.Equal(4, subscriptionIds.Count);
            Assert.True(subscriptionIds.Contains("00000000-0000-0000-0000-000000000001"));
            Assert.True(subscriptionIds.Contains("00000000-0000-0000-0000-000000000002"));
            Assert.True(subscriptionIds.Contains("00000000-0000-0000-0000-000000000003"));
            Assert.True(subscriptionIds.Contains("00000000-0000-0000-0000-000000000004"));
        }

        [Fact]
        public void TestGetproviderNamesFor()
        {
            var armRepository = new ArmRepository(new MockHttpClientWrapper());
            var providerNames = armRepository.GetProviderNamesFor(null, "00000000-0000-0000-0000-000000000003").Result;
            Assert.Equal(11,providerNames.Count);
            HashSet<string> expectedProviderNames = new HashSet<string>{ "MICROSOFT.EVENTHUB", "MICROSOFT.INSIGHTS", "MICROSOFT.KEYVAULT", "MICROSOFT.SQL", "MICROSOFT.STORAGE", "MICROSOFT.WEB", "MICROSOFT.CLASSICCOMPUTE", "MICROSOFT.NETWORK", "MICROSOFT.PORTAL", "MICROSOFT.CLASSICSTORAGE", "MICROSOFT.RESOURCES" }; 
            Assert.Equal(expectedProviderNames.Count, providerNames.Count);
            Assert.True(providerNames.All(s => expectedProviderNames.Contains(s)));
        }

        [Fact]
        public void TestGetProvidersFor()
        {
            var armRepository = new ArmRepository(new MockHttpClientWrapper());
            
            var providers = armRepository.GetProvidersFor(null, "00000000-0000-0000-0000-000000000003").Result;
            var expectedProviderKeys = new HashSet<string>
            {
                "CONTOSOADS-CENTRALRESOURCES", "CONTOSOADSTESTDEPLOY", "DEFAULT-STORAGE-CENTRALUS", "DEFAULT-STORAGE-SOUTHINDIA",
                "DEFAULT-STORAGE-WESTEUROPE", "SECURITYDATA", "DASHBOARDS"
            };

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

            var resourceGroupDictionary = providers["SECURITYDATA"];
            Assert.Equal(2, resourceGroupDictionary.Count);
            var resources = resourceGroupDictionary["MICROSOFT.RESOURCES"];
            Assert.Equal(2, resources.Count);
            Assert.True(resources.Contains("RESOURCES"));
            Assert.True(resources.Contains("DEPLOYMENTS"));
        }
    }
}
