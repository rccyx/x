import { z } from "zod";
import { env } from "@ashgw/env";
import { logger } from "@ashgw/logger";
import { err, ok, run, runner } from "@ashgw/runner";

interface SubscribeInput {
  email: string;
}

const kitAPIResponseSchema = z.object({
  errors: z.array(z.string()).optional(),
  message: z.string().optional(),
});

type KitAPIResponse = z.infer<typeof kitAPIResponseSchema>;

const serviceTag = "NewsletterService";

export class NewsletterService {
  private static readonly API_BASE = "https://api.kit.com/v4";
  private static readonly HEADERS = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": env.KIT_API_KEY,
  } as const;

  public static async subscribe({ email }: SubscribeInput) {
    logger.info("creating/updating subscriber", { email });

    return runner(
      run(
        () =>
          fetch(`${this.API_BASE}/subscribers`, {
            method: "POST",
            headers: this.HEADERS,
            body: JSON.stringify({ email_address: email }),
          }),
        `${serviceTag}SubscriberApiFailure`,
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
      .next((res) => {
        return run(
          () => this._parseKitResponse(res),
          `${serviceTag}ParseResponseFailure`,
          {
            message:
              "looks like something went wrong with our newsletter provider",
            severity: "error",
            meta: {
              email,
            },
          },
        );
      })
      .next((kitApiResponse) => {
        if (kitApiResponse.errors) {
          return err({
            severity: "error",
            message: "failed to subscribe to newsletter",
            tag: "NewsletterServiceSubscribeFailure",
            meta: {
              note: "kit response doesnt look like what it's supposed to be",
              apiResponseErrors: {
                ...kitApiResponse.errors,
              },
            },
          });
        }
        return ok();
      });
  }

  private static _parseKitResponse(res: Response): KitAPIResponse {
    if (
      res.status === 204 ||
      !res.headers.get("content-type")?.includes("application/json")
    ) {
      return {};
    }
    return kitAPIResponseSchema.parse(res.json());
  }
}
