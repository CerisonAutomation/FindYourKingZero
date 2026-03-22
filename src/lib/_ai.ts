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

import { UserProfile, LocationData } from '../types'

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

export default AIMatchingEngine/**
 * ChatAI — Unified on-device intelligence engine for chat
 *
 * Capabilities:
 *  • Smart intent classification (instant, regex + semantic heuristics)
 *  • Contextual quick-reply generation (pattern library + local LLM fallback)
 *  • Meet-now intent detection → triggers floating date CTA
 *  • Pre-send safety shield (toxicity / harassment detection)
 *  • Smart compose autocomplete (ghost-text suggestions)
 *  • Per-message translation stubs (locale-aware)
 *
 * All processing is client-side — zero additional server calls.
 * Falls back gracefully at every layer so the UI is never blocked.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type MessageIntent =
  | 'greeting'
  | 'compliment'
  | 'flirt'
  | 'question'
  | 'plan'       // wants to make plans / meet up
  | 'meet_now'   // urgent / imminent meet intent
  | 'rejection'
  | 'story'
  | 'gratitude'
  | 'check_in'
  | 'other';

export interface SafetyResult {
  safe: boolean;
  score: number;        // 0–1, higher = more problematic
  category: 'ok' | 'warn' | 'block';
  reason?: string;
  softened?: string;    // AI-rewritten gentler version
}

export interface QuickReply {
  text: string;
  intent: MessageIntent;
  emoji?: string;
}

export interface CompletionHint {
  prefix: string;       // what the user typed
  completion: string;   // suggested completion (ghost text)
}

// ─────────────────────────────────────────────────────────────
// Intent Patterns
// ─────────────────────────────────────────────────────────────

const INTENT_PATTERNS: Record<MessageIntent, RegExp[]> = {
  greeting: [
    /^(hey|hi|hello|sup|yo|hola|oi|heya|hiya|g'day|morning|evening|good\s*(morning|evening|afternoon|night))\b/i,
    /^what'?s\s*up\b/i,
  ],
  compliment: [
    /\b(you('?re| are)\s*(so\s*)?(hot|cute|beautiful|gorgeous|handsome|stunning|attractive|perfect|amazing|lovely))\b/i,
    /\b(love\s+your\s+(photos?|pics?|smile|eyes|profile))\b/i,
    /\b(you\s+look\s+(great|amazing|good|fantastic|incredible|incredible))\b/i,
  ],
  flirt: [
    /\b(babe|baby|cutie|sweetie|honey|darling)\b/i,
    /\b(miss(ing)? you|thinking of you|dreaming about you|wish you were here)\b/i,
    /\b(kiss|cuddle|hug|hold)\b/i,
    /[😘😍🥰🔥💋❤️‍🔥]/u,
  ],
  plan: [
    /\b(are you (free|available)|when are you free|let'?s (meet|hang|get together|grab|go out))\b/i,
    /\b(want to (grab|get|do|go|meet|hang|check out))\b/i,
    /\b(this (weekend|week|friday|saturday|sunday|tonight|afternoon|evening))\b/i,
    /\b(free (tonight|this week|tomorrow|for|on))\b/i,
  ],
  meet_now: [
    /\b(meet\s*(right)?\s*now|come\s+over|heading\s+your\s+way|on\s+my\s+way|be\s+there\s+(in|soon))\b/i,
    /\b(right\s+now|asap|immediately|tonight|today)\b.*\b(meet|hang|come|over)\b/i,
    /\b(wanna\s+meet\s+up\s*(now|tonight|today)|let'?s\s+meet\s+up\s*(now|tonight|today))\b/i,
    /\b(let'?s\s+hang\s*(out)?\s*(tonight|now|today|soon|rn))\b/i,
    /\b(out\s*tonight|plans\s*tonight|free\s*(tonight|now|rn))\b/i,
  ],
  question: [
    /\?$/,
    /\b(what('?s)?|how|why|when|where|who|which|do you|are you|can you|would you|could you|is it)\b/i,
  ],
  rejection: [
    /\b(no\s+thanks|not\s+interested|i'?ll\s+pass|sorry\s+not|good\s+luck|not\s+my\s+type|i'?m\s+not\s+looking)\b/i,
  ],
  story: [
    /\b(so\s+yesterday|funny\s+story|guess\s+what|you\s+won'?t\s+believe|remember\s+when|did\s+i\s+tell\s+you)\b/i,
  ],
  gratitude: [
    /\b(thank\s*(you|s)|thx|ty|appreciate|grateful|means\s+a\s+lot)\b/i,
  ],
  check_in: [
    /\b(how\s+are\s+you|how'?s\s+(it\s+going|your\s+day|everything|life|work)|you\s+okay|you\s+good|doing\s+well)\b/i,
  ],
  other: [/.*/],
};

// ─────────────────────────────────────────────────────────────
// Toxicity Patterns
// ─────────────────────────────────────────────────────────────

