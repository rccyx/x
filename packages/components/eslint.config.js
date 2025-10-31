import baseConfig from "@rccyx/eslint-config/base";
import nextjsConfig from "@rccyx/eslint-config/nextjs";
import reactConfig from "@rccyx/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
];
