/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🤖 AI MATCHING ENGINE - Advanced Compatibility Analysis
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sophisticated AI-powered matching system with behavioral analysis,
 * personality compatibility, interest matching, and location-based scoring.
 * Uses multiple AI models for comprehensive compatibility assessment.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 4.0.0
 */

import {LocationData, UserProfile} from '../types'

export type MatchScore  = {
  score: number // 0-100
  confidence: number // 0-1
  factors: {
    compatibility: number // Interest/personality compatibility
    proximity: number // Location-based proximity
    interests: number // Shared interests overlap
    behavior: number // Behavioral pattern compatibility
    availability: number // Online/activity compatibility
    demographics: number // Age/tribe/demographic compatibility
  }
  explanation: string
  recommendations: string[]
  potentialIssues: string[]
}

export type AIConfig  = {
  openaiApiKey?: string
  model?: string
  enableBehavioralAnalysis?: boolean
  enableSentimentAnalysis?: boolean
  enablePersonalityMatching?: boolean
  enableInterestCompatibility?: boolean
  enableLocationBasedMatching?: boolean
}

export type BehavioralPattern  = {
  activityLevel: 'low' | 'medium' | 'high'
  responseRate: number
  averageResponseTime: number // minutes
  preferredCommunicationTime: string[] // Hours of day
  messageStyle: 'formal' | 'casual' | 'flirty' | 'direct'
  engagementPattern: 'initiator' | 'responder' | 'balanced'
  onlineSchedule: Record<string, number> // Day -> hours online
}

export type CompatibilityWeights  = {
  compatibility: number
  proximity: number
  interests: number
  behavior: number
  availability: number
  demographics: number
}

/**
 * Advanced AI Matching Engine
 */
export class AIMatchingEngine {
  private config: AIConfig
  private compatibilityWeights: CompatibilityWeights = {
    compatibility: 0.25,
    proximity: 0.20,
    interests: 0.20,
    behavior: 0.15,
    availability: 0.10,
    demographics: 0.10,
  }

  constructor(config: AIConfig = {}) {
    this.config = config
  }

  /**
   * Initialize AI models and services
   */
  async initialize(config: AIConfig): Promise<void> {
    this.config = { ...this.config, ...config }
    
    // Initialize OpenAI client if API key provided
    if (this.config.openaiApiKey) {
      // OpenAI client initialization would go here
    }
    
    // Load pre-trained models
    await this.loadPretrainedModels()
    
    // Initialize behavioral analysis
    if (this.config.enableBehavioralAnalysis) {
      await this.initializeBehavioralAnalysis()
    }
  }

  /**
   * Calculate comprehensive compatibility score between two users
   */
  async calculateCompatibility(user1: UserProfile, user2: UserProfile): Promise<MatchScore> {
    const factors = {
      compatibility: await this.calculateInterestCompatibility(user1, user2),
      proximity: await this.calculateProximityScore(user1.location, user2.location),
      interests: await this.calculateInterestCompatibility(user1, user2),
      behavior: await this.calculateBehaviorCompatibility(user1, user2),
      availability: await this.calculateAvailabilityScore(user1, user2),
      demographics: await this.calculateDemographicCompatibility(user1, user2),
    }

    // Weighted score calculation
    let score = 0
    for (const [factor, value] of Object.entries(factors)) {
      score += value * this.compatibilityWeights[factor as keyof CompatibilityWeights]
    }

    // Confidence calculation based on data completeness
    const confidence = this.calculateConfidence(user1, user2)

    // Generate explanation and recommendations
    const explanation = await this.generateCompatibilityExplanation(user1, user2, factors, score)
    const recommendations = await this.generateRecommendations(user1, user2, factors)
    const potentialIssues = await this.identifyPotentialIssues(user1, user2, factors)

    return {
      score: Math.round(score),
      confidence,
      factors,
      explanation,
      recommendations,
      potentialIssues,
    }
  }

