import { defineProject, mergeConfig, UserWorkspaceConfig } from "vitest/config";

// importing using @rccyx/vitest-config keep erroring out, and it's annoying af!
import { baseConfig } from "./../../tooling/vitest";

export default mergeConfig(
  baseConfig as UserWorkspaceConfig,
  defineProject({
    test: {
      globals: true,
      exclude: ["**/e2e/**"],
    },
  }) as UserWorkspaceConfig,
);
