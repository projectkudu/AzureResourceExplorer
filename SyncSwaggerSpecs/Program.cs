using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace SyncSwaggerSpecs
{
    class Program
    {
        static async Task Main(string[] args)
        {
            await DownloadSpecsAsync();
            LoadCurrentSpecs();
            LoadRemoteSpecs();
            await CopySpecsToLocalAsync();
        }

        private static string tmpSpecDirectry;
        private static bool doCopyOnlyStableVersion = true;
        private static bool dryRunCopy = false;
        private static string syncResultFileName = "syncResult.json";
        private static List<SwaggerSpec> localSpecs = new List<SwaggerSpec>();
        private static List<SwaggerSpec> remoteSpecs = new List<SwaggerSpec>();

        private static async Task DownloadSpecsAsync()
        {
            Console.WriteLine("Downloading swagger specs from https://github.com/Azure/azure-rest-api-specs");
            var tmpSpecFile = Path.GetTempFileName();
            using (WebClient wc = new WebClient())
            {
                await wc.DownloadFileTaskAsync(new Uri("https://github.com/Azure/azure-rest-api-specs/archive/refs/heads/master.zip"), tmpSpecFile);
                Console.WriteLine($"Downloaded to {tmpSpecFile}");
            }
            tmpSpecDirectry = Path.GetTempPath() + Path.GetRandomFileName();
            Console.WriteLine($"Extracting {tmpSpecFile} from to {tmpSpecDirectry}");
            ZipFile.ExtractToDirectory(tmpSpecFile, tmpSpecDirectry);
            Console.WriteLine($"Extracted to {tmpSpecDirectry}");
            File.Delete(tmpSpecFile);
        }

        private static void LoadRemoteSpecs()
        {
            Regex reg = new Regex(@"\w*[\\\/]resource-manager[\\\/](Microsoft.\w*)[\\\/]\w*[\\\/]([0-9]{4}-[0-9]{2}-[0-9]{2})(-preview)?[\\\/]\w*.json");
            remoteSpecs.Clear();
            var searchDir = tmpSpecDirectry + Path.DirectorySeparatorChar + @"azure-rest-api-specs-master" + Path.DirectorySeparatorChar + @"specification" + Path.DirectorySeparatorChar;
            var files = Directory.GetFiles(searchDir, "*.*", SearchOption.AllDirectories);
            Console.WriteLine($"Loading azure-rest-api-specs {searchDir} {files.Length} Files are Found");
            if (files.Length > 0)
            {
                Console.WriteLine($"1st File is {files[0]}");
            }
            remoteSpecs.AddRange(files
             .Where(s => reg.IsMatch(s))
             .Select(q => new SwaggerSpec() {
                 FullName = q,
                 FileName = Path.GetFileName(q),
                 IsStable = q.IndexOf("stable") > -1,
                 Version = reg.Match(q).Groups[2].Value,
                 ResourceType = reg.Match(q).Groups[1].Value,
             })
             .ToArray());
            Console.WriteLine($"Loaded azure-rest-api-specs");
        }

        private class SwaggerSpec
        {
            internal SwaggerSpec()
            {
            }

            internal bool IsStable { get; set; }
            internal string Version { get; set; }
            internal string ResourceType { get; set; }
            internal string FileName { get; set; }
            internal string FullName { get; set; }

            internal void CopyToLocal()
            {
                File.Copy(FullName, GetLocalSwaggerSpecsPath() + Path.DirectorySeparatorChar + ResourceType + Path.DirectorySeparatorChar + FileName, true);
            }

            internal static string GetLocalSwaggerSpecsPath()
            {
                return Path.GetDirectoryName(Path.GetDirectoryName(Path.GetDirectoryName(Path.GetDirectoryName(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location))))) + Path.DirectorySeparatorChar + @"App_Data" + Path.DirectorySeparatorChar + @"SwaggerSpecs";
            }
        }

        [Serializable]
        public class LocalSwaggerSpec
        {
            public LocalSwaggerSpec()
            {
            }
            public string swagger { get; set; }
            public LocalSwaggerSpecInfo info { get; set; }
        }
        [Serializable]
        public class LocalSwaggerSpecInfo
        {
            public LocalSwaggerSpecInfo()
            {

            }
            public string title { get; set; }
            public string description { get; set; }
            public string version { get; set; }
        }

        private static void LoadCurrentSpecs()
        {
            Console.WriteLine($"Loading API definitions on this repository");
            localSpecs.Clear();
            localSpecs.AddRange(Directory.GetDirectories(SwaggerSpec.GetLocalSwaggerSpecsPath(), "Microsoft.*")
                .SelectMany(q =>
                Directory.GetFiles(q, "*.json"))
                .Select(q =>
                {
                    using (StreamReader sr = new StreamReader(q, System.Text.Encoding.UTF8))
                    {
                        LocalSwaggerSpec jsonObj = JsonSerializer.Deserialize<LocalSwaggerSpec>(sr.ReadToEnd());
                        return new SwaggerSpec()
                        {
                            FullName = q,
                            FileName = Path.GetFileName(q),
                            IsStable = jsonObj.info.version.IndexOf("preview") > -1,
                            Version = jsonObj.info.version,
                            ResourceType = Path.GetFileName(Path.GetDirectoryName(q)),
                        };
                    }
                }));

            Console.WriteLine($"Loaded API definitions on this repository");
        }


        [Serializable]
        public class SyncResultRoot
        {
            public SyncResultItem[] Items { get; set; }
        }


        [Serializable]
        public class SyncResultItem
        {
            public SyncResultItem()
            {

            }
            public string ResourceType { get; set; }
            public string Version { get; set; }
            public string[] Files { get; set; }
        }

        private static async Task CopySpecsToLocalAsync()
        {
            var updatedTargets = (doCopyOnlyStableVersion ? remoteSpecs.Where(q => q.IsStable) : remoteSpecs)                
                .GroupBy(q => new { q.FileName, q.ResourceType })
                .OrderBy(q => q.Key.ResourceType)
                .ThenBy(q => q.Key.FileName)
                .Select(q => new { Key = q.Key, Latest = q.OrderByDescending(p => p.Version).FirstOrDefault() })
                .ToArray()
                .Where(r => localSpecs.Exists(l => l.ResourceType == r.Key.ResourceType && l.FileName == r.Key.FileName && l.Version.CompareTo(r.Latest.Version) < 0 ))
                .ToArray();
            var updatedGroups = updatedTargets
                .GroupBy(q => new { q.Key.ResourceType, q.Latest.IsStable, q.Latest.Version })
                .ToArray();
            List<SyncResultItem> results = new List<SyncResultItem>();
            using (StreamWriter sw = new StreamWriter(syncResultFileName, false, System.Text.Encoding.UTF8))
            {
                foreach (var group in updatedGroups)
                {
                    results.Add((new SyncResultItem() { 
                        ResourceType = group.Key.ResourceType,
                        Version = group.Key.Version,
                        Files = group.Select(q => q.Latest.FileName).ToArray(),
                    }));
                    if (!dryRunCopy)
                    {
                        Array.ForEach(group.Select(q => q.Latest).ToArray(), (SwaggerSpec q) => {
                            q.CopyToLocal();
                        });
                    }
                }
                await sw.WriteLineAsync(JsonSerializer.Serialize<SyncResultRoot>(new SyncResultRoot() { Items = results.ToArray() }));
            }
        }
    }
}
