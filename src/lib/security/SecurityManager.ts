/**
 * Security Utilities
 * Content moderation and safety features
 */

export type SecurityConfig  = {
  contentModeration: {
    enabled: boolean
    profanityFilter: boolean
    imageModeration: boolean
    autoBlock: boolean
  }
  privacy: {
    dataEncryption: boolean
    anonymizeData: boolean
    gdprCompliant: boolean
  }
  safety: {
    verifyProfiles: boolean
    backgroundChecks: boolean
    reportSystem: boolean
  }
}

class SecurityManager {
  private config: SecurityConfig

  constructor(config: SecurityConfig) {
    this.config = config
  }

  // Content moderation
  async moderateContent(content: string): Promise<{
    isAppropriate: boolean
    violations: string[]
    confidence: number
  }> {
    if (!this.config.contentModeration.enabled) {
      return { isAppropriate: true, violations: [], confidence: 1.0 }
    }

    // Basic profanity filter
    const profanityList = ['spam', 'inappropriate', 'offensive']
    const violations = profanityList.filter(word => 
      content.toLowerCase().includes(word)
    )

    return {
      isAppropriate: violations.length === 0,
      violations,
      confidence: violations.length === 0 ? 1.0 : 0.5
    }
  }

  // Image safety check
  async moderateImage(imageData: string): Promise<{
    isSafe: boolean
    confidence: number
    issues: string[]
  }> {
    if (!this.config.contentModeration.imageModeration) {
      return { isSafe: true, confidence: 1.0, issues: [] }
    }

    // In production, this would use a real image moderation service
    // For now, return safe by default
    return { isSafe: true, confidence: 0.8, issues: [] }
  }

  // Profile verification
  async verifyProfile(profileData: {
    photos: string[]
    bio: string
    age: number
  }): Promise<{
    isVerified: boolean
    score: number
    issues: string[]
  }> {
    const issues: string[] = []

    // Check photo quality
    if (profileData.photos.length === 0) {
      issues.push('No photos provided')
    }

    // Check bio content
    const bioModeration = await this.moderateContent(profileData.bio)
    if (!bioModeration.isAppropriate) {
      issues.push('Inappropriate bio content')
    }

    // Check age validity
    if (profileData.age < 18 || profileData.age > 100) {
      issues.push('Invalid age')
    }

    return {
      isVerified: issues.length === 0,
      score: Math.max(0, 100 - (issues.length * 25)),
      issues
    }
  }

  // Data encryption utilities
  encryptSensitiveData(data: string): string {
    if (!this.config.privacy.dataEncryption) {
      return data
    }

    // Basic encoding - in production use proper encryption
    return btoa(data)
  }

  decryptSensitiveData(encryptedData: string): string {
    if (!this.config.privacy.dataEncryption) {
      return encryptedData
    }

    // Basic decoding - in production use proper decryption
    return atob(encryptedData)
  }

  // Report handling
  async handleReport(reportData: {
    reporterId: string
    reportedUserId: string
    reason: string
    description: string
  }): Promise<{
    submitted: boolean
    reportId: string
    priority: 'low' | 'medium' | 'high'
  }> {
    // Determine priority based on reason
    const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
      'spam': 'low',
      'fake_profile': 'medium',
      'harassment': 'high',
      'inappropriate_content': 'medium'
    }

    const priority = priorityMap[reportData.reason] || 'medium'
    const reportId = `report_${Date.now()}_${reportData.reporterId}`

    // In production, save to database
    console.log('Report submitted:', { reportId, priority, ...reportData })

    return {
      submitted: true,
      reportId,
      priority
    }
  }
}

// Default security configuration
const defaultConfig: SecurityConfig = {
  contentModeration: {
    enabled: true,
    profanityFilter: true,
    imageModeration: true,
    autoBlock: false
  },
  privacy: {
    dataEncryption: true,
    anonymizeData: true,
    gdprCompliant: true
  },
  safety: {
    verifyProfiles: true,
    backgroundChecks: false,
    reportSystem: true
  }
}

export const securityManager = new SecurityManager(defaultConfig)

export function createSecurityManager(config: Partial<SecurityConfig>): SecurityManager {
  return new SecurityManager({ ...defaultConfig, ...config })
}