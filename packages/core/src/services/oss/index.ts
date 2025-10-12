import type {
  OssGetGithubTextSchemaDto,
  OssGetDirectTextSchemaRo,
} from "../../models";
import { AppError } from "@ashgw/error";

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

  try {
    const res = await fetch(url, {
      next: { revalidate: input.revalidateSeconds },
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
    return { text };
  } catch (error) {
    throw new AppError({
      code: "INTERNAL",
      message: "Upstream fetch failed",
      cause: error,
    });
  }
}

export const OssService = {
  fetchText,
};
