import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type { OssGetGpgResponses, OssGetGpgQueryRequest } from "../../models";
import { OssService } from "@ashgw/core/services";
import { gpg } from "@ashgw/constants";

export async function fetchGpg(
  input: OssGetGpgQueryRequest,
): Promise<OssGetGpgResponses> {
  try {
    const { text } = await OssService.fetchText({
      fetchUrl: {
        type: "direct",
        url: gpg.publicUrl,
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
