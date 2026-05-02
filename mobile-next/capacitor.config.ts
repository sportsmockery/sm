import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sportsmockery.app',
  appName: 'Sports Mockery',
  webDir: 'out',
  ios: {
    contentInset: 'always',
    backgroundColor: '#111111',
  },
  android: {
    backgroundColor: '#111111',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#111111',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#111111',
    },
  },
};

export default config;
