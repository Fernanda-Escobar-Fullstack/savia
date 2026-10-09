module.exports = {
  rootDir: '..',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/Unit Tests/jest.setup.cjs',
  ],
  testMatch: [
    '<rootDir>/Unit Tests/**/*.test.(ts|tsx)',
    '<rootDir>/Integration Tests/**/*.test.(ts|tsx)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$':
      '<rootDir>/Unit Tests/styleMock.cjs',
    '\\.(webp|png|jpg|jpeg|gif|svg)$':
      '<rootDir>/Unit Tests/fileMock.cjs',
  },
}
