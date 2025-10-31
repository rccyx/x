import baseConfig from "@rccyx/eslint-config/base";
import restrictEnvAccess from "@rccyx/eslint-config/restricted-env";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
];
