using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ARMExplorer.Telemetry
{
    public interface ITelemetryEvent
    {
    }

    public static class ITelemetryEventExtension
    {
        public static IDictionary<string, string> ToDictionary(this ITelemetryEvent tEvent)
        {
            return tEvent.GetType().GetProperties().Where(p =>  p.CanRead && p.PropertyType == typeof(string)).ToDictionary(k => k.Name, v => (string) v.GetValue(tEvent));
        }
    }
}