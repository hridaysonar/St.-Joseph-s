import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
export default [
  { ignores: [".next/**", "node_modules/**", "data/**"] },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.js", "**/*.jsx"],
    // Keep existing user-uploaded data URLs and remote profile/routine images working.
    rules: { "@next/next/no-img-element": "off" },
  },
];
