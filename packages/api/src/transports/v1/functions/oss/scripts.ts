import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type {
  DebionQueryRequest,
  DebionResponses,
  WhisperResponses,
  BootstrapResponses,
  BootstrapQueryRequest,
  WhisperQueryRequest,
} from "../../models";
import { OssService } from "@ashgw/core/services";

type OssGetScriptQueryRequest = DebionQueryRequest; // TODO: remove this after erryx
type OssGetTextResponses = DebionResponses; // same

async function fetchScript(input: {
  query: OssGetScriptQueryRequest;
  from: {
    repo: string;
    path: string;
  };
}): Promise<OssGetTextResponses> {
  try {
    const { text } = await OssService.fetchText({
      fetchUrl: {
        type: "github",
        repo: input.from.repo,
        scriptPath: input.from.path,
      },
      cacheControl: "s-maxage=86400, stale-while-revalidate=86400",
      revalidateSeconds: input.query.revalidateSeconds,
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

export async function debion({
  query,
}: {
  query: DebionQueryRequest;
}): Promise<DebionResponses> {
  return await fetchScript({
    from: {
      repo: "debion",
      path: "setup",
    },
    query,
  });
}
