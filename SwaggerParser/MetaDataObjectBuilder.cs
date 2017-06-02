using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using ARMExplorer.Controllers;
using ARMExplorer.SwaggerParser.Model;
using Newtonsoft.Json.Linq;

namespace ARMExplorer.SwaggerParser
{
    public class MetaDataObjectBuilder
    {
        private readonly ServiceDefinition _serviceDefinition;
        private const int MaxJsonLevel = 4;

        private static readonly ReadOnlyCollection<String> BlacklistedPaths = new ReadOnlyCollection<string>(new List<string>()
        {
            "backup",
            "restore",
            "backup/config",
            "discover",
            "metrics",
            "repository",
            "Clone",
            "GetOperation",
            "register",
            "unregister",
            "GetSubscription",
            "PutSubscription",
            "ListSubscriptionStorageAccounts",
            "CheckDnsNameAvailability",
            "MigrateSubscription",
            "sharedResourceProviderBase",
            "kuduApiName",
            "ishostingenvironmentnameavailable",
            "ishostnameavailable",
            "ishostnamereservedornotallowed",
            "isusernameavailable",
            "premieraddonoffers",
            "subscriptions/{subscriptionId}/providers/Microsoft.Web/publishingCredentials",
            "webhostingplans",
            "{subscriptionid}/resourcegroups/{resourcegroupname}/providers/microsoft.web/webhostingplan",
            "/providers/Microsoft.Web/publishingUsers/{name}",
            "csrs",
            "deletedSites",
            "/workers/{workerName}",
            "/operations/{operationId}",
            "/extensions/{extensionApiMethod}",
            "/snapshots",
            "/restorablesnapshots"
        });

        public MetaDataObjectBuilder(ServiceDefinition serviceDefinition)
        {
            _serviceDefinition = serviceDefinition;
        }

        private string GetApiVersionForOperation(Operation operation)
        {
            var queryParameter = operation.Parameters.FirstOrDefault(parameter => parameter.In.Equals(ParameterLocation.Query) && parameter.IsConstant);
            if (queryParameter != null && queryParameter.Name.Equals("api-version"))
            {
                // if parameter.IsConstant is true then we are guaranteed there is an enum with 1 value
                return queryParameter.Enum.Last();
            }
            return _serviceDefinition.Info.Version;
        }

        public IEnumerable<MetadataObject> GetMetaDataObjects()
        {
            var metadataObjects = new List<MetadataObject>();
            foreach (KeyValuePair<string, Dictionary<string, Operation>> path in _serviceDefinition.Paths)
            {
                var currentPath = path.Key;
                if (BlacklistedPaths.Any(subString => currentPath.IndexOf(subString, StringComparison.OrdinalIgnoreCase) >= 0))
                    continue;
                foreach (KeyValuePair<string, Operation> methodNameOperationPair in path.Value)
                {
                    var method = methodNameOperationPair.Key;
                    var operation = methodNameOperationPair.Value;

                    var metadataObject = new MetadataObject
                    {
                        MethodName = GetMethodNameFromHttpVerb(method),
                        HttpMethod = method.ToUpper(),
                        Url = "https://management.azure.com" + currentPath,
                        ResponseBody = new JObject(),
                        ResponseBodyDoc = new JObject(),
                        RequestBody = GetRequestBodyForOperation(operation, false),
                        RequestBodyDoc = GetRequestBodyForOperation(operation, true),
                        ApiVersion = GetApiVersionForOperation(methodNameOperationPair.Value),
                    };
                    metadataObjects.Add(metadataObject);
                }
            }
            return metadataObjects;
        }

        public JObject GetRequestBodyForOperation(Operation operation, bool getDescription)
        {
            if (operation.Consumes.Count == 0 || operation.Consumes.Where(ConsumesJson).Any())
            {
                var bodyParameter = operation.Parameters.FirstOrDefault(parameter => parameter.In.Equals(ParameterLocation.Body));
                if (bodyParameter != null)
                {
                    return GetRequestBody(bodyParameter.Schema, getDescription, 0);
                }
            }
            // In the client side we rely on request body being undefined for empty request body
            // return null instead of empty JObject so that we get undefined on serialization. 
            return null;
        }

        private bool ConsumesJson(string s)
        {
            return s.Equals("application/json") || s.Equals("text/json");
        }

        private string GetMethodNameFromHttpVerb(string httpVerb)
        {
            switch (httpVerb.ToUpper())
            {
                case "GET":
                    return "Get";
                case "PUT":
                    return "CreateOrUpdate";
                case "DELETE":
                    return "Delete";
                case "PATCH":
                    return "Update";
                default:
                    return "MethodNameWeird";
            }
        }

        private Schema GetSchemaFromReferenceString(String referenceString)
        {
            var split = referenceString.Split('/');
            if (split[1].Equals("definitions", StringComparison.OrdinalIgnoreCase))
            {
                return _serviceDefinition.Definitions[split[2]];
            }
            if (split[2].Equals("parameters", StringComparison.OrdinalIgnoreCase))
            {
                return _serviceDefinition.Parameters[split[2]].Schema;
            }
            return new Schema();
        }

        private dynamic GetRequestBody(Schema schema, bool getDescription, int level)
        {
            var jObject = new JObject();

            // Item schemas of Array type can recursively contain its own types as a child of its child leading to stack overflow.
            // Return an empty object if we have traversed enough of the object hierarchy.
            if (level > MaxJsonLevel) return jObject;

            if (schema.Reference != null)
            {
                // No change in level since this is just a redirect.
                return GetRequestBody(GetSchemaFromReferenceString(schema.Reference), getDescription, level);
            }

            if (!schema.Type.Equals(DataType.Object) && !schema.Type.Equals(DataType.Array) 
                && schema.Properties == null)
            {
                var formattableString = getDescription ? schema.Description : $"({schema.Type})";
                return formattableString;
            }

            if (schema.Type.Equals(DataType.Object) || schema.Properties != null || schema.AllOf != null)
            {
                if (schema.AllOf != null)
                {
                    foreach (var allOfSchema in schema.AllOf)
                    {
                        if (allOfSchema.Reference != null)
                        {
                            jObject = GetRequestBody(GetSchemaFromReferenceString(allOfSchema.Reference), getDescription, level);
                            //return GetRequestBody(GetSchemaFromReferenceString(allOfSchema.Reference), getDescription, level);
                        }
                        if (allOfSchema.Properties != null)
                        {
                            foreach (KeyValuePair<string, Schema> keyValuePair in allOfSchema.Properties)
                            {
                                jObject[keyValuePair.Key] = GetRequestBody(keyValuePair.Value, getDescription, level+1);
                            }
                        }
                    }
                }
                if (schema.Properties != null)
                {
                    foreach (KeyValuePair<string, Schema> schemaProperty in schema.Properties)
                    {
                        jObject[schemaProperty.Key] = GetRequestBody(schemaProperty.Value, getDescription, level+1);
                    }
                }
                return jObject;
            }

            if (schema.Type.Equals(DataType.Array))
            {
                var jArray = new JArray
                {
                    GetRequestBody(schema.Items, getDescription, level + 1)
                };
                return jArray;
            }

            // This shouldn't be possible. But return an empty element
            throw new Exception("Error processing request body from swagger");
        }
    }
}
