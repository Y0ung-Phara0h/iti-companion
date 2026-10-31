// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    settings: {
      // Resolve the tsconfig `@/*` alias so import/no-unresolved stays useful.
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
  },
]);
