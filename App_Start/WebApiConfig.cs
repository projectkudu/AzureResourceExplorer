using System.Web.Http;
using System.Web.Routing;

namespace ARMOAuth
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute("get-methods", "api/methods/{type}", new { controller = "Manage", action = "GetMethods" }, new { verb = new HttpMethodConstraint("GET", "HEAD") });
            config.Routes.MapHttpRoute("invoke-methods", "api/methods/{type}/{subscription}/{method}", new { controller = "Manage", action = "InvokeMethod" }, new { verb = new HttpMethodConstraint("POST") });

            config.Routes.MapHttpRoute("get-token", "api/token", new { controller = "ARM", action = "GetToken" }, new { verb = new HttpMethodConstraint("GET", "HEAD") });
            config.Routes.MapHttpRoute("get", "api/{*path}", new { controller = "ARM", action = "Get" }, new { verb = new HttpMethodConstraint("GET", "HEAD") });

            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            // Uncomment the following line of code to enable query support for actions with an IQueryable or IQueryable<T> return type.
            // To avoid processing unexpected or malicious queries, use the validation settings on QueryableAttribute to validate incoming queries.
            // For more information, visit http://go.microsoft.com/fwlink/?LinkId=279712.
            //config.EnableQuerySupport();

            // To disable tracing in your application, please comment out or remove the following line of code
            // For more information, refer to: http://www.asp.net/web-api
            config.EnableSystemDiagnosticsTracing();

            GlobalConfiguration.Configuration.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
        }
    }
}
