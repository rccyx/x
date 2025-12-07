import Stripe from "stripe";
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
  PaymentMode,
} from "../base";
import { BasePaymentsService } from "../base";

/** stripe checkout implementation. uses hosted checkout pages, no card forms on your frontend. */
export class StripeCheckoutPaymentsService extends BasePaymentsService {
  private static readonly _STRIPE_API_VERSION: Stripe.LatestApiVersion =
    "2024-06-20";
  private readonly _stripe: Stripe;
  private readonly _webhookSecret: string;

  constructor() {
    super();
    this._stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: StripeCheckoutPaymentsService._STRIPE_API_VERSION,
    });
    this._webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    logger.info("payments client ready", { provider: "stripe" });
  }

  /**
   * create a stripe checkout session.
   * automatically creates/finds customer by userId metadata.
   * @returns session with url to redirect user to stripe checkout.
   */
  public override async createCheckoutSession(
    input: CheckoutSessionCreateInput,
  ): Promise<CheckoutSession> {
    const customer = await this._ensureCustomer(input.userId, input.userEmail);

    const quantity = input.quantity ?? 1;
    const metadata: Record<string, string> = {
      userId: input.userId,
      priceId: input.priceId,
      ...input.metadata,
    };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: input.mode,
      customer: customer.id,
      line_items: [{ price: input.priceId, quantity }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata,
    };

    if (input.mode === "subscription") {
      sessionParams.subscription_data = {
        metadata: {
          userId: input.userId,
          priceId: input.priceId,
        },
      };
    }

    const session = await this._stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error("stripe checkout session missing url");
    }

    return {
      provider: "stripe",
      id: session.id,
      url: session.url,
    };
  }

  /**
   * create a stripe billing portal session.
   * @returns session with url to redirect user to stripe portal.
   */
  public override async createPortalSession(
    input: PortalSessionCreateInput,
  ): Promise<PortalSession> {
    const session = await this._stripe.billingPortal.sessions.create({
      customer: input.customerId,
      return_url: input.returnUrl,
    });

    return {
      provider: "stripe",
      url: session.url,
    };
  }

  /** cancel a stripe subscription immediately. */
  public override async cancelSubscription(input: {
    subscriptionId: string;
  }): Promise<void> {
    await this._stripe.subscriptions.cancel(input.subscriptionId);
  }

  /**
   * search stripe subscriptions by userId in metadata.
   * @returns array of subscription summaries.
   */
  public override async getUserSubscriptions(
    userId: string,
  ): Promise<SubscriptionSummary[]> {
    const result = await this._stripe.subscriptions.search({
      query: `metadata['userId']:'${userId}'`,
    });

    return result.data.map((sub) => this._mapSubscription(sub));
  }

  /**
   * verify stripe webhook signature and parse event.
   * @returns array of PaymentEvent objects. empty for unhandled stripe events.
   * @throws if signature verification fails.
   */
  public override async parseWebhook(
    input: ParseWebhookInput,
  ): Promise<PaymentEvent[]> {
    const rawBody =
      typeof input.rawBody === "string"
        ? Buffer.from(input.rawBody)
        : input.rawBody;

    const event = this._stripe.webhooks.constructEvent(
      rawBody,
      input.signature,
      this._webhookSecret,
    );

    return this._mapEvent(event);
  }

  /** find or create stripe customer by userId metadata. updates email if changed. */
  private async _ensureCustomer(
    userId: string,
    email: string,
  ): Promise<Stripe.Customer> {
    const searchResult = await this._stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
    });

    if (searchResult.data.length > 0) {
      const existing = searchResult.data[0];
      if (!existing) {
        throw new Error("unexpected empty customer search result");
      }
      if (existing.email !== email) {
        return this._stripe.customers.update(existing.id, { email });
      }
      return existing;
    }

    return this._stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  private _mapSubscription(sub: Stripe.Subscription): SubscriptionSummary {
    const priceId = sub.items.data[0]?.price?.id ?? null;

    return {
      provider: "stripe",
      id: sub.id,
      priceId,
      status: sub.status,
      currentPeriodStart: sub.current_period_start
        ? new Date(sub.current_period_start * 1000)
        : null,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  /** map stripe events to PaymentEvent. returns empty array for unhandled events. */
  private async _mapEvent(event: Stripe.Event): Promise<PaymentEvent[]> {
    switch (event.type) {
      case "checkout.session.completed":
        return this._handleCheckoutCompleted(event.data.object);

      case "invoice.payment_succeeded":
        return this._handleInvoicePaymentSucceeded(event.data.object);

      case "invoice.payment_failed":
        return this._handleInvoicePaymentFailed(event.data.object);

      case "customer.subscription.deleted":
        return this._handleSubscriptionDeleted(event.data.object);

      default:
        return [];
    }
  }

  private _handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): PaymentEvent[] {
    const mode: PaymentMode =
      session.mode === "subscription" ? "subscription" : "payment";
    const customerId = this._extractCustomerId(session.customer);
    const subscriptionId = this._extractStringId(session.subscription);

    return [
      {
        type: "checkout.completed",
        provider: "stripe",
        mode,
        userId: session.metadata?.userId ?? null,
        customerId,
        subscriptionId,
        priceId: session.metadata?.priceId ?? null,
        amountTotal: session.amount_total,
        currency: session.currency,
      },
    ];
  }

  private async _handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<PaymentEvent[]> {
    const subscriptionId = this._extractStringId(invoice.subscription);
    if (!subscriptionId) {
      return [];
    }

    const subscription =
      await this._stripe.subscriptions.retrieve(subscriptionId);
    const customerId = this._extractCustomerId(subscription.customer);
    const priceId = subscription.items.data[0]?.price?.id ?? null;
    const userId = subscription.metadata.userId ?? null;

    return [
      {
        type: "subscription.renewed",
        provider: "stripe",
        userId,
        customerId,
        subscriptionId,
        priceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: subscription.status,
      },
    ];
  }

  private async _handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<PaymentEvent[]> {
    const subscriptionId = this._extractStringId(invoice.subscription);
    if (!subscriptionId) {
      return [];
    }

    const subscription =
      await this._stripe.subscriptions.retrieve(subscriptionId);
    const customerId = this._extractCustomerId(subscription.customer);
    const userId = subscription.metadata.userId ?? null;

    return [
      {
        type: "subscription.payment_failed",
        provider: "stripe",
        userId,
        customerId,
        subscriptionId,
        status: subscription.status,
      },
    ];
  }

  private _handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): PaymentEvent[] {
    const customerId = this._extractCustomerId(subscription.customer);
    const userId = subscription.metadata.userId ?? null;

    return [
      {
        type: "subscription.canceled",
        provider: "stripe",
        userId,
        customerId,
        subscriptionId: subscription.id,
        status: subscription.status,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    ];
  }

  private _extractCustomerId(
    customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  ): string {
    if (typeof customer === "string") {
      return customer;
    }
    if (customer && "id" in customer) {
      return customer.id;
    }
    return "";
  }

  private _extractStringId(
    value: string | { id: string } | null | undefined,
  ): string | null {
    if (typeof value === "string") {
      return value;
    }
    if (value && typeof value === "object" && "id" in value) {
      return value.id;
    }
    return null;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _paymentsClient: MaybeUndefined<StripeCheckoutPaymentsService>;
}

/** singleton stripe payments client. cached on global in dev for hot reload. */
export const stripePaymentsClient =
  global._paymentsClient ?? new StripeCheckoutPaymentsService();

/** type alias for stripe payments client instance. */
export type StripePaymentsClient = typeof stripePaymentsClient;

// node dev, not global dev
if (env.NODE_ENV !== "production")
  global._paymentsClient = stripePaymentsClient;
