/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/_test_'],
  collectCoverageFrom: [
    'src/controllers/**/*.ts',
    'src/services/**/*.ts',
    'src/middleware/**/*.ts',
    'src/utils/**/*.ts',
    'src/routes/**/*.ts',
    'src/app.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
