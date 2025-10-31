import type { PostsPurgeTrashBinHandlerResponses } from "../../models";
import { PostService } from "@rccyx/core/services";

export async function postsPurgeTrashBin(): Promise<PostsPurgeTrashBinHandlerResponses> {
  return new PostService().purgeTrash().then((r) =>
    r.match({
      ok: () => ({
        status: 204,
        body: undefined,
      }),
      err: {
        PostServiceDatabaseFailure: (e) => {
          return {
            status: 500,
            body: {
              message: e.message,
            },
          } as const;
        },
      },
    }),
  );
}

export const posts = {
  postsPurgeTrashBin,
};
