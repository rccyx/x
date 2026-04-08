import type { z } from "zod";

/**
 * Type alias that extracts the TS type from any zod schema used in your
 * contract for body, query, or headers.
 *
 * Example:
 * ```ts
 *   // contract
 *   const createUserBody = z.object({ email: z.string().email() });
 *   responses: { 201: c.type<{ id: string }>() }
 *
 *   // handler
 *   type CreateBody = InferRequest<typeof createUserBody>;
 *   export async function myServiceHandler({ body }: { body: CreateBody }) { ... }
 * ```
 */
export type InferRequest<T extends z.ZodTypeAny> = z.infer<T>;
