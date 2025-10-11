import type { HealthResponses } from "~/api/models";

export class HealthService {
  public static async check(): Promise<HealthResponses> {
    await new Promise((r) => setTimeout(r, 1));

    return {
      status: 200,
      body: undefined,
    };
  }
}
