module.exports = function(api) {
  api.cache(true);

  const plugins = [
    'react-native-reanimated/plugin',
  ];

  // Remove console.logs in production builds
  if (process.env.NODE_ENV === 'production') {
    plugins.push([
      'transform-remove-console',
      { exclude: ['error', 'warn'] } // Keep console.error and console.warn
    ]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
