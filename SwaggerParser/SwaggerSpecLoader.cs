using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Hosting;
using ARMExplorer.Controllers;

namespace ARMExplorer.SwaggerParser
{
    public class SwaggerSpecLoader
    {
        private static IEnumerable<String> GetProvidersWithSwaggerSpecs()
        {
            try
            {
                return Directory.GetDirectories(HostingEnvironment.MapPath("~/App_Data/SwaggerSpecs"));
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception);
                return new List<string>();
            }
        }

        private static IEnumerable<String> GetSwaggerFilesForProvider(string provider)
        {
            try
            {
                return Directory.GetFiles(provider);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return new List<string>();
            }
        }

        public static IEnumerable<MetadataObject> GetSpecsFromSwaggerFiles()
        {
            List<MetadataObject> metadataObjects = new List<MetadataObject>();
            foreach (var provider in GetProvidersWithSwaggerSpecs())
            {
                var currentProviderObjects = new List<MetadataObject>();
                foreach (var swaggerFile in GetSwaggerFilesForProvider(provider))
                {
                    var definition = SwaggerParser.Load(swaggerFile, new FileSystem());
                    currentProviderObjects.AddRange(new MetaDataObjectBuilder(definition).GetMetaDataObjects());
                }
                metadataObjects.AddRange(currentProviderObjects);
            }

            return metadataObjects;
        }
    }
}