# 🎯 Supabase AI Prompts Collection

This document contains a curated collection of production-ready prompts for building AI-powered features with Supabase and the Find Your King tech stack.

## 🤖 AI Agent System Prompts

### Master System Prompt
```
You are an expert full-stack AI engineer building enterprise-grade applications with React, Supabase, and AI technologies. You specialize in dating platforms with real-time features, AI-powered matching, and enterprise security.

Your core responsibilities:
1. Build production-ready code following enterprise patterns
2. Implement secure, privacy-first features with proper RLS
3. Create AI-powered experiences with real-time capabilities
4. Ensure scalability, performance, and accessibility
5. Follow security best practices and GDPR compliance

Always reference the official documentation in AGENTS.md and follow the architectural patterns defined in ARCHITECTURE.md.
```

### Database Design Agent
```
You are a database architecture expert specializing in PostgreSQL and Supabase. Your role is to design scalable, secure database schemas for dating platforms.

Key expertise:
- PostgreSQL 15+ with advanced features
- Row Level Security (RLS) policy design
- Vector database design with pgvector
- Real-time subscription optimization
- Performance indexing strategies
- GDPR-compliant data modeling

Always design schemas with:
- Proper RLS policies on all tables
- Efficient indexing for performance
- Vector columns for AI features
- Audit trails for sensitive operations
- Privacy-by-design principles
```

### Frontend Architecture Agent
```
You are a React and TypeScript expert specializing in enterprise dating platforms. Your role is to build scalable, maintainable frontend architectures.

Key expertise:
- React 18+ with concurrent features
- TypeScript strict mode and advanced typing
- TailwindCSS with shadcn/ui design systems
- Real-time UI patterns with Supabase
- Component architecture and state management
- Performance optimization and code splitting

Always build components with:
- TypeScript strict compliance
- Accessibility (WCAG 2.1 AA)
- Responsive design patterns
- Error boundary integration
- Performance optimization
```

### AI Integration Agent
```
You are an AI integration expert specializing in Vercel AI SDK and OpenAI technologies. Your role is to implement AI-powered features for dating platforms.

Key expertise:
- Vercel AI SDK with streaming and tools
- OpenAI GPT-4+ integration
- Vector embeddings and semantic search
- Prompt engineering and system design
- Real-time AI interactions
- AI safety and content moderation

Always implement AI features with:
- Proper tool design and JSON schemas
- Streaming responses for better UX
- Content safety and moderation
- Context management and memory
- Performance optimization
```

## 🔧 Feature-Specific Prompts

### User Profile Management
```
Design and implement a comprehensive user profile system for a dating platform with the following requirements:

Core Features:
- Profile creation with multiple photos and verification
- Privacy controls and visibility settings
- AI-powered profile optimization suggestions
- Interest tags and personality traits
- Location-based discovery with privacy controls

Technical Requirements:
- Use Supabase for data storage with RLS policies
- Implement photo upload with compression and moderation
- Add vector embeddings for AI matching compatibility
- Create real-time profile updates
- Ensure GDPR compliance with data deletion

Security Considerations:
- Row Level Security for profile access
- Photo ID verification system
- Content moderation for inappropriate content
- Privacy-preserving location handling
- Audit logging for profile changes

Please implement the complete profile management system following the architectural patterns in ARCHITECTURE.md and security policies in SECURITY.md.
```

### AI-Powered Matching Algorithm
```
Implement an AI-powered matching system for a dating platform with advanced compatibility scoring:

Matching Features:
- Multi-dimensional compatibility scoring
- Behavioral pattern analysis
- Interest and value alignment detection
- Communication style matching
- AI-powered compatibility insights

Technical Implementation:
- Use pgvector for profile embeddings
- Implement real-time matching updates
- Create matching explanation system
- Add learning algorithm for user feedback
- Optimize for performance with caching

Algorithm Components:
- Personality trait analysis (Big Five, MBTI)
- Interest compatibility scoring
- Communication style matching
- Life goal alignment detection
- Physical preference learning

Data Privacy:
- User consent for AI analysis
- Explainable AI decisions
- Data minimization for matching
- Secure embedding storage
- Right to opt-out of AI features

Build the complete matching system with proper RLS policies, performance optimization, and user privacy protections.
```

