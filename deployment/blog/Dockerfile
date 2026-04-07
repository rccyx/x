# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20
ARG PORT=3001
ARG IS_PREVIEW=false

FROM node:${NODE_VERSION}-alpine AS base

# redeclare so it can be used in the next stage
ARG IS_PREVIEW

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
# make sure corepack never prompts
ENV COREPACK_ENABLE_DOWNLOAD=1 \
    PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    PORT=${PORT}

RUN corepack enable
WORKDIR /app
COPY . .

RUN --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=DIRECT_URL \
    --mount=type=secret,id=S3_BUCKET_NAME \
    --mount=type=secret,id=S3_BUCKET_REGION \
    --mount=type=secret,id=S3_BUCKET_ACCESS_KEY_ID \
    --mount=type=secret,id=S3_BUCKET_SECRET_KEY \
    --mount=type=secret,id=S3_BUCKET_URL \
    --mount=type=secret,id=KIT_API_KEY \
    --mount=type=secret,id=IP_HASH_SALT \
    --mount=type=secret,id=X_API_KEY \
    --mount=type=secret,id=SENTRY_ORG \
    --mount=type=secret,id=SENTRY_PROJECT \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=NEXT_PUBLIC_CURRENT_ENV \
    --mount=type=secret,id=NEXT_PUBLIC_WWW_URL \
    --mount=type=secret,id=NEXT_PUBLIC_BLOG_URL \
    --mount=type=secret,id=NEXT_PUBLIC_WWW_GOOGLE_ANALYTICS_ID \
    --mount=type=secret,id=NEXT_PUBLIC_BLOG_GOOGLE_ANALYTICS_ID \
    --mount=type=secret,id=NEXT_PUBLIC_SENTRY_DSN \
    --mount=type=secret,id=NEXT_PUBLIC_POSTHOG_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_POSTHOG_HOST <<EOSH

set -eu
exp() { [ -f "/run/secrets/$1" ] && export "$1=$(cat /run/secrets/$1)"; }

exp DATABASE_URL 
exp DIRECT_URL 
exp S3_BUCKET_NAME 
exp S3_BUCKET_REGION 
exp S3_BUCKET_ACCESS_KEY_ID 
exp S3_BUCKET_SECRET_KEY 
exp S3_BUCKET_URL 
exp KIT_API_KEY 
exp IP_HASH_SALT 
exp X_API_KEY 
exp SENTRY_ORG 
exp SENTRY_PROJECT 
exp SENTRY_AUTH_TOKEN 
exp NEXT_PUBLIC_CURRENT_ENV 
exp NEXT_PUBLIC_WWW_URL 
exp NEXT_PUBLIC_BLOG_URL 
exp NEXT_PUBLIC_WWW_GOOGLE_ANALYTICS_ID 
exp NEXT_PUBLIC_BLOG_GOOGLE_ANALYTICS_ID 
exp NEXT_PUBLIC_SENTRY_DSN 
exp NEXT_PUBLIC_POSTHOG_KEY 
exp NEXT_PUBLIC_POSTHOG_HOST 

pnpm install --frozen-lockfile

if [ "$IS_PREVIEW" = "true" ]; then
  pnpm --filter @rccyx/continuum build:preview
else
  pnpm --filter @rccyx/continuum build
fi
EOSH

USER node
EXPOSE ${PORT}
CMD ["pnpm", "--filter", "@rccyx/continuum", "start"]

