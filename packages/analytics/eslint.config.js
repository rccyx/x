import baseConfig from "@rccyx/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  {
    rules: {
      "@typescript-eslint/no-unsafe-member-access": "off", // posthog-js/react
    },
  },
];
