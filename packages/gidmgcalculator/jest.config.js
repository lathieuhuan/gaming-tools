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
    '@Src/constants': '<rootDir>/mocks/constants.mock.ts',
    '@Mocks/(.*)': '<rootDir>/mocks/$1',
    '@Src/(.*)': '<rootDir>/src/$1',
  }
};