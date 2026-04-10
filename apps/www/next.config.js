// ESM-safe __dirname + tracing root for monorepo
import { createJiti } from "jiti";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "../../"); // repo root

const jiti = createJiti(import.meta.url);

const baseConfig = jiti("@rccyx/next/config");

const { withConfig } = jiti("@rccyx/monitor/next");
// validate at build
jiti("@rccyx/env");

const config = withConfig({
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
