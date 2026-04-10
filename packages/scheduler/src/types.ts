import type { ExclusiveUnion } from "typyx";

export type Payload = string;

export interface ScheduleBaseDto {
  url: string;
  payload: Payload;
}

export interface AtDto extends ScheduleBaseDto {
  at: { datetimeIso: string };
}

export type Delay = ExclusiveUnion<
  | { seconds: number }
  | { minutes: number }
  | { hours: number }
  | { days: number }
>;

export interface DelayDto extends ScheduleBaseDto {
  delay: Delay;
}

export type ScheduleDto = AtDto | DelayDto;

export interface ScheduleResult {
  messageId: string;
}

export interface ScheduleDelayResult {
  messageId: string;
}
