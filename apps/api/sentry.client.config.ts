import { init } from "@rccyx/monitor/init";

// Browser-side Sentry init for this app. Next auto-loads this file so we
// don't need to wire anything in layouts or providers.
init({
  runtime: "server",
});