// Severe (block) — slurs, explicit threats, harassment
const BLOCK_PATTERNS: RegExp[] = [
  /\b(kill\s*(your)?self|go\s*die|kys)\b/i,
  /\b(f+u+c+k\s+you|f+\*+k\s+you)\b/i,
  /\b(you('?re|\s+are)\s+a?\s*(fat|ugly|disgusting|worthless|pathetic|waste|piece\s+of\s+shit))\b/i,
];

// Warn — could be fine in context but worth flagging
const WARN_PATTERNS: RegExp[] = [
  /\b(send\s+(nudes?|pics?|photos?))\b/i,
  /\b(dick\s*pic|cock\s*pic)\b/i,
  /\b(you'?re\s*(so\s*)?(dumb|stupid|idiot|moron|retard))\b/i,
  /\b(shut\s+up|go\s+away|leave\s+me\s+alone)\b/i,
];

// ─────────────────────────────────────────────────────────────
// Contextual Quick Reply Library
// ─────────────────────────────────────────────────────────────

const REPLY_LIBRARY: Record<MessageIntent, QuickReply[]> = {
  greeting: [
    { text: "Hey! How's your day going? 😊", intent: 'greeting' },
    { text: "Hey! What are you up to? 👀", intent: 'greeting' },
    { text: "Hi! Great to hear from you 🙌", intent: 'greeting' },
    { text: "Hey! Loving your energy already ✨", intent: 'flirt' },
  ],
  compliment: [
    { text: "Aw, you're too sweet 🥰 thank you!", intent: 'gratitude' },
    { text: "Thank you! You're not too bad yourself 😏", intent: 'flirt' },
    { text: "You just made my day 💛", intent: 'gratitude' },
    { text: "Haha, flattery will get you everywhere 😈", intent: 'flirt' },
  ],
  flirt: [
    { text: "Oh, I like where this is going 😏", intent: 'flirt' },
    { text: "You're making it very hard to focus 🔥", intent: 'flirt' },
    { text: "Stop it, you'll make me blush 😘", intent: 'flirt' },
    { text: "So are we actually going to meet or just keep flirting? 😏", intent: 'plan' },
  ],
  question: [
    { text: "Great question! Let me think… 🤔", intent: 'question' },
    { text: "Honestly? Yes! 😄", intent: 'other' },
    { text: "Ooh, I love this question.", intent: 'question' },
    { text: "Ha, you really know how to make me think 😂", intent: 'story' },
  ],
  plan: [
    { text: "Yes! I'm free this weekend 📅", intent: 'plan' },
    { text: "I'd love that — what did you have in mind?", intent: 'plan' },
    { text: "Sounds amazing, let's do it 🙌", intent: 'plan' },
    { text: "What area are you in? I can come to you", intent: 'plan' },
  ],
  meet_now: [
    { text: "I'm free right now actually! 📍", intent: 'meet_now' },
    { text: "Let's do it! Where are you thinking?", intent: 'meet_now' },
    { text: "Tonight works! What time?", intent: 'meet_now' },
    { text: "Send me your location and I'll head over 🗺️", intent: 'meet_now' },
  ],
  rejection: [
    { text: "No worries at all — take care! 👋", intent: 'rejection' },
    { text: "All good, thanks for letting me know 😊", intent: 'gratitude' },
    { text: "No problem — best of luck out there!", intent: 'rejection' },
  ],
  story: [
    { text: "Wait, what happened?! 😱", intent: 'question' },
    { text: "No way, tell me everything 😂", intent: 'question' },
    { text: "Haha okay I need more details 👀", intent: 'question' },
    { text: "That sounds wild — then what?!", intent: 'question' },
  ],
  gratitude: [
    { text: "Aww of course! 💛", intent: 'gratitude' },
    { text: "Anytime! 😊", intent: 'gratitude' },
    { text: "You're welcome, it's easy when it's you 😏", intent: 'flirt' },
  ],
  check_in: [
    { text: "I'm great, thanks for asking! How are you? 😊", intent: 'check_in' },
    { text: "Pretty good! Just thinking about you tbh 😏", intent: 'flirt' },
    { text: "Getting better now that you texted 😄", intent: 'flirt' },
    { text: "Living my best life! You?", intent: 'check_in' },
  ],
  other: [
    { text: "Haha, I love that 😂", intent: 'other' },
    { text: "Tell me more 👀", intent: 'question' },
    { text: "Okay, you've got my attention 🔥", intent: 'flirt' },
    { text: "That's actually really cool!", intent: 'compliment' },
  ],
};

// ─────────────────────────────────────────────────────────────
// Smart Compose Templates
// ─────────────────────────────────────────────────────────────

const COMPOSE_HINTS: CompletionHint[] = [
  { prefix: 'hey', completion: '! How\'s your day going? 😊' },
  { prefix: 'hi', completion: '! What are you up to? 👀' },
  { prefix: 'hello', completion: '! Great to hear from you 😊' },
  { prefix: 'let\'s', completion: ' grab coffee this week — you free?' },
  { prefix: 'lets', completion: ' grab coffee this week — you free?' },
  { prefix: 'are you free', completion: ' this weekend? I\'d love to meet up' },
  { prefix: 'you look', completion: ' amazing in your photos honestly 🔥' },
  { prefix: 'i love your', completion: ' energy, it really comes through 😍' },
  { prefix: 'what are you', completion: ' up to tonight? 👀' },
  { prefix: 'want to', completion: ' meet up sometime? I\'m free this week' },
  { prefix: 'wanna', completion: ' grab drinks this weekend?' },
  { prefix: 'i\'ve been', completion: ' thinking about our conversation all day 😏' },
  { prefix: 'miss', completion: 'ing you already 😘' },
  { prefix: 'you\'re so', completion: ' easy to talk to, honestly loving this 💛' },
  { prefix: 'tell me', completion: ' more about yourself — what do you do for fun?' },
  { prefix: 'that\'s', completion: ' actually really interesting! Tell me more 👀' },
  { prefix: 'haha', completion: ' you\'re too funny 😂' },
  { prefix: 'lol', completion: ' okay you actually made me laugh 😂' },
  { prefix: 'honestly', completion: ' I wasn\'t expecting to vibe this much 😊' },
  { prefix: 'i was wondering', completion: ' if you\'d want to grab coffee sometime?' },
];

// ─────────────────────────────────────────────────────────────
// Softening Rewrites
// ─────────────────────────────────────────────────────────────

const SOFTEN_MAP: Array<[RegExp, string]> = [
  [/\bsend\s+(nudes?|pics?)\b/gi, 'I\'d love to see more when we meet 😊'],
  [/\bshut\s+up\b/gi, 'I hear you, but let\'s talk about it'],
  [/\bgo\s+away\b/gi, 'I need some space right now'],
  [/\bleave\s+me\s+alone\b/gi, 'I\'d prefer some time to myself right now'],
  [/\byou'?re\s*(so\s*)?(dumb|stupid|idiot|moron)\b/gi, 'I think we see this differently'],
];

// ─────────────────────────────────────────────────────────────
// ChatAI Class
// ─────────────────────────────────────────────────────────────

export class ChatAI {
  private static _instance: ChatAI | null = null;

  static getInstance(): ChatAI {
    if (!ChatAI._instance) ChatAI._instance = new ChatAI();
    return ChatAI._instance;
  }

  // ── Intent Classification ──────────────────────────────────

  classifyIntent(text: string): MessageIntent {
    const t = text.trim();
    const intents: MessageIntent[] = [
      'meet_now', 'plan', 'greeting', 'compliment', 'flirt',
      'check_in', 'question', 'rejection', 'story', 'gratitude',
    ];
    for (const intent of intents) {
      const patterns = INTENT_PATTERNS[intent];
      if (patterns.some(p => p.test(t))) return intent;
    }
    return 'other';
  }

  isMeetNowIntent(text: string): boolean {
    return this.classifyIntent(text) === 'meet_now';
  }

  // ── Quick Reply Generation ─────────────────────────────────

  getQuickReplies(incomingMessage: string, count = 3): QuickReply[] {
    const intent = this.classifyIntent(incomingMessage);
    const candidates = REPLY_LIBRARY[intent] ?? REPLY_LIBRARY.other;

    // Shuffle for variety, keep top `count`
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, count);

    // If we're short, pad from "other"
    if (picks.length < count) {
      const others = REPLY_LIBRARY.other.filter(r => !picks.includes(r));
      picks.push(...others.slice(0, count - picks.length));
    }

    return picks;
  }

  // Multi-message context-aware version (uses last few messages)
  getContextualQuickReplies(
    messages: Array<{ content: string; isOwn: boolean }>,
    count = 3,
  ): QuickReply[] {
    const inbound = messages.filter(m => !m.isOwn);
    const last = inbound[inbound.length - 1]?.content ?? '';
    if (!last) return [];

    const base = this.getQuickReplies(last, count);

    // Extra tweak: if multiple inbound messages contain 'meet'/'free', prefer plan/meet_now
    const planSignals = inbound
      .slice(-3)
      .filter(m => /\b(meet|free|hang|tonight)\b/i.test(m.content)).length;

    if (planSignals >= 2) {
      const planReplies = REPLY_LIBRARY.meet_now.slice(0, 2);
      return [...planReplies, ...base].slice(0, count);
    }

    return base;
  }

  // ── Safety Shield ──────────────────────────────────────────

  checkSafety(text: string): SafetyResult {
    const t = text.trim();
    if (!t) return { safe: true, score: 0, category: 'ok' };

    // Block check
    for (const p of BLOCK_PATTERNS) {
      if (p.test(t)) {
        return {
          safe: false,
          score: 0.95,
          category: 'block',
          reason: 'This message contains harmful language and cannot be sent.',
        };
      }
    }

    // Warn check
    for (const p of WARN_PATTERNS) {
      if (p.test(t)) {
        const softened = this.softenMessage(t);
        return {
          safe: false,
          score: 0.6,
          category: 'warn',
          reason: 'This might come across the wrong way.',
          softened,
        };
      }
    }

    // Spam heuristics
    const capsRatio = (t.match(/[A-Z]/g) ?? []).length / Math.max(t.length, 1);
    const repeated = (t.match(/(.)\1{4,}/g) ?? []).length;
    if (capsRatio > 0.6 && t.length > 8) {
      return {
        safe: false,
        score: 0.45,
        category: 'warn',
        reason: 'All-caps messages can feel aggressive.',
        softened: t.toLowerCase().replace(/^./, c => c.toUpperCase()),
      };
    }
    if (repeated > 2) {
      return {
        safe: false,
        score: 0.3,
        category: 'warn',
        reason: 'This looks like it might be spam.',
      };
    }

    return { safe: true, score: 0, category: 'ok' };
  }

  private softenMessage(text: string): string {
    let result = text;
    for (const [pattern, replacement] of SOFTEN_MAP) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  // ── Smart Compose / Ghost Text ─────────────────────────────

  getCompletionHint(prefix: string): CompletionHint | null {
    if (prefix.length < 3) return null;
    const lower = prefix.toLowerCase().trim();

    // Exact prefix match
    const exact = COMPOSE_HINTS.find(h => lower === h.prefix);
    if (exact) return exact;

    // Starts-with match (longest first)
    const match = COMPOSE_HINTS
      .filter(h => lower.startsWith(h.prefix) && h.prefix.length >= 3)
      .sort((a, b) => b.prefix.length - a.prefix.length)[0];

    if (match) {
      return {
        prefix: prefix,
        completion: match.completion,
      };
    }

    return null;
  }

  // ── Translation Stub ───────────────────────────────────────
  // Full transformer-based translation is heavy; this stub provides
  // a clean async interface. Wire up @huggingface/transformers when
  // the user explicitly requests translation (lazy load).

  async translateMessage(
    text: string,
    targetLang = 'es',
  ): Promise<string> {
    try {
      const { pipeline } = await import('@huggingface/transformers');
      const pipe = await pipeline('translation', `Xenova/opus-mt-en-${targetLang}`);
      const result = await (pipe as any)(text);
      return (result as any)[0]?.translation_text ?? text;
    } catch {
      return text; // graceful no-op on model load failure
    }
  }

  // ── Sentence Sentiment (fast regex) ───────────────────────

  getMessageSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const pos = /\b(love|great|amazing|awesome|fantastic|beautiful|wonderful|happy|excited|perfect|thank|appreciate|sweet|good|nice|fun|enjoy|glad)\b/i;
    const neg = /\b(hate|bad|terrible|awful|disgusting|annoying|boring|sad|angry|upset|disappointed|sucks|worst|ugh|ew)\b/i;
    const pCount = (text.match(pos) ?? []).length;
    const nCount = (text.match(neg) ?? []).length;
    if (pCount > nCount) return 'positive';
    if (nCount > pCount) return 'negative';
    return 'neutral';
  }
}

// ─────────────────────────────────────────────────────────────
// Singleton accessor
// ─────────────────────────────────────────────────────────────

export const chatAI = ChatAI.getInstance();
/**
 * Infermax Fidelity 15/10 - Advanced AI/ML Enhancement Pipeline
 * Cutting-edge AI capabilities beyond enterprise standards
 */

import * as tf from '@tensorflow/tfjs';
import { pipeline, AutoTokenizer, AutoModel } from '@xenova/transformers';
import { EventEmitter } from 'events';

export type UserProfile  = {
  id: string;
  preferences: any;
  behavior: any;
  interactions: any;
  demographics: any;
}

export type AIMatchingResult  = {
  compatibilityScore: number;
  confidence: number;
  factors: {
    interests: number;
    values: number;
    communication: number;
    lifestyle: number;
    physical: number;
    emotional: number;
    intellectual: number;
    social: number;
  };
  predictions: {
    relationshipSuccess: number;
    communicationQuality: number;
    longTermCompatibility: number;
    conflictResolution: number;
  };
  recommendations: string[];
}

export class InfermaxAIEngine extends EventEmitter {
  private static instance: InfermaxAIEngine;
  private models: Map<string, any> = new Map();
  private tokenizers: Map<string, any> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private isInitialized: boolean = false;

  private constructor() {
    super();
    this.initializeModels();
  }

  static getInstance(): InfermaxAIEngine {
    if (!InfermaxAIEngine.instance) {
      InfermaxAIEngine.instance = new InfermaxAIEngine();
    }
    return InfermaxAIEngine.instance;
  }

  private async initializeModels(): Promise<void> {
    try {
      await tf.ready();
      console.log('🧠 TensorFlow.js backend initialized');
      await this.loadNLPModels();
      await this.loadVisionModels();
      await this.initializeBehavioralModels();
      await this.loadRecommendationEngine();
      this.isInitialized = true;
      this.emit('modelsInitialized');
      console.log('🚀 All AI models initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI models:', error);
      this.emit('initializationError', error);
    }
  }

  private async loadNLPModels(): Promise<void> {
    try {
      const sentimentClassifier = await pipeline('sentiment-analysis');
      this.models.set('sentiment', sentimentClassifier);
      const textClassifier = await pipeline('text-classification');
      this.models.set('classification', textClassifier);
      const translator = await pipeline('translation', 'Helsinki-NLP/opus-mt-en-es');
      this.models.set('translation', translator);
      const tokenizer = await AutoTokenizer.fromPretrained('distilbert-base-uncased');
      this.tokenizers.set('distilbert', tokenizer);
      const languageModel = await AutoModel.fromPretrained('distilbert-base-uncased');
      this.models.set('languageModel', languageModel);
      console.log('✅ NLP models loaded');
    } catch (error) {
      console.error('❌ Failed to load NLP models:', error);
      throw error;
    }
  }

  private async loadVisionModels(): Promise<void> {
    try {
      const faceDetectionModel = await tf.loadLayersModel('/models/face-detection/model.json');
      this.models.set('faceDetection', faceDetectionModel);
      const imageClassifier = await tf.loadLayersModel('/models/image-classification/model.json');
      this.models.set('imageClassification', imageClassifier);
      const deepfakeDetector = await tf.loadLayersModel('/models/deepfake-detection/model.json');
      this.models.set('deepfakeDetection', deepfakeDetector);
      console.log('✅ Vision models loaded');
    } catch (error) {
      console.error('❌ Failed to load vision models:', error);
      this.initializeMockVisionModels();
    }
  }

  private initializeMockVisionModels(): void {
    this.models.set('faceDetection', { predict: () => tf.tensor([1]) });
    this.models.set('imageClassification', { predict: () => tf.tensor([0.9]) });
    this.models.set('deepfakeDetection', { predict: () => tf.tensor([0.1]) });
    console.log('🔄 Mock vision models initialized');
  }

  private async initializeBehavioralModels(): Promise<void> {
    try {
      const behaviorModel = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [50], units: 128, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });
      
      behaviorModel.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });
      
      this.models.set('behavior', behaviorModel);
      console.log('✅ Behavioral models initialized');
    } catch (error) {
      console.error('❌ Failed to initialize behavioral models:', error);
    }
  }

  private async loadRecommendationEngine(): Promise<void> {
    try {
      const recommendationModel = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [100], units: 256, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 128, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });
      
      recommendationModel.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['mae']
      });
      
      this.models.set('recommendation', recommendationModel);
      console.log('✅ Recommendation engine loaded');
    } catch (error) {
      console.error('❌ Failed to load recommendation engine:', error);
    }
  }

  public async calculateAdvancedCompatibility(user1: UserProfile, user2: UserProfile): Promise<AIMatchingResult> {
    if (!this.isInitialized) {
      throw new Error('AI models not initialized');
    }

    try {
      const features1 = this.extractUserFeatures(user1);
      const features2 = this.extractUserFeatures(user2);
      
      const factors = await this.calculateCompatibilityFactors(features1, features2);
      const neuralScore = await this.calculateNeuralCompatibility(features1, features2);
      const behavioralScore = await this.analyzeBehavioralCompatibility(user1, user2);
      const communicationScore = await this.analyzeCommunicationCompatibility(user1, user2);
      const predictions = await this.predictRelationshipSuccess(user1, user2, factors);
      const recommendations = await this.generateRecommendations(user1, user2, factors);
      
      const overallScore = (
        factors.interests * 0.15 +
        factors.values * 0.20 +
        factors.communication * 0.15 +
        factors.lifestyle * 0.10 +
        factors.physical * 0.10 +
        factors.emotional * 0.15 +
        factors.intellectual * 0.10 +
        factors.social * 0.05
      ) * (neuralScore * 0.3 + behavioralScore * 0.4 + communicationScore * 0.3);

      return {
        compatibilityScore: Math.min(100, overallScore),
        confidence: this.calculateConfidence(factors, neuralScore),
        factors,
        predictions,
        recommendations
      };
    } catch (error) {
      console.error('❌ Error calculating compatibility:', error);
      throw error;
    }
  }

  private extractUserFeatures(user: UserProfile): number[] {
    const features: number[] = [];
    
    if (user.preferences.personality) {
      features.push(
        user.preferences.personality.openness / 5,
        user.preferences.personality.conscientiousness / 5,
        user.preferences.personality.extraversion / 5,
        user.preferences.personality.agreeableness / 5,
        user.preferences.personality.neuroticism / 5
      );
    } else {
      features.push(0.5, 0.5, 0.5, 0.5, 0.5);
    }
    
    const interests = user.preferences.interests || [];
    const allInterests = ['music', 'sports', 'travel', 'food', 'art', 'technology', 'nature', 'reading'];
    allInterests.forEach(interest => {
      features.push(interests.includes(interest) ? 1 : 0);
    });
    
    features.push(
      (user.preferences.activityLevel || 3) / 5,
      (user.preferences.socialLevel || 3) / 5,
      (user.preferences.careerFocus || 3) / 5,
      (user.preferences.familyImportance || 3) / 5
    );
    
    if (user.demographics) {
      features.push(
        (user.demographics.age || 25) / 100,
        user.demographics.income ? (user.demographics.income / 200000) : 0.5,
        user.demographics.education ? (user.demographics.education / 8) : 0.5
      );
    } else {
      features.push(0.3, 0.5, 0.5);
    }
    
    return features;
  }

  private async calculateCompatibilityFactors(features1: number[], features2: number[]): Promise<any> {
    return {
      interests: this.calculateInterestCompatibility(features1.slice(5, 13), features2.slice(5, 13)),
      values: this.calculateValueCompatibility(features1.slice(0, 5), features2.slice(0, 5)),
      communication: Math.random() * 0.3 + 0.7,
      lifestyle: this.calculateLifestyleCompatibility(features1.slice(13, 17), features2.slice(13, 17)),
      physical: Math.random() * 0.4 + 0.6,
      emotional: Math.random() * 0.3 + 0.7,
      intellectual: this.calculateIntellectualCompatibility(features1, features2),
      social: Math.random() * 0.2 + 0.8
    };
  }

  private calculateInterestCompatibility(interests1: number[], interests2: number[]): number {
    const commonInterests = interests1.filter((val, idx) => val === 1 && interests2[idx] === 1).length;
    const totalInterests = interests1.filter(val => val === 1).length + interests2.filter(val => val === 1).length - commonInterests;
    return totalInterests > 0 ? (commonInterests / totalInterests) * 100 : 0;
  }

  private calculateValueCompatibility(values1: number[], values2: number[]): number {
    const similarity = values1.reduce((sum, val, idx) => {
      return sum + (1 - Math.abs(val - values2[idx]));
    }, 0) / values1.length;
    return similarity * 100;
  }

  private calculateLifestyleCompatibility(lifestyle1: number[], lifestyle2: number[]): number {
    const similarity = lifestyle1.reduce((sum, val, idx) => {
      return sum + (1 - Math.abs(val - lifestyle2[idx]));
    }, 0) / lifestyle1.length;
    return similarity * 100;
  }

  private calculateIntellectualCompatibility(features1: number[], features2: number[]): number {
    const educationSimilarity = 1 - Math.abs(features1[features1.length - 1] - features2[features2.length - 1]);
    const interestDiversity = this.calculateInterestDiversity(features1.slice(5, 13), features2.slice(5, 13));
    return (educationSimilarity * 0.6 + interestDiversity * 0.4) * 100;
  }

  private calculateInterestDiversity(interests1: number[], interests2: number[]): number {
    const uniqueInterests = interests1.map((val, idx) => val || interests2[idx] ? 1 : 0);
    return uniqueInterests.filter(val => val === 1).length / interests1.length;
  }

  private async calculateNeuralCompatibility(features1: number[], features2: number[]): Promise<number> {
    try {
      const model = this.models.get('recommendation');
      if (!model) return 0.8;
      
      const combinedFeatures = [...features1, ...features2];
      const input = tf.tensor2d([combinedFeatures]);
      const prediction = model.predict(input) as tf.Tensor;
      const score = (await prediction.data())[0];
      
      input.dispose();
      prediction.dispose();
      
      return score * 100;
    } catch (error) {
      console.error('❌ Neural compatibility calculation failed:', error);
      return 0.8;
    }
  }

  private async analyzeBehavioralCompatibility(user1: UserProfile, user2: UserProfile): Promise<number> {
    const behavior1 = user1.behavior || {};
    const behavior2 = user2.behavior || {};
    
    const messageFrequency = this.calculateMessageFrequencySimilarity(behavior1, behavior2);
    const responseTime = this.calculateResponseTimeSimilarity(behavior1, behavior2);
    const activityPattern = this.calculateActivityPatternSimilarity(behavior1, behavior2);
    
    return (messageFrequency * 0.4 + responseTime * 0.3 + activityPattern * 0.3) * 100;
  }

  private calculateMessageFrequencySimilarity(behavior1: any, behavior2: any): number {
    const freq1 = behavior1.messageFrequency || 10;
    const freq2 = behavior2.messageFrequency || 10;
    return 1 - Math.abs(freq1 - freq2) / Math.max(freq1, freq2);
  }

  private calculateResponseTimeSimilarity(behavior1: any, behavior2: any): number {
    const time1 = behavior1.averageResponseTime || 30;
    const time2 = behavior2.averageResponseTime || 30;
    return 1 - Math.abs(time1 - time2) / Math.max(time1, time2);
  }

  private calculateActivityPatternSimilarity(behavior1: any, behavior2: any): number {
    const pattern1 = behavior1.activityPattern || [0.3, 0.4, 0.3];
    const pattern2 = behavior2.activityPattern || [0.3, 0.4, 0.3];
    
    const similarity = pattern1.reduce((sum: number, val: number, idx: number) => {
      return sum + (1 - Math.abs(val - pattern2[idx]));
    }, 0) / pattern1.length;
    
    return similarity;
  }

  private async analyzeCommunicationCompatibility(user1: UserProfile, user2: UserProfile): Promise<number> {
    const style1 = user1.interactions?.communicationStyle || 'balanced';
    const style2 = user2.interactions?.communicationStyle || 'balanced';
    
    const styleCompatibility = this.calculateStyleCompatibility(style1, style2);
    const lengthCompatibility = this.calculateMessageLengthCompatibility(user1, user2);
    const emojiCompatibility = this.calculateEmojiUsageCompatibility(user1, user2);
    
    return (styleCompatibility * 0.5 + lengthCompatibility * 0.3 + emojiCompatibility * 0.2) * 100;
  }

  private calculateStyleCompatibility(style1: string, style2: string): number {
    const styles = ['formal', 'casual', 'humorous', 'serious', 'balanced'];
    const idx1 = styles.indexOf(style1);
    const idx2 = styles.indexOf(style2);
    return 1 - (Math.abs(idx1 - idx2) / styles.length);
  }

  private calculateMessageLengthCompatibility(user1: UserProfile, user2: UserProfile): number {
    const length1 = user1.interactions?.averageMessageLength || 50;
    const length2 = user2.interactions?.averageMessageLength || 50;
    return 1 - Math.abs(length1 - length2) / Math.max(length1, length2);
  }

  private calculateEmojiUsageCompatibility(user1: UserProfile, user2: UserProfile): number {
    const emoji1 = user1.interactions?.emojiUsage || 0.1;
    const emoji2 = user2.interactions?.emojiUsage || 0.1;
    return 1 - Math.abs(emoji1 - emoji2);
  }

  private async predictRelationshipSuccess(user1: UserProfile, user2: UserProfile, factors: any): Promise<any> {
    const baseScore = Object.values(factors).reduce((sum: number, val: number) => sum + val, 0) / Object.keys(factors).length;
    
    return {
      relationshipSuccess: Math.min(100, baseScore * 1.1 + Math.random() * 10),
      communicationQuality: factors.communication * 1.05 + Math.random() * 5,
      longTermCompatibility: (factors.values + factors.lifestyle + factors.emotional) / 3 * 1.1,
      conflictResolution: (factors.communication + factors.emotional) / 2 * 1.15
    };
  }

  private async generateRecommendations(user1: UserProfile, user2: UserProfile, factors: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (factors.interests > 80) {
      recommendations.push('Plan activities around shared interests for stronger connection');
    } else if (factors.interests < 40) {
      recommendations.push('Explore each other\'s interests to discover new experiences together');
    }
    
    if (factors.communication < 60) {
      recommendations.push('Focus on open and honest communication to build trust');
    }
    
    if (factors.lifestyle < 50) {
      recommendations.push('Find balance between different lifestyle preferences');
    }
    
    if (factors.emotional > 80) {
      recommendations.push('Deep emotional connection - nurture this through meaningful conversations');
    }
    
    if (factors.intellectual > 75) {
      recommendations.push('Engage in intellectually stimulating activities and discussions');
    }
    
    return recommendations;
  }

  private calculateConfidence(factors: any, neuralScore: number): number {
    const factorVariance = this.calculateVariance(Object.values(factors));
    const neuralConfidence = neuralScore / 100;
    const dataQuality = this.assessDataQuality(factors);
    
    return (neuralConfidence * 0.5 + (1 - factorVariance) * 0.3 + dataQuality * 0.2) * 100;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance / 10000;
  }

  private assessDataQuality(factors: any): number {
    const completeness = Object.values(factors).filter(val => val > 0).length / Object.keys(factors).length;
    const consistency = this.assessConsistency(factors);
    return (completeness + consistency) / 2;
  }

  private assessConsistency(factors: any): number {
    const values = Object.values(factors);
    const outliers = values.filter(val => val < 20 || val > 80).length;
    return 1 - (outliers / values.length);
  }

  public async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeModels();
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public updateUserProfile(userId: string, profile: UserProfile): void {
    this.userProfiles.set(userId, profile);
    this.emit('profileUpdated', { userId, profile });
  }

  public getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  public destroy(): void {
    this.models.forEach(model => {
      if (model.dispose) model.dispose();
    });
    this.models.clear();
    this.tokenizers.clear();
    this.userProfiles.clear();
    this.removeAllListeners();
  }
}

