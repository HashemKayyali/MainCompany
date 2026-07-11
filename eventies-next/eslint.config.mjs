import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

/**
 * FOUND-003 — import-boundary zones per 03_TARGET_FOLDER_STRUCTURE.
 * A deliberate violation must fail `npm run lint` (QG-ARCH-2 demo in the
 * phase report). Table:
 *   shared/     may import nothing internal
 *   lib/        may import shared only
 *   server/     may import shared, lib (server-only runtime)
 *   components/ may import shared, lib
 *   features/X  may import shared, lib, components, own feature — never other features, never server
 *   app/        may import everything (thin composition)
 */
const zones = [
  // shared/ imports nothing internal
  { target: "./src/shared", from: "./src/lib" },
  { target: "./src/shared", from: "./src/server" },
  { target: "./src/shared", from: "./src/features" },
  { target: "./src/shared", from: "./src/components" },
  { target: "./src/shared", from: "./src/app" },
  { target: "./src/shared", from: "./src/i18n" },
  // lib/ only shared
  { target: "./src/lib", from: "./src/server" },
  { target: "./src/lib", from: "./src/features" },
  { target: "./src/lib", from: "./src/components" },
  { target: "./src/lib", from: "./src/app" },
  // server/ never imports client-ward code
  { target: "./src/server", from: "./src/features" },
  { target: "./src/server", from: "./src/components" },
  { target: "./src/server", from: "./src/app" },
  // components/ = cross-feature primitives only
  { target: "./src/components", from: "./src/features" },
  { target: "./src/components", from: "./src/server" },
  { target: "./src/components", from: "./src/app" },
  // features/ must not import server code (type-only exceptions are reviewed case-by-case)
  { target: "./src/features", from: "./src/server" },
  { target: "./src/features", from: "./src/app" },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { import: importPlugin },
    rules: {
      "import/no-restricted-paths": ["error", { zones }],
    },
  },
  {
    // 03 §Locale architecture: page-route navigation ONLY via i18n/navigation.ts
    // wrappers — raw next/link / next/navigation drops the locale.
    files: ["src/app/**", "src/features/**", "src/components/**"],
    ignores: ["src/app/api/**", "src/app/auth/**", "src/app/sitemap.xml/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message: "Use Link from '@/i18n/navigation' (locale-aware).",
            },
            {
              name: "next/navigation",
              importNames: ["useRouter", "usePathname", "redirect", "permanentRedirect"],
              message: "Use the wrappers from '@/i18n/navigation' (locale-aware).",
            },
          ],
        },
      ],
    },
  },
  {
    // 08 §Direction: logical CSS only in new code. Bans the physical
    // margin/padding/text-align Tailwind utilities that have logical twins.
    files: ["src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/\\b(?:ml|mr|pl|pr)-(?:\\d|px|auto)|text-left|text-right|border-l(?:-|\\b)|border-r(?:-|\\b)|left-\\d|right-\\d/]",
          message:
            "Physical direction utility — use the logical twin (ms/me/ps/pe/text-start/text-end/border-s/border-e/start-/end-) per 08_I18N_CONSTITUTION.",
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
