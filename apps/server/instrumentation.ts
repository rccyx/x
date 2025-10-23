import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import { observer } from "runyx";

export function register() {
  monitor.next.initializeServer();
  observer((error) => {
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
