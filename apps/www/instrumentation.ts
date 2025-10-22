import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import { observer } from "runyx";

export const onRequestError = monitor.next.SentryLib.captureRequestError;

export function register() {
  monitor.next.initializeServer();
  observer((error) => {
    // every Err() and run() call in this process goes through here
    if (error.meta?.severity === "info") {
      logger.info(error.message, {
        tag: error.tag,
        meta: error.meta,
        cause: error.cause,
      });
      return;
    }

    logger.error(error.message, {
      tag: error.tag,
      meta: error.meta,
      cause: error.cause,
    });

    monitor.next.captureException({
      error,
    });
  });
}
