using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;

namespace ARMExplorer.Controllers
{
    public static class ProviderNamesRepository
    {
        private static readonly string AppData = HostingEnvironment.MapPath("~/App_Data");
        private static readonly string _providerNamesFileName = "providernames.txt";

        private static readonly List<string> AllProviderNames = new List<string>();

        static ProviderNamesRepository()
        {
            var providersFileName = Path.Combine(AppData, _providerNamesFileName);
            if (File.Exists(providersFileName))
            {
                var hashSet = new HashSet<string>();
                foreach (var provider in File.ReadAllLines(providersFileName))
                {
                    var trimmedProvider = provider.Trim();
                    if (string.IsNullOrWhiteSpace(trimmedProvider) || trimmedProvider.Any(char.IsWhiteSpace) || trimmedProvider.Any(char.IsLower))
                    {
                        throw new Exception($"Invalid provider name {trimmedProvider}");
                    }

                    hashSet.Add(provider);
                }

                AllProviderNames.AddRange(hashSet);
            }
        }

        public static IEnumerable<string> GetAllProviders()
        {
            return AllProviderNames;
        }
    }
}