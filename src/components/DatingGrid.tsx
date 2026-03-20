/**
 * Enterprise Dating Grid Component
 * Production-ready user discovery with AI matching and performance optimization
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X, Star, MapPin, Shield, Brain } from 'lucide-react';

export interface UserProfile {
  id: string;
  displayName: string;
  age: number;
  bio: string;
  location: {
    city?: string;
    distance?: number;
  };
  photos: Array<{
    url: string;
    thumbnailUrl: string;
    isPrimary: boolean;
  }>;
  verification: {
    ageVerified: boolean;
    photoVerified: boolean;
    idVerified: boolean;
  };
  stats: {
    compatibilityScore?: number;
    responseRate: number;
    trustScore: number;
  };
  isOnline: boolean;
  isPremium: boolean;
}

interface DatingGridProps {
  users: UserProfile[];
  favorites: string[];
  compatibilityScores: Map<string, number>;
  onProfileSelect: (user: UserProfile) => void;
  onProfileView: (userId: string) => void;
  onFavorite: (userId: string) => void;
  onUnfavorite: (userId: string) => void;
  onBlock: (userId: string) => void;
  onMessage: (userId: string) => void;
  onCall: (userId: string) => void;
  onAIAnalysis: (userId: string) => void;
  advancedMode: boolean;
  loading?: boolean;
}

export const DatingGrid: React.FC<DatingGridProps> = ({
  users,
  favorites,
  compatibilityScores,
  onProfileSelect,
  onProfileView,
  onFavorite,
  onUnfavorite,
  onBlock,
  onMessage,
  onCall,
  onAIAnalysis,
  advancedMode,
  loading = false,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sort users by compatibility score and online status
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // Prioritize online users
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      // Then by compatibility score
      const aScore = compatibilityScores.get(a.id) || a.stats.compatibilityScore || 0;
      const bScore = compatibilityScores.get(b.id) || b.stats.compatibilityScore || 0;
      
      return bScore - aScore;
    });
  }, [users, compatibilityScores]);

  const handleProfileClick = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    onProfileSelect(user);
  }, [onProfileSelect]);

  const handleFavorite = useCallback((e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (favorites.includes(userId)) {
      onUnfavorite(userId);
    } else {
      onFavorite(userId);
    }
  }, [favorites, onFavorite, onUnfavorite]);

  const handleAIAnalysisClick = useCallback((e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onAIAnalysis(userId);
  }, [onAIAnalysis]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 animate-pulse">
            <div className="h-48 bg-white/20 rounded-lg mb-4"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Discover</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* User Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
        : "space-y-4"
      }>
        <AnimatePresence>
          {sortedUsers.map((user, index) => {
            const compatibilityScore = compatibilityScores.get(user.id) || user.stats.compatibilityScore || 0;
            const isFavorite = favorites.includes(user.id);
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden hover:bg-white/20 transition-all duration-300 cursor-pointer ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => handleProfileClick(user)}
              >
                {/* Profile Photo */}
                <div className={`relative ${viewMode === 'list' ? 'w-48 h-48' : 'h-48'}`}>
                  <img
                    src={user.photos.find(p => p.isPrimary)?.thumbnailUrl || user.photos[0]?.thumbnailUrl}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Online Status */}
                  {user.isOnline && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  
                  {/* Verification Badges */}
                  <div className="absolute top-2 left-2 flex space-x-1">
                    {user.verification.photoVerified && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {user.verification.ageVerified && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Compatibility Score */}
                  {advancedMode && compatibilityScore > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                      <div className="flex items-center space-x-1">
                        <Brain className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-white font-semibold">
                          {Math.round(compatibilityScore)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{user.displayName}</h3>
                      <p className="text-white/60 text-sm">{user.age} years old</p>
                      {user.location.city && (
                        <div className="flex items-center text-white/60 text-sm mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {user.location.city}
                          {user.location.distance && ` • ${Math.round(user.location.distance)}km`}
                        </div>
                      )}
                    </div>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleFavorite(e, user.id)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white/60'}`} 
                      />
                    </button>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-white/80 text-sm line-clamp-2 mb-3">{user.bio}</p>
                  )}

                  {/* Stats */}
                  {advancedMode && (
                    <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                      <span>Response: {Math.round(user.stats.responseRate * 100)}%</span>
                      <span>Trust: {user.stats.trustScore}/100</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMessage(user.id);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </button>
                    
                    {advancedMode && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCall(user.id);
                          }}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <div className="w-4 h-4 border-2 border-white rounded-full" />
                        </button>
                        
                        <button
                          onClick={(e) => handleAIAnalysisClick(e, user.id)}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white/60" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No profiles found</h3>
          <p className="text-white/60">Try adjusting your filters or check back later</p>
        </div>
      )}

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedUser.displayName}</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* Profile content would be expanded here */}
              <div className="text-white/60">
                <p>Age: {selectedUser.age}</p>
                <p>Bio: {selectedUser.bio}</p>
                <p>Location: {selectedUser.location.city}</p>
                {advancedMode && (
                  <p>Compatibility: {Math.round(compatibilityScores.get(selectedUser.id) || 0)}%</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatingGrid;