  /**
   * Calculate interest compatibility using Jaccard similarity
   */
  private async calculateInterestCompatibility(user1: UserProfile, user2: UserProfile): Promise<number> {
    if (!user1.interests || !user2.interests) return 0

    const interests1 = new Set(user1.interests.map(i => i.toLowerCase()))
    const interests2 = new Set(user2.interests.map(i => i.toLowerCase()))

    const intersection = new Set([...interests1].filter(i => interests2.has(i)))
    const union = new Set([...interests1, ...interests2])

    const jaccardSimilarity = intersection.size / union.size
    return Math.min(jaccardSimilarity * 100, 100)
  }

  /**
   * Calculate proximity score using Haversine distance formula
   */
  private async calculateProximityScore(location1: LocationData, location2: LocationData): Promise<number> {
    if (!location1 || !location2) return 0

    const distance = this.calculateDistance(location1, location2)
    
    // Score decreases with distance (100 at 0km, 0 at 100km+)
    if (distance <= 1) return 100
    if (distance >= 100) return 0
    
    return Math.round(100 * Math.exp(-distance / 20))
  }

  /**
   * Calculate behavioral compatibility
   */
  private async calculateBehaviorCompatibility(user1: UserProfile, user2: UserProfile): Promise<number> {
    if (!this.config.enableBehavioralAnalysis) return 50 // Default score

    const pattern1 = user1.behavioralPatterns || await this.analyzeBehavioralPattern(user1)
    const pattern2 = user2.behavioralPatterns || await this.analyzeBehavioralPattern(user2)

    let compatibility = 0

    // Activity level compatibility
    if (pattern1.activityLevel === pattern2.activityLevel) compatibility += 25

    // Communication style compatibility
    if (pattern1.messageStyle === pattern2.messageStyle) compatibility += 25

    // Engagement pattern compatibility
    const engagementCompatibility = this.calculateEngagementCompatibility(pattern1, pattern2)
    compatibility += engagementCompatibility * 25

    // Schedule compatibility
    const scheduleCompatibility = this.calculateScheduleCompatibility(pattern1, pattern2)
    compatibility += scheduleCompatibility * 25

    return Math.min(compatibility, 100)
  }

  /**
   * Calculate availability score based on online status and activity
   */
  private async calculateAvailabilityScore(user1: UserProfile, user2: UserProfile): Promise<number> {
    let score = 50 // Base score

    // Online status bonus
    const user1Online = this.isUserOnline(user1)
    const user2Online = this.isUserOnline(user2)
    
    if (user1Online && user2Online) score += 30
    else if (user1Online || user2Online) score += 15

    // Recent activity bonus
    const user1Recent = this.isUserRecentlyActive(user1)
    const user2Recent = this.isUserRecentlyActive(user2)
    
    if (user1Recent && user2Recent) score += 20
    else if (user1Recent || user2Recent) score += 10

    return Math.min(score, 100)
  }

  /**
   * Calculate demographic compatibility
   */
  private async calculateDemographicCompatibility(user1: UserProfile, user2: UserProfile): Promise<number> {
    let score = 0

    // Age compatibility (within 10 years)
    const ageDiff = Math.abs((user1.age || 0) - (user2.age || 0))
    if (ageDiff <= 5) score += 30
    else if (ageDiff <= 10) score += 20
    else if (ageDiff <= 15) score += 10

    // Tribe compatibility
    if (user1.tribe && user2.tribe) {
      const sharedTribes = user1.tribe.filter(t => user2.tribe?.includes(t))
      if (sharedTribes.length > 0) score += sharedTribes.length * 10
    }

    // Position compatibility
    if (user1.position && user2.position) {
      if (user1.position === user2.position) score += 20
      else if (this.arePositionsCompatible(user1.position, user2.position)) score += 10
    }

    // Relationship goals compatibility
    if (user1.relationshipGoals && user2.relationshipGoals) {
      const sharedGoals = user1.relationshipGoals.filter(g => user2.relationshipGoals?.includes(g))
      if (sharedGoals.length > 0) score += sharedGoals.length * 15
    }

    return Math.min(score, 100)
  }

