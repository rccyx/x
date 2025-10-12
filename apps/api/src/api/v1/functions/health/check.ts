import type { HealthResponses } from "~/api/v1/models";

export async function check(): Promise<HealthResponses> {
  await new Promise((r) => setTimeout(r, 1));

  return {
    status: 200,
    body: undefined,
  };
}
