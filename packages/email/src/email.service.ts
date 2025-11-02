import { Resend } from "resend";
import type { CreateEmailOptions } from "resend";
import { err, ok, run, runner } from "@rccyx/runner";
import { logger } from "@rccyx/logger";
import { env } from "@rccyx/env";
import { email } from "@rccyx/constants";
import type { EmailSender } from "@rccyx/constants";
import type { SendParams, SendResult } from "./types";

export class EmailService {
  private _cached?: Resend;

  public async sendHtml(params: SendParams & { from?: EmailSender }) {
    const client = this.client();
    const to = typeof params.to === "string" ? [params.to] : params.to;

    const sender = params.from ?? "bot";
    const from = email[sender].from;

    const options: CreateEmailOptions = {
      from,
      to,
      subject: params.subject,
      html: params.html,
    };

    if (params.cc)
      options.cc = typeof params.cc === "string" ? [params.cc] : params.cc;
    if (params.bcc)
      options.bcc = typeof params.bcc === "string" ? [params.bcc] : params.bcc;

    logger.info("sending email", { from, to, subject: params.subject });

    return runner(
      run(() => client.emails.send(options), "EmailClientApiSendingFailure", {
        severity: "error",
        message: "failed to send email",
      }),
    ).next(({ data, error }) => {
      if (error) {
        return err({
          message: "email response failure",
          tag: "EmailClientApiResponseFailure",
          severity: "error",
          meta: {
            note: "verify the domain if you changed it",
            resendErrorResponse: {
              message: error.message,
              name: error.name,
            },
          },
        });
      }
      return ok<SendResult>({ id: data.id });
    });
  }

  protected client(): Resend {
    if (!this._cached) this._cached = new Resend(env.RESEND_API_KEY);
    return this._cached;
  }
}

export const emailService = new EmailService();