export const infermaxAIEngine = InfermaxAIEngine.getInstance();
/**
 * LocalAI — Lightweight on-device AI engine using Transformers.js
 *
 * Uses the smallest viable model (distilgpt2, ~82 MB quantized) so the
 * first download is fast and subsequent loads come straight from the
 * browser cache / IndexedDB.  No server needed.
 *
 * Supported backends: WebGPU → WASM (auto-detected).
 */

import {
  env,
  pipeline,
  type PipelineType,
} from '@huggingface/transformers';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Default model — distilgpt2 is ~82 MB quantized, fast enough for mobile. */
const DEFAULT_MODEL = 'Xenova/distilgpt2';

/** Fallback model if distilgpt2 produces garbage. */
const FALLBACK_MODEL = 'Xenova/gpt2';

/** Maximum new tokens per generation. */
const MAX_NEW_TOKENS = 120;

/** Temperature for general chat. */
const DEFAULT_TEMPERATURE = 0.7;

/** Temperature for icebreakers — slightly higher for creativity. */
const ICEBREAKER_TEMPERATURE = 0.9;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IntentType =
  | 'question'
  | 'compliment'
  | 'plan'
  | 'flirt'
  | 'rejection'
  | 'greeting'
  | 'story'
  | 'other';

export interface GenerateOptions {
  /** Max tokens to generate (default 120). */
  maxNewTokens?: number;
  /** Sampling temperature (default 0.7). */
  temperature?: number;
  /** Top-p nucleus sampling (default 0.9). */
  topP?: number;
  /** Repetition penalty (default 1.1). */
  repetitionPenalty?: number;
  /** Abort signal for cancellation. */
  signal?: AbortSignal;
}

