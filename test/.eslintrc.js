module.exports = {
  plugins: ['chai-friendly'],
  overrides: [{
    files: '*.test.ts',
    rules: {
      'no-unused-expressions': 'off',
      'chai-friendly/no-unused-expressions': 'error',
    },
  }],
 }