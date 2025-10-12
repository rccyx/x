import baseConfig from "@ashgw/eslint-config/base";
import reactConfig from "@ashgw/eslint-config/react";
import restrictEnvAccess from "@ashgw/eslint-config/restricted-env";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...restrictEnvAccess,
];
