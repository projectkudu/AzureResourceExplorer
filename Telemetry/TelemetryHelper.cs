using ARMExplorer.Telemetry;
using Microsoft.ApplicationInsights;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ARMExplorer.Telemetry
{
    public static class TelemetryHelper
    {
        private static TelemetryClient _client;

        static TelemetryHelper()
        {
            _client = new TelemetryClient();
        }

        public static void LogInfo(ITelemetryEvent tEvent)
        {
            if (tEvent != null)
            {
                _client.TrackEvent(tEvent.GetType().Name, tEvent.ToDictionary());
            }
        }

        public static void LogException(Exception e)
        {
            _client.TrackException(e);
        }
    }
}