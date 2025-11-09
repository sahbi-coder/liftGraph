/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Add 'cjs' to source extensions for Firebase compatibility
config.resolver.sourceExts.push('cjs');

// Disable unstable package exports to prevent Firebase Auth registration issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