### Real-Time Messaging System
```
Build a comprehensive real-time messaging system for a dating platform with advanced features:

Core Messaging Features:
- Real-time message delivery and read receipts
- Rich media support (photos, videos, voice notes)
- Message reactions and threading
- AI-powered conversation suggestions
- Content moderation and safety filters

Technical Architecture:
- Supabase Realtime for live updates
- Message encryption and privacy
- Message history and search
- Offline message queue
- Push notification integration

AI Integration:
- Smart reply suggestions
- Conversation starters
- Ice breaker recommendations
- Tone analysis and feedback
- Relationship progress insights

Security & Privacy:
- End-to-end encryption for sensitive messages
- Content moderation for inappropriate content
- Report and block functionality
- Message retention policies
- GDPR compliance with message deletion

Implement the complete messaging system with real-time capabilities, AI features, and enterprise-grade security.
```

### Event Management System
```
Create an enterprise-grade event management system for dating platform events and meetups:

Event Features:
- Event creation and management tools
- RSVP system with waitlists
- Ticket sales and payment integration
- Event discovery and recommendations
- AI-powered event matching

Technical Implementation:
- Supabase for event data storage
- Real-time event updates and notifications
- Geographic-based event discovery
- Event analytics and insights
- Integration with calendar systems

AI-Powered Features:
- Personalized event recommendations
- Event compatibility matching
- Attendance prediction
- Event success optimization
- Networking suggestions

Revenue Features:
- Tiered ticket pricing
- Promotional code system
- Host payout management
- Revenue analytics dashboard
- Financial reporting and compliance

Build the complete event management system with proper monetization, AI features, and scalability considerations.
```

## 🛡️ Security & Privacy Prompts

### GDPR Compliance Implementation
```
Implement comprehensive GDPR compliance for a dating platform with the following requirements:

Data Protection:
- Consent management for all data processing
- Right to access and data portability
- Right to rectification and erasure
- Data processing transparency
- Data protection impact assessments

Technical Implementation:
- Data anonymization and pseudonymization
- Secure data deletion workflows
- Audit logging for compliance
- Cookie consent management
- Privacy policy integration

User Rights:
- Data export functionality
- Account deletion with data removal
- Consent withdrawal mechanisms
- Processing activity logs
- Privacy dashboard

Security Measures:
- Encryption at rest and in transit
- Access control and authentication
- Regular security assessments
- Data breach notification system
- Employee access controls

Implement the complete GDPR compliance framework following the security policies in SECURITY.md.
```

### Content Moderation System
```
Build an AI-powered content moderation system for a dating platform with enterprise-grade safety:

Moderation Features:
- AI-powered text and image moderation
- Real-time content scanning
- User reporting and review system
- Automated warning and suspension system
- Appeal process and human review

AI Implementation:
- OpenAI moderation API integration
- Custom content classification models
- Context-aware moderation decisions
- Multi-language support
- Cultural sensitivity considerations

Technical Architecture:
- Real-time content scanning pipeline
- Moderation queue and workflow management
- Automated decision-making with human oversight
- Moderation analytics and insights
- Integration with user management

Safety Features:
- Progressive discipline system
- Educational content for users
- Community guidelines enforcement
- Emergency response procedures
- Law enforcement cooperation

Implement the complete content moderation system with AI automation, human oversight, and comprehensive safety measures.
```

## 🚀 Performance & Scalability Prompts

### Database Optimization
```
Optimize the Supabase database for enterprise-scale dating platform performance:

Performance Requirements:
- Support 1M+ concurrent users
- Sub-second query response times
- Real-time feature performance
- Efficient vector search operations
- Geographic query optimization

Optimization Strategies:
- Advanced indexing strategies
- Query optimization and caching
- Connection pooling management
- Read replica configuration
- Partitioning for large tables

Vector Search Optimization:
- HNSW index tuning
- Embedding dimension optimization
- Query performance monitoring
- Caching strategies for vector queries
- Batch processing for embeddings

Monitoring & Analytics:
- Query performance monitoring
- Resource usage tracking
- Slow query analysis
- Performance regression testing
- Capacity planning

Implement comprehensive database optimization with performance monitoring and scalability planning.
```

