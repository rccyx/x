import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type {
  OssGetGpgResponses,
  OssGetTextQueryDto,
  OssGetTextResponses,
} from "~/api/v1/models";
import type { ExclusiveUnion } from "ts-roids";

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

export class OssService {
  public static async fetchText(input: {
    fetchUrl: FetchUrl;
    query?: OssGetTextQueryDto;
    opts: FetchOpts;
  }): Promise<OssGetTextResponses | OssGetGpgResponses> {
    const { fetchUrl, opts } = input;
    const revalidateSeconds =
      input.query?.revalidateSeconds ?? opts.defaultRevalidate;

    const url = fetchUrl.github
      ? OssService._repoMainBranchBaseUrl({
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
        return {
          status: 424,
          body: {
            code: "UPSTREAM_ERROR",
            message: "Upstream error",
          },
        };
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
  private static _repoMainBranchBaseUrl(opts: {
    repo: string;
    scriptPath: string;
  }) {
    const { repo, scriptPath } = opts;
    return `https://raw.githubusercontent.com/rccyx/${repo}/main/${scriptPath}`;
  }
}
