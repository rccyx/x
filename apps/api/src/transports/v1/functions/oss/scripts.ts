import { logger } from "@rccyx/logger";
import type {
  ThyxQueryRequest,
  ThyxResponses,
  WhisperResponses,
  BootstrapResponses,
  BootstrapQueryRequest,
  WhisperQueryRequest,
} from "../../models";
import { OssService } from "@rccyx/core/services";

type OssGetScriptQueryRequest = ThyxQueryRequest;
type OssGetTextResponses = ThyxResponses;

async function fetchScript(input: {
  query: OssGetScriptQueryRequest;
  from: {
    repo: string;
    path: string;
  };
}): Promise<OssGetTextResponses> {
  logger.info("fetching script from", {
    repo: input.from.repo,
    path: input.from.path,
  });

  return await OssService.fetchText({
    fetchUrl: {
      type: "github",
      repo: input.from.repo,
      scriptPath: input.from.path,
    },
    cacheControl: "s-maxage=86400, stale-while-revalidate=86400",
    revalidateSeconds: input.query.revalidateSeconds,
  }).then((r) =>
    r.match({
      ok: (data) => {
        logger.info("script fetched successfully");
        return {
          status: 200,
          body: data.text,
        } as const;
      },
      err: {
        OssServiceGithubContentApiFetchFailure: (e) =>
          ({
            status: 500,
            body: { message: e.message },
          }) as const,
        OssServiceGithubContentNonOkResponseFailure: (e) =>
          ({
            status: 424,
            body: { message: e.message },
          }) as const,
        OssServiceGithubContentParseFailure: (e) =>
          ({
            status: 500,
            body: { message: e.message },
          }) as const,
      },
    }),
  );
}

export async function whisper({
  query,
}: {
  query: WhisperQueryRequest;
}): Promise<WhisperResponses> {
  return await fetchScript({
    from: {
      repo: "whisper",
      path: "setup",
    },
    query,
  });
}

export async function bootstrap({
  query,
}: {
  query: BootstrapQueryRequest;
}): Promise<BootstrapResponses> {
  return await fetchScript({
    from: {
      repo: "dotfiles",
      path: "install/bootstrap",
    },
    query,
  });
}

export async function thyx({
  query,
}: {
  query: ThyxQueryRequest;
}): Promise<ThyxResponses> {
  return await fetchScript({
    from: {
      repo: "thyx",
      path: "setup",
    },
    query,
  });
}
