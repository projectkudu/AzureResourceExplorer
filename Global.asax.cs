using ARMExplorer.App_Start;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Principal;
using System.Web;
using System.Web.Http;
using System.Web.Security;
using System.Web.SessionState;

namespace ARMExplorer
{
    public class Global : System.Web.HttpApplication
    {

        protected void Application_Start()
        {
            WebApiConfig.Register(GlobalConfiguration.Configuration);
        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {
            var displayName = HttpContext.Current.Request.Headers["X-MS-CLIENT-DISPLAY-NAME"];
            var principalName = HttpContext.Current.Request.Headers["X-MS-CLIENT-PRINCIPAL-NAME"];
            if (!string.IsNullOrWhiteSpace(principalName) ||
                !string.IsNullOrWhiteSpace(displayName))
            {
                HttpContext.Current.User = new GenericPrincipal(new GenericIdentity(principalName ?? displayName), new [] {"User"});
            }
        }
    }
}