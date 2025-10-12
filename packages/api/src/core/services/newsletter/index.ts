import { env } from "@ashgw/env";
import { AppError } from "@ashgw/error";
import { logger } from "@ashgw/logger";

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

  /** Creates or updates a subscriber */
  public static async subscribe({ email }: SubscribeInput): Promise<void> {
    try {
      await this._createSubscriber({ email });
    } catch (error) {
      logger.error("Newsletter subscription failed", { error });
      throw new AppError({
        code: "INTERNAL",
        message: "Failed to subscribe to newsletter",
        cause: error,
      });
    }
  }

  private static async _createSubscriber({
    email,
  }: SubscribeInput): Promise<void> {
    logger.info("Creating/updating subscriber", { email });

    const res = await fetch(`${this.API_BASE}/subscribers`, {
      method: "POST",
      headers: this.HEADERS,
      body: JSON.stringify({
        email_address: email,
      }),
    });

    const data = await this._parseResponse(res);
    this._handleResponse({ res, data });
  }

  private static async _parseResponse(res: Response): Promise<KitAPIResponse> {
    return (await res.json().catch(() => ({
      errors: ["Failed to parse response"],
    }))) as KitAPIResponse;
  }

  private static _handleResponse({
    res,
    data,
  }: {
    res: Response;
    data: KitAPIResponse;
  }): void {
    logger.info("Kit API response", {
      status: res.status,
      data,
      headers: Object.fromEntries(res.headers.entries()),
    });

    if (!res.ok) {
      const errorMessage =
        data.errors?.join(", ") ?? data.message ?? "Unknown error";

      throw new AppError({
        code: "INTERNAL",
        message: `Kit API error (${res.status}): ${errorMessage}`,
      });
    }
  }
}
