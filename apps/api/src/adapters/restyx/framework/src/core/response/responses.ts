import type { AppRouteResponse } from "@ts-rest/core";

/**
 * Example:
 *   const listUsersResponses = createSchemaResponses({
 *     200: c.type<User[]>(),
 *     401: httpErrorSchema.unauthorized(),
 *     500: httpErrorSchema.internal(),
 *   });
 */
export function createSchemaResponses<
  const R extends Record<number, AppRouteResponse>,
>(r: R): R {
  return r;
}
