import { initContract } from "@ts-rest/core";

/**
 * Why:
 * - Decouples your public surface from ts-rest internals
 * - Lets you swap or wrap later without breaking callers
 *
 * Usage:
 *   import { initContract } from "@ts-rest/core";
 *   import { createContract } from "@restyx/next";
 *
 *   const c = initContract();
 *   export const contract = createContract(c)({
 *     ping: { method: "GET", path: "/ping", responses: { 200: c.noBody() } },
 *   });
 */
export const createContract = (
  contractInstance: ReturnType<typeof initContract>,
) => contractInstance.router;

export const createContractInstance = () => initContract();
