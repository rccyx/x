import { logger } from "@ashgw/logger";
import type {
  OssGetGithubTextSchemaDto,
  OssGetDirectTextSchemaRo,
} from "../../models";
import { E, throwable } from "@ashgw/error";

function getRepoMainBranchBaseUrl(opts: { repo: string; scriptPath: string }) {
  const { repo, scriptPath } = opts;
  return `https://raw.githubusercontent.com/rccyx/${repo}/main/${scriptPath}`;
}

async function fetchText(
  input: OssGetGithubTextSchemaDto,
): Promise<OssGetDirectTextSchemaRo> {
  const url =
    input.fetchUrl.type === "github"
      ? getRepoMainBranchBaseUrl({
          repo: input.fetchUrl.repo,
          scriptPath: input.fetchUrl.scriptPath,
        })
      : input.fetchUrl.url;

  logger.info("fetching text from", { url });

  const res = await throwable(
    "external",
    () =>
      fetch(url, {
        next: { revalidate: input.revalidateSeconds },
        cache: "force-cache",
        signal: AbortSignal.timeout(10_000),
      }),
    {
      service: "oss",
      operation: "fetchText",
      message: "failed to fetch github content",
    },
  );

  if (!res.ok) {
    throw E.upstreamError(`${url} returned non-ok response`, {
      upstream: { service: "oss", operation: "fetchText" },
      statusText: res.statusText,
    });
  }

  const text = await throwable("external", () => res.text(), {
    service: "oss",
    operation: "parseText",
    message: "failed to parse upstream text",
  });

  return { text };
}

export const OssService = { fetchText };
