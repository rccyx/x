import { z } from "zod";
import { env } from "@rccyx/env";
import { logger } from "@rccyx/logger";
import { err, ok, run, runner } from "@rccyx/runner";

const kitAPIResponseSchema = z.object({
  errors: z.array(z.string().min(1)).optional(),
  message: z.string().min(1).optional(),
});

export class NewsletterService {
  private readonly API_BASE = "https://api.kit.com/v4";
  private readonly SERVICE_TAG = "NewsletterService";
  private readonly HEADERS = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": env.KIT_API_KEY,
  } as const;

  public async subscribe({ email }: { email: string }) {
    logger.info("creating/updating subscriber", { email });

    return runner(
      run(
        () =>
          fetch(`${this.API_BASE}/subscribers`, {
            method: "POST",
            headers: this.HEADERS,
            body: JSON.stringify({ email_address: email }),
          }),
        `${this.SERVICE_TAG}SubscriberApiFailure`,
        {
          message:
            "looks like something went wrong with our newsletter provider",
          severity: "error",
          meta: {
            email,
          },
        },
      ),
    )
      .next((res) => this._parse(res))
      .next((kitRes) => {
        if (kitRes.errors) {
          return err({
            severity: "error",
            message: "failed to subscribe to newsletter",
            tag: "NewsletterServiceSubscribeFailure",
            meta: {
              note: "kit response doesnt look like what it's supposed to be",
              apiResponse: {
                errors: kitRes.errors,
                message: kitRes.message,
              },
            },
          });
        }
        return ok();
      });
  }

  private _parse(res: Response) {
    return run(
      () => {
        if (
          res.status === 204 ||
          !res.headers.get("content-type")?.includes("application/json")
        ) {
          return {};
        }
        return kitAPIResponseSchema.parse(res.json());
      },
      `${this.SERVICE_TAG}ParseResponseFailure`,
      {
        message: "looks like something went wrong with our newsletter provider",
        severity: "error",
        meta: {
          reason: "response is not valid JSON, could not parse properly",
        },
      },
    );
  }
}
