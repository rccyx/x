/** supported payment providers. extend this union when adding new backends. */
export type PaymentProvider = "stripe" | "whop";

/** checkout session mode - recurring subscriptions or one-time payments. */
export type PaymentMode = "subscription" | "payment";

export interface CheckoutSessionCreateInput {
  /** your internal user id. stored in payment provider metadata for reconciliation. */
  userId: string;
  /** user email for receipts and customer record. */
  userEmail: string;
  /** payment provider price id (e.g. stripe price_xxx). */
  priceId: string;
  /** "subscription" for recurring, "payment" for one-time. */
  mode: PaymentMode;
  /** line item quantity. defaults to 1. */
  quantity?: number;
  /** redirect url after successful payment. use {CHECKOUT_SESSION_ID} placeholder if needed. */
  successUrl: string;
  /** redirect url if user cancels checkout. */
  cancelUrl: string;
  /** additional metadata to store on the session. */
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  /** which payment provider handled this session. */
  provider: PaymentProvider;
  /** provider-specific session id. */
  id: string;
  /** redirect url for the hosted checkout page. */
  url: string;
}

export interface PortalSessionCreateInput {
  /** payment provider customer id (e.g. stripe cus_xxx). get this from checkout.completed event. */
  customerId: string;
  /** url to return to after portal session ends. */
  returnUrl: string;
}

export interface PortalSession {
  /** which payment provider handled this session. */
  provider: PaymentProvider;
  /** redirect url for the hosted billing portal page. */
  url: string;
}

export interface SubscriptionSummary {
  /** which payment provider owns this subscription. */
  provider: PaymentProvider;
  /** provider subscription id. */
  id: string;
  /** price id if available. */
  priceId: string | null;
  /** subscription status (active, canceled, past_due, trialing, etc.). */
  status: string;
  /** start of current billing period. */
  currentPeriodStart: Date | null;
  /** end of current billing period. */
  currentPeriodEnd: Date | null;
  /** true if subscription will cancel at period end instead of renewing. */
  cancelAtPeriodEnd: boolean;
}

/** union of all payment webhook events. check `type` field to narrow. */
export type PaymentEvent =
  | CheckoutCompletedEvent
  | SubscriptionRenewedEvent
  | SubscriptionPaymentFailedEvent
  | SubscriptionCanceledEvent;

/** emitted when checkout completes (both subscription and one-time). save customerId to your db. */
export interface CheckoutCompletedEvent {
  type: "checkout.completed";
  provider: PaymentProvider;
  /** "subscription" or "payment" depending on checkout mode. */
  mode: PaymentMode;
  /** your userId from metadata. null if missing. */
  userId: string | null;
  /** payment provider customer id. save this for portal sessions. */
  customerId: string;
  /** subscription id if mode was subscription. null for one-time payments. */
  subscriptionId: string | null;
  /** price id from metadata. */
  priceId: string | null;
  /** total amount in smallest currency unit (cents for usd). */
  amountTotal: number | null;
  /** currency code (usd, eur, etc.). */
  currency: string | null;
}

/** emitted when a subscription renews successfully (recurring invoice paid). */
export interface SubscriptionRenewedEvent {
  type: "subscription.renewed";
  provider: PaymentProvider;
  /** your userId from subscription metadata. */
  userId: string | null;
  /** payment provider customer id. */
  customerId: string;
  /** subscription id that renewed. */
  subscriptionId: string;
  /** price id for the subscription. */
  priceId: string | null;
  /** new billing period start. */
  currentPeriodStart: Date;
  /** new billing period end. */
  currentPeriodEnd: Date;
  /** subscription status after renewal (usually "active"). */
  status: string;
}

/** emitted when a subscription payment fails. notify user and maybe downgrade access. */
export interface SubscriptionPaymentFailedEvent {
  type: "subscription.payment_failed";
  provider: PaymentProvider;
  /** your userId from subscription metadata. */
  userId: string | null;
  /** payment provider customer id. */
  customerId: string;
  /** subscription id that failed to renew. */
  subscriptionId: string;
  /** subscription status (typically "past_due"). */
  status: string;
}

/** emitted when a subscription is canceled/deleted. revoke access. */
export interface SubscriptionCanceledEvent {
  type: "subscription.canceled";
  provider: PaymentProvider;
  /** your userId from subscription metadata. */
  userId: string | null;
  /** payment provider customer id. */
  customerId: string;
  /** subscription id that was canceled. */
  subscriptionId: string;
  /** final subscription status. */
  status: string;
  /** when the subscription was canceled. */
  canceledAt: Date | null;
}

export interface ParseWebhookInput {
  /** raw request body. do not parse as json - signature verification needs raw bytes. */
  rawBody: Buffer | string;
  /** signature header from the request (e.g. stripe-signature header value). */
  signature: string;
}

/** base class for payment service implementations. extend this to add new providers. */
export abstract class BasePaymentsService {
  /**
   * create a checkout session for subscription or one-time payment.
   * @returns session with url to redirect user to hosted checkout page.
   */
  public abstract createCheckoutSession(
    input: CheckoutSessionCreateInput,
  ): Promise<CheckoutSession>;

  /**
   * create a billing portal session for self-service subscription management.
   * users can update payment method, cancel subscription, view invoices.
   * @returns session with url to redirect user to hosted portal page.
   */
  public abstract createPortalSession(
    input: PortalSessionCreateInput,
  ): Promise<PortalSession>;

  /**
   * cancel a subscription immediately.
   * for cancel-at-period-end behavior, use the billing portal instead.
   */
  public abstract cancelSubscription(input: {
    subscriptionId: string;
  }): Promise<void>;

  /**
   * get all subscriptions for a user by userId stored in metadata.
   * @returns array of subscription summaries (may be empty).
   */
  public abstract getUserSubscriptions(
    userId: string,
  ): Promise<SubscriptionSummary[]>;

  /**
   * parse and verify an incoming webhook request.
   * @returns array of PaymentEvent objects to handle. empty for unhandled event types.
   * @throws if signature verification fails.
   */
  public abstract parseWebhook(
    input: ParseWebhookInput,
  ): Promise<PaymentEvent[]>;
}
