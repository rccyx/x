import { z } from "zod";

const databaseUrlSchema = z
  .string()
  .min(1, "DATABASE_URL is required")
  .url("Must be a valid URL")
  .superRefine((url, ctx) => {
    const env = process.env.NEXT_PUBLIC_CURRENT_ENV;

    if (env === "production" && !url.includes("supabase")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "In production, databse must be Supabase'",
      });
    }

    if (env === "preview" && !url.includes("neon")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "In preview, database must be a Neon temp branch",
      });
    }

    if (env === "development" && !url.includes("localhost")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "In development, database must point to a local container",
      });
    }
  });

export const serverVars = {
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .optional()
    .describe("NextJS is taking care of this basically"),
  SENTRY_ORG: z.string().min(2).max(255),
  X_API_TOKEN: z.string().length(32).max(255),
  SENTRY_PROJECT: z.string().min(2).max(255),
  SENTRY_AUTH_TOKEN: z.string().min(20).max(255),
  IP_HASH_SALT: z
    .string()
    .min(32, "IP hash salt must be at least 32 characters long")
    .describe(
      "This is used to has the IP with other fingerprinting info to see if the user is spamming my blog or nah",
    ),
  DATABASE_URL: databaseUrlSchema,
  DIRECT_URL: databaseUrlSchema,
  S3_BUCKET_NAME: z
    .string()
    .min(3, "Bucket name too short")
    .max(63, "Bucket name too long")
    .regex(/^[a-z0-9.-]+$/, "Invalid S3 bucket name"),
  S3_BUCKET_REGION: z
    .enum(["us-east-1", "us-west-1", "us-west-2", "eu-west-1"], {
      errorMap: () => ({ message: "Invalid AWS region" }),
    })
    .describe("I dont deploy anywhere else really"),
  S3_BUCKET_ACCESS_KEY_ID: z
    .string()
    .length(20, { message: "Access Key ID must be 20 chars" }),
  S3_BUCKET_SECRET_KEY: z.string().min(20, "Secret access key too short"),
  S3_BUCKET_URL: z
    .string()
    .url("Must be a valid S3 bucket URL")
    .refine(
      (url) => url.includes("amazonaws.com") || url.includes("cloudfront.net"),
      { message: "Must be a valid S3 or CloudFront URL" },
    ),
  KIT_API_KEY: z.string().min(20).startsWith("kit_").max(255),
  RESEND_API_KEY: z.string().min(20).startsWith("re_").max(255),
  QSTASH_TOKEN: z.string().endsWith("=").min(20).max(255),
  AUTH_ENCRYPTION_KEY: z
    .string()
    .length(32, "Auth encryption key must be 32 characters long"),
} as const;
