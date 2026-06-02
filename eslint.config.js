const prettier = require("eslint-config-prettier/flat");
const tseslint = require("typescript-eslint");
const raycast = require("@raycast/eslint-plugin");
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
    },
  },
  ...(Array.isArray(raycast.configs.recommended)
    ? raycast.configs.recommended
    : [raycast.configs.recommended]),
  prettier,
];
