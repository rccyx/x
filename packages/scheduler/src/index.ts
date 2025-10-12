import { Client as QstashClient } from "@upstash/qstash";
import { env } from "@ashgw/env";
import { logger } from "@ashgw/logger";
import { E } from "@ashgw/error";
import type {
  Payload,
  ScheduleDto,
  AtDto,
  CronDto,
  ScheduleAtResult,
  ScheduleCronResult,
  ScheduleDelayResult,
  DelayDto,
  Delay,
} from "./types";

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

  public async schedule(input: AtDto): Promise<ScheduleAtResult>;
  public async schedule(input: CronDto): Promise<ScheduleCronResult>;
  public async schedule(input: DelayDto): Promise<ScheduleDelayResult>;
  public async schedule(
    input: ScheduleDto,
  ): Promise<ScheduleAtResult | ScheduleCronResult | ScheduleDelayResult> {
    try {
      if ("at" in input) {
        return await this.scheduleAt({
          atTime: input.at.datetimeIso,
          url: input.url,
          payload: input.payload,
        });
      }
      if ("delay" in input) {
        return await this.scheduleDelay({
          delay: input.delay,
          url: input.url,
          payload: input.payload,
        });
      }
      return await this.scheduleCron({
        expression: input.cron.expression,
        url: input.url,
        payload: input.payload,
      });
    } catch (err) {
      logger.error("scheduler: failed to schedule task", err);
      throw E.upstreamError(
        "failed to schedule task",
        {
          upstream: { service: "upstash-qstash", operation: "schedule" },
        },
        err,
      );
    }
  }

  private async scheduleAt(input: {
    url: string;
    payload: Payload;
    atTime: string;
  }): Promise<ScheduleAtResult> {
    logger.info(`scheduling one-time job -> ${input.url}`);
    try {
      const response = await qstashClient.publish({
        url: input.url,
        body: input.payload,
        headers: this._headers,
        notBefore: SchedulerService._toUnixSecond(input.atTime),
      });
      logger.info(`scheduled at ${input.atTime} (id=${response.messageId})`);
      return { messageId: response.messageId };
    } catch (err) {
      logger.error("scheduler: qstash publish failed (at)", err);
      throw E.upstreamError(
        "qstash publish failed",
        {
          upstream: { service: "upstash-qstash", operation: "publish-at" },
        },
        err,
      );
    }
  }

  private async scheduleDelay({
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
    try {
      const response = await qstashClient.publish({
        url,
        body: payload,
        headers: this._headers,
        delay: normalizedDelayInSeconds,
      });
      logger.info(
        `scheduled after ${normalizedDelayInSeconds}s (id=${response.messageId})`,
      );
      return { messageId: response.messageId };
    } catch (err) {
      logger.error("scheduler: qstash publish failed (delay)", err);
      throw E.upstreamError(
        "qstash publish failed",
        {
          upstream: { service: "upstash-qstash", operation: "publish-delay" },
        },
        err,
      );
    }
  }

  private async scheduleCron(input: {
    url: string;
    payload: Payload;
    expression: string;
  }): Promise<ScheduleCronResult> {
    logger.info(`scheduling cron -> ${input.expression} -> ${input.url}`);
    try {
      const response = await qstashClient.schedules.create({
        destination: input.url,
        cron: input.expression,
        body: input.payload,
        headers: this._headers,
      });
      logger.info(`cron created (id=${response.scheduleId})`);
      return { scheduleId: response.scheduleId };
    } catch (err) {
      logger.error("scheduler: qstash schedule create failed (cron)", err);
      throw E.upstreamError(
        "qstash schedule create failed",
        {
          upstream: { service: "upstash-qstash", operation: "schedule-cron" },
        },
        err,
      );
    }
  }

  private static _toUnixSecond(isoString: string): number {
    return Math.floor(new Date(isoString).getTime() / 1000);
  }
}

export const scheduler = new SchedulerService();
