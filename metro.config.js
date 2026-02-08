// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for @/ path aliases
config.resolver.extraNodeModules = {
  '@': __dirname,
  '@/components': path.resolve(__dirname, 'components'),
  '@/constants': path.resolve(__dirname, 'constants'),
  '@/hooks': path.resolve(__dirname, 'hooks'),
  '@/utils': path.resolve(__dirname, 'utils'),
  '@/lib': path.resolve(__dirname, 'lib'),
  '@/contexts': path.resolve(__dirname, 'contexts'),
  '@/assets': path.resolve(__dirname, 'assets'),
};

module.exports = config;
