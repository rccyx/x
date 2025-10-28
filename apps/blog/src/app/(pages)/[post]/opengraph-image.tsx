import { ImageResponse } from "next/og";
import { monitor } from "@ashgw/monitor";
import { trpcHttpServerSideClient } from "@ashgw/api/trpc";
import { logger } from "@ashgw/logger";

export const runtime = "nodejs";

export const alt = "Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface RouteCtx {
  params: { post: string };
}

const load = async <T extends ArrayBuffer>(p: string) =>
  await fetch(new URL(p, import.meta.url)).then(
    (r) => r.arrayBuffer() as Promise<T>,
  );

const toDataUri = (buf: ArrayBuffer, mime = "image/png") =>
  `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;

const clamp = (s: string, n: number) =>
  s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";

export default async function Image(_: Request, { params }: RouteCtx) {
  try {
    const post =
      await trpcHttpServerSideClient.post.getDetailedPublicPost.query({
        slug: params.post,
      });

    const title = clamp(post?.title ?? "Post not found", 90);
    const subtitle = clamp(post?.summary ?? "No description available", 140);

    const [bgPng, fontBold] = await Promise.all([
      load("./../../opengraph-image.png").catch(() => null),
      load<ArrayBuffer>(
        "./../../../../../../assets/fonts/AtkinsonHyperlegible.ttf",
      ).catch(() => null),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            position: "relative",
            display: "flex",
          }}
        >
          {bgPng ? (
            // OG routes render via Satori, next/image isn’t supported and will fail.
            /* eslint-disable @next/next/no-img-element */
            <img
              alt="blog post image"
              src={toDataUri(bgPng)}
              width={1200}
              height={630}
              style={{ position: "absolute", inset: 0, objectFit: "cover" }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "56px",
              gap: "16px",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.00) 40%, rgba(0,0,0,0.55) 100%)",
            }}
          >
            <div
              style={{
                fontFamily: "AtkinsonBold, system-ui, Sans-Serif",
                fontSize: 72,
                lineHeight: 1.05,
                color: "white",
                textShadow: "0px 2px 8px rgba(0,0,0,0.45)",
                letterSpacing: "-0.5px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: "AtkinsonBold, system-ui, Sans-Serif",
                fontSize: 36,
                color: "rgba(255,255,255,0.92)",
                textShadow: "0px 1px 4px rgba(0,0,0,0.45)",
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: fontBold
          ? [
              {
                name: "AtkinsonBold",
                data: fontBold,
                style: "normal",
                weight: 700,
              },
            ]
          : [],
      },
    );
  } catch (error) {
    logger.error("OG image generation failed", { error, slug: params.post });
    monitor.next.captureException({ error });

    // Minimal fallback image
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111",
            color: "#fff",
            fontSize: 64,
            fontFamily: "system-ui, Sans-Serif",
          }}
        >
          {clamp("Blog", 40)}
        </div>
      ),
      { ...size },
    );
  }
}
