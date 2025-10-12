// ESM-safe __dirname + tracing root for monorepo
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "../../"); // repo root

const jiti = createJiti(import.meta.url);

const baseConfig = jiti("@ashgw/next-config/base.js");
const { monitor } = jiti("@ashgw/monitor");

// validate at build
jiti("@ashgw/env");

const config = monitor.next.withConfig({
  /** @type {import('next').NextConfig} */
  nextConfig: {
    ...baseConfig,
    // keep it under experimental for Next 14.2.x, which reports it as an "Experiment"
    experimental: {
      ...(baseConfig.experimental ?? {}),
      outputFileTracingRoot: monorepoRoot,
    },
  },
});

export default config;