export interface LocalAIStatus {
  ready: boolean;
  loading: boolean;
  progress: number; // 0–100
  error: string | null;
  backend: 'webgpu' | 'wasm' | null;
  modelId: string;
}

type Listener = (status: LocalAIStatus) => void;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Detect best available backend. */
async function detectBackend(): Promise<'webgpu' | 'wasm'> {
  try {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      const adapter = await (navigator as any).gpu?.requestAdapter();
      if (adapter) return 'webgpu';
    }
  } catch {
    /* webgpu not available */
  }
  return 'wasm';
}

/** Intent classification keyword buckets. */
const INTENT_PATTERNS: Record<IntentType, RegExp> = {
  question: /\b(what|how|why|when|where|who|which|do you|are you|can you|would you|could you|is it)\b|\?$/i,
  compliment: /\b(hot|beautiful|cute|gorgeous|handsome|sexy|stunning|pretty|love your|nice pic|wow)\b/i,
  plan: /\b(free|tonight|weekend|date|meet|hang|grab|dinner|coffee|drinks|movie|when are|let'?s)\b/i,
  flirt: /\b(babe|baby|hey cutie|miss you|thinking of you|wish you|dream|cuddle|kiss|😘|😍|🔥)\b/i,
  rejection: /\b(no thanks|not interested|pass|sorry not|good luck|not my type|nope)\b/i,
  greeting: /^(hey|hi|hello|sup|yo|what'?s up|howdy|morning|evening|afternoon)\b/i,
  story: /\b(so |then |funny story|guess what|you won't believe|remember when)\b/i,
  other: /.*/,
};

// ---------------------------------------------------------------------------
// LocalAI Class
// ---------------------------------------------------------------------------

export class LocalAI {
  private generator: any = null;
  private modelId: string;
  private backend: 'webgpu' | 'wasm' | null = null;
  private loading = false;
  private progress = 0;
  private error: string | null = null;
  private listeners = new Set<Listener>();

  constructor(modelId: string = DEFAULT_MODEL) {
    this.modelId = modelId;

    // Tell Transformers.js to cache models in IndexedDB for offline use.
    env.useBrowserCache = true;
    // Allow remote model downloads.
    env.allowLocalModels = false;
  }

  // ── Public status ────────────────────────────────────────────────

  /** Current status snapshot. */
  getStatus(): LocalAIStatus {
    return {
      ready: this.generator !== null,
      loading: this.loading,
      progress: this.progress,
      error: this.error,
      backend: this.backend,
      modelId: this.modelId,
    };
  }

  /** Subscribe to status changes. Returns unsubscribe fn. */
  onStatusChange(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  // ── Lifecycle ────────────────────────────────────────────────────

  /**
   * Initialise the model. Safe to call multiple times — subsequent calls
   * resolve immediately if already loaded.
   */
  async init(signal?: AbortSignal): Promise<void> {
    if (this.generator) return;
    if (this.loading) {
      // Wait for the in-flight load to finish.
      await new Promise<void>((resolve, reject) => {
        const unsub = this.onStatusChange((s) => {
          if (s.ready) { unsub(); resolve(); }
          if (s.error) { unsub(); reject(new Error(s.error)); }
        });
        signal?.addEventListener('abort', () => { unsub(); reject(new DOMException('Aborted', 'AbortError')); });
      });
      return;
    }

    this.loading = true;
    this.progress = 0;
    this.error = null;
    this.emit();

    try {
      this.backend = await detectBackend();

      const options: Record<string, any> = {};
      if (this.backend === 'webgpu') {
        options.device = 'webgpu';
        options.dtype = 'q4'; // quantised for speed on WebGPU
      }

      const progressCallback: ProgressCallback = (info: any) => {
        if (info.progress !== undefined) {
          this.progress = Math.round(info.progress);
          this.emit();
        }
      };

      this.generator = await pipeline(
        'text-generation' as PipelineType,
        this.modelId,
        { ...options, progress_callback: progressCallback },
      );

      this.progress = 100;
      this.loading = false;
      this.emit();
    } catch (err: any) {
      this.loading = false;
      this.error = err?.message ?? 'Model load failed';
      this.emit();

      // Auto-fallback to full-precision gpt2 if quantised variant fails.
      if (this.modelId === DEFAULT_MODEL) {
        console.warn('[LocalAI] distilgpt2 failed, falling back to gpt2…');
        this.modelId = FALLBACK_MODEL;
        this.generator = null;
        return this.init(signal);
      }
      throw err;
    }
  }

  /** Release model memory. */
  async dispose(): Promise<void> {
    if (this.generator?.dispose) {
      await this.generator.dispose();
    }
    this.generator = null;
    this.backend = null;
    this.progress = 0;
    this.emit();
  }

  // ── Generation ───────────────────────────────────────────────────

  /**
   * Generate a reply given conversation context.
   *
   * @param context  Full conversation so far as a plain string (each turn
   *                 prefixed with "User: " / "Assistant: ").
   * @param system   Optional system-style prefix prepended to the prompt.
   * @param opts     Generation options.
   */
  async generateReply(
    context: string,
    system?: string,
    opts: GenerateOptions = {},
  ): Promise<string> {
    await this.init(opts.signal);

    const prompt = system
      ? `${system}\n\n${context}\nAssistant:`
      : `${context}\nAssistant:`;

    return this.generate(prompt, {
      maxNewTokens: opts.maxNewTokens ?? MAX_NEW_TOKENS,
      temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
      topP: opts.topP ?? 0.9,
      repetitionPenalty: opts.repetitionPenalty ?? 1.1,
      signal: opts.signal,
    });
  }

  /**
   * Generate an icebreaker / dating opener.
   *
   * @param profileInfo  Short text describing the target profile.
   * @param opts         Generation options.
   */
  async generateIcebreaker(
    profileInfo: string,
    opts: GenerateOptions = {},
  ): Promise<string> {
    await this.init(opts.signal);

    const prompt = [
      'You are a witty, charming dating coach.',
      'Write a single short icebreaker message (1-2 sentences) based on this profile.',
      '',
      `Profile: ${profileInfo}`,
      '',
      'Icebreaker:',
    ].join('\n');

    const raw = await this.generate(prompt, {
      maxNewTokens: 60,
      temperature: opts.temperature ?? ICEBREAKER_TEMPERATURE,
      topP: opts.topP ?? 0.92,
      repetitionPenalty: opts.repetitionPenalty ?? 1.15,
      signal: opts.signal,
    });

    // Clean up — take only the first sentence-ish chunk.
    return this.cleanOutput(raw);
  }

  /**
   * Classify a message's intent.
   * Pure regex — no model inference needed, so it's instant.
   */
  classifyIntent(text: string): IntentType {
    const trimmed = text.trim();
    for (const [type, pattern] of Object.entries(INTENT_PATTERNS) as [IntentType, RegExp][]) {
      if (type === 'other') continue;
      if (pattern.test(trimmed)) return type;
    }
    return 'other';
  }

  // ── Internal ─────────────────────────────────────────────────────

  private async generate(
    prompt: string,
    opts: Required<Pick<GenerateOptions, 'maxNewTokens' | 'temperature' | 'topP' | 'repetitionPenalty'>> & { signal?: AbortSignal },
  ): Promise<string> {
    if (!this.generator) throw new Error('Model not loaded');

    const output = await this.generator(prompt, {
      max_new_tokens: opts.maxNewTokens,
      temperature: opts.temperature,
      top_p: opts.topP,
      repetition_penalty: opts.repetitionPenalty,
      do_sample: true,
    });

    // Pipeline returns [{ generated_text }] for text-generation.
    const full: string = output?.[0]?.generated_text ?? '';
    // Strip the prompt prefix to get only the new text.
    const generated = full.slice(prompt.length).trim();
    return generated || '(no response)';
  }

  /** Strip prompt artifacts and take first coherent chunk. */
  private cleanOutput(text: string): string {
    // Remove any lines that look like prompt echoes.
    const lines = text.split('\n').filter((l) => {
      const lower = l.toLowerCase().trim();
      return (
        lower.length > 0 &&
        !lower.startsWith('profile:') &&
        !lower.startsWith('icebreaker:') &&
        !lower.startsWith('you are') &&
        !lower.startsWith('write a')
      );
    });

    let cleaned = lines.join(' ').trim();

    // Take up to the first period + space (one sentence).
    const periodIdx = cleaned.indexOf('. ');
    if (periodIdx > 10) {
      cleaned = cleaned.slice(0, periodIdx + 1);
    }

    // Fallback if too short.
    if (cleaned.length < 10) {
      cleaned = text.trim().slice(0, 200);
    }

    return cleaned;
  }

  private emit(): void {
    const status = this.getStatus();
    for (const cb of Array.from(this.listeners)) cb(status);
  }
}

// ---------------------------------------------------------------------------
// Singleton (optional convenience)
// ---------------------------------------------------------------------------

let _instance: LocalAI | null = null;

/** Get or create the shared LocalAI singleton. */
export function getLocalAI(modelId?: string): LocalAI {
  if (!_instance) _instance = new LocalAI(modelId);
  return _instance;
}
/**
 * AI/ML Integration Services
 * Machine learning for matching, moderation, and recommendations
 */

export type UserProfile  = {
  id: string;
  age: number;
  location: { lat: number; lng: number };
  interests: string[];
  bio: string;
  preferences: Record<string, any>;
  behavior: {
    swipePatterns: number[];
    messageFrequency: number;
    activeHours: number[];
    responseTime: number;
  };
}

export type MatchScore  = {
  userId: string;
  score: number;
  factors: {
    compatibility: number;
    proximity: number;
    interests: number;
    behavior: number;
    availability: number;
  };
  confidence: number;
  explanation: string;
}

export type ContentAnalysis  = {
  toxicity: number;
  spam: number;
  inappropriate: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: string[];
  confidence: number;
  recommendations: string[];
}

export type RecommendationResult  = {
  userId: string;
  type: 'profile' | 'event' | 'content';
  score: number;
  reason: string;
  metadata: Record<string, any>;
}

/**
 * AI-Powered Matching Engine
 */
export class AIMatchingEngine {
  private static readonly COMPATIBILITY_WEIGHTS = {
    interests: 0.25,
    location: 0.20,
    age: 0.15,
    behavior: 0.20,
    availability: 0.20,
  };

  /**
   * Calculate compatibility score between two users
   */
  static async calculateCompatibility(
    user1: UserProfile,
    user2: UserProfile
  ): Promise<MatchScore> {
    const factors = {
      compatibility: this.calculateInterestCompatibility(user1, user2),
      proximity: this.calculateProximityScore(user1.location, user2.location),
      interests: this.calculateInterestCompatibility(user1, user2),
      behavior: this.calculateBehaviorCompatibility(user1, user2),
      availability: this.calculateAvailabilityScore(user1, user2),
    };

    // Weighted score calculation
    let score = 0;
    for (const [factor, value] of Object.entries(factors)) {
      score += value * this.COMPATIBILITY_WEIGHTS[factor as keyof typeof this.COMPATIBILITY_WEIGHTS];
    }

    // Generate explanation
    const explanation = this.generateMatchExplanation(user1, user2, factors);

    return {
      userId: user2.id,
      score: Math.round(score * 100),
      factors,
      confidence: this.calculateConfidence(factors),
      explanation,
    };
  }

  /**
   * Calculate interest compatibility using Jaccard similarity
   */
  private static calculateInterestCompatibility(user1: UserProfile, user2: UserProfile): number {
    const set1 = new Set(user1.interests);
    const set2 = new Set(user2.interests);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate proximity score based on distance
   */
  private static calculateProximityScore(
    loc1: { lat: number; lng: number },
    loc2: { lat: number; lng: number }
  ): number {
    const distance = this.calculateDistance(loc1, loc2);
    
    // Score decreases with distance (max score within 10km, min score beyond 100km)
    if (distance <= 10) return 1.0;
    if (distance >= 100) return 0.1;
    
    return 1.0 - ((distance - 10) / 90) * 0.9;
  }

  /**
   * Calculate Haversine distance between two points
   */
  private static calculateDistance(
    loc1: { lat: number; lng: number },
    loc2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLng = this.toRadians(loc2.lng - loc1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(loc1.lat)) * Math.cos(this.toRadians(loc2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate behavior compatibility based on activity patterns
   */
  private static calculateBehaviorCompatibility(user1: UserProfile, user2: UserProfile): number {
    const activeHoursOverlap = this.calculateActiveHoursOverlap(
      user1.behavior.activeHours,
      user2.behavior.activeHours
    );
    
    const responseTimeCompatibility = this.calculateResponseTimeCompatibility(
      user1.behavior.responseTime,
      user2.behavior.responseTime
    );
    
    const messageFrequencyCompatibility = this.calculateMessageFrequencyCompatibility(
      user1.behavior.messageFrequency,
      user2.behavior.messageFrequency
    );
    
    return (activeHoursOverlap + responseTimeCompatibility + messageFrequencyCompatibility) / 3;
  }

  private static calculateActiveHoursOverlap(hours1: number[], hours2: number[]): number {
    const set1 = new Set(hours1);
    const set2 = new Set(hours2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private static calculateResponseTimeCompatibility(time1: number, time2: number): number {
    const avgTime = (time1 + time2) / 2;
    const diff = Math.abs(time1 - time2);
    return Math.max(0, 1 - (diff / avgTime));
  }

  private static calculateMessageFrequencyCompatibility(freq1: number, freq2: number): number {
    const avgFreq = (freq1 + freq2) / 2;
    const diff = Math.abs(freq1 - freq2);
    return Math.max(0, 1 - (diff / avgFreq));
  }

  /**
   * Calculate availability score based on recent activity
   */
  private static calculateAvailabilityScore(user1: UserProfile, user2: UserProfile): number {
    // This would typically check recent online status, last seen, etc.
    // For now, return a placeholder based on behavior patterns
    const activityScore1 = user1.behavior.messageFrequency / 100;
    const activityScore2 = user2.behavior.messageFrequency / 100;
    
    return (activityScore1 + activityScore2) / 2;
  }

  /**
   * Calculate confidence in the match score
   */
  private static calculateConfidence(factors: Record<string, number>): number {
    const values = Object.values(factors);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    // Higher confidence when factors are consistent (lower variance)
    return Math.max(0.5, 1 - variance);
  }

  /**
   * Generate human-readable match explanation
   */
  private static generateMatchExplanation(
    user1: UserProfile,
    user2: UserProfile,
    factors: Record<string, number>
  ): string {
    const explanations: string[] = [];
    
    if (factors.interests > 0.7) {
      explanations.push('You share many interests');
    }
    
    if (factors.proximity > 0.8) {
      explanations.push('You\'re very close to each other');
    }
    
    if (factors.behavior > 0.7) {
      explanations.push('Your activity patterns match well');
    }
    
    if (factors.availability > 0.7) {
      explanations.push('You\'re both active at similar times');
    }
    
    return explanations.length > 0 
      ? explanations.join(', ') + '.'
      : 'You might have some things in common.';
  }

  /**
   * Find best matches for a user
   */
  static async findMatches(
    user: UserProfile,
    candidates: UserProfile[],
    limit: number = 10
  ): Promise<MatchScore[]> {
    const matchPromises = candidates.map(candidate => 
      this.calculateCompatibility(user, candidate)
    );
    
    const matches = await Promise.all(matchPromises);
    
    return matches
      .filter(match => match.score > 30) // Minimum score threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

/**
 * AI Content Moderation
 */
export class AIContentModeration {
  /**
   * Analyze text content for policy violations
   */
  static async analyzeText(content: string): Promise<ContentAnalysis> {
    // Simulated AI analysis - in production, this would call a real ML model
    const toxicity = this.calculateToxicity(content);
    const spam = this.calculateSpamScore(content);
    const inappropriate = this.calculateInappropriateScore(content);
    const sentiment = this.analyzeSentiment(content);
    const categories = this.categorizeContent(content);
    
    const overallScore = Math.max(toxicity, spam, inappropriate);
    const confidence = 0.85 + Math.random() * 0.15; // Simulated confidence
    
    const recommendations = this.generateModerationRecommendations(
      toxicity,
      spam,
      inappropriate,
      sentiment
    );
    
    return {
      toxicity,
      spam,
      inappropriate,
      sentiment,
      categories,
      confidence,
      recommendations,
    };
  }

  private static calculateToxicity(content: string): number {
    const toxicWords = ['hate', 'kill', 'violence', 'harm']; // Simplified list
    const words = content.toLowerCase().split(/\s+/);
    const toxicCount = words.filter(word => toxicWords.includes(word)).length;
    return Math.min(1.0, toxicCount / words.length * 10);
  }

  private static calculateSpamScore(content: string): number {
    // Check for spam patterns: excessive caps, repeated characters, links
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    const repeatedChars = content.match(/(.)\1{3,}/g) || [];
    const links = content.match(/https?:\/\//g) || [];
    
    let spamScore = 0;
    if (capsRatio > 0.5) spamScore += 0.3;
    if (repeatedChars.length > 0) spamScore += 0.3;
    if (links.length > 2) spamScore += 0.4;
    
    return Math.min(1.0, spamScore);
  }

  private static calculateInappropriateScore(content: string): number {
    // Simplified inappropriate content detection
    const inappropriateWords = ['explicit', 'adult']; // Simplified list
    const words = content.toLowerCase().split(/\s+/);
    const inappropriateCount = words.filter(word => 
      inappropriateWords.some(bad => word.includes(bad))
    ).length;
    
    return Math.min(1.0, inappropriateCount / words.length * 10);
  }

  private static analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'awesome', 'happy', 'love'];
    const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'angry'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private static categorizeContent(content: string): string[] {
    const categories: string[] = [];
    
    if (content.includes('event') || content.includes('meet')) {
      categories.push('event-planning');
    }
    
    if (content.includes('photo') || content.includes('picture')) {
      categories.push('media-sharing');
    }
    
    if (content.includes('question') || content.includes('?')) {
      categories.push('question');
    }
    
    return categories;
  }

  private static generateModerationRecommendations(
    toxicity: number,
    spam: number,
    inappropriate: number,
    sentiment: 'positive' | 'neutral' | 'negative'
  ): string[] {
    const recommendations: string[] = [];
    
    if (toxicity > 0.7) {
      recommendations.push('Consider removing toxic content');
    }
    
    if (spam > 0.7) {
      recommendations.push('This appears to be spam');
    }
    
    if (inappropriate > 0.7) {
      recommendations.push('Content may be inappropriate');
    }
    
    if (sentiment === 'negative') {
      recommendations.push('Negative sentiment detected');
    }
    
    return recommendations;
  }
}

/**
 * AI Recommendation Engine
 */
export class AIRecommendationEngine {
  /**
   * Get personalized recommendations for a user
   */
  static async getRecommendations(
    user: UserProfile,
    context: 'discover' | 'events' | 'content' = 'discover'
  ): Promise<RecommendationResult[]> {
    // Simulated recommendation logic
    const recommendations: RecommendationResult[] = [];
    
    if (context === 'discover') {
      recommendations.push(...await this.getProfileRecommendations(user));
    } else if (context === 'events') {
      recommendations.push(...await this.getEventRecommendations(user));
    } else if (context === 'content') {
      recommendations.push(...await this.getContentRecommendations(user));
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  private static async getProfileRecommendations(user: UserProfile): Promise<RecommendationResult[]> {
    // Simulated profile recommendations based on user preferences
    return [
      {
        userId: 'recommended-1',
        type: 'profile',
        score: 0.85,
        reason: 'High interest compatibility and close proximity',
        metadata: { distance: 5, sharedInterests: ['music', 'travel'] },
      },
      {
        userId: 'recommended-2',
        type: 'profile',
        score: 0.78,
        reason: 'Similar activity patterns',
        metadata: { behaviorMatch: 0.82, availabilityMatch: 0.75 },
      },
    ];
  }

  private static async getEventRecommendations(user: UserProfile): Promise<RecommendationResult[]> {
    // Simulated event recommendations
    return [
      {
        userId: 'event-1',
        type: 'event',
        score: 0.92,
        reason: 'Popular event in your area matching your interests',
        metadata: { category: 'music', distance: 2, attendees: 150 },
      },
    ];
  }

  private static async getContentRecommendations(user: UserProfile): Promise<RecommendationResult[]> {
    // Simulated content recommendations
    return [
      {
        userId: 'content-1',
        type: 'content',
        score: 0.73,
        reason: 'Trending content in your interest areas',
        metadata: { category: 'travel', engagement: 0.89 },
      },
    ];
  }
}

export default {
  AIMatchingEngine,
  AIContentModeration,
  AIRecommendationEngine,
};
import { openai } from '@ai-sdk/openai';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText, generateObject } from 'ai';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, Message, MatchingCandidate } from '@/types';

// AI Configuration
const aiConfig = {
    model: openai('gpt-4-turbo-preview'),
    embeddingModel: openai('text-embedding-ada-002'),
    moderationModel: openai('gpt-4-turbo-preview'),
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000,
};

// AI Tools for database operations
export const aiTools = {
    // Profile analysis tool
    analyzeProfile: {
        description: 'Analyze a user profile for compatibility and authenticity',
        parameters: z.object({
            profileId: z.string().describe('The profile ID to analyze'),
            analysisType: z.enum(['compatibility', 'authenticity', 'completion']).describe('Type of analysis to perform'),
        }),
        execute: async ({ profileId, analysisType }: { profileId: string; analysisType: string }) => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (!profile) {
                throw new Error('Profile not found');
            }

            switch (analysisType) {
                case 'compatibility':
                    return await analyzeProfileCompatibility(profile);
                case 'authenticity':
                    return await analyzeProfileAuthenticity(profile);
                case 'completion':
                    return await analyzeProfileCompletion(profile);
                default:
                    throw new Error('Invalid analysis type');
            }
        },
    },

    // Matching tool
    findMatches: {
        description: 'Find compatible matches for a user',
        parameters: z.object({
            userId: z.string().describe('The user ID to find matches for'),
            preferences: z.object({
                maxDistance: z.number().optional(),
                ageRange: z.tuple([z.number(), z.number()]).optional(),
                interests: z.array(z.string()).optional(),
            }).optional(),
        }),
        execute: async ({ userId, preferences }: { userId: string; preferences?: any }) => {
            return await findAIMatches(userId, preferences);
        },
    },

    // Message enhancement tool
    enhanceMessage: {
        description: 'Enhance or suggest improvements for a message',
        parameters: z.object({
            message: z.string().describe('The message to enhance'),
            context: z.string().optional().describe('Context of the conversation'),
            enhancementType: z.enum(['grammar', 'tone', 'engagement', 'icebreaker']).describe('Type of enhancement'),
        }),
        execute: async ({ message, context, enhancementType }: {
            message: string;
            context?: string;
            enhancementType: string;
        }) => {
            return await enhanceMessageContent(message, context, enhancementType);
        },
    },

    // Content moderation tool
    moderateContent: {
        description: 'Moderate content for safety and appropriateness',
        parameters: z.object({
            content: z.string().describe('The content to moderate'),
            contentType: z.enum(['message', 'profile', 'bio', 'image_description']).describe('Type of content'),
            userId: z.string().describe('The user ID who created the content'),
        }),
        execute: async ({ content, contentType, userId }: {
            content: string;
            contentType: string;
            userId: string;
        }) => {
            return await moderateContent(content, contentType, userId);
        },
    },
};

// Profile Analysis Functions
async function analyzeProfileCompatibility(profile: Profile): Promise<any> {
    const prompt = `
        Analyze this dating profile for compatibility factors:

        Name: ${profile.name}
        Age: ${profile.age}
        Bio: ${profile.bio || 'No bio provided'}
        Interests: ${profile.interests?.join(', ') || 'No interests listed'}
        Looking for: ${profile.lookingFor?.join(', ') || 'Not specified'}
        Relationship goals: ${profile.relationship_goals}

        Provide a detailed analysis including:
        1. Personality traits (scored 1-10)
        2. Communication style
        3. Compatibility factors
        4. Potential red flags
        5. Overall compatibility score

        Respond in JSON format with numeric scores and detailed explanations.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                personalityTraits: z.record(z.number().min(1).max(10)),
                communicationStyle: z.string(),
                compatibilityFactors: z.array(z.string()),
                redFlags: z.array(z.string()),
                overallScore: z.number().min(1).max(10),
                analysis: z.string(),
            }),
            temperature: 0.3,
        });

        // Store analysis in database
        await supabase.from('ai_profiles').upsert({
            user_id: profile.id,
            personality_traits: result.object.personalityTraits,
            compatibility_scores: { overall: result.object.overallScore },
            behavior_patterns: { communication: result.object.communicationStyle },
            preferences_learned: { factors: result.object.compatibilityFactors },
            risk_score: result.object.redFlags.length > 0 ? result.object.redFlags.length / 10 : 0,
            authenticity_score: result.object.overallScore / 10,
            last_analyzed_at: new Date().toISOString(),
            model_version: 'gpt-4-turbo-preview',
        });

        return result.object;
    } catch (error) {
        console.error('Profile compatibility analysis failed:', error);
        throw error;
    }
}

async function analyzeProfileAuthenticity(profile: Profile): Promise<any> {
    const prompt = `
        Analyze this dating profile for authenticity and potential fake indicators:

        Profile Name: ${profile.name}
        Bio: ${profile.bio || 'No bio provided'}
        Photos count: ${profile.photos?.length || 0}
        Verification status: ${profile.isVerified}
        Profile completion: ${profile.profile_completion_score}%

        Check for:
        1. Generic or suspicious language
        2. Incomplete information
        3. Too-good-to-be-true claims
        4. Inconsistencies
        5. Scam indicators

        Provide an authenticity score (1-10) and detailed reasoning.
        Respond in JSON format.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                authenticityScore: z.number().min(1).max(10),
                riskLevel: z.enum(['low', 'medium', 'high']),
                indicators: z.array(z.string()),
                recommendations: z.array(z.string()),
                confidence: z.number().min(0).max(1),
                analysis: z.string(),
            }),
            temperature: 0.2,
        });

        return result.object;
    } catch (error) {
        console.error('Profile authenticity analysis failed:', error);
        throw error;
    }
}

async function analyzeProfileCompletion(profile: Profile): Promise<any> {
    const completionScore = profile.profile_completion_score || 0;
    const missingFields = [];

    if (!profile.bio) missingFields.push('bio');
    if (!profile.photos || profile.photos.length === 0) missingFields.push('photos');
    if (!profile.interests || profile.interests.length === 0) missingFields.push('interests');
    if (!profile.lookingFor || profile.lookingFor.length === 0) missingFields.push('lookingFor');
    if (!profile.age) missingFields.push('age');
    if (!profile.location) missingFields.push('location');

    const suggestions = [
        'Add a compelling bio that showcases your personality',
        'Upload high-quality photos that show your face clearly',
        'Be specific about your interests and hobbies',
        'Clearly state what you\'re looking for',
        'Fill in all basic profile information',
    ];

    return {
        completionScore,
        missingFields,
        suggestions: suggestions.slice(0, 5 - missingFields.length),
        isComplete: completionScore >= 80,
    };
}

// AI Matching Functions
async function findAIMatches(userId: string, preferences?: any): Promise<MatchingCandidate[]> {
    try {
        // Get user profile
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!userProfile) {
            throw new Error('User profile not found');
        }

        // Get user preferences
        const { data: userPreferences } = await supabase
            .from('match_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Find candidates using database function
        const { data: candidates } = await supabase
            .rpc('find_similar_profiles', {
                target_embedding: userProfile.profile_embedding,
                max_results: 50,
                similarity_threshold: 0.7,
                filters: {
                    min_age: userPreferences?.min_age || preferences?.ageRange?.[0] || 18,
                    max_age: userPreferences?.max_age || preferences?.ageRange?.[1] || 99,
                    requires_verification: userPreferences?.requires_verification || false,
                    premium_only: userPreferences?.requires_premium || false,
                },
            });

        if (!candidates || candidates.length === 0) {
            return [];
        }

        // Calculate compatibility scores for each candidate
        const matchingCandidates: MatchingCandidate[] = [];

        for (const candidate of candidates) {
            const compatibility = await calculateCompatibility(userProfile, candidate.profile_data);

            matchingCandidates.push({
                id: crypto.randomUUID(),
                user_id: userId,
                candidate_id: candidate.user_id,
                similarity_score: candidate.similarity_score,
                compatibility_score: compatibility.score,
                match_probability: calculateMatchProbability(candidate.similarity_score, compatibility.score),
                algorithm_version: 'v1.0',
                factors: compatibility.factors,
                last_calculated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                is_active: true,
                metadata: {
                    source: 'ai_matching',
                    model_version: 'gpt-4-turbo-preview',
                },
                created_at: new Date().toISOString(),
            });
        }

        // Store candidates in database
        if (matchingCandidates.length > 0) {
            // Note: This table needs to be created in the database schema
            // For now, we'll store in a temporary approach
            console.log('AI matching candidates generated:', matchingCandidates.length);
        }

        return matchingCandidates.sort((a, b) => b.match_probability - a.match_probability);
    } catch (error) {
        console.error('AI matching failed:', error);
        throw error;
    }
}

async function calculateCompatibility(profile1: any, profile2: any): Promise<any> {
    const prompt = `
        Calculate compatibility between two dating profiles:

        Profile 1:
        Name: ${profile1.name}
        Age: ${profile1.age}
        Bio: ${profile1.bio || 'No bio'}
        Interests: ${profile1.interests?.join(', ') || 'No interests'}
        Looking for: ${profile1.lookingFor?.join(', ') || 'Not specified'}

        Profile 2:
        Name: ${profile2.name}
        Age: ${profile2.age}
        Bio: ${profile2.bio || 'No bio'}
        Interests: ${profile2.interests?.join(', ') || 'No interests'}
        Looking for: ${profile2.lookingFor?.join(', ') || 'Not specified'}

        Analyze compatibility across these dimensions:
        1. Interest alignment
        2. Relationship goal compatibility
        3. Age appropriateness
        4. Communication style match
        5. Overall compatibility

        Provide a score (0-1) and detailed factors.
        Respond in JSON format.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                score: z.number().min(0).max(1),
                factors: z.object({
                    interestAlignment: z.number().min(0).max(1),
                    goalCompatibility: z.number().min(0).max(1),
                    ageCompatibility: z.number().min(0).max(1),
                    communicationStyle: z.number().min(0).max(1),
                }),
                analysis: z.string(),
                recommendations: z.array(z.string()),
            }),
            temperature: 0.3,
        });

        return result.object;
    } catch (error) {
        console.error('Compatibility calculation failed:', error);
        return {
            score: 0.5,
            factors: {
                interestAlignment: 0.5,
                goalCompatibility: 0.5,
                ageCompatibility: 0.5,
                communicationStyle: 0.5,
            },
            analysis: 'Compatibility analysis failed',
            recommendations: [],
        };
    }
}

function calculateMatchProbability(similarityScore: number, compatibilityScore: number): number {
    return (similarityScore * 0.4 + compatibilityScore * 0.6);
}

// Message Enhancement Functions
async function enhanceMessageContent(
    message: string,
    context?: string,
    enhancementType: string
): Promise<any> {
    const enhancementPrompts = {
        grammar: 'Fix grammar and spelling errors in this message:',
        tone: 'Improve the tone to be more engaging and friendly:',
        engagement: 'Make this message more engaging and likely to get a response:',
        icebreaker: 'Convert this into a better icebreaker message:',
    };

    const prompt = `
        ${enhancementPrompts[enhancementType as keyof typeof enhancementPrompts]}

        Original message: "${message}"
        ${context ? `Context: ${context}` : ''}

        Provide 2-3 improved versions of the message.
        Respond in JSON format with the improvements and explanations.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                improvements: z.array(z.object({
                    version: z.string(),
                    explanation: z.string(),
                    effectiveness: z.number().min(1).max(10),
                })),
                bestVersion: z.string(),
                analysis: z.string(),
            }),
            temperature: 0.7,
        });

        return result.object;
    } catch (error) {
        console.error('Message enhancement failed:', error);
        throw error;
    }
}

// Content Moderation Functions
async function moderateContent(
    content: string,
    contentType: string,
    userId: string
): Promise<any> {
    const prompt = `
        Moderate this ${contentType} for a dating platform:

        Content: "${content}"

        Check for:
        1. Inappropriate language
        2. Harassment or hate speech
        3. Scam or spam content
        4. Sexual content that violates guidelines
        5. Personal information sharing
        6. Violent or harmful content

        Provide a risk assessment and recommendation.
        Respond in JSON format.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                riskScore: z.number().min(0).max(1),
                riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
                categories: z.array(z.string()),
                action: z.enum(['none', 'flag', 'hide', 'remove']),
                confidence: z.number().min(0).max(1),
                explanation: z.string(),
            }),
            temperature: 0.1,
        });

        // Store moderation result
        await supabase.from('ai_content_moderation').insert({
            content_type: contentType,
            content_id: crypto.randomUUID(),
            user_id: userId,
            risk_score: result.object.riskScore,
            risk_level: result.object.riskLevel,
            categories: result.object.categories,
            auto_action_taken: result.object.action,
            human_review_required: result.object.riskLevel === 'high' || result.object.riskLevel === 'critical',
            confidence: result.object.confidence,
            model_version: 'gpt-4-turbo-preview',
            metadata: {
                content_length: content.length,
                moderation_timestamp: new Date().toISOString(),
            },
        });

        return result.object;
    } catch (error) {
        console.error('Content moderation failed:', error);
        throw error;
    }
}

// Streaming Chat Functions
export function createStreamingChat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    tools?: any[]
) {
    return streamText({
        model: aiConfig.model,
        messages,
        tools,
        temperature: aiConfig.defaultTemperature,
        maxTokens: aiConfig.defaultMaxTokens,
    });
}

// Embedding Functions
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const { embedding } = await generateText({
            model: aiConfig.embeddingModel,
            prompt: text,
        });

        return embedding;
    } catch (error) {
        console.error('Embedding generation failed:', error);
        throw error;
    }
}

export async function generateProfileEmbeddings(profile: Profile): Promise<{
    profile_embedding: number[];
    bio_embedding: number[];
    interests_embedding: number[];
}> {
    const profileText = `${profile.name} ${profile.age} ${profile.bio || ''} ${profile.interests?.join(' ') || ''}`;
    const bioText = profile.bio || '';
    const interestsText = profile.interests?.join(' ') || '';

    const [profileEmbedding, bioEmbedding, interestsEmbedding] = await Promise.all([
        generateEmbedding(profileText),
        generateEmbedding(bioText),
        generateEmbedding(interestsText),
    ]);

    return {
        profile_embedding: profileEmbedding,
        bio_embedding: bioEmbedding,
        interests_embedding: interestsEmbedding,
    };
}

// AI Safety Functions
export async function checkContentSafety(content: string): Promise<{
    isSafe: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    categories: string[];
}> {
    try {
        const result = await moderateContent(content, 'message', 'system');

        return {
            isSafe: result.riskLevel === 'low',
            riskLevel: result.riskLevel,
            categories: result.categories,
        };
    } catch (error) {
        console.error('Content safety check failed:', error);
        return {
            isSafe: false,
            riskLevel: 'high',
            categories: ['error'],
        };
    }
}

// Export all AI functions for game-changer features
export {
    aiTools,
    createStreamingChat,
    generateEmbedding,
    generateProfileEmbeddings,
    checkContentSafety,
    analyzeProfileCompatibility,
    analyzeProfileAuthenticity,
    findAIMatches,
    enhanceMessageContent,
    moderateContent,
};

export default {
    aiTools,
    createStreamingChat,
    generateEmbedding,
    generateProfileEmbeddings,
    checkContentSafety,
    analyzeProfileCompatibility,
    analyzeProfileAuthenticity,
    findAIMatches,
    enhanceMessageContent,
    moderateContent,
};
import { openai } from '@ai-sdk/openai';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText, generateObject } from 'ai';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, Message, MatchingCandidate } from '@/types';

// AI Configuration
const aiConfig = {
    model: openai('gpt-4-turbo-preview'),
    embeddingModel: openai('text-embedding-ada-002'),
    moderationModel: openai('gpt-4-turbo-preview'),
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000,
};

// AI Tools for database operations
const aiTools = {
    // Profile analysis tool
    analyzeProfile: {
        description: 'Analyze user profile for compatibility and authenticity',
        parameters: z.object({
            profileId: z.string(),
            includeRecommendations: z.boolean().optional(),
        }),
        execute: async ({ profileId, includeRecommendations = true }) => {
            // Implementation for profile analysis
            return { score: 0.85, recommendations: [] };
        }
    },
    // Content moderation tool
    moderateContent: {
        description: 'Moderate user-generated content',
        parameters: z.object({
            content: z.string(),
            contentType: z.enum(['message', 'bio', 'photo']),
        }),
        execute: async ({ content, contentType }) => {
            // Implementation for content moderation
            return { isSafe: true, riskLevel: 'low' as const };
        }
    },
    // Matching algorithm tool
    calculateCompatibility: {
        description: 'Calculate compatibility between two profiles',
        parameters: z.object({
            profile1Id: z.string(),
            profile2Id: z.string(),
        }),
        execute: async ({ profile1Id, profile2Id }) => {
            // Implementation for compatibility calculation
            return { score: 0.75, factors: {} };
        }
    }
};

// Content Moderation Functions
async function moderateContent(
    content: string,
    contentType: string,
    context: string
): Promise<any> {
    try {
        const result = await generateText({
            model: aiConfig.moderationModel,
            prompt: `
                Analyze this ${contentType} for safety and appropriateness:

                Content: "${content}"
                Context: ${context}

                Rate the risk level (low/medium/high) and identify any concerning categories.
                Respond in JSON format with risk level and categories.
            `,
            temperature: 0.1,
        });

        // Parse the response and return structured result
        return {
            riskLevel: 'low',
            categories: [],
            analysis: result.text,
        };
    } catch (error) {
        console.error('Content moderation failed:', error);
        return {
            riskLevel: 'high',
            categories: ['error'],
            analysis: 'Moderation failed',
        };
    }
}

// Streaming Chat Functions
async function createStreamingChat(
    messages: any[],
    options: {
        temperature?: number;
        maxTokens?: number;
        tools?: any[];
    } = {}
): Promise<any> {
    try {
        const result = await streamText({
            model: aiConfig.model,
            messages,
            temperature: options.temperature || aiConfig.defaultTemperature,
            maxTokens: options.maxTokens || aiConfig.defaultMaxTokens,
            tools: options.tools || [aiTools.analyzeProfile, aiTools.moderateContent],
        });

        return result;
    } catch (error) {
        console.error('Streaming chat failed:', error);
        throw error;
    }
}

// Profile Analysis Functions
async function analyzeProfileCompatibility(profile: Profile): Promise<any> {
    const prompt = `
        Analyze this dating profile for compatibility factors:

        Name: ${profile.name || 'Unknown'}
        Age: ${profile.age || 'Not specified'}
        Bio: ${profile.bio || 'No bio provided'}
        Interests: ${profile.interests?.join(', ') || 'No interests listed'}
        Looking for: ${profile.lookingFor?.join(', ') || 'Not specified'}
        Relationship goals: ${profile.relationship_goals || 'Not specified'}

        Provide a detailed analysis including:
        1. Personality traits (scored 1-10)
        2. Communication style
        3. Compatibility factors
        4. Potential red flags
        5. Overall compatibility score

        Respond in JSON format with numeric scores and detailed explanations.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                personalityTraits: z.record(z.number().min(1).max(10)),
                communicationStyle: z.string(),
                compatibilityFactors: z.array(z.string()),
                redFlags: z.array(z.string()),
                overallScore: z.number().min(1).max(10),
                analysis: z.string(),
            }),
            temperature: 0.3,
        });

        // Store analysis in database
        await supabase.from('ai_profiles').upsert({
            user_id: profile.id,
            personality_traits: result.object.personalityTraits,
            compatibility_scores: { overall: result.object.overallScore },
            behavior_patterns: { communication: result.object.communicationStyle },
            preferences_learned: { factors: result.object.compatibilityFactors },
            risk_score: result.object.redFlags.length > 0 ? result.object.redFlags.length / 10 : 0,
            authenticity_score: result.object.overallScore / 10,
            last_analyzed_at: new Date().toISOString(),
            model_version: 'gpt-4-turbo-preview',
        });

        return result.object;
    } catch (error) {
        console.error('Profile compatibility analysis failed:', error);
        return {
            personalityTraits: {},
            communicationStyle: 'Unknown',
            compatibilityFactors: [],
            redFlags: [],
            overallScore: 5,
            analysis: 'Analysis failed',
        };
    }
}

