import { initializeClient } from "@rccyx/monitor/client";

// Browser-side Sentry init for this app. Next auto-loads this file so we
// don't need to wire anything in layouts or providers.
initializeClient();
