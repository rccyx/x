import { WhopServerSdk, makeWebhookValidator } from "@whop/api";
import type { MaybeUndefined } from "typyx";
import { env } from "@rccyx/env";
import { logger } from "@rccyx/logger";

import type {
  CheckoutSessionCreateInput,
  CheckoutSession,
  PortalSessionCreateInput,
  PortalSession,
  SubscriptionSummary,
  ParseWebhookInput,
  PaymentEvent,
} from "../base";
import { BasePaymentsService } from "../base";

/** whop implementation. uses whop checkout and billing portal. */
export class WhopPaymentsService extends BasePaymentsService {
  private readonly _sdk: ReturnType<typeof WhopServerSdk>;
  private readonly _webhookValidator: ReturnType<typeof makeWebhookValidator>;
  private readonly _companyId: string;

  constructor(companyId: string) {
    super();
    this._companyId = companyId;
    this._sdk = WhopServerSdk({
      appApiKey: env.WHOP_APP_API_KEY,
      appId: env.WHOP_APP_ID,
      companyId,
    });
    this._webhookValidator = makeWebhookValidator({
      webhookSecret: env.WHOP_WEBHOOK_SECRET,
    });

    logger.info("payments client ready", { provider: "whop", companyId });
  }

  /**
   * create a whop checkout session.
   * uses planId (passed as priceId) to create the checkout.
   * @returns session with url to redirect user to whop checkout.
   */
  public override async createCheckoutSession(
    input: CheckoutSessionCreateInput,
  ): Promise<CheckoutSession> {
    // whop createCheckoutSession works for both subscription and one-time plans
    // the plan's type (renewal vs one_time) determines the billing behavior
    const result = await this._sdk.payments.createCheckoutSession({
      planId: input.priceId,
      redirectUrl: input.successUrl,
      metadata: {
        userId: input.userId,
        userEmail: input.userEmail,
        mode: input.mode,
        ...input.metadata,
      },
    });

    if (!result || result._error) {
      throw new Error(
        result?._error?.message ?? "whop checkout session creation failed",
      );
    }

    // whop checkout url pattern
    const checkoutUrl = `https://whop.com/checkout/${result.id}`;

    return {
      provider: "whop",
      id: result.id,
      url: checkoutUrl,
    };
  }

  /**
   * create a whop billing portal session.
   * whop uses the hub settings page for billing management.
   * @returns session with url to redirect user to whop portal.
   */
  public override createPortalSession(
    input: PortalSessionCreateInput,
  ): Promise<PortalSession> {
    // whop billing portal is at whop.com/hub/settings/billing
    const portalUrl = `https://whop.com/hub/settings/billing?return_url=${encodeURIComponent(input.returnUrl)}`;

    return Promise.resolve({
      provider: "whop",
      url: portalUrl,
    });
  }

  /**
   * whop doesn't have a direct cancel membership API in the SDK.
   * users should use the billing portal to manage subscriptions.
   * @throws always - use billing portal for cancellation.
   */
  public override cancelSubscription(_input: {
    subscriptionId: string;
  }): Promise<void> {
    // whop subscription management should be done through the billing portal
    // the SDK doesn't expose a direct cancel endpoint
    return Promise.reject(
      new Error(
        "whop cancellation should be handled through the billing portal",
      ),
    );
  }

  /**
   * get whop memberships for a company.
   * note: whop requires company context for membership queries.
   * @returns array of subscription summaries.
   */
  public override async getUserSubscriptions(
    _userId: string,
  ): Promise<SubscriptionSummary[]> {
    try {
      const response = await this._sdk.companies.listMemberships({
        companyId: this._companyId,
        first: 100,
      });

      // whop sdk returns WithError<T | null>
      if (!response || response._error) {
        return [];
      }

      const result = response;
      const memberships = result.memberships.nodes ?? [];

      return memberships
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .map((m) => ({
          provider: "whop" as const,
          id: m.id,
          priceId: m.plan.id,
          status: m.status,
          currentPeriodStart: m.createdAt ? new Date(m.createdAt * 1000) : null,
          currentPeriodEnd: m.expiresAt ? new Date(m.expiresAt * 1000) : null,
          cancelAtPeriodEnd: m.canceledAt !== null,
        }));
    } catch {
      return [];
    }
  }

