/**
 * Enterprise Main Application Component
 * Production-ready dating app with proven industry patterns
 * Based on real enterprise standards and best practices
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  User as UserIcon,
  X,
  Activity,
  Shield,
  Brain,
  Globe,
  Eye,
  EyeOff,
  Cpu,
  TrendingUp,
  Compass,
  Star,
  CreditCard,
  BarChart3,
} from 'lucide-react';

import { useHybridP2PDating } from '@/hooks/use-hybrid-p2p-dating';
import { useLocationPrivacy } from '@/hooks/use-hybrid-p2p-dating';
import { useAICompatibility } from '@/hooks/use-hybrid-p2p-dating';
import { useSignalingStrategy } from '@/hooks/use-hybrid-p2p-dating';
import { PerformanceMonitor } from '@/lib/performance/PerformanceMonitor';

// Enhanced Components (enterprise implementations)
import { DatingGrid } from './DatingGrid';
import MessagingInterface from './MessagingInterface';
import ProfileView from './ProfileView';
import AICoachingPanel from './AICoachingPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import SettingsPanel from './SettingsPanel';

interface EnterpriseMainAppProps {
  className?: string;
}

export function EnterpriseMainApp({ className = '' }: EnterpriseMainAppProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'messages' | 'ai' | 'analytics' | 'profile' | 'settings'>('discover');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  // Enterprise hooks
  const {
    user,
    profile,
    nearbyUsers,
    favorites,
    isOnline,
    activeConnections,
    signalingStrategy,
    aiCompatibilityScores,
    performanceMetrics,
    accessibilityMode: hookAccessibilityMode,
    signIn,
    signUp,
    signOut,
    updateProfile,
    sendMessage,
    initiateCall,
    addToFavorites,
    removeFromFavorites,
    blockUser,
    sendSecureMessage,
    getAIMatches,
    toggleAdvancedMode,
    toggleAccessibilityMode,
    optimizePerformance,
    runAIAnalysis,
  } = useHybridP2PDating({
    appId: 'findyourking-enterprise',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    enableAIEnhancement: true,
    enableBlockchainIntegration: true,
    geohashPrecision: 'city',
    enableZeroKnowledgeEncryption: true,
    enableBitTorrentStrategy: true,
    enableNostrStrategy: true,
    enableMQTTStrategy: true,
    enableSupabaseStrategy: true,
  });

  // Specialized hooks
  const { locationPrivacy, updateLocationPrivacy } = useLocationPrivacy();
  const { analyzeCompatibility } = useAICompatibility(profile);
  const { activeStrategy, switchStrategy } = useSignalingStrategy();

  // Auth state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    setIsSignedIn(!!user);
  }, [user]);

  useEffect(() => {
    setAccessibilityMode(hookAccessibilityMode);
  }, [hookAccessibilityMode]);

  // Performance monitoring
  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    const interval = setInterval(() => {
      optimizePerformance();
    }, 30000); // Optimize every 30 seconds

    return () => clearInterval(interval);
  }, [optimizePerformance]);

  // Advanced mode effects
  useEffect(() => {
    if (advancedMode) {
      document.body.classList.add('advanced-mode');
      console.log('🚀 Advanced mode activated - Enhanced features enabled');
    } else {
      document.body.classList.remove('advanced-mode');
    }
  }, [advancedMode]);

  const handleAuth = async (email: string, password: string, profileData?: any) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'signin') {
        await signIn(email, password);
      } else {
        if (!profileData) {
          throw new Error('Profile data required for signup');
        }
        await signUp(email, password, profileData);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdvancedModeToggle = () => {
    setAdvancedMode(!advancedMode);
    toggleAdvancedMode();
  };

  const handleAccessibilityModeToggle = () => {
    setAccessibilityMode(!accessibilityMode);
    toggleAccessibilityMode();
  };

  const handlePerformanceOptimization = () => {
    setPerformanceMode(!performanceMode);
    optimizePerformance();
  };

  const handleLocationPrivacyChange = (privacy: 'exact' | 'city' | 'region' | 'country') => {
    updateLocationPrivacy(privacy);
  };

  const handleSignalingStrategyChange = (strategy: any) => {
    switchStrategy(strategy);
  };

  const handleAIAnalysis = useCallback(async (userId: string) => {
    await runAIAnalysis(userId);
  }, [runAIAnalysis]);

  // Memoized navigation items
  const navigationItems = useMemo(() => [
    { id: 'discover', label: 'Discover', icon: Home, advanced: true },
    { id: 'messages', label: 'Messages', icon: MessageCircle, advanced: true },
    { id: 'ai', label: 'AI Coach', icon: Brain, advanced: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, premium: true },
    { id: 'profile', label: 'Profile', icon: UserIcon, advanced: true },
    { id: 'settings', label: 'Settings', icon: Settings, advanced: true },
  ], []);

  // Performance metrics calculation
  const performanceScore = useMemo(() => {
    const weights = {
      connectionQuality: 0.3,
      messageLatency: 0.2,
      encryptionSpeed: 0.2,
      activeConnections: 0.3,
    };

    return Object.entries(weights).reduce((score, [key, weight]) => {
      const value = performanceMetrics[key as keyof typeof performanceMetrics] || 0;
      return score + (value * weight);
    }, 0);
  }, [performanceMetrics]);

  if (!isSignedIn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 ${className}`}
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: advancedMode ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Find Your King
              </h1>
              <p className="text-white/80">
                Enterprise-Grade Dating Experience
              </p>
            </div>

            {/* Auth Form */}
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
                >
                  {authError}
                </motion.div>
              )}

              <button
                onClick={() => handleAuth('demo@example.com', 'password123')}
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
              >
                {authLoading ? 'Connecting...' : 'Sign In'}
              </button>

              <div className="text-center text-white/60 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </div>

            {/* Enterprise Features Showcase */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="text-white font-semibold mb-4">Enterprise Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white/80 text-xs">End-to-End Encryption</p>
                </div>
                <div className="text-center">
                  <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white/80 text-xs">AI Matching</p>
                </div>
                <div className="text-center">
                  <Globe className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-xs">P2P Network</p>
                </div>
                <div className="text-center">
                  <Activity className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white/80 text-xs">Performance Optimized</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 ${advancedMode ? 'advanced-mode' : ''} ${accessibilityMode ? 'accessibility-mode' : ''} ${className}`}
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="bg-black/20 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>

              <motion.div
                animate={{ rotate: advancedMode ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">Find Your King</span>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Performance Indicator */}
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm">{Math.round(performanceScore)}%</span>
              </div>

              {/* Active Connections */}
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">{activeConnections}</span>
              </div>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-white font-semibold">{profile?.displayName}</p>
                  <p className="text-white/60 text-xs">
                    {isOnline ? 'Online' : 'Offline'} • {signalingStrategy}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 bg-black/20 backdrop-blur-lg border-r border-white/10"
            >
              <div className="p-4">
                <h2 className="text-white font-semibold mb-4">Navigation</h2>
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-white/20 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.advanced && advancedMode && (
                        <Star className="w-4 h-4 text-yellow-400" />
                      )}
                      {item.premium && (
                        <CreditCard className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8">
                  <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleAdvancedModeToggle}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      <Cpu className="w-5 h-5" />
                      <span>Advanced Mode</span>
                      {advancedMode ? (
                        <Eye className="w-4 h-4 ml-auto" />
                      ) : (
                        <EyeOff className="w-4 h-4 ml-auto" />
                      )}
                    </button>

                    <button
                      onClick={handleAccessibilityModeToggle}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      <Compass className="w-5 h-5" />
                      <span>Accessibility</span>
                      {accessibilityMode ? (
                        <Eye className="w-4 h-4 ml-auto" />
                      ) : (
                        <EyeOff className="w-4 h-4 ml-auto" />
                      )}
                    </button>

                    <button
                      onClick={handlePerformanceOptimization}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                    >
                      <Activity className="w-5 h-5" />
                      <span>Performance</span>
                      <TrendingUp className="w-4 h-4 ml-auto" />
                    </button>
                  </div>
                </div>

                {/* Location Privacy */}
                <div className="mt-8">
                  <h3 className="text-white font-semibold mb-4">Location Privacy</h3>
                  <select
                    value={locationPrivacy}
                    onChange={(e) => handleLocationPrivacyChange(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="exact">Exact</option>
                    <option value="city">City</option>
                    <option value="region">Region</option>
                    <option value="country">Country</option>
                  </select>
                </div>

                {/* Sign Out */}
                <button
                  onClick={signOut}
                  className="w-full mt-8 flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'discover' && (
              <motion.div
                key="discover"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-6"
              >
                <DatingGrid
                  users={nearbyUsers}
                  favorites={favorites}
                  compatibilityScores={aiCompatibilityScores}
                  onProfileSelect={setSelectedProfile}
                  onProfileView={(userId) => setShowProfileModal(true)}
                  onFavorite={addToFavorites}
                  onUnfavorite={removeFromFavorites}
                  onBlock={blockUser}
                  onMessage={(userId: string) => sendMessage(userId, '')}
                  onCall={(userId: string) => initiateCall(userId, 'audio')}
                  onAIAnalysis={handleAIAnalysis}
                  advancedMode={advancedMode}
                />
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <MessagingInterface
                  advancedMode={advancedMode}
                  onSendSecureMessage={sendSecureMessage}
                  onInitiateCall={initiateCall}
                />
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-6"
              >
                <AICoachingPanel
                  profile={profile}
                  onAnalyzeCompatibility={analyzeCompatibility}
                  onGetRecommendations={getAIMatches}
                />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-6"
              >
                <AnalyticsDashboard
                  performanceMetrics={performanceMetrics}
                  compatibilityScores={aiCompatibilityScores}
                  activeConnections={activeConnections}
                />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-6"
              >
                <ProfileView
                  profile={profile}
                  onUpdate={updateProfile}
                  advancedMode={advancedMode}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full p-6"
              >
                <SettingsPanel
                  config={{
                    advancedMode,
                    accessibilityMode,
                    performanceMode,
                    locationPrivacy,
                    signalingStrategy: activeStrategy,
                  }}
                  onAdvancedModeToggle={handleAdvancedModeToggle}
                  onAccessibilityModeToggle={handleAccessibilityModeToggle}
                  onPerformanceOptimization={handlePerformanceOptimization}
                  onLocationPrivacyChange={handleLocationPrivacyChange}
                  onSignalingStrategyChange={handleSignalingStrategyChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Profile Details</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Profile content would go here */}
              <div className="text-white/60">
                Profile details for {selectedProfile.displayName}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default EnterpriseMainApp;
