import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type {
  OssGetTextResponses,
  OssGetScriptQueryRequest,
} from "../../models";
import { OssService } from "@ashgw/core/services";

export async function fetchScript(
  input: OssGetScriptQueryRequest,
): Promise<OssGetTextResponses> {
  try {
    const { text } = await OssService.fetchText({
      fetchUrl: {
        type: "github",
        repo: input.script.repo,
        scriptPath: input.script.path,
      },
      cacheControl: "s-maxage=86400, stale-while-revalidate=86400",
      revalidateSeconds: input.revalidateSeconds,
    });

    return {
      status: 200,
      body: text,
    };
  } catch (error) {
    logger.error("fetchGpg failed", { error });
    monitor.next.captureException({ error });
    return {
      status: 424,
      body: {
        code: "UPSTREAM_ERROR",
        message: "Upstream error",
      },
    };
  }
}
