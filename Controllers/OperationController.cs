using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;
using Hydra.ApiModel;
using Hydra.ServiceModel;
using Microsoft.Azure.Management.WebSites;
using Newtonsoft.Json.Linq;

namespace ARMOAuth.Controllers
{
    public class OperationController : ApiController
    {
        const string ApiVersion = "2014-06-01";
        static object _lock = new object();
        static bool _resetDefinedTypes = false;
        static Dictionary<Type, JArray[]> _operations = new Dictionary<Type, JArray[]>();

        public OperationController()
        {
            ResetDefinedTypes();
        }

        [Authorize]
        public HttpResponseMessage Get(bool hidden = false)
        {
            var watch = new Stopwatch();
            watch.Start();

            var json = GetOperations<WebSiteManagementClient>(hidden);

            watch.Stop();
            var response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
            response.Headers.Add(Utils.X_MS_Ellapsed, watch.ElapsedMilliseconds + "ms");
            return response;
        }

        [Authorize]
        public async Task<HttpResponseMessage> Invoke(OperationInfo info)
        {
            using (var client = GetClient(Utils.GetCSMUrl(Request.RequestUri.Host)))
            {
                var request = new HttpRequestMessage(new System.Net.Http.HttpMethod(info.HttpMethod), info.Url + "?api-version=" + ApiVersion);
                if (info.RequestBody != null)
                {
                    request.Content = new StringContent(info.RequestBody.ToString(), Encoding.UTF8, "application/json");
                }

                return await Utils.Execute(client.SendAsync(request));
            }
        }

