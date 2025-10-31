import { logger } from "@rccyx/logger";
import { monitor } from "@rccyx/monitor";
import { observer } from "runyx";

export function register() {
  monitor.next.initializeServer();
  observer((error) => {
    // Skip if the error is a retry error, only log the last attempt
    if ((error.meta?.retryAttempt ?? 0) < (error.meta?.retryMaxAttempts ?? 0))
      return;

    const severity = error.meta?.severity;
    if (severity === "warn") {
      logger.warn(error.message, {
        tag: error.tag,
        meta: error.meta,
        cause: error.cause,
      });
      return;
    }

    if (severity === "fatal") {
      logger.fatal(error.message, {
        tag: error.tag,
        meta: error.meta,
        cause: error.cause,
      });
      monitor.next.captureException({ error });
      return;
    }

    logger.error(error.message, {
      tag: error.tag,
      meta: error.meta,
      cause: error.cause,
    });

    monitor.next.captureException({ error });
  });
}
