module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(svg|jpg|png)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(css)$": "<rootDir>/__mocks__/styleMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverage: true,
  collectCoverageFrom: ["src/js/**/*.js", "!src/js/index.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
