# ARCHITECTURE.md

## 🏛️ High-Level Architecture

This document describes the enterprise architecture of the Find Your King dating platform, a React + Supabase application with AI-powered features and real-time capabilities.

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   AI Services   │
│   (React/Vite)  │◄──►│   (PostgreSQL)   │◄──►│   (OpenAI)      │
│                 │    │                 │    │                 │
│ - UI Components │    │ - Auth & RLS     │    │ - GPT-4 Chat     │
│ - State Mgmt    │    │ - Real-time     │    │ - Embeddings    │
│ - Routing       │    │ - Vector Store   │    │ - AI Tools      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development    │    │   Infrastructure│    │   MCP Layer     │
│   Environment    │    │   (Docker/K8s)   │    │   (Tools)       │
│                 │    │                 │    │                 │
│ - Mock Auth     │    │ - Containers    │    │ - DB Access     │
│ - Hot Reload    │    │ - Load Balancer  │    │ - File Storage  │
│ - Dev Tools     │    │ - Monitoring    │    │ - API Wrappers  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Directory Structure

### Root Level Structure
```
/
├── public/                 # Static assets
├── src/                   # Source code
├── supabase/             # Database and edge functions
├── tests/                # Test suites
├── docs/                 # Documentation
├── .github/              # CI/CD workflows
├── docker-compose.yml    # Container orchestration
└── package.json          # Dependencies and scripts
```

### Frontend Architecture (`src/`)

