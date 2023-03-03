module.exports = {
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx)', '**/?(*.)+(spec|test).+(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'esbuild-jest',
  },
  setupFilesAfterEnv: ['jest-extended'],
  testEnvironment: 'node',
  testTimeout: 5 * 60 * 1000,
  maxWorkers: 1,
  verbose: true,
}
