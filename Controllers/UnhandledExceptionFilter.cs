using ARMExplorer.Controllers.Telemetry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Filters;

namespace ARMExplorer.Controllers
{
    public class UnhandledExceptionFilter : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext context)
        {
            TelemetryHelper.LogException(context.Exception);
        }
    }
}