import { middlewareResponse, middlewareFn } from "ts-rest-kit/core";
import { createLimiter } from "limico";
import type { RlWindow } from "limico";
import type { GlobalContext } from "~/ts-rest/context";
import { getFingerprint } from "@ashgw/security";

type RlKind = "interval" | "quota";

interface RateLimiterCtx {
  rl: {
    every: RlWindow;
    kind: RlKind;
  };
}

export type RateLimitOptions =
  | {
      kind: "interval";
      limit: {
        every: RlWindow;
      };
    }
  | {
      kind: "quota";
      limit: {
        every: RlWindow;
        hits: number;
      };
    };

const rlQ = createLimiter({
  kind: "quota",
  limit: 1,
  window: "1s",
});

const rlI = createLimiter({
  kind: "interval",
  interval: "1s",
});

export function rateLimiter(input: RateLimitOptions) {
  if (input.kind === "interval") {
    rlI.update({
      interval: input.limit.every,
    });
  } else {
    rlQ.update({
      limit: input.limit.hits,
      window: input.limit.every,
    });
  }
  const allow =
    input.kind === "interval" ? rlI.allow.bind(rlI) : rlQ.allow.bind(rlQ);

  return middlewareFn<GlobalContext, RateLimiterCtx>(async (req, _res) => {
    const pass = await allow(getFingerprint({ req }));
    if (!pass.allowed) {
      let message: string;

      if (input.kind === "interval") {
        const seconds = Math.ceil(pass.retryAfterMs / 1000);
        message = `Too many requests: you must wait ${seconds}s before trying again.`;
      } else {
        const seconds = Math.ceil(pass.retryAfterMs / 1000);
        message =
          pass.remaining > 0
            ? `You have ${pass.remaining} requests left in this ${input.limit.every} window.`
            : `Rate limit exceeded: please wait ${seconds}s until quota refresh.`;
      }

      return middlewareResponse.errors.tooManyRequests({
        body: { message },
        retryAfterSeconds: Math.max(1, Math.floor(pass.retryAfterMs / 1000)),
      });
    }

    return {
      ctx: {
        rl: {
          every: input.limit.every,
          kind: input.kind,
        },
      },
    };
  });
}
