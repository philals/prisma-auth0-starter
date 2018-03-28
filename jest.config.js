module.exports = {
  collectCoverage: true,
  globalSetup: './jest.setup.js',
  globalTeardown: './jest.teardown.js',
  moduleFileExtensions: [ "ts", "tsx", "js", "jsx", "json", "node" ],
  testEnvironment: 'node',
  testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ["/tests/utils/fetchTokens.js", "/tests/utils/gqlAuthHeader.js"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};