        private HttpClient GetClient(string baseUri)
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(baseUri);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",
                Request.Headers.GetValues(Utils.X_MS_OAUTH_TOKEN).FirstOrDefault());
            client.DefaultRequestHeaders.Add("User-Agent", Request.RequestUri.Host);
            return client;
        }

        private void ResetDefinedTypes()
        {
            if (!_resetDefinedTypes)
            {
                lock (_lock)
                {
                    ServiceType.ResetDefinedTypes();
                }
            }
        }

        private bool ShouldSkip(IMethod method)
        {
            return method.Name.IndexOf("backup", StringComparison.OrdinalIgnoreCase) >= 0
                || method.Name.IndexOf("restore", StringComparison.OrdinalIgnoreCase) >= 0
                || method.Name.IndexOf("discover", StringComparison.OrdinalIgnoreCase) >= 0
                || method.Name.IndexOf("resource", StringComparison.OrdinalIgnoreCase) >= 0
                || method.Name.IndexOf("slotConfigNames", StringComparison.OrdinalIgnoreCase) >= 0
                || method.Name.IndexOf("usages", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        private JArray GetOperations<T>(bool hidden)
        {
            lock (_lock)
            {
                JArray[] cache;
                if (_operations.TryGetValue(typeof(T), out cache))
                {
                    return cache[hidden ? 1 : 0];
                }
            }

            var service = ApiModeler.Instantiate<T, IService>();

            JArray array = new JArray();
            JArray skip = new JArray();
            foreach (var method in service.Methods.Values)
            {
                GenerateMethod(ShouldSkip(method) ? skip : array, method);
            }

            foreach (var operation in service.ServiceOperations)
            {
                foreach (var method in operation.Value.Methods.Values)
                {
                    GenerateMethod(ShouldSkip(method) ? skip : array, method);
                }
            }

            lock (_lock)
            {
                _operations[typeof(T)] = new[] { array, skip };
            }

            return array;
        }

        private void GenerateMethod(JArray array, IMethod method)
        {
            var json = new JObject();
            json["MethodName"] = method.Name;
            json["HttpMethod"] = method.HttpMethod.ToString();

            if (method.RequestBodies.Count == 1)
            {
                var request = (RequestBody)method.RequestBodies.First().Value;
                var schema = GetJsonSchehma(request.Serialization);
                json["RequestBody"] = schema;
            }

            if (method.ResponseBodies.Count == 1)
            {
                var response = (ResponseBody)method.ResponseBodies.First().Value;
                var schema = GetJsonSchehma(response.Serialization);
                json["ResponseBody"] = schema;
            }

            var url = EvaluateExpression(method.UrlExpression).ToString();
            url = url.Contains('?') ? url.Substring(0, url.IndexOf('?')) : url;

            var urls = new List<string>();
            if (url.Contains('['))
            {
                urls.Add(url.Replace("[", String.Empty).Replace("]", String.Empty));
                urls.Add(Regex.Replace(url, "[[][^]]*[]]+", String.Empty));
            }
            else
            {
                urls.Add(url);
            }

            foreach (var item in urls)
            {
                var clone = json.DeepClone();
                clone["Url"] = item;
                array.Add(clone);
            }
        }

        private JToken GetJsonSchehma(ISerializationBase serialization)
        {
            var xmlValue = serialization as Hydra.ServiceModel.XmlElement;
            if (xmlValue != null)
            {
                return "(xml)";
            }

            var jsonValue = serialization as Hydra.ServiceModel.JsonValue;
            if (jsonValue != null)
            {
                if (jsonValue.Type is Hydra.ServiceModel.ObjectType)
                {
                    var schema = new JObject();
                    foreach (var member in jsonValue.Members)
                    {
                        if ((member is JsonValue && ((JsonValue)member).PassThrough) ||
                            (member is JsonArray && ((JsonArray)member).PassThrough) ||
                            (member is JsonDictionary && ((JsonDictionary)member).PassThrough))
                        {
                            return GetJsonSchehma(member);
                        }

                        schema[member.Name] = GetJsonSchehma(member);
                    }
                    return schema;
                }

                if (jsonValue.Type is Hydra.ServiceModel.KnownType)
                {
                    return String.Format("({0})", jsonValue.Type.Name.ToLower());
                }

                if (jsonValue.Type.UnderlyingType.IsEnum)
                {
                    var strb = new StringBuilder();
                    bool first = true;
                    foreach (var value in Enum.GetValues(jsonValue.Type.UnderlyingType))
                    {
                        strb.Append(first ? '(' : '|');
                        strb.Append(value);
                        first = false;
                    }
                    strb.Append(')');
                    return strb.ToString();
                }

                throw new InvalidOperationException("Should not reach here. jsonValue.Type  = " + jsonValue.Type);
            }

            var jsonArray = serialization as Hydra.ServiceModel.JsonArray;
            if (jsonArray != null)
            {
                var schema = new JArray();
                if (jsonArray.Element != null)
                {
                    schema.Add(GetJsonSchehma(jsonArray.Element));
                }
                else
                {
                    var elementType = jsonArray.Type.UnderlyingType.GenericTypeArguments.FirstOrDefault();
                    var strb = new StringBuilder();
                    strb.Append('(');
                    strb.Append(elementType == null ? "string" : elementType.Name.ToLower());
                    strb.Append(')');
                    schema.Add(strb.ToString());
                }
                return schema;
            }

            var jsonDict = serialization as Hydra.ServiceModel.JsonDictionary;
            if (jsonDict != null)
            {
                return new JObject();
            }

            throw new InvalidOperationException("Should not reach here for " + serialization.GetType());
        }

        private object EvaluateExpression(BindingExpression expression)
        {
            // special case
            if (expression.ToString().Equals("{Credentials.SubscriptionId}", StringComparison.OrdinalIgnoreCase))
            {
                return "{subscriptionId}";
            }

            if (expression.ToString().Equals("{BaseUri}", StringComparison.OrdinalIgnoreCase))
            {
                return Utils.GetCSMUrl(Request.RequestUri.Host);
                //return EvaluateExpression(((Hydra.ServiceModel.Method)expression.Context).Service.BaseUrlExpression);
            }

            if (expression.ToString().StartsWith("{parameters.", StringComparison.OrdinalIgnoreCase))
            {
                var parts = expression.ToString().Split(new[] { '.', '{', '}' }, StringSplitOptions.RemoveEmptyEntries);
                return "{" + parts.Last() + "}";
            }

            var concat = expression as ConcatenatedBindingExpression;
            if (concat != null)
            {
                var strb = new StringBuilder();
                foreach (var item in concat.Expressions)
                {
                    strb.Append(EvaluateExpression(item));
                }
                return strb.ToString();
            }

            var conditional = expression as ConditionalBindingExpression;
            if (conditional != null)
            {
                var strb = new StringBuilder();
                strb.Append('[');
                strb.Append(EvaluateExpression(conditional.ConcatenatedExpression));
                strb.Append(']');
                return strb.ToString();
            }

            var literal = expression as LiteralBindingExpression;
            if (literal != null)
            {
                return literal.Text;
            }

            var instance = expression as InstanceBindingExpression;
            if (instance != null)
            {
                return instance.Context;
            }

            var property = expression as PropertyPathBindingExpression;
            if (property != null)
            {
                var obj = EvaluateExpression(property.Expression);
                if (obj == null)
                {
                    throw new InvalidOperationException(property.Expression + " expression should not be null");
                }

                var prop = obj.GetType().GetProperty(property.PropertyName);
                if (prop == null)
                {
                    throw new InvalidOperationException(property.PropertyName + " property should not be null");
                }

                var value = prop.GetValue(obj);
                return value;
            }

            var parameter = expression as ParameterBindingExpression;
            if (parameter != null)
            {
                var parts = parameter.ToString().Split(new[] { '.', '{', '}' }, StringSplitOptions.RemoveEmptyEntries);
                return "{" + parts.Last() + "}";
            }

            var formatting = expression as FormattingBindingExpression;
            if (formatting != null)
            {
                return "{" + formatting.FormatString + "}";
            }

            throw new InvalidOperationException("Should not reach here. " + expression.GetType() + ", " + expression);
        }
    }
}
