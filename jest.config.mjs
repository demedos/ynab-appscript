/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      statements: 90,
    },
  },
};