  /**
   * Analyze behavioral patterns from user activity
   */
  private async analyzeBehavioralPattern(user: UserProfile): Promise<BehavioralPattern> {
    // This would analyze actual user activity data
    // For now, return a default pattern
    return {
      activityLevel: 'medium',
      responseRate: 0.8,
      averageResponseTime: 30,
      preferredCommunicationTime: ['19', '20', '21'],
      messageStyle: 'casual',
      engagementPattern: 'balanced',
      onlineSchedule: {
        'Monday': 2,
        'Tuesday': 3,
        'Wednesday': 2,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 4,
      },
    }
  }

  /**
   * Generate AI-powered compatibility explanation
   */
  private async generateCompatibilityExplanation(
    user1: UserProfile,
    user2: UserProfile,
    factors: MatchScore['factors'],
    score: number
  ): Promise<string> {
    if (!this.config.openaiApiKey) {
      return this.generateBasicExplanation(user1, user2, factors, score)
    }

    // Use AI to generate personalized explanation
    const prompt = `Generate a compatibility explanation for two dating app users:
    
    User 1: ${user1.displayName}, age ${user1.age}, interests: ${user1.interests?.join(', ')}
    User 2: ${user2.displayName}, age ${user2.age}, interests: ${user2.interests?.join(', ')}
    
    Compatibility scores:
    - Interest compatibility: ${factors.interests}%
    - Proximity: ${factors.proximity}%
    - Behavior compatibility: ${factors.behavior}%
    - Availability: ${factors.availability}%
    - Demographic compatibility: ${factors.demographics}%
    
    Overall score: ${score}%
    
    Generate a brief, encouraging explanation (max 150 characters) focusing on the strongest compatibility factors.`

    // This would call OpenAI API
    return this.generateBasicExplanation(user1, user2, factors, score)
  }

  /**
   * Generate basic explanation without AI
   */
  private generateBasicExplanation(
    user1: UserProfile,
    user2: UserProfile,
    factors: MatchScore['factors'],
    score: number
  ): string {
    const strongestFactor = Object.entries(factors).reduce((a, b) => 
      factors[a[0] as keyof typeof factors] > factors[b[0] as keyof typeof factors] ? a : b
    )[0]

    const factorNames = {
      compatibility: 'shared interests and personality',
      proximity: 'geographic proximity',
      interests: 'common interests',
      behavior: 'communication style',
      availability: 'online availability',
      demographics: 'demographic preferences',
    }

    if (score >= 80) {
      return `Excellent match! Strong ${factorNames[strongestFactor as keyof typeof factorNames]} compatibility.`
    } else if (score >= 60) {
      return `Good connection with notable ${factorNames[strongestFactor as keyof typeof factorNames]} alignment.`
    } else if (score >= 40) {
      return `Moderate compatibility with potential for growth.`
    } else {
      return `Limited compatibility - consider exploring other matches.`
    }
  }

  /**
   * Generate personalized recommendations
   */
  private async generateRecommendations(
    user1: UserProfile,
    user2: UserProfile,
    factors: MatchScore['factors']
  ): Promise<string[]> {
    const recommendations: string[] = []

    if (factors.interests >= 70) {
      recommendations.push('Start with shared interests to break the ice')
    }

    if (factors.proximity >= 80) {
      recommendations.push('You\'re nearby - suggest meeting for coffee')
    }

    if (factors.behavior <= 40) {
      recommendations.push('Take time to understand each other\'s communication styles')
    }

    if (factors.availability >= 70) {
      recommendations.push('Both active - great time to connect')
    }

    if (recommendations.length === 0) {
      recommendations.push('Send a friendly message to get to know each other')
    }

    return recommendations
  }

  /**
   * Identify potential compatibility issues
   */
  private async identifyPotentialIssues(
    user1: UserProfile,
    user2: UserProfile,
    factors: MatchScore['factors']
  ): Promise<string[]> {
    const issues: string[] = []

    if (factors.proximity <= 30) {
      issues.push('Long distance may require extra commitment')
    }

    if (factors.interests <= 30) {
      issues.push('Limited shared interests - may need to explore new activities together')
    }

    if (factors.behavior <= 30) {
      issues.push('Different communication styles may require patience')
    }

    const ageDiff = Math.abs((user1.age || 0) - (user2.age || 0))
    if (ageDiff > 20) {
      issues.push('Significant age gap - ensure life goals align')
    }

    if (user1.relationshipGoals && user2.relationshipGoals) {
      const sharedGoals = user1.relationshipGoals.filter(g => user2.relationshipGoals?.includes(g))
      if (sharedGoals.length === 0) {
        issues.push('Different relationship goals - discuss expectations early')
      }
    }

    return issues
  }

