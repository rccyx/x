export const ANALYTICS_EVENTS = {
  USER_SIGNED_UP: "user_signed_up",
  PROJECT_CREATED: "project_created",
  SUBSCRIPTION_UPGRADED: "subscription_upgraded",
} as const;

export interface AnalyticsEventBus {
  [ANALYTICS_EVENTS.USER_SIGNED_UP]: {
    plan: "free" | "pro";
    method: "google" | "email";
  };
  [ANALYTICS_EVENTS.PROJECT_CREATED]: {
    template_used: string;
    is_private: boolean;
  };
  // ... add your humongous structure here
}
