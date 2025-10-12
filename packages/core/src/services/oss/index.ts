import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type {
  OssGetGpgResponses,
  OssGetTextQueryRequest,
  OssGetTextResponses,
} from "../../models";
import type { ExclusiveUnion } from "ts-roids";
import { AppError } from "@ashgw/error";

interface FetchOpts {
  defaultRevalidate: number; // seconds
  cacheControl: string;
}

type FetchUrl = ExclusiveUnion<
  | {
      github: {
        repo: string;
        scriptPath: string;
      };
    }
  | {
      direct: {
        url: string;
      };
    }
>;

function getRepoMainBranchBaseUrl(opts: { repo: string; scriptPath: string }) {
  const { repo, scriptPath } = opts;
  return `https://raw.githubusercontent.com/rccyx/${repo}/main/${scriptPath}`;
}

export async function fetchText(input: {
  fetchUrl: FetchUrl;
  query?: OssGetTextQueryRequest;
  opts: FetchOpts;
}): Promise<OssGetTextResponses | OssGetGpgResponses> {
  const { fetchUrl, opts } = input;
  const revalidateSeconds =
    input.query?.revalidateSeconds ?? opts.defaultRevalidate;

  const url = fetchUrl.github
    ? getRepoMainBranchBaseUrl({
        repo: fetchUrl.github.repo,
        scriptPath: fetchUrl.github.scriptPath,
      })
    : fetchUrl.direct.url;

  try {
    const res = await fetch(url, {
      next: { revalidate: revalidateSeconds },
      cache: "force-cache",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new AppError({
        code: "INTERNAL",
        message: "Upstream error",
      });
    }

    const text = (await res.text()) as unknown as string;

    return {
      status: 200,
      body: text,
      headers: {
        "Cache-Control": opts.cacheControl,
      },
    };
  } catch (error) {
    logger.error("fetchTextFromUpstream failed", { url, error });
    monitor.next.captureException({ error });
    return {
      status: 500,
      body: {
        code: "INTERNAL_ERROR",
        message: "Internal error",
      },
    };
  }
}