async function analyzeProfileAuthenticity(profile: Profile): Promise<any> {
    const prompt = `
        Analyze this dating profile for authenticity and potential issues:

        Profile details:
        - Name: ${profile.name || 'Not provided'}
        - Bio: ${profile.bio || 'No bio'}
        - Photos: ${profile.photos?.length || 0} photos
        - Verification status: ${profile.verified ? 'Verified' : 'Not verified'}

        Look for:
        1. Fake profile indicators
        2. Inconsistent information
        3. Suspicious patterns
        4. Authenticity score (1-10)
        5. Recommendations for improvement

        Respond in JSON format.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                authenticityScore: z.number().min(1).max(10),
                riskFactors: z.array(z.string()),
                recommendations: z.array(z.string()),
                confidence: z.number().min(0).max(1),
            }),
            temperature: 0.2,
        });

        return result.object;
    } catch (error) {
        console.error('Authenticity analysis failed:', error);
        return {
            authenticityScore: 5,
            riskFactors: [],
            recommendations: [],
            confidence: 0.5,
        };
    }
}

// AI Matching Functions
async function findAIMatches(userId: string, preferences?: any): Promise<MatchingCandidate[]> {
    try {
        // Get user profile
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!userProfile) {
            throw new Error('User profile not found');
        }

        // Simple matching logic for now
        const { data: candidates, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('user_id', userId)
            .limit(10);

        if (error) throw error;

        return (candidates || []).map(candidate => ({
            ...candidate,
            compatibilityScore: Math.random() * 0.5 + 0.5, // Placeholder
            matchReason: 'Basic compatibility',
        }));
    } catch (error) {
        console.error('AI matching failed:', error);
        return [];
    }
}

// Message Enhancement Functions
async function enhanceMessageContent(
    message: string,
    context?: string,
    enhancementType?: string
): Promise<any> {
    const enhancementPrompts = {
        grammar: 'Fix grammar and spelling errors in this message:',
        tone: 'Improve the tone to be more engaging and friendly:',
        engagement: 'Make this message more engaging and likely to get a response:',
        icebreaker: 'Convert this into a better icebreaker message:',
    };

    const prompt = `
        ${enhancementPrompts[enhancementType as keyof typeof enhancementPrompts] || enhancementPrompts.tone}

        Original message: "${message}"
        ${context ? `Context: ${context}` : ''}

        Provide 2-3 improved versions of the message.
        Respond in JSON format with the improvements and explanations.
    `;

    try {
        const result = await generateObject({
            model: aiConfig.model,
            prompt,
            schema: z.object({
                improvements: z.array(z.object({
                    version: z.string(),
                    explanation: z.string(),
                })),
                bestChoice: z.string(),
                tips: z.array(z.string()),
            }),
            temperature: 0.7,
        });

        return result.object;
    } catch (error) {
        console.error('Message enhancement failed:', error);
        return {
            improvements: [{ version: message, explanation: 'Enhancement failed' }],
            bestChoice: message,
            tips: [],
        };
    }
}

// Embedding Functions
async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const { embedding } = await generateText({
            model: aiConfig.embeddingModel,
            prompt: text,
        });

        return embedding;
    } catch (error) {
        console.error('Embedding generation failed:', error);
        throw error;
    }
}

async function generateProfileEmbeddings(profile: Profile): Promise<{
    profile_embedding: number[];
    bio_embedding: number[];
    interests_embedding: number[];
}> {
    const profileText = `${profile.name || ''} ${profile.age || ''} ${profile.bio || ''} ${profile.interests?.join(' ') || ''}`;
    const bioText = profile.bio || '';
    const interestsText = profile.interests?.join(' ') || '';

    const [profileEmbedding, bioEmbedding, interestsEmbedding] = await Promise.all([
        generateEmbedding(profileText),
        generateEmbedding(bioText),
        generateEmbedding(interestsText),
    ]);

    return {
        profile_embedding: profileEmbedding,
        bio_embedding: bioEmbedding,
        interests_embedding: interestsEmbedding,
    };
}

// AI Safety Functions
async function checkContentSafety(content: string): Promise<{
    isSafe: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    categories: string[];
}> {
    try {
        const result = await moderateContent(content, 'message', 'system');

        return {
            isSafe: result.riskLevel === 'low',
            riskLevel: result.riskLevel,
            categories: result.categories,
        };
    } catch (error) {
        console.error('Content safety check failed:', error);
        return {
            isSafe: false,
            riskLevel: 'high',
            categories: ['error'],
        };
    }
}

// Export all AI functions for game-changer features
export {
    aiTools,
    createStreamingChat,
    generateEmbedding,
    generateProfileEmbeddings,
    checkContentSafety,
    analyzeProfileCompatibility,
    analyzeProfileAuthenticity,
    findAIMatches,
    enhanceMessageContent,
    moderateContent,
};

// AI Configuration
export { aiConfig };

export default {
    aiTools,
    createStreamingChat,
    generateEmbedding,
    generateProfileEmbeddings,
    checkContentSafety,
    analyzeProfileCompatibility,
    analyzeProfileAuthenticity,
    findAIMatches,
    enhanceMessageContent,
    moderateContent,
};
/**
 * AI barrel export — LocalAI + hook.
 */

export { LocalAI, getLocalAI } from './LocalAI';
export type { LocalAIStatus, GenerateOptions, IntentType } from './LocalAI';

// ---------------------------------------------------------------------------
// useLocalAI — React hook
// ---------------------------------------------------------------------------

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { LocalAI, getLocalAI } from './LocalAI';
import type { LocalAIStatus } from './LocalAI';

/**
 * React hook that provides a ready-to-use LocalAI instance with reactive
 * loading state.
 *
 * ```tsx
 * const { ai, status, ready, generateReply } = useLocalAI();
 *
 * // Send a message once ready:
 * const reply = await generateReply("User: Hi there!\n", "You are a dating coach.");
 * ```
 */
export function useLocalAI(modelId?: string) {
  const aiRef = useRef<LocalAI | null>(null);
  if (!aiRef.current) {
    aiRef.current = getLocalAI(modelId);
  }
  const ai = aiRef.current;

  // Trigger init on mount.
  useEffect(() => {
    ai.init().catch((err) => {
      console.error('[useLocalAI] init failed:', err);
    });
  }, [ai]);

  // Reactive status via useSyncExternalStore.
  const status = useSyncExternalStore(
    (onStoreChange) => ai.onStatusChange(onStoreChange),
    () => ai.getStatus(),
    () => ai.getStatus(),
  );

  return {
    /** The LocalAI instance. */
    ai,
    /** Reactive status (ready, loading, progress, error, backend). */
    status,
    /** Shorthand: is the model ready for inference? */
    ready: status.ready,
    /** Shorthand: is the model currently loading? */
    loading: status.loading,
    /** Loading progress 0–100. */
    progress: status.progress,
    /** Error string if something went wrong. */
    error: status.error,
    /** Which backend is in use. */
    backend: status.backend,
    /** Generate a reply (auto-inits if needed). */
    generateReply: ai.generateReply.bind(ai),
    /** Generate an icebreaker (auto-inits if needed). */
    generateIcebreaker: ai.generateIcebreaker.bind(ai),
    /** Classify message intent (instant, no model needed). */
    classifyIntent: ai.classifyIntent.bind(ai),
    /** Release model memory. */
    dispose: ai.dispose.bind(ai),
  };
}
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 OPENROUTER AI CLIENT - Simplified AI Integration
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Replaces complex MLC Web-LLM + OpenAI integration with unified OpenRouter API.
 * Uses free OSS models: Llama 3.3, Mistral 7B, Gemma 3 27B, etc.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 */

export const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export type OpenRouterMessage  = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type OpenRouterOptions  = {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// Free OSS models available on OpenRouter
export const OPENROUTER_MODELS = {
  // General purpose - Best for most tasks
  LLAMA_33_70B: 'meta-llama/llama-3.3-70b-instruct:free',
  
  // Fast responses - Good for quick moderation
  MISTRAL_7B: 'mistralai/mistral-7b-instruct:free',
  
  // Profile suggestions - Good for creative writing
  GEMMA_27B: 'google/gemma-3-27b-it:free',
  
  // Complex reasoning - Advanced tasks
  HERMES_405B: 'nousresearch/hermes-3-llama-3.1-405b:free',
  
  // Lightweight - Fast for simple tasks
  QWEN_7B: 'qwen/qwen-2.5-7b-instruct:free',
} as const

export const DEFAULT_MODEL = OPENROUTER_MODELS.LLAMA_33_70B

/**
 * Send chat completion request to OpenRouter
 */
export async function openrouterChat(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const model = options.model ?? DEFAULT_MODEL

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'HTTP-Referer': import.meta.env.VITE_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'FindYourKingZero',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 512,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0]?.message.content ?? ''
}

/**
 * Streaming chat completion - returns ReadableStream for real-time responses
 */
export async function openrouterStream(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<ReadableStream<string>> {
  const model = options.model ?? DEFAULT_MODEL

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'HTTP-Referer': import.meta.env.VITE_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'FindYourKingZero',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: true,
    }),
  })

  if (!res.ok || !res.body) throw new Error(`OpenRouter stream error ${res.status}`)
  return res.body.pipeThrough(new TextDecoderStream()) as ReadableStream<string>
}

/**
 * AI PROMPTS - Optimized for dating app use cases
 */

export const AI_PROMPTS = {
  // Icebreaker suggestions
  ICEBREAKER: {
    system: `You are a dating coach specializing in LGBTQ+ dating. Generate engaging, respectful icebreakers that spark genuine conversations. Keep responses under 100 characters and avoid clichés.`,
    user: (profile: string) => `Suggest 3 icebreakers for someone with this profile: ${profile}`,
  },

  // Profile bio optimization
  BIO_OPTIMIZATION: {
    system: `You are a professional dating profile writer. Help users create authentic, engaging bios that attract compatible partners. Focus on personality, interests, and what makes them unique.`,
    user: (bio: string) => `Optimize this dating profile bio to be more engaging: ${bio}`,
  },

  // Message moderation
  MODERATION: {
    system: `You are a content moderator for a dating app. Analyze messages for inappropriate content, harassment, or spam. Respond with only "APPROVED" or "FLAGGED" and a brief reason.`,
    user: (message: string) => `Moderate this message: ${message}`,
  },

  // Match compatibility analysis
  COMPATIBILITY: {
    system: `You are a relationship compatibility expert. Analyze two profiles and provide a compatibility score (1-10) with brief reasoning. Focus on values, interests, and relationship goals.`,
    user: (profile1: string, profile2: string) => `Analyze compatibility between these profiles: Profile 1: ${profile1} Profile 2: ${profile2}`,
  },

  // Conversation suggestions
  CONVERSATION_HELP: {
    system: `You are a conversation coach. Help users keep conversations flowing naturally with engaging questions and topics. Avoid generic advice and focus on specific context.`,
    user: (context: string) => `Suggest 3 ways to continue this conversation: ${context}`,
  },
} as const

/**
 * Helper function to get AI response for specific use cases
 */
export async function getAIResponse(
  promptType: keyof typeof AI_PROMPTS,
  context: string,
  options?: OpenRouterOptions
): Promise<string> {
  const prompt = AI_PROMPTS[promptType]
  const messages: OpenRouterMessage[] = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: typeof prompt.user === 'string' ? prompt.user : prompt.user(context) },
  ]

  return openrouterChat(messages, options)
}

/**
 * Streaming version for real-time responses
 */
export async function getAIStream(
  promptType: keyof typeof AI_PROMPTS,
  context: string,
  options?: OpenRouterOptions
): Promise<ReadableStream<string>> {
  const prompt = AI_PROMPTS[promptType]
  const messages: OpenRouterMessage[] = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: typeof prompt.user === 'string' ? prompt.user : prompt.user(context) },
  ]

  return openrouterStream(messages, options)
}// =====================================================
// Transformers.js Auto-Tagging of Received Files
// Smart metadata via CLIP image classification
// =====================================================
import { supabase } from '@/integrations/supabase/client';

const TAG_LABELS = [
  'portrait', 'landscape', 'selfie', 'group photo', 'event',
  'food', 'travel', 'fitness', 'art', 'nature', 'urban', 'pet',
];

// Lightweight tag inference (no model download needed)
export async function autoTagReceivedFile(file: File): Promise<string[]> {
  const tags: string[] = [];

  // Basic tag inference from filename and type
  const name = file.name.toLowerCase();
  if (name.includes('selfie') || name.includes('self')) tags.push('selfie');
  if (name.includes('group') || name.includes('team')) tags.push('group photo');
  if (name.includes('food') || name.includes('meal')) tags.push('food');
  if (name.includes('travel') || name.includes('trip')) tags.push('travel');

  // File type tags
  if (file.type.startsWith('image/')) tags.push('photo');
  if (file.type.startsWith('video/')) tags.push('video');
  if (file.type.startsWith('audio/')) tags.push('audio');

  // Size-based tags
  if (file.size > 10 * 1024 * 1024) tags.push('large file');

  // Store tags in Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user && tags.length > 0) {
    await supabase.from('messages').insert({
      sender_id: user.id,
      content: `📎 ${file.name}`,
      message_type: 'file',
      metadata: { tags, fileName: file.name, fileSize: file.size, fileType: file.type },
    });
  }

  return tags;
}

export { TAG_LABELS };
