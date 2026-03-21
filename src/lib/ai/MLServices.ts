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
