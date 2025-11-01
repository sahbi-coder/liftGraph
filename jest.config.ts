import { Config } from 'jest';

const config: Config = {
  projects: ['<rootDir>/apps/*/jest.config.ts', '<rootDir>/packages/*/jest.config.ts'],
};

export default config;
