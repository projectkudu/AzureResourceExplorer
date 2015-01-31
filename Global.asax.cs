using ARMExplorer.App_Start;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
            WebApiConfig.Register(GlobalConfiguration.Configuration);
        }
    }
}