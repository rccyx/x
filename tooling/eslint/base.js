/// <reference types="./types.d.ts" />

import * as path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import runyx from "eslint-plugin-runyx";

export default tseslint.config(
  // ignore files not tracked by git and any config files
  includeIgnoreFile(path.join(import.meta.dirname, "../../.gitignore")),
  { ignores: ["**/*.config.*", "**dist/**"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
      runyx,
    },
    extends: [
      // base eslint js rules
      eslint.configs.recommended,
      // ts-eslint recommended sets with type info and style
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      // plugin: turbo
      // enforce turborepo graph rules and pipeline constraints
      ...turboPlugin.configs.recommended.rules,

      // plugin: runyx
      // forbid "hanging" runyx calls that are not properly handled
      "runyx/no-hanging-calls": "error",

      // general code shape for app logic
      // warn when functions get too branchy
      complexity: ["warn", 10],
      // warn when nesting gets too deep
      "max-depth": ["warn", 3],
      // warn when a single function grows too large
      "max-lines-per-function": ["warn", 80],
      // keep argument lists reasonable, prefer an options object past this
      "max-params": ["warn", 4],

      // plugin: typescript-eslint - async and safety
      // enforce consistent type-only imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
          fixStyle: "separate-type-imports",
        },
      ],
      // disallow async functions that do not await or return a promise
      "@typescript-eslint/require-await": "error",
      // prevent awaiting non-thenable values
      "@typescript-eslint/await-thenable": "error",
      // ensure every promise is awaited, returned, or otherwise handled
      "@typescript-eslint/no-floating-promises": [
        "error",
        { ignoreVoid: false },
      ],
      // block use of any so app types stay precise
      "@typescript-eslint/no-explicit-any": "error",
      // catch calling values that are not safely typed as functions
      "@typescript-eslint/no-unsafe-call": "error",
      // catch unsafe property access on unknown or any
      "@typescript-eslint/no-unsafe-member-access": "error",
      // prevent returning values with unknown or unsafe types
      "@typescript-eslint/no-unsafe-return": "error",
      // warn when assigning unknown or loose values
      "@typescript-eslint/no-unsafe-assignment": "warn",
      // disallow unused variables but allow underscore escape hatch
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // catch misused promises in handlers and callbacks
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      // catch always truthy or always falsy conditions
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        { allowConstantLoopConditions: true },
      ],
      // forbid non null assertion operator, push null handling into types
      "@typescript-eslint/no-non-null-assertion": "error",
      // typescript aware check for settimeout-like "implied eval" sites
      "@typescript-eslint/no-implied-eval": "error",
      // prevent comparing enums against unrelated enums or values
      "@typescript-eslint/no-unsafe-enum-comparison": "error",

      // core js safety
      // hard block eval in app code
      "no-eval": "error",
      // delegate implied eval checks to the ts rule above
      "no-implied-eval": "off",

      // plugin: import - minimal but strict type import layout
      // enforce type-only imports at the top level consistently
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

      // app wide restriction: console
      // force use of structured logger instead of console.*
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='console']",
          message:
            "use import { logger } from '@rccyx/logger' instead of console.*",
        },
        {
          selector: "Identifier[name='console']",
          message:
            "use import { logger } from '@rccyx/logger' instead of console",
        },
      ],
    },
  },
  {
    // report unused eslint-disable comments
    linterOptions: { reportUnusedDisableDirectives: true },
    // enable project aware parsing so ts rules have type info
    languageOptions: { parserOptions: { projectService: true } },
  },
);
