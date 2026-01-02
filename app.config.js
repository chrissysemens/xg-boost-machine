export default ({ config }) => {
  const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

  return {
    ...config,

    name: 'footy-boostmachine',
    slug: 'footy-boostmachine',
    scheme: 'footy-boostmachine',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: true,

    icon: './assets/icon.png',

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    ios: {
      bundleIdentifier: 'com.fbm.app',
      supportsTablet: true,
    },

    android: {
      package: 'com.fbm.app',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },

    web: {
      favicon: './assets/favicon.png',
    },

    plugins: [
      ['expo-router', storybookEnabled ? { root: './src/storybook-app' } : {}],
      'expo-localization',
      '@react-native-community/datetimepicker',
    ],
  };
};
