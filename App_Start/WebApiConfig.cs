using System.Web.Http;
using System.Web.Routing;

namespace ARMExplorer.App_Start
{
    public class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute("get-operations-for-user-post", "api/all-operations", new { controller = "Operation", action = "GetPost" }, new { verb = new HttpMethodConstraint("POST") });
            config.Routes.MapHttpRoute("get-providers-for-subscription", "api/operations/providers/{subscriptionId}", new { controller = "Operation", action = "GetProviders" }, new { verb = new HttpMethodConstraint("GET", "HEAD") });
            config.Routes.MapHttpRoute("invoke-operation", "api/operations", new { controller = "Operation", action = "Invoke" }, new { verb = new HttpMethodConstraint("POST") });
            config.Routes.MapHttpRoute("get-providers-for-user", "api/providers",new {controller = "Operation", action = "GetAllProviders" }, new {verb = new HttpMethodConstraint("GET", "HEAD")});

            config.Routes.MapHttpRoute("get-token", "api/token", new { controller = "ARM", action = "GetToken" }, new { verb = new HttpMethodConstraint("GET", "HEAD") });
            config.Routes.MapHttpRoute("get-search", "api/search", new { controller = "ARM", action = "Search" }, new { verb = new HttpMethodConstraint("GET", "HEAD") });
            config.Routes.MapHttpRoute("get", "api/{*path}", new { controller = "ARM", action = "Get" }, new { verb = new HttpMethodConstraint("GET", "HEAD") });

            GlobalConfiguration.Configuration.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
        }
    }
}