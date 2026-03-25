/**
 * Enterprise Profile View Component
 * Comprehensive user profile with AI analysis, verification, and performance optimization
 */

import React, {useCallback, useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {
  Ban,
  BarChart3,
  Brain,
  Calendar,
  Camera,
  Check,
  Clock,
  Edit,
  Eye,
  Flag,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Share2,
  Shield,
  Target,
  Unlock,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';

import type {UserProfile} from '@/lib/hybrid-p2p-dating';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

interface ProfileViewProps {
  profile: UserProfile | null;
  onUpdate: (updates: Partial<UserProfile>) => void;
  advancedMode: boolean;
}

interface ProfileStats {
  profileViews: number;
  profileLikes: number;
  matches: number;
  messages: number;
  responseRate: number;
  averageResponseTime: number;
  connectionQuality: number;
  trustScore: number;
  aiPopularityScore: number;
  blockchainReputation: number;
}

interface AIAnalysis {
  profileCompleteness: number;
  photoQuality: number;
  bioEngagement: number;
  attractivenessScore: number;
  personalityInsights: string[];
  improvementSuggestions: string[];
  compatibilityFactors: {
    interests: number;
    values: number;
    lifestyle: number;
    communication: number;
  };
}

export default function ProfileView({ profile, onUpdate, advancedMode }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // Sample AI analysis (would come from actual AI service)
  useEffect(() => {
    if (profile && advancedMode) {
      setAIAnalysis({
        profileCompleteness: 0.85,
        photoQuality: 0.92,
        bioEngagement: 0.78,
        attractivenessScore: 0.88,
        personalityInsights: [
          'Adventurous and open-minded',
          'Strong communication skills',
          'Values authenticity and honesty',
          'Socially active and outgoing'
        ],
        improvementSuggestions: [
          'Add more photos showing different activities',
          'Include specific interests and hobbies',
          'Mention what you\'re looking for in a relationship',
          'Add more details about your lifestyle'
        ],
        compatibilityFactors: {
          interests: 0.82,
          values: 0.91,
          lifestyle: 0.76,
          communication: 0.89
        }
      });
    }
  }, [profile, advancedMode]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && profile) {
      // Handle photo upload
      console.log('Photo upload:', files[0]);
    }
  }, [profile]);

  const handlePhotoDelete = useCallback((index: number) => {
    if (profile) {
      const updatedPhotos = profile.photos.filter((_, i) => i !== index);
      onUpdate({ photos: updatedPhotos });
    }
  }, [profile, onUpdate]);

  const handleProfileUpdate = useCallback((updates: Partial<UserProfile>) => {
    onUpdate(updates);
    setIsEditing(false);
  }, [onUpdate]);

  const runAIAnalysis = useCallback(async () => {
    if (!profile) return;

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      // AI analysis would be updated here
    } finally {
      setIsAnalyzing(false);
    }
  }, [profile]);

  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }, []);

  const PhotoGallery = () => (
    <div className="relative h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg overflow-hidden">
      {profile?.photos.length > 0 ? (
        <>
          <img
            src={profile.photos[selectedPhotoIndex].url}
            alt={`${profile.displayName} - Photo ${selectedPhotoIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Photo Navigation */}
          {profile.photos.length > 1 && (
            <>
              <button
                onClick={() => setSelectedPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
              >
                <X className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % profile.photos.length)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Photo Indicators */}
          {profile.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {profile.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-semibold">No photos yet</p>
            <p className="text-sm opacity-75">Add photos to showcase yourself</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {isEditing && (
        <div className="absolute top-4 right-4">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="bg-black/50 rounded-full p-2 text-white hover:bg-black/70 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </label>
        </div>
      )}
    </div>
  );

  const ProfileInfo = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{profile?.displayName}</h1>
            <div className="flex items-center space-x-4 text-white/80">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{profile?.age} years</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{profile?.location.city || 'Location not set'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{profile?.lastActive ? formatTime(profile.lastActive) : 'Unknown'}</span>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleProfileUpdate({})}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Verification Badges */}
        <div className="flex items-center space-x-2">
          {profile?.verification.emailVerified && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              <Check className="w-3 h-3 mr-1" />
              Email Verified
            </Badge>
          )}
          {profile?.verification.photoVerified && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              <Camera className="w-3 h-3 mr-1" />
              Photo Verified
            </Badge>
          )}
          {profile?.verification.idVerified && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Shield className="w-3 h-3 mr-1" />
              ID Verified
            </Badge>
          )}
          {profile?.blockchainVerified && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
              <Lock className="w-3 h-3 mr-1" />
              Blockchain Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Bio */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">About</h3>
        <div className="text-white/80 leading-relaxed">
          {isEditing ? (
            <textarea
              value={profile?.bio || ''}
              onChange={(e) => profile && onUpdate({ bio: e.target.value })}
              className="w-full p-3 bg-white/10 border-white/20 rounded-lg text-white placeholder-white/60 resize-none"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <>
              <p className={showFullBio ? '' : 'line-clamp-3'}>
                {profile?.bio || 'No bio added yet'}
              </p>
              {profile?.bio && profile.bio.length > 200 && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                >
                  {showFullBio ? 'Show less' : 'Show more'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {advancedMode && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Profile Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Profile Views', value: profile?.stats.profileViews || 0, icon: Eye },
              { label: 'Likes', value: profile?.stats.profileLikes || 0, icon: Heart },
              { label: 'Matches', value: profile?.stats.matches || 0, icon: Users },
              { label: 'Messages', value: profile?.stats.messages || 0, icon: MessageCircle },
            ].map((stat, index) => (
              <Card key={index} className="bg-white/10 border-white/20 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <stat.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-white/60 text-sm">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {(profile?.preferences.lookingFor || []).map((interest, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-white/10 text-white border-white/20"
            >
              {interest}
            </Badge>
          ))}
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Interest
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const AIAnalysisPanel = () => (
    <Card className="bg-black/40 border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">AI Analysis</h3>
        <Button
          onClick={runAIAnalysis}
          disabled={isAnalyzing}
          className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          <Brain className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
      </div>

      {aiAnalysis && (
        <div className="space-y-6">
          {/* Profile Scores */}
          <div>
            <h4 className="text-white font-semibold mb-3">Profile Scores</h4>
            <div className="space-y-3">
              {[
                { label: 'Profile Completeness', value: aiAnalysis.profileCompleteness, color: 'blue' },
                { label: 'Photo Quality', value: aiAnalysis.photoQuality, color: 'green' },
                { label: 'Bio Engagement', value: aiAnalysis.bioEngagement, color: 'purple' },
                { label: 'Attractiveness', value: aiAnalysis.attractivenessScore, color: 'pink' },
              ].map((score, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80">{score.label}</span>
                    <span className="text-white">{Math.round(score.value * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r from-${score.color}-500 to-${score.color}-400 h-2 rounded-full`}
                      style={{ width: `${score.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personality Insights */}
          <div>
            <h4 className="text-white font-semibold mb-3">Personality Insights</h4>
            <div className="space-y-2">
              {aiAnalysis.personalityInsights.map((insight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-white/80">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility Factors */}
          <div>
            <h4 className="text-white font-semibold mb-3">Compatibility Factors</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(aiAnalysis.compatibilityFactors).map(([key, value], index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{Math.round(value * 100)}%</div>
                  <div className="text-white/60 text-sm capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div>
            <h4 className="text-white font-semibold mb-3">Improvement Suggestions</h4>
            <div className="space-y-2">
              {aiAnalysis.improvementSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span className="text-white/80">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <User className="w-16 h-16 mx-auto mb-4 text-white/60" />
          <h3 className="text-xl font-semibold mb-2">No Profile Found</h3>
          <p className="text-white/60">Profile information is not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-black/20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <div className="flex items-center space-x-2">
            {advancedMode && (
              <>
                <Button
                  onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                  variant={showAIAnalysis ? "default" : "outline"}
                  className={showAIAnalysis ? "bg-blue-500 text-white" : "bg-white/10 text-white"}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Analysis
                </Button>
                <Button
                  onClick={() => setShowStats(!showStats)}
                  variant={showStats ? "default" : "outline"}
                  className={showStats ? "bg-green-500 text-white" : "bg-white/10 text-white"}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Stats
                </Button>
              </>
            )}
            <Button
              onClick={() => setShowVerification(!showVerification)}
              variant="outline"
              className="bg-white/10 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Verification
            </Button>
            <Button
              onClick={() => setShowPrivacy(!showPrivacy)}
              variant="outline"
              className="bg-white/10 text-white"
            >
              {isPrivate ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
              Privacy
            </Button>
          </div>
        </div>

        {/* Photo Gallery */}
        <PhotoGallery />

        {/* Profile Information */}
        <div className="mt-6">
          <ProfileInfo />
        </div>

        {/* AI Analysis Panel */}
        <AnimatePresence>
          {showAIAnalysis && advancedMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <AIAnalysisPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button className="bg-blue-500 text-white hover:bg-blue-600">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" className="bg-white/10 text-white">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" className="bg-white/10 text-white">
            <Heart className="w-4 h-4 mr-2" />
            Like
          </Button>
          <Button variant="outline" className="bg-white/10 text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="bg-red-500/20 text-red-400">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
          <Button variant="outline" className="bg-red-500/20 text-red-400">
            <Ban className="w-4 h-4 mr-2" />
            Block
          </Button>
        </div>
      </div>
    </div>
  );
}
