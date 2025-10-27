import path from "path";
import { defineProject, mergeConfig } from "vitest/config";

// importing using @ashgw/vitest-config keep erroring out, and it's annoying af!
import { baseConfig } from "./../../tooling/vitest";

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      deps: {
        inline: [/server-only/], // the server-only package errors out when we're in a broswer env, mock it.
      },
      mockReset: false,
      environment: "node",
      setupFiles: ["./test/setup.ts"],
      testTimeout: 15000,
    },
    resolve: {
      alias: {
        // @see https://stackoverflow.com/questions/73022020/vitest-not-recognizing-absolute-import
        "~": path.resolve(__dirname, "./src"),
      },
    },
  }),
);
