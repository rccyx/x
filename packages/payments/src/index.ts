export type {
  PaymentProvider,
  PaymentMode,
  CheckoutSessionCreateInput,
  CheckoutSession,
  PortalSessionCreateInput,
  PortalSession,
  SubscriptionSummary,
  PaymentEvent,
  CheckoutCompletedEvent,
  SubscriptionRenewedEvent,
  SubscriptionPaymentFailedEvent,
  SubscriptionCanceledEvent,
  ParseWebhookInput,
} from "./base";

export { BasePaymentsService } from "./base";
export { whop } from "./whop";
export { stripe } from "./stripe";

import type { BasePaymentsService } from "./base";
import { stripe } from "./stripe"; // easy as bruv

export const payments: BasePaymentsService = stripe;
