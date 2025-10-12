import baseConfig from "@ashgw/eslint-config/base";
import restrictEnvAccess from "@ashgw/eslint-config/restricted-env";

/** @type {import('typescript-eslint').Config} */
export default [...baseConfig, ...restrictEnvAccess];
