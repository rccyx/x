import { Client as QstashClient } from "@upstash/qstash";
import { env } from "@rccyx/env";
import { logger } from "@rccyx/logger";
import type {
  Payload,
  ScheduleDto,
  ScheduleResult,
  ScheduleDelayResult,
  Delay,
} from "./types";
import { run } from "@rccyx/runner";

const qstashClient = new QstashClient({ token: env.QSTASH_TOKEN });

class SchedulerService {
  constructor(
    private readonly _headers: Record<string, string> = {
      "Content-Type": "application/json",
    },
  ) {}

  public headers(headers: Record<string, string>): SchedulerService {
    return new SchedulerService({ ...this._headers, ...headers });
  }

  public async schedule(input: ScheduleDto) {
    return run(
      () => this._schedule(input),
      "SchedulerServiceExternalApiPublishFailure",
      {
        message: "failed to schedule job",
        severity: "error",
      },
    );
  }

  private async _schedule(input: ScheduleDto) {
    if ("at" in input) {
      return this._scheduleAt({
        atTime: input.at.datetimeIso,
        url: input.url,
        payload: input.payload,
      });
    } else {
      return this._scheduleDelay({
        delay: input.delay,
        url: input.url,
        payload: input.payload,
      });
    }
  }

  private async _scheduleAt(input: {
    url: string;
    payload: Payload;
    atTime: string;
  }): Promise<ScheduleResult> {
    logger.info(`scheduling one-time job -> ${input.url}`);
    const response = await qstashClient.publish({
      url: input.url,
      body: input.payload,
      headers: this._headers,
      notBefore: SchedulerService._toUnixSecond(input.atTime),
    });
    logger.info(`scheduled at ${input.atTime} (id=${response.messageId})`);
    return { messageId: response.messageId } as const;
  }

  private async _scheduleDelay({
    delay,
    payload,
    url,
  }: {
    url: string;
    payload: Payload;
    delay: Delay;
  }): Promise<ScheduleDelayResult> {
    const normalizedDelayInSeconds = delay.days
      ? delay.days * 86400
      : delay.hours
        ? delay.hours * 3600
        : delay.minutes
          ? delay.minutes * 60
          : delay.seconds;

    logger.info(`scheduling delayed job -> ${url}`);
    const response = await qstashClient.publish({
      url,
      body: payload,
      headers: this._headers,
      delay: normalizedDelayInSeconds,
    });
    logger.info(
      `scheduled after ${normalizedDelayInSeconds}s (id=${response.messageId})`,
    );
    return { messageId: response.messageId } as const;
  }

  private static _toUnixSecond(isoString: string): number {
    return Math.floor(new Date(isoString).getTime() / 1000);
  }
}

export const scheduler = new SchedulerService();