#### Core Application Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── forms/           # Form components with validation
│   ├── layout/          # Layout components (header, sidebar)
│   └── common/          # Common business components
├── features/            # Feature-specific modules
│   ├── auth/            # Authentication flows
│   │   ├── pages/       # Auth pages (login, register)
│   │   ├── components/  # Auth-specific components
│   │   └── hooks/        # Auth hooks
│   ├── profiles/        # User profile management
│   │   ├── pages/       # Profile pages
│   │   ├── components/  # Profile components
│   │   └── hooks/        # Profile hooks
│   ├── chat/            # Real-time messaging
│   │   ├── components/  # Chat components
│   │   ├── hooks/        # Chat hooks
│   │   └── services/     # Chat services
│   ├── matching/        # AI-powered matching
│   │   ├── components/  # Matching components
│   │   ├── hooks/        # Matching hooks
│   │   └── services/     # Matching algorithms
│   └── events/          # Event management
│       ├── pages/       # Event pages
│       ├── components/  # Event components
│       └── hooks/        # Event hooks
├── hooks/               # Global custom hooks
├── lib/                 # Shared utilities
├── integrations/        # External service integrations
├── types/               # TypeScript type definitions
└── pages/               # Route components
```

#### Component Architecture Patterns

**Component Hierarchy**
```
App
├── AppLayout
│   ├── Header
│   ├── Sidebar
│   └── Main
│       └── Page Components
├── AuthLayout
│   └── Auth Pages
└── ErrorBoundary
```

**Component Categories**

1. **UI Components** (`src/components/ui/`)
   - Base components from shadcn/ui
   - Design system tokens and themes
   - Reusable UI primitives

2. **Business Components** (`src/components/common/`)
   - Domain-specific components
   - Complex UI with business logic
   - Reusable across features

3. **Feature Components** (`src/features/*/components/`)
   - Feature-specific implementations
   - Encapsulated feature logic
   - Single responsibility per feature

### Data Layer Architecture

#### Supabase Integration (`src/integrations/supabase/`)
```
supabase/
├── client.ts            # Browser client configuration
├── server.ts            # Server-side client configuration
├── types.ts             # Generated TypeScript types
├── auth.ts              # Authentication utilities
├── realtime.ts          # Real-time subscription setup
└── queries/             # Pre-built database queries
    ├── profiles.ts
    ├── messages.ts
    ├── events.ts
    └── matching.ts
```

#### Database Schema (`supabase/migrations/`)
```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_profiles_enhancement.sql
├── 003_messaging_system.sql
├── 004_events_system.sql
├── 005_ai_matching.sql
├── 006_vector_embeddings.sql
└── complete_dating_platform_schema.sql
```

#### Row Level Security (RLS)
- All tables have RLS policies enabled
- User-scoped data access
- Role-based permissions
- Audit logging for sensitive operations

### AI & Machine Learning Architecture

#### AI Services (`src/lib/ai/`)
```
src/lib/ai/
├── client.ts             # AI SDK configuration
├── tools/                # MCP tool implementations
│   ├── database.ts       # Database query tools
│   ├── profiles.ts       # Profile analysis tools
│   ├── matching.ts       # Matching algorithm tools
│   └── moderation.ts     # Content moderation tools
├── agents/               # AI agent definitions
│   ├── matchmaking.ts    # AI matchmaking agent
│   ├── content.ts        # Content generation agent
│   └── moderation.ts     # Safety moderation agent
├── prompts/              # System prompts and templates
│   ├── system.ts         # Base system prompts
│   ├── matchmaking.ts    # Matching-specific prompts
│   └── moderation.ts     # Moderation prompts
└── embeddings/           # Vector embedding utilities
    ├── profile.ts        # Profile embedding generation
    ├── content.ts        # Content embedding generation
    └── search.ts         # Semantic search utilities
```

#### Vector Architecture
```
Vector Store (Supabase pgvector)
├── profile_embeddings    # User profile vectors
├── content_embeddings    # Content vectors
├── message_embeddings    # Message context vectors
└── event_embeddings      # Event description vectors
```

### Real-time Architecture

#### WebSocket Integration (`src/lib/realtime/`)
```
src/lib/realtime/
├── client.ts             # Realtime client setup
├── subscriptions/        # Real-time subscriptions
│   ├── messages.ts       # Message updates
│   ├── presence.ts       # User presence
│   ├── events.ts         # Event updates
│   └── matching.ts       # Matching updates
├── events/               # Real-time event handlers
├── presence/             # Presence management
└── notifications/        # Push notification setup
```

#### Real-time Features
- **Live Messaging**: Instant message delivery
- **Presence System**: Online/offline status
- **Live Events**: Real-time event updates
- **Matching Updates**: Live matching notifications
- **Activity Feeds**: Real-time activity streams

### MCP (Model Context Protocol) Layer

#### MCP Servers (`mcp/servers/`)
```
mcp/servers/
├── supabase/             # Supabase database access
│   ├── server.ts         # MCP server implementation
│   ├── tools/            # Database tools
│   └── auth/             # Authentication handlers
├── storage/              # File storage access
│   ├── server.ts         # Storage MCP server
│   └── tools/            # File management tools
└── external/             # External API integrations
    ├── server.ts         # External API server
    └── tools/            # API integration tools
```

#### MCP Configuration (`mcp/config/`)
```
mcp/config/
├── servers.json          # Server configuration
├── auth.json            # Authentication settings
├── scopes.json          # Permission scopes
└── manifests/           # Server manifests
```

## 🔒 Security Architecture

### Authentication Flow
```
User Request → Auth Layout → Supabase Auth → Token Validation → Protected Route
```

### Security Layers
1. **Network Security**
   - HTTPS everywhere
   - CORS configuration
   - Rate limiting

2. **Application Security**
   - Input validation
   - XSS protection
   - CSRF protection

3. **Data Security**
   - Row Level Security (RLS)
   - Data encryption
   - Audit logging

4. **API Security**
   - JWT token validation
   - API key management
   - OAuth 2.1 integration

## 🚀 Performance Architecture

### Frontend Performance
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Heavy components loaded on demand
- **Caching**: React Query for server state caching
- **Bundle Optimization**: Tree shaking and minification

### Database Performance
- **Indexing Strategy**: Optimized indexes for queries
- **Connection Pooling**: Supabase connection management
- **Query Optimization**: Efficient database queries
- **Vector Indexing**: HNSW indexes for vector search

### Real-time Performance
- **Connection Management**: Efficient WebSocket connections
- **Message Queuing**: Message batching and throttling
- **Presence Optimization**: Efficient presence tracking
- **Subscription Management**: Selective real-time updates

## 📊 Monitoring & Observability

### Frontend Monitoring
- **Error Tracking**: Sentry integration
- **Performance Metrics**: Web Vitals monitoring
- **User Analytics**: Custom event tracking
- **A/B Testing**: Feature flag integration

### Backend Monitoring
- **Database Metrics**: Supabase monitoring
- **API Performance**: Response time tracking
- **Real-time Metrics**: WebSocket connection health
- **AI Service Monitoring**: Token usage and costs

### Infrastructure Monitoring
- **Container Health**: Docker container monitoring
- **Resource Usage**: CPU, memory, and disk usage
- **Network Performance**: Bandwidth and latency
- **Security Monitoring**: Threat detection and alerting

## 🔧 Development Architecture

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Mock Services**: Mock authentication and data
- **Database Seeding**: Local database with sample data
- **Testing Environment**: Isolated test database

### Build Process
- **TypeScript Compilation**: Strict type checking
- **Code Quality**: ESLint and Prettier integration
- **Testing**: Unit, integration, and E2E tests
- **Bundle Analysis**: Bundle size optimization

### Deployment Architecture
- **Container Strategy**: Multi-stage Docker builds
- **Environment Management**: Development, staging, production
- **CI/CD Pipeline**: Automated testing and deployment
- **Rollback Strategy**: Blue-green deployment

## 🎯 Scalability Architecture

### Horizontal Scaling
- **Load Balancing**: Multiple app instances
- **Database Scaling**: Read replicas and connection pooling
- **Real-time Scaling**: Multiple WebSocket servers
- **AI Service Scaling**: Multiple AI service instances

### Vertical Scaling
- **Resource Optimization**: Efficient resource usage
- **Caching Strategy**: Multi-layer caching
- **Database Optimization**: Query and index optimization
- **AI Model Optimization**: Model selection and tuning

### Data Architecture Scaling
- **Database Partitioning**: Time-based partitioning
- **Vector Store Scaling**: Multiple vector databases
- **File Storage Scaling**: Distributed file storage
- **Analytics Scaling**: Separate analytics database

This architecture provides a solid foundation for building an enterprise-grade dating platform with AI-powered features, real-time capabilities, and scalable infrastructure.