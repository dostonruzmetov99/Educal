import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.edusphere.app',
  appName: 'Educal',
  webDir: 'dist',
  server: {
    url: 'https://educal.freeddns.org/',
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
