using ARMExplorer.App_Start;
using System.Web.Http;

namespace ARMExplorer
{
    public class Global : System.Web.HttpApplication
    {

        protected void Application_Start()
        {
            WebApiConfig.Register(GlobalConfiguration.Configuration);
        }
    }
}