/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  testPathIgnorePatterns: [
    "node_modules",
    "e2e"
  ],
  moduleNameMapper: {
    '@Src/constants': '<rootDir>/unit-test/mocks/constants.mock.ts',
    '@UnitTest/(.*)': '<rootDir>/unit-test/$1',
    '@Src/(.*)': '<rootDir>/src/$1',
  },
  // globalSetup: '<rootDir>/unit-test/global-setup.ts'
};