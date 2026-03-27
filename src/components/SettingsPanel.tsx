/**
 * Enterprise Settings Panel Component
 * Comprehensive settings management with performance, accessibility, and security options
 */

import React, {useCallback, useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  Camera,
  Clock,
  Compass,
  Copy,
  Download,
  Eye,
  Fingerprint,
  Heart,
  Key,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Monitor,
  Moon,
  Palette,
  PieChart,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Sliders,
  Smartphone,
  Smartphone as PhoneIcon,
  Star,
  Sun,
  Trash2,
  Upload,
  Wifi,
  Zap,
} from 'lucide-react';

import type {UserProfile} from '@/lib/p2p/canonical';
import {SignalingStrategy} from '@/lib/p2p/canonical';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

interface SettingsPanelProps {
  config: {
    advancedMode: boolean;
    accessibilityMode: boolean;
    performanceMode: boolean;
    locationPrivacy: 'exact' | 'city' | 'region' | 'country';
    signalingStrategy: SignalingStrategy;
  };
  onAdvancedModeToggle: () => void;
  onAccessibilityModeToggle: () => void;
  onPerformanceOptimization: () => void;
  onLocationPrivacyChange: (privacy: 'exact' | 'city' | 'region' | 'country') => void;
  onSignalingStrategyChange: (strategy: SignalingStrategy) => void;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  messageNotifications: boolean;
  likeNotifications: boolean;
  matchNotifications: boolean;
  profileViewNotifications: boolean;
  quietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface PrivacySettings {
  showAge: boolean;
  showDistance: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowProfileVisits: boolean;
  allowScreenshotProtection: boolean;
  dataCollection: boolean;
  analyticsSharing: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  biometricAuth: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  deviceManagement: boolean;
  encryptionLevel: 'standard' | 'enhanced' | 'maximum';
  dataBackup: boolean;
  secureDelete: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  language: string;
  dateFormat: 'us' | 'eu' | 'iso';
  timeFormat: '12h' | '24h';
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export default function SettingsPanel({
  config,
  onAdvancedModeToggle,
  onAccessibilityModeToggle,
  onPerformanceOptimization,
  onLocationPrivacyChange,
  onSignalingStrategyChange,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Settings states
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    messageNotifications: true,
    likeNotifications: true,
    matchNotifications: true,
    profileViewNotifications: false,
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showAge: true,
    showDistance: true,
    showOnlineStatus: true,
    showLastSeen: false,
    allowProfileVisits: true,
    allowScreenshotProtection: false,
    dataCollection: true,
    analyticsSharing: false,
    marketingEmails: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    biometricAuth: false,
    sessionTimeout: 24,
    loginAlerts: true,
    deviceManagement: true,
    encryptionLevel: 'enhanced',
    dataBackup: true,
    secureDelete: false,
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'dark',
    fontSize: 'medium',
    language: 'en',
    dateFormat: 'us',
    timeFormat: '12h',
    animations: true,
    reducedMotion: false,
    highContrast: false,
  });

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
  ];

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmReset = useCallback(() => {
    // Reset all settings to defaults
    setNotificationSettings({
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      messageNotifications: true,
      likeNotifications: true,
      matchNotifications: true,
      profileViewNotifications: false,
      quietHours: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    });
    setPrivacySettings({
      showAge: true,
      showDistance: true,
      showOnlineStatus: true,
      showLastSeen: false,
      allowProfileVisits: true,
      allowScreenshotProtection: false,
      dataCollection: true,
      analyticsSharing: false,
      marketingEmails: false,
    });
    setSecuritySettings({
      twoFactorAuth: false,
      biometricAuth: false,
      sessionTimeout: 24,
      loginAlerts: true,
      deviceManagement: true,
      encryptionLevel: 'enhanced',
      dataBackup: true,
      secureDelete: false,
    });
    setAppearanceSettings({
      theme: 'dark',
      fontSize: 'medium',
      language: 'en',
      dateFormat: 'us',
      timeFormat: '12h',
      animations: true,
      reducedMotion: false,
      highContrast: false,
    });
    setShowResetConfirm(false);
    setHasChanges(false);
  }, []);