### Real-Time System Architecture
```
Design and implement a scalable real-time architecture for the dating platform:

Real-Time Requirements:
- Live messaging with 100K+ concurrent connections
- Real-time presence and online status
- Live event updates and notifications
- Real-time matching notifications
- Live activity feeds

Technical Architecture:
- Supabase Realtime optimization
- Connection management and pooling
- Message queuing and delivery
- Offline support and sync
- Push notification integration

Scalability Considerations:
- Horizontal scaling for real-time servers
- Database connection optimization
- Message routing and load balancing
- Geographic distribution
- Performance monitoring

Reliability Features:
- Connection resilience and recovery
- Message delivery guarantees
- Backup and failover systems
- Performance monitoring
- Error handling and logging

Implement the complete real-time architecture with enterprise-grade scalability and reliability.
```

## 📊 Analytics & Insights Prompts

### User Behavior Analytics
```
Build comprehensive user behavior analytics for the dating platform with AI-powered insights:

Analytics Features:
- User engagement tracking
- Conversion funnel analysis
- Retention and churn analysis
- Feature usage analytics
- A/B testing framework

AI-Powered Insights:
- User behavior pattern detection
- Churn prediction models
- Personalization recommendations
- Performance optimization suggestions
- Market trend analysis

Technical Implementation:
- Event tracking and data collection
- Real-time analytics dashboard
- Data visualization and reporting
- Machine learning model integration
- Privacy-compliant analytics

Business Intelligence:
- Revenue analytics and forecasting
- User acquisition analysis
- Market segmentation insights
- Competitive analysis tools
- Strategic planning support

Implement the complete analytics system with AI insights, real-time dashboards, and business intelligence capabilities.
```

### Matching Algorithm Analytics
```
Create advanced analytics for the AI-powered matching system with continuous improvement:

Matching Analytics:
- Algorithm performance metrics
- Success rate tracking
- User satisfaction measurements
- Match quality analysis
- Bias detection and mitigation

AI Model Monitoring:
- Model performance tracking
- Drift detection and alerts
- A/B testing for algorithm improvements
- Feature importance analysis
- Model retraining workflows

User Insights:
- Matching preference analysis
- Behavior pattern recognition
- Compatibility factor importance
- Feedback loop integration
- Personalization effectiveness

Technical Implementation:
- Real-time metrics collection
- Analytics dashboard development
- Machine learning pipeline monitoring
- Data visualization tools
- Automated reporting systems

Build comprehensive matching analytics with AI model monitoring, user insights, and continuous improvement capabilities.
```

## 🎨 UI/UX Design Prompts

### Mobile-First Design System
```
Create a comprehensive mobile-first design system for the dating platform with enterprise-grade UX:

Design Principles:
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA compliance)
- Intuitive user experience
- Consistent visual language
- Performance-optimized interactions

Component Library:
- Design tokens and theme system
- Reusable component patterns
- Animation and interaction guidelines
- Typography and spacing systems
- Icon and imagery guidelines

User Experience:
- Onboarding and user education
- Error handling and recovery
- Loading states and feedback
- Empty states and guidance
- Progressive disclosure

Technical Implementation:
- TailwindCSS with custom design tokens
- shadcn/ui component integration
- Responsive design patterns
- Performance optimization
- Accessibility implementation

Design the complete design system with comprehensive component library, accessibility features, and mobile-first approach.
```

### AI-Powered User Experience
```
Design AI-enhanced user experiences for the dating platform with intelligent interactions:

AI UX Features:
- Smart onboarding and personalization
- AI-powered content suggestions
- Intelligent search and discovery
- Conversational AI assistants
- Predictive user interface

Experience Design:
- Adaptive interfaces based on user behavior
- Contextual AI recommendations
- Progressive AI feature introduction
- Transparent AI decision-making
- User control over AI features

Technical Implementation:
- Real-time AI response handling
- Smooth AI interaction flows
- Error handling for AI failures
- Performance optimization for AI features
- User feedback integration

Ethical Considerations:
- Explainable AI decisions
- User consent for AI features
- Bias detection and mitigation
- Privacy-preserving AI interactions
- Human oversight and control

Design comprehensive AI-powered user experiences with intelligent interactions, ethical considerations, and seamless integration.
```

This collection of prompts provides a comprehensive foundation for building AI-powered features with Supabase and the Find Your King tech stack. Each prompt is designed to guide AI agents in implementing production-ready features with proper security, performance, and user experience considerations.