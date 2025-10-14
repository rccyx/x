import { env } from "@ashgw/env";
import { logger } from "@ashgw/logger";
import { E, throwable } from "../../../../runner/src";

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
        service: "newsletter",
        operation: "create-subscriber",
      },
    );

    const data = await throwable("external", () => this._parseResponse(res), {
      message: "failed to parse newsletter response",
      service: "newsletter",
      operation: "create-subscriber",
    });

    this._validateResponse({ res, data });
  }
  private static async _parseResponse(res: Response): Promise<KitAPIResponse> {
    // handle empty or non-json responses explicitly
    if (
      res.status === 204 ||
      !res.headers.get("content-type")?.includes("application/json")
    ) {
      return {};
    }

    const text = await throwable("external", () => res.text(), {
      service: "newsletter",
      operation: "read-body",
      message: "failed to read newsletter response body",
    });

    // constrain JSON.parse to a typed generic
    const json = await throwable(
      "external",
      () => JSON.parse(text) as unknown,
      {
        service: "newsletter",
        operation: "read-body",
        message: "failed to parse newsletter JSON",
      },
    );

    if (typeof json !== "object" || json === null || Array.isArray(json)) {
      throw E.unprocessableContent("unexpected Kit API response shape");
    }
    return json as KitAPIResponse;
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