  /**
   * verify whop webhook signature and parse event.
   * note: this creates a Request object internally from raw body + signature.
   * @returns array of PaymentEvent objects. empty for unhandled whop events.
   * @throws if signature verification fails.
   */
  public override async parseWebhook(
    input: ParseWebhookInput,
  ): Promise<PaymentEvent[]> {
    const body =
      typeof input.rawBody === "string"
        ? input.rawBody
        : input.rawBody.toString();

    // create a Request object for the whop validator
    const request = new Request("https://webhook.local", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "whop-signature": input.signature,
      },
      body,
    });

    const event = await this._webhookValidator(request);

    return this._mapEvent(event);
  }

  /** map whop webhook events to PaymentEvent. returns empty array for unhandled events. */
  private _mapEvent(event: {
    action: string;
    data: {
      id: string;
      user_id?: string | null;
      plan_id?: string | null;
      membership_id?: string | null;
      final_amount?: number;
      currency?: string;
      status?: string;
      renewal_period_start?: number | null;
      renewal_period_end?: number | null;
      cancel_at_period_end?: boolean;
      metadata?: Record<string, unknown> | null;
    };
  }): PaymentEvent[] {
    const { action, data } = event;

    switch (action) {
      case "payment.succeeded":
        return this._handlePaymentSucceeded(data);

      case "membership.went_valid":
        return this._handleMembershipWentValid(data);

      case "membership.went_invalid":
        return this._handleMembershipWentInvalid(data);

      default:
        return [];
    }
  }

  private _handlePaymentSucceeded(data: {
    id: string;
    user_id?: string | null;
    plan_id?: string | null;
    membership_id?: string | null;
    final_amount?: number;
    currency?: string;
    metadata?: Record<string, unknown> | null;
  }): PaymentEvent[] {
    const userId = (data.metadata?.userId as string | undefined) ?? null;

    return [
      {
        type: "checkout.completed",
        provider: "whop",
        mode: "subscription",
        userId,
        customerId: data.user_id ?? "",
        subscriptionId: data.membership_id ?? null,
        priceId: data.plan_id ?? null,
        amountTotal: data.final_amount ?? null,
        currency: data.currency ?? null,
      },
    ];
  }

  private _handleMembershipWentValid(data: {
    id: string;
    user_id?: string | null;
    plan_id?: string | null;
    renewal_period_start?: number | null;
    renewal_period_end?: number | null;
    metadata?: Record<string, unknown> | null;
  }): PaymentEvent[] {
    const userId = (data.metadata?.userId as string | undefined) ?? null;

    return [
      {
        type: "subscription.renewed",
        provider: "whop",
        userId,
        customerId: data.user_id ?? "",
        subscriptionId: data.id,
        priceId: data.plan_id ?? null,
        currentPeriodStart: data.renewal_period_start
          ? new Date(data.renewal_period_start * 1000)
          : new Date(),
        currentPeriodEnd: data.renewal_period_end
          ? new Date(data.renewal_period_end * 1000)
          : new Date(),
        status: "active",
      },
    ];
  }

  private _handleMembershipWentInvalid(data: {
    id: string;
    user_id?: string | null;
    status?: string;
    cancel_at_period_end?: boolean;
    metadata?: Record<string, unknown> | null;
  }): PaymentEvent[] {
    const userId = (data.metadata?.userId as string | undefined) ?? null;

    // if cancel_at_period_end is true, this is a cancellation
    if (data.cancel_at_period_end) {
      return [
        {
          type: "subscription.canceled",
          provider: "whop",
          userId,
          customerId: data.user_id ?? "",
          subscriptionId: data.id,
          status: data.status ?? "canceled",
          canceledAt: new Date(),
        },
      ];
    }

    // otherwise it's a payment failure
    return [
      {
        type: "subscription.payment_failed",
        provider: "whop",
        userId,
        customerId: data.user_id ?? "",
        subscriptionId: data.id,
        status: data.status ?? "invalid",
      },
    ];
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _whopPaymentsClient: MaybeUndefined<WhopPaymentsService>;
}

/**
 * create a whop payments client for a specific company.
 * whop requires company context for most operations.
 */
export function createWhopPaymentsClient(
  companyId: string,
): WhopPaymentsService {
  return new WhopPaymentsService(companyId);
}

/** type alias for whop payments client instance. */
export type WhopPaymentsClient = WhopPaymentsService;
