import { logger } from "@ashgw/logger";
import type {
  OssGetGithubTextSchemaDto,
  OssGetDirectTextSchemaRo,
} from "../../models";
import { err, ok, run, runner } from "@ashgw/runner";

function getRepoMainBranchBaseUrl(opts: { repo: string; scriptPath: string }) {
  const { repo, scriptPath } = opts;
  return `https://raw.githubusercontent.com/rccyx/${repo}/main/${scriptPath}`;
}

export class OssService {
  private static readonly serviceTag = "OssService";
  public static async fetchText(input: OssGetGithubTextSchemaDto) {
    const url =
      input.fetchUrl.type === "github"
        ? getRepoMainBranchBaseUrl({
            repo: input.fetchUrl.repo,
            scriptPath: input.fetchUrl.scriptPath,
          })
        : input.fetchUrl.url;

    logger.info("fetching text from", { url });

    return runner(
      run(
        () =>
          fetch(url, {
            next: { revalidate: input.revalidateSeconds },
            cache: "force-cache",
            signal: AbortSignal.timeout(10_000),
          }),
        `${this.serviceTag}GithubContentApiFetchFailure`,
        {
          message: "failed to call github api",
          severity: "error",
          meta: {
            url,
          },
        },
      ),
    )
      .next((res) => {
        if (!res.ok) {
          return err({
            message: "github api returned non-ok response",
            tag: `${this.serviceTag}GithubContentNonOkResponseFailure`,
            severity: "error",
            meta: {
              url,
              status: res.status,
              statusText: res.statusText,
              headers: Object.fromEntries(res.headers.entries()),
            },
          });
        }
        return ok(res);
      })
      .next((res) =>
        run(() => res.text(), `${this.serviceTag}GithubContentParseFailure`, {
          message: "failed to parse github content",
          severity: "error",
          meta: {
            url,
          },
        }),
      )
      .next((text) => ok<OssGetDirectTextSchemaRo>({ text }));
  }
}
