import { env } from "@rccyx/env";
import { logger } from "@rccyx/logger";
import { ok, run, runner } from "@rccyx/runner";
import { Kit } from "@anthonyhagi/kit-node-sdk";

const kit = new Kit({ apiKey: env.KIT_API_KEY });

export class NewsletterService {
  private readonly SERVICE_TAG = "NewsletterService";
  private readonly client = kit;
  public async subscribe({ email }: { email: string }) {
    logger.info("creating/updating subscriber", { email });
    return runner(
      run(
        () =>
          this.client.subscribers.create({
            email_address: email,
          }),
        `${this.SERVICE_TAG}SubscribeApiFailure`,
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
