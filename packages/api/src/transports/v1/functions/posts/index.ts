import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type { PostTrashDeleteResponses } from "../../models";
import { PostService } from "@ashgw/core/services";

export async function postsPurgeTrashBin(): Promise<PostTrashDeleteResponses> {
  try {
    await new PostService().purgeTrash();
    logger.info("Trashed posts purged");
    return { status: 204, body: undefined };
  } catch (error) {
    monitor.next.captureException({ error });
    return {
      status: 500,
      body: {
        code: "INTERNAL_ERROR",
        message: "Oops! Looks like it's on me this time",
      },
    };
  }
}

export const posts = {
  postsPurgeTrashBin,
};
