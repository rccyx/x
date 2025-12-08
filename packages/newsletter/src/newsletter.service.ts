import { env } from "@rccyx/env";
import { logger } from "@rccyx/logger";
import { ok, run, runner } from "@rccyx/runner";
import { Kit } from "@anthonyhagi/kit-node-sdk";

const kit = new Kit({ apiKey: env.KIT_API_KEY });

export class NewsletterService {
  private readonly _SERVICE_TAG = "NewsletterService";
  private readonly _client = kit;
  public async subscribe({ email }: { email: string }) {
    logger.info("creating/updating subscriber", { email });
    return runner(
      run(
        () =>
          this._client.subscribers.create({
            email_address: email,
          }),
        `${this._SERVICE_TAG}SubscribeApiFailure`,
        {
          message:
            "looks like something went wrong with our newsletter provider",
          severity: "error",
          meta: {
            email,
          },
        },
      ),
    ).next(({ subscriber }) => {
      logger.info("created/updated subscriber", {
        id: subscriber.id,
        at: subscriber.created_at,
      });
      return ok();
    });
  }
}