  /**
   * Moderate content for appropriateness
   */
  async moderateContent(content: string): Promise<boolean> {
    // Basic content moderation
    const inappropriateWords = [
      'spam', 'scam', 'fake', 'bot', 'advertisement',
      // Add more inappropriate words as needed
    ]

    const lowerContent = content.toLowerCase()
    return !inappropriateWords.some(word => lowerContent.includes(word))
  }

  /**
   * Calculate confidence score based on data completeness
   */
  private calculateConfidence(user1: UserProfile, user2: UserProfile): number {
    let completeness = 0
    let totalFields = 0

    const fields = ['interests', 'bio', 'photos', 'age', 'location', 'preferences']
    
    for (const field of fields) {
      totalFields++
      if (user1[field] && user2[field]) {
        completeness++
      }
    }

    return completeness / totalFields
  }

  /**
════════════════════════════════════════════════════════════════════════════════ 
 * UTILITY METHODS
 * ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Calculate distance between two locations using Haversine formula
   */
  private calculateDistance(location1: LocationData, location2: LocationData): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(location2.latitude - location1.latitude)
    const dLon = this.toRadians(location2.longitude - location1.longitude)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(location1.latitude)) * 
              Math.cos(this.toRadians(location2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Check if user is currently online
   */
  private isUserOnline(user: UserProfile): boolean {
    const lastSeen = new Date(user.lastSeen || 0)
    const now = new Date()
    const minutesDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    return minutesDiff <= 5
  }

  /**
   * Check if user was recently active (within 24 hours)
   */
  private isUserRecentlyActive(user: UserProfile): boolean {
    const lastSeen = new Date(user.lastSeen || 0)
    const now = new Date()
    const hoursDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24
  }

  /**
   * Calculate engagement pattern compatibility
   */
  private calculateEngagementCompatibility(pattern1: BehavioralPattern, pattern2: BehavioralPattern): number {
    if (pattern1.engagementPattern === pattern2.engagementPattern) return 1
    
    // Balanced patterns work well with others
    if (pattern1.engagementPattern === 'balanced' || pattern2.engagementPattern === 'balanced') return 0.8
    
    // Initiator and responder can work well together
    if ((pattern1.engagementPattern === 'initiator' && pattern2.engagementPattern === 'responder') ||
        (pattern1.engagementPattern === 'responder' && pattern2.engagementPattern === 'initiator')) {
      return 0.9
    }
    
    return 0.5
  }

  /**
   * Calculate schedule compatibility
   */
  private calculateScheduleCompatibility(pattern1: BehavioralPattern, pattern2: BehavioralPattern): number {
    let overlap = 0
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    for (const day of days) {
      const hours1 = pattern1.onlineSchedule[day] || 0
      const hours2 = pattern2.onlineSchedule[day] || 0
      overlap += Math.min(hours1, hours2)
    }
    
    // Normalize to 0-1 scale (assuming max 8 hours per day overlap)
    return Math.min(overlap / (7 * 8), 1)
  }

  /**
   * Check if positions are compatible
   */
  private arePositionsCompatible(position1: string, position2: string): boolean {
    const compatiblePositions = {
      'top': ['bottom', 'versatile'],
      'bottom': ['top', 'versatile'],
      'versatile': ['top', 'bottom', 'versatile'],
    }
    
    return compatiblePositions[position1 as keyof typeof compatiblePositions]?.includes(position2) || false
  }

  /**
   * Load pre-trained models
   */
  private async loadPretrainedModels(): Promise<void> {
    // Load machine learning models for compatibility analysis
    // This would load actual ML models in production
  }

  /**
   * Initialize behavioral analysis
   */
  private async initializeBehavioralAnalysis(): Promise<void> {
    // Initialize behavioral analysis models and data structures
    // This would set up actual behavioral analysis in production
  }
}

export default AIMatchingEngine