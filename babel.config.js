module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
            '@/components': './components',
            '@/constants': './constants',
            '@/hooks': './hooks',
            '@/utils': './utils',
            '@/lib': './lib',
            '@/contexts': './contexts',
            '@/assets': './assets',
          },
          extensions: [
            '.ios.js',
            '.android.js',
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.json',
          ],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
