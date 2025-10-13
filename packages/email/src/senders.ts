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
      const html = await render(
        React.createElement(VerifyEmailTemplate, params),
        { pretty: true },
      );
      return emailService.sendHtml({
        to: params.to,
        subject: "Verify your email",
        html,
      });
    },

    afterVerification: async (params: EmailIsVerifiedParams) => {
      const html = await render(
        React.createElement(EmailIsVerifiedTemplate, params),
        { pretty: true },
      );
      return emailService.sendHtml({
        to: params.to,
        subject: "Email verified",
        html,
      });
    },

    resetPassword: async (params: ResetPasswordParams) => {
      const html = await render(
        React.createElement(ResetPasswordTemplate, params),
        { pretty: true },
      );
      return emailService.sendHtml({
        to: params.to,
        subject: "Reset your password",
        html,
      });
    },

    accountDeleted: async (params: AccountDeletedParams) => {
      const html = await render(
        React.createElement(AccountDeletedTemplate, params),
        { pretty: true },
      );
      return emailService.sendHtml({
        to: params.to,
        subject: "Your account has been deleted",
        html,
      });
    },
  };

  public readonly notification = {
    notify: async (params: NotificationParams) => {
      const html = await render(
        React.createElement(NotifyTemplate, {
          messageMd: params.messageMd,
          type: params.type, // capitalize this,
        }),
        { pretty: true },
      );
      return emailService.sendHtml({
        to: params.to,
        subject: params.subject ?? params.title,
        html,
      });
    },
  };
}

export const send = new EmailSenders();
