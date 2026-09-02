module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    // 整形系ルールは Prettier に委譲する（最後に置いて衝突するルールを無効化）
    'prettier',
  ],
  plugins: ['vue', '@typescript-eslint'],
  overrides: [
    // React（.tsx）は vue-eslint-parser を通さず、Hooks のルールを適用する
    {
      files: ['packages/react/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['react-hooks'],
      extends: ['plugin:react-hooks/recommended'],
    },
  ],

  // 整形系のルール（arrow-parens / comma-dangle / key-spacing / no-multi-spaces /
  // space-before-function-paren）は Prettier へ委譲したので持たない
  rules: {
    // 'multi-line' は Prettier の折り返しと衝突する（1 行だった if が
    // 折り返された瞬間に違反になる）。行の形に依存しない 'all' を使う
    curly: ['error', 'all'],
    'vue/multi-word-component-names': 'off',
    'vue/attribute-hyphenation': [
      'error',
      'never',
      {
        ignore: ['custom-prop'],
      },
    ],
    'vue/v-on-event-hyphenation': [
      'error',
      'never',
      {
        autofix: false,
      },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
