import * as React from "react";
import { render } from "@react-email/render";
import { emailService } from "./email.service";
import type { Recipient } from "./types";
import type { NotificationType } from "./types";

import VerifyEmailTemplate from "./templates/auth/VerifyEmail";
import ResetPasswordTemplate from "./templates/auth/ResetPassword";
import EmailIsVerifiedTemplate from "./templates/auth/EmailIsVerified";
import AccountDeletedTemplate from "./templates/auth/AccountDeleted";
import NotifyTemplate from "./templates/notification/Notify";
import { run, runner } from "@ashgw/runner";

export interface VerifyEmailParams {
  readonly to: Recipient;
  readonly verifyUrl: string;
  readonly userName?: string;
}
export interface EmailIsVerifiedParams {
  readonly to: Recipient;
  readonly userName?: string;
}
export interface ResetPasswordParams {
  readonly to: Recipient;
  readonly resetUrl: string;
  readonly userName?: string;
}
export interface AccountDeletedParams {
  readonly to: Recipient;
  readonly userName?: string;
  readonly time?: string;
}

/** Notification params */
export interface NotificationParams {
  readonly to: Recipient;
  readonly title: string;
  readonly messageMd: string;
  readonly type: NotificationType;
  readonly subject?: string;
}

class EmailSenders {
  public readonly auth = {
    verifyEmail: async (params: VerifyEmailParams) => {
      return runner(
        run(
          () => {
            return render(React.createElement(VerifyEmailTemplate, params), {
              pretty: true,
            });
          },
          "VerifyEmailTemplateRenderingFailure",
          {
            message: "cannot render verify email template",
          },
        ),
      ).next((html) => {
        return emailService.sendHtml({
          to: params.to,
          subject: "Verify your email",
          html,
        });
      });
    },

    afterVerification: async (params: EmailIsVerifiedParams) => {
      return runner(
        run(
          () => {
            return render(
              React.createElement(EmailIsVerifiedTemplate, params),
              { pretty: true },
            );
          },
          "EmailIsVerifiedTemplateRenderingFailure",
          {
            message: "cannot render email is verified template",
          },
        ),
      ).next((html) => {
        return emailService.sendHtml({
          to: params.to,
          subject: "Email verified",
          html,
        });
      });
    },

    resetPassword: async (params: ResetPasswordParams) => {
      return runner(
        run(
          () => {
            return render(React.createElement(ResetPasswordTemplate, params), {
              pretty: true,
            });
          },
          "ResetPasswordTemplateRenderingFailure",
          {
            message: "cannot render reset password template",
          },
        ),
      ).next((html) => {
        return emailService.sendHtml({
          to: params.to,
          subject: "Reset your password",
          html,
        });
      });
    },

    accountDeleted: async (params: AccountDeletedParams) => {
      return runner(
        run(
          () =>
            render(React.createElement(AccountDeletedTemplate, params), {
              pretty: true,
            }),
          "AccountDeletedTemplateRenderingFailure",
          {
            message: "cannot render account deleted template",
          },
        ),
      ).next((html) => {
        return emailService.sendHtml({
          to: params.to,
          subject: "Your account has been deleted",
          html,
        });
      });
    },
  };

  public readonly notification = {
    notify: async (params: NotificationParams) => {
      return runner(
        run(
          () =>
            render(
              React.createElement(NotifyTemplate, {
                messageMd: params.messageMd,
                type: params.type, // capitalize this,
              }),
              { pretty: true },
            ),
          "NotificationTemplateRenderingFailure",
          {
            message: "cannot render notification template",
          },
        ),
      ).next((html) => {
        return emailService.sendHtml({
          to: params.to,
          subject: params.subject ?? params.title,
          html,
        });
      });
    },
  };
}

export const send = new EmailSenders();
