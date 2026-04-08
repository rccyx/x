import { logger } from "@rccyx/logger";
import { captureException } from "@rccyx/monitor/server";
import { init } from "@rccyx/monitor/init";
import { observer } from "runyx";

export function register() {
  init({
    runtime: "server",
  });
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
      captureException({ error });
      return;
    }

    logger.error(error.message, {
      tag: error.tag,
      meta: error.meta,
      cause: error.cause,
    });

    captureException({ error });
  });
}
