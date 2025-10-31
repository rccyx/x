import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

const baseConfig = jiti("@rccyx/next-config/base.js");
const { monitor } = jiti("@rccyx/monitor");

jiti("@rccyx/env");

const config = monitor.next.withConfig({
  /** @type {import('next').NextConfig} */
  nextConfig: {
    ...baseConfig,
    experimental: {
      outputFileTracingIncludes: {
        "/": ["./public/**/*"],
      },
    },
  },
});

export default config;
