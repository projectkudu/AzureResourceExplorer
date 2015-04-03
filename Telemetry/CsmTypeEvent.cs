using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ARMExplorer.Telemetry
{
    public class CsmTypeEvent : ITelemetryEvent
    {
        public string Type { get; set; }
        public string HttpMethod { get; set; }
    }
}