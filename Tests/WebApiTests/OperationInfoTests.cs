using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ARMExplorer.Controllers;
using Xunit;

namespace Tests.WebApiTests
{
    public class OperationInfoTests
    {
        [Theory]
        [InlineData("", false)]
        [InlineData(null, false)]
        [InlineData("https://management.azure.com/subscriptions", true)]
        [InlineData("https://management.azurre.com/subscriptions", false)]
        [InlineData("https://abcd.com", false)]
        public void IsValidOperationInfoHost(string url, bool isValidHost)
        {
            var operationInfo = new OperationInfo() {Url = url};
            Assert.Equal(isValidHost, operationInfo.IsValidHost());
        }
    }
}
