import baseConfig from "@rccyx/eslint-config/base";
import nextjsConfig from "@rccyx/eslint-config/nextjs";
import reactConfig from "@rccyx/eslint-config/react";
import restrictEnvAccess from "@rccyx/eslint-config/restricted-env";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
