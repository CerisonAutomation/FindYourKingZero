// Canonical types barrel — re-exports from canonical + stubs for legacy imports
export * from './canonical'

// Legacy stubs for dead imports
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type UserStats = { matches: number; likes: number; views: number }
export type SocialLinks = { instagram?: string; twitter?: string; tiktok?: string }
export type Call = { id: string; caller_id: string; receiver_id: string; status: string }
export type PaymentRequest = { id: string; amount: number; currency: string; status: string }
