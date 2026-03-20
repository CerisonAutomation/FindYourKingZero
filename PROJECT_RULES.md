# PROJECT_RULES.md

## 🏗️ Technology Stack

### Core Framework
- **Frontend**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Vite 5+ with enterprise configuration
- **Routing**: React Router v6 with App Router patterns
- **State Management**: Zustand + React Query for server state
- **Styling**: TailwindCSS + shadcn/ui components

### Backend & Database
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth with OAuth 2.1
- **Real-time**: Supabase Realtime subscriptions
- **Vector Store**: Supabase pgvector for AI embeddings
- **Edge Functions**: Supabase Edge Functions for serverless logic

### AI & Machine Learning
- **AI SDK**: Vercel AI SDK for streaming and tools
- **Models**: OpenAI GPT-4+ for chat and embeddings
- **Vector Search**: pgvector with HNSW indexing
- **Agent Framework**: LangChain/LlamaIndex integration
- **MCP**: Model Context Protocol for tool access

### Development & Deployment
- **Package Manager**: npm with lockfile
- **Testing**: Playwright for E2E, Vitest for unit tests
- **CI/CD**: GitHub Actions with enterprise workflows
- **Containerization**: Docker with multi-stage builds
- **Monitoring**: Sentry for errors, Supabase for analytics

## 📝 Coding Standards

### TypeScript Rules
- **Strict Mode**: All code must pass `--strict` TypeScript checks
- **No Any Types**: Explicit typing required for all variables
- **Interface over Type**: Use `interface` for object shapes
- **Enum Usage**: Use string enums for constants
- **Generic Types**: Prefer generic functions over any types

### React Patterns
- **Functional Components**: Only functional components with hooks
- **Custom Hooks**: Extract complex logic into custom hooks
- **Props Interface**: Define interfaces for all component props
- **Forward Ref**: Use `forwardRef` for DOM element refs
- **Error Boundaries**: Wrap routes with error boundaries

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── forms/          # Form components
├── features/           # Feature-specific components
│   ├── auth/           # Authentication flows
│   ├── chat/           # Messaging system
│   ├── profiles/       # User profiles
│   └── matching/       # AI matching
├── hooks/              # Custom React hooks
├── lib/                # Shared utilities
├── integrations/       # External service integrations
├── types/              # TypeScript type definitions
└── pages/              # Route components
```

## 🚫 Never Do These

### Code Quality
- **No Console.log**: Use proper logging service
- **No Any Types**: Always specify explicit types
- **No Magic Numbers**: Use named constants
- **No Inline Styles**: Use TailwindCSS classes
- **No Direct DOM Manipulation**: Use React patterns

### Security
- **No Hardcoded Secrets**: Use environment variables
- **No SQL Injection**: Use parameterized queries
- **No XSS Vulnerabilities**: Sanitize all user input
- **No CSRF Issues**: Use CSRF tokens for state changes
- **No Auth Bypass**: Never disable authentication checks

### Performance
- **No Unnecessary Re-renders**: Use React.memo and useMemo
- **No Memory Leaks**: Clean up subscriptions and timers
- **No Bundle Bloat**: Lazy load heavy components
- **No Blocking Operations**: Use Web Workers for heavy tasks
- **No Large Images**: Optimize and compress assets

## ✅ Always Do These

### Development Practices
- **Read Documentation**: Check official docs before implementation
- **Write Tests**: Test critical paths and edge cases
- **Code Review**: All changes require peer review
- **Update Documentation**: Keep README and docs current
- **Follow Patterns**: Use established patterns from lib/

### Security Practices
- **Use RLS**: All tables must have Row Level Security
- **Validate Input**: Sanitize and validate all user input
- **Use HTTPS**: All API calls must use HTTPS
- **Implement Rate Limiting**: Prevent abuse and DoS attacks
- **Log Security Events**: Track authentication and authorization

### Performance Practices
- **Lazy Loading**: Load components and routes on demand
- **Caching**: Implement appropriate caching strategies
- **Optimization**: Profile and optimize critical paths
- **Monitoring**: Track performance metrics
- **Error Handling**: Graceful error recovery

## 🎯 Architecture Rules

### Component Design
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Prefer composition patterns
- **Props Interface**: Define clear contracts for component props
- **State Management**: Use appropriate state management patterns
- **Accessibility**: Ensure WCAG 2.1 AA compliance

### Data Flow
- **Unidirectional Flow**: Data flows down, actions flow up
- **Server State**: Use React Query for server state
- **Client State**: Use Zustand for global client state
- **Local State**: Use useState for component-local state
- **Form State**: Use react-hook-form for form management

### API Integration
- **Type Safety**: Generate types from API schemas
- **Error Handling**: Implement comprehensive error handling
- **Retry Logic**: Add exponential backoff for failed requests
- **Caching**: Cache API responses appropriately
- **Loading States**: Show loading indicators during async operations

## 🔧 Development Workflow

### Environment Setup
1. **Clone Repository**: Use git clone with SSH keys
2. **Install Dependencies**: Run `npm ci` for exact versions
3. **Environment Setup**: Copy `.env.example` to `.env.local`
4. **Database Setup**: Run Supabase migrations
5. **Start Development**: Use `npm run dev` with hot reload

### Code Review Process
1. **Self Review**: Test changes locally before PR
2. **Documentation**: Update relevant documentation
3. **Testing**: Ensure all tests pass
4. **Security Review**: Check for security vulnerabilities
5. **Performance Review**: Verify no performance regressions

### Deployment Process
1. **Build**: Create production build with optimizations
2. **Test**: Run E2E tests against staging
3. **Security Scan**: Run security vulnerability scan
4. **Database Migration**: Apply database migrations
5. **Monitor**: Monitor deployment health

## 📚 Learning Resources

### Required Reading
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Vite Guide**: https://vitejs.dev/guide/
- **TailwindCSS**: https://tailwindcss.com/docs

### Best Practices
- **React Best Practices**: https://react.dev/learn/thinking-in-react
- **TypeScript Best Practices**: https://typescript-eslint.io/rules/
- **Supabase Best Practices**: https://supabase.com/docs/guides/platform
- **Performance Guide**: https://web.dev/performance/

### Security Guidelines
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Supabase Security**: https://supabase.com/docs/guides/security
- **React Security**: https://snyk.io/blog/10-react-security-best-practices/
- **TypeScript Security**: https://typescript-eslint.io/rules/