  // Update hasChanges when any setting changes
  useEffect(() => {
    setHasChanges(true);
  }, [notificationSettings, privacySettings, securitySettings, appearanceSettings]);

  const GeneralSection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm">Display Name</label>
            <Input
              type="text"
              defaultValue="John Doe"
              className="mt-1 bg-white/10 border-white/20 text-white"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm">Email</label>
            <Input
              type="email"
              defaultValue="john.doe@example.com"
              className="mt-1 bg-white/10 border-white/20 text-white"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm">Phone</label>
            <Input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="mt-1 bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Location Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm">Location Privacy</label>
            <select
              value={config.locationPrivacy}
              onChange={(e) => onLocationPrivacyChange(e.target.value as any)}
              className="w-full mt-1 p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value="exact">Exact Location</option>
              <option value="city">City Level</option>
              <option value="region">Region Level</option>
              <option value="country">Country Level</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Location Sharing</p>
              <p className="text-white/60 text-sm">Share your location with matches</p>
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                privacySettings.showDistance ? 'bg-blue-500' : 'bg-white/20'
              }`}
              onClick={() => setPrivacySettings(prev => ({ ...prev, showDistance: !prev.showDistance }))}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                privacySettings.showDistance ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Language & Region</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm">Language</label>
            <select
              value={appearanceSettings.language}
              onChange={(e) => setAppearanceSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full mt-1 p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ru">Русский</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </div>
          <div>
            <label className="text-white/60 text-sm">Date Format</label>
            <select
              value={appearanceSettings.dateFormat}
              onChange={(e) => setAppearanceSettings(prev => ({ ...prev, dateFormat: e.target.value as any }))}
              className="w-full mt-1 p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value="us">MM/DD/YYYY</option>
              <option value="eu">DD/MM/YYYY</option>
              <option value="iso">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="text-white/60 text-sm">Time Format</label>
            <select
              value={appearanceSettings.timeFormat}
              onChange={(e) => setAppearanceSettings(prev => ({ ...prev, timeFormat: e.target.value as any }))}
              className="w-full mt-1 p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );

  const NotificationsSection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Channels</h3>
        <div className="space-y-4">
          {[
            { key: 'pushNotifications', label: 'Push Notifications', icon: Smartphone },
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: MessageSquare },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">{label}</p>
                  <p className="text-white/60 text-sm">Receive notifications via {label.toLowerCase()}</p>
                </div>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationSettings[key as keyof NotificationSettings] ? 'bg-blue-500' : 'bg-white/20'
                }`}
                onClick={() => setNotificationSettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof NotificationSettings]
                }))}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  notificationSettings[key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Types</h3>
        <div className="space-y-4">
          {[
            { key: 'messageNotifications', label: 'New Messages', icon: MessageSquare },
            { key: 'likeNotifications', label: 'Profile Likes', icon: Heart },
            { key: 'matchNotifications', label: 'New Matches', icon: Star },
            { key: 'profileViewNotifications', label: 'Profile Views', icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">{label}</p>
                  <p className="text-white/60 text-sm">Get notified about {label.toLowerCase()}</p>
                </div>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationSettings[key as keyof NotificationSettings] ? 'bg-blue-500' : 'bg-white/20'
                }`}
                onClick={() => setNotificationSettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof NotificationSettings]
                }))}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  notificationSettings[key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quiet Hours</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Quiet Hours</p>
              <p className="text-white/60 text-sm">Suppress notifications during specific hours</p>
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                notificationSettings.quietHours ? 'bg-blue-500' : 'bg-white/20'
              }`}
              onClick={() => setNotificationSettings(prev => ({ ...prev, quietHours: !prev.quietHours }))}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                notificationSettings.quietHours ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {notificationSettings.quietHours && (
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-white/60 text-sm">From</label>
                <Input
                  type="time"
                  value={notificationSettings.quietHoursStart}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm">To</label>
                <Input
                  type="time"
                  value={notificationSettings.quietHoursEnd}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const PrivacySection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Visibility</h3>
        <div className="space-y-4">
          {[
            { key: 'showAge', label: 'Show Age', icon: Calendar },
            { key: 'showDistance', label: 'Show Distance', icon: MapPin },
            { key: 'showOnlineStatus', label: 'Show Online Status', icon: Wifi },
            { key: 'showLastSeen', label: 'Show Last Seen', icon: Clock },
            { key: 'allowProfileVisits', label: 'Allow Profile Visits', icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">{label}</p>
                  <p className="text-white/60 text-sm">Control who can see your {label.toLowerCase()}</p>
                </div>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  privacySettings[key as keyof PrivacySettings] ? 'bg-blue-500' : 'bg-white/20'
                }`}
                onClick={() => setPrivacySettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof PrivacySettings]
                }))}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  privacySettings[key as keyof PrivacySettings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data & Analytics</h3>
        <div className="space-y-4">
          {[
            { key: 'dataCollection', label: 'Data Collection', icon: BarChart3 },
            { key: 'analyticsSharing', label: 'Analytics Sharing', icon: PieChart },
            { key: 'marketingEmails', label: 'Marketing Emails', icon: Mail },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">{label}</p>
                  <p className="text-white/60 text-sm">Control {label.toLowerCase()} preferences</p>
                </div>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  privacySettings[key as keyof PrivacySettings] ? 'bg-blue-500' : 'bg-white/20'
                }`}
                onClick={() => setPrivacySettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof PrivacySettings]
                }))}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  privacySettings[key as keyof PrivacySettings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Content Protection</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Camera className="w-5 h-5 text-white/60" />
              <div>
                <p className="text-white font-medium">Screenshot Protection</p>
                <p className="text-white/60 text-sm">Prevent screenshots of your profile</p>
              </div>
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                privacySettings.allowScreenshotProtection ? 'bg-blue-500' : 'bg-white/20'
              }`}
              onClick={() => setPrivacySettings(prev => ({ ...prev, allowScreenshotProtection: !prev.allowScreenshotProtection }))}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                privacySettings.allowScreenshotProtection ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const SecuritySection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Authentication</h3>
        <div className="space-y-4">
          {[
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', icon: Key },
            { key: 'biometricAuth', label: 'Biometric Authentication', icon: Fingerprint },
            { key: 'loginAlerts', label: 'Login Alerts', icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">{label}</p>
                  <p className="text-white/60 text-sm">Add an extra layer of security</p>
                </div>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  securitySettings[key as keyof SecuritySettings] ? 'bg-blue-500' : 'bg-white/20'
                }`}
                onClick={() => setSecuritySettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof SecuritySettings]
                }))}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  securitySettings[key as keyof SecuritySettings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Management</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm">Session Timeout (hours)</label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="w-full mt-1 p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={168}>1 week</option>
              <option value={720}>1 month</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-white/60" />
              <div>
                <p className="text-white font-medium">Device Management</p>
                <p className="text-white/60 text-sm">Manage connected devices</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white"
            >
              Manage
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Encryption & Data</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm">Encryption Level</label>
            <select
              value={securitySettings.encryptionLevel}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, encryptionLevel: e.target.value as any }))}
              className="w-full mt-1 p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value="standard">Standard (AES-128)</option>
              <option value="enhanced">Enhanced (AES-256)</option>
              <option value="maximum">Maximum (AES-512)</option>
            </select>
          </div>

          {[
            { key: 'dataBackup', label: 'Automatic Data Backup', icon: Upload },
            { key: 'secureDelete', label: 'Secure Delete', icon: Trash2 },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">{label}</p>
                  <p className="text-white/60 text-sm">Protect your data</p>
                </div>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  securitySettings[key as keyof SecuritySettings] ? 'bg-blue-500' : 'bg-white/20'
                }`}
                onClick={() => setSecuritySettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof SecuritySettings]
                }))}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  securitySettings[key as keyof SecuritySettings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const AppearanceSection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Theme & Display</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm">Theme</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'auto', label: 'Auto', icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: value as any }))}
                  className={`p-3 rounded-lg border transition-colors ${
                    appearanceSettings.theme === value
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm">Font Size</label>
            <select
              value={appearanceSettings.fontSize}
              onChange={(e) => setAppearanceSettings(prev => ({ ...prev, fontSize: e.target.value as any }))}
              className="w-full mt-1 p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Accessibility</h3>
        <div className="space-y-4">
          {[
            { key: 'animations', label: 'Animations', icon: Zap },
            { key: 'reducedMotion', label: 'Reduced Motion', icon: Activity },
            { key: 'highContrast', label: 'High Contrast', icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">{label}</p>
                  <p className="text-white/60 text-sm">Improve accessibility</p>
                </div>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  appearanceSettings[key as keyof AppearanceSettings] ? 'bg-blue-500' : 'bg-white/20'
                }`}
                onClick={() => setAppearanceSettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof AppearanceSettings]
                }))}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  appearanceSettings[key as keyof AppearanceSettings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const AdvancedSection = () => (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Advanced Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Advanced Mode</p>
                <p className="text-white/60 text-sm">Enable AI-powered features</p>
              </div>
            </div>
            <button
              onClick={onAdvancedModeToggle}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.advancedMode ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.advancedMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Compass className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Accessibility Mode</p>
                <p className="text-white/60 text-sm">Enhanced accessibility features</p>
              </div>
            </div>
            <button
              onClick={onAccessibilityModeToggle}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.accessibilityMode ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.accessibilityMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Performance Mode</p>
                <p className="text-white/60 text-sm">Optimize for speed</p>
              </div>
            </div>
            <button
              onClick={onPerformanceOptimization}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.performanceMode ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.performanceMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">P2P Signaling Strategy</h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm">Connection Strategy</label>
            <select
              value={config.signalingStrategy}
              onChange={(e) => onSignalingStrategyChange(e.target.value as SignalingStrategy)}
              className="w-full mt-1 p-2 bg-white/10 border-white/20 rounded-lg text-white"
            >
              <option value="bittorrent">BitTorrent DHT</option>
              <option value="nostr">Nostr Network</option>
              <option value="mqtt">MQTT Broker</option>
              <option value="supabase">Supabase Realtime</option>
              <option value="ipfs">IPFS Network</option>
              <option value="webrtc">WebRTC Direct</option>
            </select>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Wifi className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">Connection Status</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Strategy:</span>
                <span className="text-white">{config.signalingStrategy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Quality:</span>
                <span className="text-green-400">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Latency:</span>
                <span className="text-white">45ms</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-black/40 border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full bg-white/10 text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export My Data
          </Button>

          <Button
            variant="outline"
            className="w-full bg-white/10 text-white hover:bg-white/20"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Profile Link
          </Button>

          <Button
            variant="outline"
            className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'privacy':
        return <PrivacySection />;
      case 'security':
        return <SecuritySection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'advanced':
        return <AdvancedSection />;
      default:
        return <GeneralSection />;
    }
  };

  return (
    <div className="h-full flex bg-black/20">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-4">
        <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeSection} Settings</h1>
              <p className="text-white/60">Manage your {activeSection} preferences</p>
            </div>

            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  Unsaved changes
                </Badge>
              )}

              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Reset Settings?</h3>
              </div>

              <p className="text-white/60 mb-6">
                Are you sure you want to reset all settings to their default values? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowResetConfirm(false)}
                  variant="outline"
                  className="flex-1 bg-white/10 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmReset}
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                >
                  Reset All
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
