import eslintConfigLogux from '@logux/eslint-config/ts'

export default [
  {
    ignores: ['**/errors.ts']
  },
  ...eslintConfigLogux,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  }
]
