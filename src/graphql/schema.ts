// =====================================================
// ENTERPRISE GRAPHQL SCHEMA - COMPLETE API DEFINITION
// =====================================================
// Senior-level GraphQL API with full type safety

import {gql} from 'graphql-tag';

export const typeDefs = gql`
  # =====================================================
  # SCALAR TYPES
  # =====================================================
  scalar Geography
  scalar JSON
  scalar Upload
  scalar DateTime
  
  # =====================================================
  # ENUM TYPES
  # =====================================================
  enum MediaType {
    IMAGE
    VIDEO
    AUDIO
    FILE
    GIF
    STICKER
  }
  
  enum MessageType {
    TEXT
    IMAGE
    VIDEO
    AUDIO
    FILE
    PIX
    CALL
    LOCATION
    REACTION
    TYPING
  }
  
  enum VerificationStatus {
    PENDING
    APPROVED
    REJECTED
    EXPIRED
  }
  
  enum ReportStatus {
    PENDING
    REVIEWING
    RESOLVED
    DISMISSED
  }
  
  enum SubscriptionTier {
    FREE
    PREMIUM
    VIP
    ENTERPRISE
  }
  
  enum PrivacyLevel {
    PUBLIC
    FRIENDS
    PRIVATE
    STEALTH
  }
  
  enum RelationshipType {
    CASUAL
    DATING
    RELATIONSHIP
    FRIENDSHIP
    NETWORKING
  }
  
  enum PresenceStatus {
    ONLINE
    AWAY
    BUSY
    INVISIBLE
    OFFLINE
  }
  
  enum MatchStatus {
    PENDING
    MUTUAL
    EXPIRED
    BLOCKED
  }
  
  enum UserRole {
    USER
    MODERATOR
    ADMIN
    SUPER_ADMIN
  }
  
  enum NotificationType {
    MATCH
    MESSAGE
    LIKE
    VIEW
    SAFETY
    BILLING
    MARKETING
    SYSTEM
  }
  
  # =====================================================
  # INPUT TYPES
  # =====================================================
  
  input ProfileInput {
    displayName: String!
    bio: String
    age: Int
    height: Float
    weight: Float
    location: GeographyInput
    interests: [String!]
    tribes: [String!]
    lookingFor: [String!]
    bodyType: String
    ethnicity: String
    languages: [String!]
    education: String
    occupation: String
    incomeRange: String
    lifestyle: String
    relationshipGoals: RelationshipType
    hivStatus: String
    prepStatus: String
    lastTestDate: DateTime
    vaccinationStatus: String
    preferredPosition: [String!]
    kinks: [String!]
    limits: [String!]
    safeSexOnly: Boolean
    partyFriendly: Boolean
    cannabisFriendly: Boolean
    poppersFriendly: Boolean
    chemsexFriendly: Boolean
  }
  
  input MatchPreferencesInput {
    minAge: Int!
    maxAge: Int!
    maxDistanceKm: Int!
    relationshipTypes: [RelationshipType!]
    bodyTypes: [String!]
    ethnicities: [String!]
    positions: [String!]
    kinks: [String!]
    hivStatusPreference: String
    requiresVerification: Boolean
    requiresPremium: Boolean
    autoMatchEnabled: Boolean
    aiLearningEnabled: Boolean
  }
  
  input PrivacySettingsInput {
    profileVisibility: PrivacyLevel!
    locationVisibility: PrivacyLevel!
    lastSeenVisibility: PrivacyLevel!
    onlineStatusVisibility: PrivacyLevel!
    galleryVisibility: PrivacyLevel!
    allowStrangerMessages: Boolean!
    allowFriendRequests: Boolean!
    allowTagging: Boolean!
    allowScreenshots: Boolean!
    autoDeleteMessages: Boolean!
    messageRetentionDays: Int!
    blurStrangerPhotos: Boolean!
    hideAge: Boolean!
    hideDistance: Boolean!
    dataCollectionOptOut: Boolean!
    aiTrainingOptOut: Boolean!
    analyticsOptOut: Boolean!
    marketingOptOut: Boolean!
    searchOptOut: Boolean!
    blockedCountries: [String!]
    timeRestrictionStart: String
    timeRestrictionEnd: String
    doNotDisturb: Boolean!
  }
  
  input MediaItemInput {
    url: String!
    thumbnailUrl: String
    blurHash: String
    type: MediaType!
    fileSize: Int
    width: Int
    height: Int
    duration: Float
    caption: String
    tags: [String!]
    isPrivate: Boolean!
    isEphemeral: Boolean!
    expiresAt: DateTime
    contentRating: String!
  }
  
  input MessageInput {
    content: String!
    messageType: MessageType!
    mediaUrl: String
    replyToId: ID
    priority: String
    encryptionKey: String
    metadata: JSON
  }
  
  input ReportInput {
    reason: String!
    category: String!
    severity: String!
    description: String
    evidenceUrls: [String!]
    evidenceData: JSON
  }
  
  input VerificationRequestInput {
    type: String!
    priority: String
    evidenceUrls: [String!]
    notes: String
  }
  
  input NearbyUsersFilter {
    minAge: Int
    maxAge: Int
    maxDistanceMeters: Float
    requiresVerification: Boolean
    premiumOnly: Boolean
    relationshipTypes: [RelationshipType!]
    bodyTypes: [String!]
    ethnicities: [String!]
    positions: [String!]
    kinks: [String!]
  }
  
  input GeographyInput {
    lat: Float!
    lng: Float!
  }
  
  # =====================================================
  # CORE TYPES
  # =====================================================
  
  type User {
    id: ID!
    email: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    role: UserRole!
    isEmailVerified: Boolean!
    isPhoneVerified: Boolean!
    profile: Profile!
    subscription: Subscription!
    privacySettings: PrivacySettings!
    presence: Presence!
    metrics: UserMetrics!
  }
  
  type Profile {
    id: ID!
    userId: ID!
    displayName: String!
    bio: String
    avatarUrl: String
    age: Int
    height: Float
    weight: Float
    location: Geography
    locationAccuracy: Float!
    locationUpdatedAt: DateTime!
    isPremium: Boolean!
    verificationStatus: VerificationStatus!
    verificationScore: Int!
    isVerified: Boolean!
    travelModeActive: Boolean!
    travelModeLat: Float
    travelModeLng: Float
    travelModeDestination: String
    lastOnlineAt: DateTime!
    statusText: String
    isActive: Boolean!
    isBanned: Boolean!
    banReason: String
    banExpiresAt: DateTime
    profileCompletionScore: Int!
    aiEnhancedBio: String
    voiceBioUrl: String
    zodiacSign: String
    bodyType: String
    ethnicity: String
    languages: [String!]
    education: String
    occupation: String
    incomeRange: String
    lifestyle: String
    relationshipGoals: RelationshipType
    hivStatus: String
    prepStatus: String
    lastTestDate: DateTime
    vaccinationStatus: String
    preferredPosition: [String!]
    kinks: [String!]
    limits: [String!]
    safeSexOnly: Boolean!
    partyFriendly: Boolean!
    cannabisFriendly: Boolean!
    poppersFriendly: Boolean!
    chemsexFriendly: Boolean!
    interests: [String!]
    tribes: [String!]
    lookingFor: [String!]
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Computed fields
    distance: Float
    matchScore: Float
    compatibilityScore: Float
    aiMatchReason: String
    isOnline: Boolean!
    lastSeen: DateTime!
    viewsCount: Int!
    favoritesCount: Int!
    rating: Float
    
    # Relations
    mediaItems: [MediaItem!]!
    galleries: [MediaGallery!]!
    matches: [Match!]!
    conversations: [Conversation!]!
    notifications: [Notification!]!
    aiProfile: AIProfile!
  }
  
  type MediaGallery {
    id: ID!
    userId: ID!
    name: String!
    description: String
    isPrivate: Boolean!
    isPremiumOnly: Boolean!
    allowComments: Boolean!
    allowReactions: Boolean!
    autoDeleteAfter: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: User!
    mediaItems: [MediaItem!]!
  }
  
  type MediaItem {
    id: ID!
    galleryId: ID
    userId: ID!
    url: String!
    thumbnailUrl: String
    blurHash: String
    type: MediaType!
    fileSize: Int
    width: Int
    height: Int
    duration: Float
    caption: String
    tags: [String!]
    isPrivate: Boolean!
    isEphemeral: Boolean!
    expiresAt: DateTime
    viewCount: Int!
    likeCount: Int!
    metadata: JSON!
    aiTags: [String!]
    contentRating: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: User!
    gallery: MediaGallery
    reactions: [MessageReaction!]!
  }
  
  type Match {
    id: ID!
    userOne: ID!
    userTwo: ID!
    status: MatchStatus!
    matchScore: Float!
    compatibilityScore: Float!
    aiMatchReason: String
    matchAlgorithm: String!
    initiatedBy: ID
    expiresAt: DateTime
    lastInteractionAt: DateTime
    interactionCount: Int!
    metadata: JSON!
    matchedAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    userOneProfile: Profile!
    userTwoProfile: Profile!
    messages: [Message!]!
  }
  
  type Conversation {
    id: ID!
    participantOne: ID!
    participantTwo: ID!
    lastMessageAt: DateTime
    createdAt: DateTime!
    
    # Relations
    participantOneProfile: Profile!
    participantTwoProfile: Profile!
    messages: [Message!]!
    lastMessage: Message
  }
  
  type Message {
    id: ID!
    conversationId: ID!
    senderId: ID!
    content: String!
    messageType: MessageType!
    mediaUrl: String
    isRead: Boolean!
    readAt: DateTime
    reactions: JSON!
    isEdited: Boolean!
    isUnsent: Boolean!
    isDeleted: Boolean!
    deletedAt: DateTime
    expiresAt: DateTime
    deliveryStatus: String!
    replyToId: ID
    forwardCount: Int!
    priority: String!
    encryptionKey: String
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    sender: Profile!
    conversation: Conversation!
    replyTo: Message
    reactions: [MessageReaction!]!
  }
  
  type MessageReaction {
    id: ID!
    messageId: ID!
    userId: ID!
    emoji: String!
    createdAt: DateTime!
    
    # Relations
    user: Profile!
    message: Message!
  }
  
  type Notification {
    id: ID!
    userId: ID!
    title: String!
    body: String
    type: NotificationType!
    priority: String!
    readAt: DateTime
    isPushSent: Boolean!
    pushSentAt: DateTime
    isEmailSent: Boolean!
    emailSentAt: DateTime
    expiresAt: DateTime
    actionUrl: String
    actionText: String
    category: String!
    data: JSON!
    metadata: JSON!
    createdAt: DateTime!
    
    # Relations
    user: User!
  }
  
  type P2PRoom {
    id: ID!
    name: String
    description: String
    type: String!
    creatorId: ID!
    isPrivate: Boolean!
    isEncrypted: Boolean!
    maxParticipants: Int!
    requiresApproval: Boolean!
    autoDeleteAfter: DateTime
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    creator: Profile!
    participants: [P2PRoomParticipant!]!
  }
  
  type P2PRoomParticipant {
    id: ID!
    roomId: ID!
    userId: ID!
    role: String!
    joinedAt: DateTime!
    leftAt: DateTime
    isMuted: Boolean!
    isBanned: Boolean!
    lastReadAt: DateTime
    typingStatus: Boolean!
    typingSince: DateTime
    metadata: JSON!
    
    # Relations
    room: P2PRoom!
    user: Profile!
  }
  
  type MatchPreferences {
    id: ID!
    userId: ID!
    minAge: Int!
    maxAge: Int!
    maxDistanceKm: Int!
    relationshipTypes: [RelationshipType!]
    bodyTypes: [String!]
    ethnicities: [String!]
    positions: [String!]
    kinks: [String!]
    hivStatusPreference: String
    requiresVerification: Boolean!
    requiresPremium: Boolean!
    autoMatchEnabled: Boolean!
    aiLearningEnabled: Boolean!
    lastCalculatedAt: DateTime
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: User!
  }
  
  type VerificationRequest {
    id: ID!
    userId: ID!
    type: String!
    status: VerificationStatus!
    priority: String!
    assignedTo: ID
    submittedAt: DateTime!
    reviewedAt: DateTime
    approvedAt: DateTime
    rejectedAt: DateTime
    expiresAt: DateTime
    score: Int!
    notes: String
    rejectionReason: String
    evidenceUrls: [String!]
    metadata: JSON!
    aiConfidence: Float
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: Profile!
    assignedToProfile: Profile
    documents: [VerificationDocument!]!
  }
  
  type VerificationDocument {
    id: ID!
    requestId: ID!
    type: String!
    url: String!
    thumbnailUrl: String
    fileSize: Int
    checksum: String
    aiAnalysis: JSON!
    aiConfidence: Float
    humanReviewRequired: Boolean!
    reviewedBy: ID
    reviewNotes: String
    uploadedAt: DateTime!
    deletedAt: DateTime
    
    # Relations
    request: VerificationRequest!
    reviewedByProfile: Profile
  }
  
  type Report {
    id: ID!
    reporterId: ID!
    reportedId: ID!
    reason: String!
    category: String!
    severity: String!
    description: String
    evidenceUrls: [String!]
    evidenceData: JSON!
    status: ReportStatus!
    priority: String!
    assignedTo: ID
    autoActionTaken: String
    humanActionRequired: Boolean!
    resolvedAt: DateTime
    resolutionNotes: String
    appealStatus: String
    appealReason: String
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    reporter: Profile!
    reported: Profile!
    assignedToProfile: Profile
    moderationActions: [ModerationAction!]!
  }
  
  type ModerationAction {
    id: ID!
    userId: ID!
    moderatorId: ID!
    action: String!
    reason: String!
    duration: String
    expiresAt: DateTime
    isPermanent: Boolean!
    evidenceReportId: ID
    notes: String
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: Profile!
    moderator: Profile!
    evidenceReport: Report
  }
  
  type PrivacySettings {
    userId: ID!
    profileVisibility: PrivacyLevel!
    locationVisibility: PrivacyLevel!
    lastSeenVisibility: PrivacyLevel!
    onlineStatusVisibility: PrivacyLevel!
    galleryVisibility: PrivacyLevel!
    allowStrangerMessages: Boolean!
    allowFriendRequests: Boolean!
    allowTagging: Boolean!
    allowScreenshots: Boolean!
    autoDeleteMessages: Boolean!
    messageRetentionDays: Int!
    blurStrangerPhotos: Boolean!
    hideAge: Boolean!
    hideDistance: Boolean!
    dataCollectionOptOut: Boolean!
    aiTrainingOptOut: Boolean!
    analyticsOptOut: Boolean!
    marketingOptOut: Boolean!
    searchOptOut: Boolean!
    blockedCountries: [String!]
    timeRestrictionStart: String
    timeRestrictionEnd: String
    doNotDisturb: Boolean!
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: User!
  }
  
  type Presence {
    userId: ID!
    status: PresenceStatus!
    lastSeenAt: DateTime!
    currentLocation: Geography
    locationAccuracy: Float!
    locationUpdatedAt: DateTime!
    deviceInfo: JSON!
    appVersion: String
    networkType: String
    batteryLevel: Int
    isActive: Boolean!
    sessionCount: Int!
    totalSessionTime: String!
    metadata: JSON!
    updatedAt: DateTime!
    
    # Relations
    user: User!
  }
  
  type ActivityLog {
    id: ID!
    userId: ID!
    action: String!
    targetType: String
    targetId: ID
    ipAddress: String
    userAgent: String
    location: Geography
    metadata: JSON!
    createdAt: DateTime!
    
    # Relations
    user: Profile!
  }
  
  type Subscription {
    id: ID!
    userId: ID!
    tier: SubscriptionTier!
    stripeCustomerId: String
    stripeSubscriptionId: String
    stripePriceId: String
    status: String!
    currentPeriodStart: DateTime
    currentPeriodEnd: DateTime
    trialEnd: DateTime
    cancelAtPeriodEnd: Boolean!
    canceledAt: DateTime
    paymentMethod: String
    billingCycle: String!
    autoRenew: Boolean!
    gracePeriodEndsAt: DateTime
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: User!
    features: [SubscriptionFeature!]!
  }
  
  type SubscriptionFeature {
    id: ID!
    tier: SubscriptionTier!
    featureName: String!
    featureValue: String
    isEnabled: Boolean!
    limitValue: Int
    createdAt: DateTime!
  }
  
  type NotificationPreferences {
    userId: ID!
    pushEnabled: Boolean!
    emailEnabled: Boolean!
    inAppEnabled: Boolean!
    quietHoursEnabled: Boolean!
    quietHoursStart: String!
    quietHoursEnd: String!
    messageNotifications: Boolean!
    matchNotifications: Boolean!
    likeNotifications: Boolean!
    viewNotifications: Boolean!
    profileVisitNotifications: Boolean!
    safetyNotifications: Boolean!
    billingNotifications: Boolean!
    marketingNotifications: Boolean!
    doNotDisturb: Boolean!
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: User!
  }
  
  type AIProfile {
    id: ID!
    userId: ID!
    personalityTraits: JSON!
    compatibilityScores: JSON!
    behaviorPatterns: JSON!
    preferencesLearned: JSON!
    riskScore: Float!
    authenticityScore: Float!
    engagementPrediction: Float!
    lastAnalyzedAt: DateTime
    modelVersion: String
    trainingDataCount: Int!
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    user: User!
  }
  
  type AIContentModeration {
    id: ID!
    contentType: String!
    contentId: ID!
    userId: ID!
    riskScore: Float!
    riskLevel: String!
    categories: [String!]
    autoActionTaken: String
    humanReviewRequired: Boolean!
    reviewedBy: ID
    reviewedAt: DateTime
    finalAction: String
    modelVersion: String
    confidence: Float!
    metadata: JSON!
    createdAt: DateTime!
    
    # Relations
    user: Profile!
    reviewedByProfile: Profile
  }
  
  type AnalyticsEvent {
    id: ID!
    userId: ID
    sessionId: ID
    eventType: String!
    eventName: String!
    properties: JSON!
    timestamp: DateTime!
    ipAddress: String
    userAgent: String
    location: Geography
    appVersion: String
    deviceInfo: JSON!
    
    # Relations
    user: Profile
  }
  
  type UserMetrics {
    userId: ID!
    totalViews: Int!
    totalLikes: Int!
    totalMatches: Int!
    totalMessagesSent: Int!
    totalMessagesReceived: Int!
    totalProfileViews: Int!
    totalTimeSpent: String!
    averageSessionDuration: String!
    swipeRightCount: Int!
    swipeLeftCount: Int!
    matchRate: Float!
    responseRate: Float!
    premiumConversionDate: DateTime
    lastActiveDate: DateTime
    retentionDays: Int!
    churnProbability: Float!
    lifetimeValue: Float!
    calculatedAt: DateTime!
    metadata: JSON!
    
    # Relations
    user: User!
  }
  
  # =====================================================
  # QUERY TYPES
  # =====================================================
  
  type Query {
    # User queries
    me: User!
    user(id: ID!): User
    users(limit: Int = 50, offset: Int = 0, filter: String): [User!]!
    
    # Profile queries
    profile(userId: ID!): Profile
    profiles(limit: Int = 50, offset: Int = 0, filter: NearbyUsersFilter): [Profile!]!
    nearbyUsers(lat: Float!, lng: Float!, maxDistanceMeters: Float = 50000, limit: Int = 50, filters: NearbyUsersFilter): [Profile!]!
    
    # Matching queries
    matches(limit: Int = 50, offset: Int = 0, status: MatchStatus): [Match!]!
    match(id: ID!): Match
    matchSuggestions(limit: Int = 10): [Profile!]!
    
    # Conversation queries
    conversations(limit: Int = 50, offset: Int = 0): [Conversation!]!
    conversation(id: ID!): Conversation
    messages(conversationId: ID!, limit: Int = 50, offset: Int = 0): [Message!]!
    
    # Media queries
    mediaGalleries(userId: ID!, limit: Int = 50, offset: Int = 0): [MediaGallery!]!
    mediaItems(galleryId: ID, userId: ID, limit: Int = 50, offset: Int = 0): [MediaItem!]!
    mediaItem(id: ID!): MediaItem
    
    # Notification queries
    notifications(limit: Int = 50, offset: Int = 0, unreadOnly: Boolean = false): [Notification!]!
    notification(id: ID!): Notification
    
    # P2P queries
    p2pRooms(limit: Int = 50, offset: Int = 0): [P2PRoom!]!
    p2pRoom(id: ID!): P2PRoom
    
    # Verification queries
    verificationRequests(limit: Int = 50, offset: Int = 0): [VerificationRequest!]!
    verificationRequest(id: ID!): VerificationRequest
    
    # Safety queries
    reports(limit: Int = 50, offset: Int = 0, status: ReportStatus): [Report!]!
    report(id: ID!): Report
    
    # Subscription queries
    subscriptionFeatures(tier: SubscriptionTier!): [SubscriptionFeature!]!
    
    # Analytics queries
    userMetrics(userId: ID!): UserMetrics
    analyticsEvents(userId: ID, limit: Int = 100, offset: Int = 0): [AnalyticsEvent!]!
    
    # Search queries
    searchProfiles(query: String!, limit: Int = 20, offset: Int = 0): [Profile!]!
    searchMedia(query: String!, limit: Int = 20, offset: Int = 0): [MediaItem!]!
    
    # Admin queries
    adminUsers(limit: Int = 100, offset: Int = 0, filter: String): [User!]!
    adminReports(limit: Int = 100, offset: Int = 0, status: ReportStatus): [Report!]!
    adminAnalytics(startDate: DateTime!, endDate: DateTime!): JSON!
  }
  
  # =====================================================
  # MUTATION TYPES
  # =====================================================
  
  type Mutation {
    # Profile mutations
    updateProfile(input: ProfileInput!): Profile!
    updatePrivacySettings(input: PrivacySettingsInput!): PrivacySettings!
    updateMatchPreferences(input: MatchPreferencesInput!): MatchPreferences!
    deleteProfile(reason: String): Boolean!
    
    # Media mutations
    uploadMedia(file: Upload!, input: MediaItemInput!): MediaItem!
    createMediaGallery(name: String!, description: String): MediaGallery!
    updateMediaGallery(id: ID!, name: String, description: String): MediaGallery!
    deleteMediaGallery(id: ID!): Boolean!
    deleteMediaItem(id: ID!): Boolean!
    
    # Matching mutations
    createMatch(userId: ID!): Match!
    updateMatch(id: ID!, status: MatchStatus!): Match!
    deleteMatch(id: ID!): Boolean!
    
    # Conversation mutations
    createConversation(participantTwoId: ID!): Conversation!
    sendMessage(conversationId: ID!, input: MessageInput!): Message!
    updateMessage(id: ID!, content: String!): Message!
    deleteMessage(id: ID!): Boolean!
    markMessageAsRead(id: ID!): Message!
    addMessageReaction(messageId: ID!, emoji: String!): MessageReaction!
    removeMessageReaction(messageId: ID!, emoji: String!): Boolean!
    
    # P2P mutations
    createP2PRoom(name: String, description: String, type: String!): P2PRoom!
    joinP2PRoom(roomId: ID!): P2PRoomParticipant!
    leaveP2PRoom(roomId: ID!): Boolean!
    updateP2PRoomParticipant(roomId: ID!, role: String): P2PRoomParticipant!
    
    # Notification mutations
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Int!
    deleteNotification(id: ID!): Boolean!
    
    # Verification mutations
    createVerificationRequest(input: VerificationRequestInput!): VerificationRequest!
    uploadVerificationDocument(requestId: ID!, file: Upload!, type: String!): VerificationDocument!
    updateVerificationRequest(id: ID!, status: VerificationStatus!): VerificationRequest!
    
    # Safety mutations
    createReport(input: ReportInput!): Report!
    updateReport(id: ID!, status: ReportStatus!, resolutionNotes: String): Report!
    createModerationAction(userId: ID!, action: String!, reason: String!, duration: String): ModerationAction!
    
    # Subscription mutations
    createSubscription(tier: SubscriptionTier!, paymentMethodId: String!): Subscription!
    updateSubscription(id: ID!, tier: SubscriptionTier): Subscription!
    cancelSubscription(id: ID!): Subscription!
    
    # Presence mutations
    updatePresence(status: PresenceStatus!, location: GeographyInput): Presence!
    updateTypingStatus(conversationId: ID!, isTyping: Boolean!): Boolean!
    
    # Admin mutations
    updateUserRole(userId: ID!, role: UserRole!): User!
    banUser(userId: ID!, reason: String!, duration: String): ModerationAction!
    unbanUser(userId: ID!): Boolean!
    approveVerificationRequest(id: ID!): VerificationRequest!
    rejectVerificationRequest(id: ID!, reason: String!): VerificationRequest!
    
    # Analytics mutations
    trackEvent(eventType: String!, eventName: String!, properties: JSON!): AnalyticsEvent!
    updateUserMetrics: UserMetrics!
  }
  
  # =====================================================
  # SUBSCRIPTION TYPES
  # =====================================================
  
  type Subscription {
    # Real-time subscriptions
    userUpdated(userId: ID!): User!
    profileUpdated(userId: ID!): Profile!
    presenceUpdated(userId: ID!): Presence!
    
    # Matching subscriptions
    newMatch: Match!
    matchUpdated(matchId: ID!): Match!
    
    # Message subscriptions
    newMessage(conversationId: ID!): Message!
    messageUpdated(messageId: ID!): Message!
    typingStatus(conversationId: ID!): Profile!
    
    # Notification subscriptions
    newNotification(userId: ID!): Notification!
    
    # P2P subscriptions
    p2pRoomUpdated(roomId: ID!): P2PRoom!
    p2pRoomParticipantUpdated(roomId: ID!): P2PRoomParticipant!
    
    # Admin subscriptions
    newReport: Report!
    newVerificationRequest: VerificationRequest!
    
    # Analytics subscriptions
    userMetricsUpdated(userId: ID!): UserMetrics!
  }
`;
