import { Resend } from "resend";
import type { CreateEmailOptions } from "resend";
import { E, throwable } from "@ashgw/error";
import { logger } from "@ashgw/logger";
import { env } from "@ashgw/env";
import { defaultEmail, defaultEmailFrom } from "@ashgw/constants";
import type { SendParams, SendResult } from "./types";

export class EmailService {
  private _defaultEmail: string = defaultEmail;
  private _cached?: Resend;

  public get defaultEmail(): string {
    return this._defaultEmail;
  }

  public get defaultFrom(): string {
    return defaultEmailFrom;
  }

  public async sendHtml(params: SendParams): Promise<SendResult> {
    const client = this._client();
    const to = typeof params.to === "string" ? [params.to] : params.to;
    const options: CreateEmailOptions = {
      from: params.from ?? this.defaultFrom,
      to,
      subject: params.subject,
      html: params.html,
    };

    if (params.cc) {
      options.cc = typeof params.cc === "string" ? [params.cc] : params.cc;
    }
    if (params.bcc) {
      options.bcc = typeof params.bcc === "string" ? [params.bcc] : params.bcc;
    }

    logger.info("sending email...");

    const { data } = await throwable(
      "external",
      () => client.emails.send(options),
      {
        service: "resend",
        operation: "send-email",
        message: "failed to send email",
        onError: (err) =>
          logger.error("failed to send email", { errMessage: err.message }),
      },
    );

    if (!data?.id) {
      throw E.internal("missing response from email provider", {
        internal: { service: "resend", operation: "send-email" },
      });
    }

    return { id: data.id };
  }

  private _client(): Resend {
    if (!this._cached) this._cached = new Resend(env.RESEND_API_KEY);
    return this._cached;
  }
}

export const emailService = new EmailService();
