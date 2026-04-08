import { initClient } from "@ts-rest/core";

export const createSdkClient = (
  contract: Parameters<typeof initClient>[0],
  args: Parameters<typeof initClient>[1],
) => {
  return initClient(contract, args);
};
