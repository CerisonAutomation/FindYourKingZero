/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 ENHANCED MOBILE CONFIGURATION - Production Optimizations
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Enhanced Capacitor configuration with advanced mobile features
 * Push notifications, biometric auth, offline mode, performance optimization
 *
 * @author FindYourKingZero Mobile Team
 * @version 4.0.0
 */

import {CapacitorConfig} from '@capacitor/cli'

const config: CapacitorConfig = {
  // 🎯 App Identity
  appId: 'com.findyourking.app',
  appName: 'Find Your King',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    url: 'https://findyourking.vercel.app',
    cleartext: false,
  },

  // 🎨 UI Configuration
  backgroundColor: '#0f172a',
  backgroundColorFrom: '#0f172a',
  backgroundColorTo: '#1e293b',
  statusBar: {
    style: 'DARK',
    backgroundColor: '#0f172a',
  },
  navigationBar: {
    style: 'DARK',
    backgroundColor: '#1e293b',
  },

  // 🚀 Enhanced Plugin Configuration
  plugins: {
    // 📱 Splash Screen
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerStyle: 'large',
      spinnerColor: '#3b82f6',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },

    // 🌐 Network Configuration
    CapacitorHttp: {
      enabled: true,
    },

    // 🔐 Authentication & Security
    BiometricAuth: {
      enableBiometricAuth: true,
      allowDeviceCredential: true,
      authenticationValidity: 3600000, // 1 hour
      cancelTitle: 'Cancel',
      reason: 'Authenticate to access your account',
      subtitle: 'Use your fingerprint or face to unlock',
    },

    // 📍 Location Services
    Geolocation: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    },

    // 📸 Camera & Media
    Camera: {
      permissions: ['camera', 'microphone'],
      allowEdit: true,
      quality: 90,
      sourceType: 'CAMERA',
      saveToGallery: false,
      resultType: 'uri',
    },

    // 📱 Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
      requestPermissions: true,
      registration: {
        autoRegister: true,
        topics: ['all', 'messages', 'matches', 'events'],
      },
      localNotifications: {
        sound: 'default',
        vibrate: true,
        sticky: false,
        priority: 'high',
      },
    },

    // 📊 Analytics & Performance
    App: {
      appendUserAgent: 'FindYourKing/4.0.0',
      allowMixedContent: false,
      captureInput: true,
    },

    // 🔋 Battery & Performance
    BackgroundTask: {
      minimumBackgroundExecutionTime: 30000,
      minimumForegroundExecutionTime: 10000,
      isAutoRegister: true,
    },

    // 💾 Storage & Cache
    Preferences: {
      group: 'com.findyourking.app',
      mode: 'ENCRYPTED',
    },

    // 🌐 Network Status
    Network: {
      status: true,
      events: true,
    },

    // 📱 Device Information
    Device: {
      info: true,
      languageCode: true,
      country: true,
      timezone: true,
      memInfo: true,
      diskFree: true,
      diskTotal: true,
      isVirtual: true,
      real: true,
      platform: true,
      appVersion: true,
      appBuild: true,
      osVersion: true,
      os: true,
      manufacturer: true,
      model: true,
      webViewVersion: true,
    },
  },

  // 🔧 Android Configuration
  android: {
    // 📱 Build Configuration
    buildOptions: {
      keystorePath: 'android/app/keystore.jks',
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      keyAlias: process.env.ANDROID_KEY_ALIAS,
      keyPassword: process.env.ANDROID_KEY_PASSWORD,
      signingType: 'apksigner',
    },

    // 🎯 App Configuration
    minVersion: '24', // Android 7.0
    targetVersion: '34', // Android 14
    compileSdkVersion: '34',
    buildToolsVersion: '34.0.0',

    // 🔒 Permissions
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.VIBRATE',
      'android.permission.WAKE_LOCK',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
    ],

    // 🎨 Theme Configuration
    theme: {
      '@android:style/Theme.MaterialComponents.NoActionBar',
      '@android:style/Theme.MaterialComponents.Light.NoActionBar': false,
    },

    // 📱 App Icon Configuration
    icon: '@mipmap/ic_launcher',
    iconForeground: '@mipmap/ic_launcher_foreground',
    iconBackgroundColor: '#0f172a',

    // 🔔 Notification Configuration
    notifications: {
      smallIcon: '@mipmap/ic_notification',
      largeIcon: '@mipmap/ic_notification_large',
      color: '#3b82f6',
      sound: 'notification_sound',
      vibrate: [0, 250, 250, 250],
    },

    // 📊 Performance Configuration
    hardwareAcceleration: true,
    largeHeap: true,
    allowBackup: false,
    fullBackupContent: false,
    dataExtractionRules: false,
  },

  // 🍎 iOS Configuration
  ios: {
    // 📱 Build Configuration
    scheme: 'FindYourKing',
    bundleId: 'com.findyourking.app',
    productName: 'Find Your King',

    // 🎯 Target Configuration
    minVersion: '13.0', // iOS 13.0
    targetVersion: '17.0', // iOS 17.0

    // 🔒 Permissions
    permissions: [
      'NSLocationWhenInUseUsageDescription',
      'NSLocationAlwaysAndWhenInUseUsageDescription',
      'NSCameraUsageDescription',
      'NSMicrophoneUsageDescription',
      'NSPhotoLibraryUsageDescription',
      'NSFaceIDUsageDescription',
      'NSBiometricUsageDescription',
      'NSLocalNetworkUsageDescription',
      'NSMotionUsageDescription',
      'NSBluetoothAlwaysUsageDescription',
      'NSBluetoothPeripheralUsageDescription',
    ],

    // 🎨 Visual Configuration
    contentInset: 'automatic',
    statusBarStyle: 'DARK',
    backgroundColor: '#0f172a',
    backgroundColorFrom: '#0f172a',
    backgroundColorTo: '#1e293b',

    // 📱 App Icon Configuration
    icon: 'AppIcon',
    iconForeground: 'AppIcon-Foreground',
    iconBackgroundColor: '#0f172a',

    // 🔔 Notification Configuration
    notifications: {
      alertBody: 'Find Your King',
      alertTitle: 'New Message',
      sound: 'notification_sound',
      badge: true,
      soundCritical: true,
      soundCriticalVolume: 0.5,
    },

    // 📊 Performance Configuration
    preloadWebview: 'process',
    allowInlineMediaPlayback: true,
    allowsAirPlayForMediaPlayback: true,
    allowsAirPlayForPictureInPicture: true,
    allowsInlineMediaPlayback: true,
    minimumLaunchDelay: 0,
    launchDuration: 0,
    handlePerformanceMetrics: true,
    scrollEnabled: true,
    scrollBounce: true,
    customScheme: 'findyourking',
    appendUserAgent: 'FindYourKing/4.0.0',
    hideHomeIndicator: false,
    hideStatusBarOnFullscreen: false,
    enableDeeplinking: true,
    contentsScale: 1.0,
    enablePopGesture: true,
    enableDragGesture: true,
    enableSwipeGesture: true,
    enableLongPressGesture: true,
    enableDoubleTapGesture: true,
    enablePinchGesture: true,
    enableRotationGesture: true,
    enableShakeGesture: false,
    enableEdgeGesture: true,
    enablePanGesture: true,
    enableTapGesture: true,
    enableHapticFeedback: true,
    enableKeyboardResize: true,
    enableViewportResize: true,
    enableViewportScale: true,
    enableWebContentsDebuggingEnabled: false,
    enableWebContentsDebuggingEnabled: false,
    enableWebContentsDebuggingEnabled: false,
    enableWebContentsDebuggingEnabled: false,
    enableWebContentsDebuggingEnabled: false,
  },

  // 🔧 Development Configuration
  server: {
    // 🌐 Development Server
    url: process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000',
    cleartext: process.env.NODE_ENV === 'development',
    iosScheme: 'http',
    androidScheme: 'http',
  },

  // 🚀 Production Configuration
  loggingBehavior: 'production',
  logLevel: process.env.NODE_ENV === 'development' ? 'DEBUG' : 'ERROR',
  allowMixedContent: false,
  appendUserAgent: 'FindYourKing/4.0.0',
  captureInput: true,
  localUrl: process.env.VITE_LOCAL_URL,
  serverUrl: process.env.VITE_SERVER_URL,
  scheme: 'findyourking',
  hostname: process.env.VITE_HOSTNAME,
  androidScheme: process.env.VITE_ANDROID_SCHEME,
  iosScheme: process.env.VITE_IOS_SCHEME,
  plugins: {
    SplashScreen: {
      launchShowDuration: process.env.NODE_ENV === 'development' ? 1000 : 3000,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerStyle: 'large',
      spinnerColor: '#3b82f6',
    },
  },
}

export default config