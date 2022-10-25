module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
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
  },
};
