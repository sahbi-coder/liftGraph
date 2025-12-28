/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// For monorepo: include workspace root in watch folders
const defaultWatchFolders = config.watchFolders || [];
config.watchFolders = [...new Set([...defaultWatchFolders, workspaceRoot])];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Add 'cjs' to source extensions for Firebase compatibility
config.resolver.sourceExts.push('cjs');

// Disable unstable package exports to prevent Firebase Auth registration issues
config.resolver.unstable_enablePackageExports = false;

// Block test files from being included in the bundle
// Metro's blockList matches against resolved file paths
const exclusionList = require('metro-config/src/defaults/exclusionList');

config.resolver.blockList = exclusionList([
  // Block all test files (matches full path)
  /.*\.test\.(ts|tsx|js|jsx)$/,
  /.*\.spec\.(ts|tsx|js|jsx)$/,
  // Block test directories
  /.*__tests__\/.*/,
  /.*__mocks__\/.*/,
  // Block testing library packages from being bundled
  /.*node_modules\/@testing-library\/.*/,
]);

module.exports = config;
