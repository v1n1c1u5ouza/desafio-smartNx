export default {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/tests/setup-env.cjs'], 
  testMatch: ['**/src/tests/**/*.test.js'],
  verbose: true,
  transform: { '^.+\\.js$': 'babel-jest' }, // transforma ESM dos testes
};
