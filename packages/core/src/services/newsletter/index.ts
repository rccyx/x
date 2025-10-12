import { env } from "@ashgw/env";
import { logger } from "@ashgw/logger";
import { E, throwable } from "@ashgw/error";

interface SubscribeInput {
  email: string;
}

interface KitAPIResponse {
  errors?: string[];
  message?: string;
}

export class NewsletterService {
  private static readonly API_BASE = "https://api.kit.com/v4";
  private static readonly HEADERS = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": env.KIT_API_KEY,
  } as const;

  public static async subscribe({ email }: SubscribeInput): Promise<void> {
    await this._createSubscriber({ email });
  }

  private static async _createSubscriber({
    email,
  }: SubscribeInput): Promise<void> {
    logger.info("creating/updating subscriber", { email });

    const res = await throwable(
      "external",
      () =>
        fetch(`${this.API_BASE}/subscribers`, {
          method: "POST",
          headers: this.HEADERS,
          body: JSON.stringify({ email_address: email }),
        }),
      {
        message: "failed to subscribe to newsletter",
        service: "kit",
        operation: "create-subscriber",
        onError: (err) => {
          logger.error("kit api request failed", { errMessage: err.message });
        },
      },
    );

    const data = await throwable("internal", () => this._parseResponse(res), {
      message: "failed to parse newsletter response",
      service: "kit",
      operation: "create-subscriber",
      onError: (err) => {
        logger.error("failed to parse newsletter response", {
          errMessage: err.message,
        });
      },
    });

    this._validateResponse({ res, data });
  }

  private static async _parseResponse(res: Response): Promise<KitAPIResponse> {
    return (await res.json().catch(() => ({
      errors: ["failed to parse response"],
    }))) as KitAPIResponse;
  }

  private static _validateResponse({
    res,
    data,
  }: {
    res: Response;
    data: KitAPIResponse;
  }): void {
    logger.info("kit api response", {
      status: res.status,
      data,
      headers: Object.fromEntries(res.headers.entries()),
    });

    if (!res.ok) {
      const errorMessage =
        data.errors?.join(", ") ?? data.message ?? "unknown error";

      throw E.upstreamError(`kit api error (${res.status}): ${errorMessage}`, {
        upstream: { service: "kit", operation: "create-subscriber" },
      });
    }
  }
}
