/**
 * Game-Changing Dating Features
 * Advanced matching and interaction patterns
 */

import {useCallback, useEffect, useState} from 'react'
import {supabase} from '@/integrations/supabase/client'

export type GameChangerProfile  = {
  id: string
  score: number
  compatibility: number
  lastInteraction: string
  interests: string[]
  vibe: 'adventurous' | 'romantic' | 'casual' | 'serious'
}

export type MatchInsight  = {
  userId: string
  compatibilityScore: number
  sharedInterests: string[]
  personalityMatch: number
  lifestyleMatch: number
  recommendation: 'highly_recommended' | 'recommended' | 'maybe' | 'skip'
}

export function useGameChanger() {
  const [profiles, setProfiles] = useState<GameChangerProfile[]>([])
  const [insights, setInsights] = useState<MatchInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load game-changing profiles
  const loadProfiles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get potential matches with AI scoring
      const { data, error } = await supabase
        .from('ai_matching_candidates')
        .select('*')
        .eq('user_id', user.id)
        .order('compatibility_score', { ascending: false })
        .limit(20)

      if (error) throw error

      const gameChangerProfiles: GameChangerProfile[] = (data || []).map(item => ({
        id: item.candidate_id,
        score: item.compatibility_score,
        compatibility: item.compatibility_score,
        lastInteraction: new Date().toISOString(),
        interests: item.shared_interests || [],
        vibe: determineVibe(item.compatibility_score)
      }))

      setProfiles(gameChangerProfiles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Generate match insights
  const generateInsights = useCallback(async (targetUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // This would call an AI service in production
      const mockInsight: MatchInsight = {
        userId: targetUserId,
        compatibilityScore: Math.floor(Math.random() * 30) + 70, // 70-100
        sharedInterests: ['music', 'travel', 'fitness'],
        personalityMatch: Math.floor(Math.random() * 20) + 80, // 80-100
        lifestyleMatch: Math.floor(Math.random() * 25) + 75, // 75-100
        recommendation: 'highly_recommended'
      }

      setInsights(prev => [...prev.filter(i => i.userId !== targetUserId), mockInsight])
      return mockInsight
    } catch (err) {
      console.error('Failed to generate insights:', err)
      return null
    }
  }, [])

  // Super-like action
  const superLike = useCallback(async (targetUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Record super-like
      const { error } = await supabase
        .from('super_likes')
        .insert({
          from_user_id: user.id,
          to_user_id: targetUserId,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Update profile score
      setProfiles(prev => prev.map(profile => 
        profile.id === targetUserId 
          ? { ...profile, score: profile.score + 50 }
          : profile
      ))

      return true
    } catch (err) {
      console.error('Failed to super-like:', err)
      return false
    }
  }, [])

  // Boost profile visibility
  const boostProfile = useCallback(async (duration: number = 30) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create boost record
      const { error } = await supabase
        .from('profile_boosts')
        .insert({
          user_id: user.id,
          boost_type: 'visibility',
          duration_minutes: duration,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      return true
    } catch (err) {
      console.error('Failed to boost profile:', err)
      return false
    }
  }, [])

  // Initialize
  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  return {
    profiles,
    insights,
    isLoading,
    error,
    loadProfiles,
    generateInsights,
    superLike,
    boostProfile
  }
}

// Helper function to determine vibe
function determineVibe(score: number): GameChangerProfile['vibe'] {
  if (score >= 90) return 'adventurous'
  if (score >= 80) return 'romantic'
  if (score >= 70) return 'casual'
  return 'serious'
}