import { defineProject, mergeConfig } from "vitest/config";

// importing using @rccyx/vitest-config keep erroring out, and it's annoying af!
import { baseConfig } from "../../tooling/vitest";

export default mergeConfig(baseConfig, defineProject({}));
