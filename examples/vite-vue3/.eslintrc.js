/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  env: {
    node: true,
    // 'vue/setup-compiler-macros': true
  },
  extends: [
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser'
  },
  rules: {
    'semi': [2, 'always'],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'quotes': ['error', 'single'],
    '@typescript-eslint/no-var-requires': 'off',
    'brace-style': ['error', 'stroustrup'],
    'keyword-spacing': [
      'error', {
        before: true,
        after: true,
      }
    ],
    'space-before-function-paren': ['error', {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'always',
    }],
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1
      }
    ],
    'vue/script-indent': [
      'error',
      2,
      {
        'baseIndent': 1,
        'switchCase': 1,
      },
    ],
    'vue/html-self-closing': 'off',
    'vue/multi-word-component-names': 0,
    'vue/first-attribute-linebreak': ['error', {
      'singleline': 'ignore',
      'multiline': 'below'
    }],
    'vue/no-reserved-props': ['error', {
      'vueVersion': 3, // or 2
    }],
    'vue/valid-define-props': 'off',
    'vue/valid-define-emits': 'off'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
      },
    },
  ],

  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly'
  },
};
