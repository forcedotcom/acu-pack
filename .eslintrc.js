module.exports = {
  env: {
    es6: true,
    mocha: true
  },
  extends: ["eslint-config-salesforce-typescript"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      './packages/**/tsconfig.json',
      './packages/**/test/tsconfig.json',
      './tsconfig.json',
      './test/tsconfig.json',
    ],
    sourceType: 'module',
  },
  rules: {
    "@typescript-eslint/quotes": [
      "error",
      "single",
      {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ],

    // Lots of 'any' in the code
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "@typescript-eslint/no-explicit-any": 0,
       
    // would need a bunch of refactoring
    "complexity": 0,

    // Just turn off prettier - its annoying
    "prettier/prettier": 0,

    // "@typescript-eslint/explicit-module-boundary-types": [
    //   0,
    //   {
    //     "allowArgumentsExplicitlyTypedAsAny": true
    //   }
    // ],
  }
};
