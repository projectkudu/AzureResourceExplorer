using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Hosting;
using ARMExplorer.Controllers;

namespace ARMExplorer.SwaggerParser
{
    public class SwaggerSpecLoader
    {
        private static readonly string SwaggerRoot = HostingEnvironment.MapPath("~/App_Data/SwaggerSpecs");
        private static IEnumerable<string> GetSwaggerFilesForProvider(string provider)
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

        public static IEnumerable<MetadataObject> GetSpecFromSwagger(string provider)
        {
            var providerObjects = new List<MetadataObject>();
            if (SwaggerRoot != null)
            {
                var currentProviderPath = Path.Combine(SwaggerRoot, provider);
                if (Directory.Exists(currentProviderPath))
                {
                    foreach (var swaggerFile in GetSwaggerFilesForProvider(currentProviderPath))
                    {
                        var definition = SwaggerParser.Load(swaggerFile, new FileSystem());
                        providerObjects.AddRange(new MetaDataObjectBuilder(definition).GetMetaDataObjects());
                    }
                }
            }
            return providerObjects;
        }
    }
}