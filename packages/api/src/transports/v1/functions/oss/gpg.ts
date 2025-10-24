import type { GpgQueryRequest, GpgResponses } from "../../models";
import { OssService } from "@ashgw/core/services";
import { gpg as gpgConstants } from "@ashgw/constants";

function error(status: GpgResponses["status"], message: string): GpgResponses {
  return {
    status,
    body: {
      message: message,
    },
  } as GpgResponses;
}

export async function gpg({
  query,
}: {
  query: GpgQueryRequest;
}): Promise<GpgResponses> {
  return OssService.fetchText({
    fetchUrl: {
      type: "direct",
      url: gpgConstants.publicUrl,
    },
    cacheControl: "s-maxage=86400, stale-while-revalidate=86400",
    revalidateSeconds: query.revalidateSeconds,
  }).then((r) =>
    r.match({
      ok: (data) => {
        return {
          status: 200,
          body: data.text,
        };
      },
      err: {
        OssServiceGithubContentApiFetchFailure: (e) => error(500, e.message),
        OssServiceGithubContentNonOkResponseFailure: (e) =>
          error(424, e.message),
        OssServiceGithubContentParseFailure: (e) => error(500, e.message),
      },
    }),
  );
}
