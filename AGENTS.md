# AGENTS.md

<!-- START nextjs/ai-agents -->
# 🤖 AI Agent Instructions

This section contains managed instructions for AI coding agents. DO NOT EDIT THE CONTENT BETWEEN THE MARKERS.

## 📚 Official Documentation

Before making any changes, read these official docs:

- **Next.js AI Agents**: https://nextjs.org/docs/app/guides/ai-agents
- **AI SDK Introduction**: https://ai-sdk.dev/docs/introduction
- **AI SDK Next.js Cookbook**: https://ai-sdk.dev/cookbook/next/human-in-the-loop

## 🏗️ Project-Specific Instructions

### Stack Overview
- **Framework**: React + Vite (not Next.js)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **AI Integration**: Vercel AI SDK + OpenAI
- **Language**: TypeScript (strict)
- **Styling**: TailwindCSS + shadcn/ui
- **Architecture**: Enterprise dating platform with real-time features

### Key Rules
1. **Read project docs first**: Always read `PROJECT_RULES.md`, `ARCHITECTURE.md`, and `SECURITY.md` before coding
2. **Use official APIs**: Never guess Supabase or AI SDK APIs - check the official docs
3. **TypeScript strict**: All code must pass strict TypeScript checks
4. **Enterprise patterns**: Follow established patterns in `src/lib/` and `src/components/`
5. **Security first**: Never expose secrets, always use RLS policies
6. **Real-time first**: Leverage Supabase realtime for live features
7. **Mock mode**: Use `VITE_MOCK_API=true` for development without live services

### File Structure
- `src/integrations/supabase/` - Supabase client and types
- `src/lib/` - Shared utilities and helpers
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/features/` - Feature-specific components and pages
- `supabase/` - Database migrations and edge functions

### Authentication Flow
- Use mock authentication in development (`VITE_MOCK_API=true`)
- Production uses Supabase Auth with proper RLS
- All auth state managed through `src/hooks/useAuth.tsx`
- Callback URLs: `${window.location.origin}/auth/callback`

## 🔗 Official Docs You MUST Use

### Supabase + AI
- **Supabase AI & vectors**: https://supabase.com/docs/guides/ai
- **Supabase AI models in Edge Functions**: https://supabase.com/docs/guides/functions/ai-models
- **Supabase LangChain**: https://supabase.com/docs/guides/ai/langchain
- **Supabase AI prompts**: https://supabase.com/docs/guides/getting-started/ai-prompts
- **Supabase MCP**: https://supabase.com/docs/guides/getting-started/mcp
- **MCP Authentication**: https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication

### AI SDK & Frameworks
- **AI SDK docs**: https://ai-sdk.dev/docs/introduction
- **AI SDK tools**: https://ai-sdk.dev/docs/tools/tools
- **AI SDK streaming**: https://ai-sdk.dev/docs/ai-sdk-core/streaming
- **LangChain docs**: https://python.langchain.com/
- **LlamaIndex**: https://developers.llamaindex.ai/python/framework/understanding/

### MCP & Tools
- **MCP Specification**: https://modelcontextprotocol.io/specification/2025-11-25
- **MCP Deep Dive**: https://sainam.tech/blog/mcp-complete-guide-2026/
- **MCP Best Practices**: https://bridgeapp.ai/resources/blog/a-complete-guide-to-model-context-protocol-mcp-architecture-integration-and-best-practices

### Vector & AI Architecture
- **Supabase Vector**: https://supabase.com/docs/guides/ai/vector-embeddings
- **Engineering for Scale**: https://supabase.com/docs/guides/ai/engineering-for-scale
- **Vecs Python Client**: https://supabase.github.io/vecs/api/

## 🎯 Development Workflow

1. **Setup**: Ensure `VITE_MOCK_API=true` for development
2. **Authentication**: Use mock flow for testing, real Supabase for production
3. **Database**: All schema changes in `supabase/migrations/`
4. **Real-time**: Use Supabase realtime subscriptions
5. **AI Features**: Implement through edge functions and client-side AI SDK
6. **Testing**: Mock external services, test with real Supabase when possible

## 🚀 AI Integration Patterns

### Chat/AI Features
- Use Vercel AI SDK for streaming responses
- Implement tools for database queries
- Add human-in-the-loop for sensitive operations
- Store AI conversations in Supabase

### Vector Search
- Use Supabase pgvector for embeddings
- Implement semantic search for profiles/matching
- Store conversation embeddings for context

### Real-time + AI
- Combine Supabase realtime with AI responses
- Use AI for matching algorithms
- Implement AI-powered moderation

<!-- END nextjs/ai-agents -->

## 📋 Project-Specific Rules

### Dating Platform Specific
- **Privacy First**: All user data must be protected with RLS
- **GDPR Compliant**: Follow data protection regulations
- **Content Moderation**: AI-powered content filtering
- **Verification System**: Photo ID and behavioral scoring
- **Matching Algorithm**: AI-powered compatibility scoring

### Enterprise Requirements
- **Scalability**: Design for 1M+ users
- **Performance**: Sub-second response times
- **Security**: Zero-trust architecture
- **Monitoring**: Comprehensive logging and metrics
- **Compliance**: Regular security audits

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Enterprise configuration
- **Prettier**: Consistent formatting
- **Testing**: E2E with Playwright
- **Documentation**: Comprehensive README

## 🔒 Security Policies

### Never Do
- Expose API keys or secrets
- Bypass RLS policies
- Log sensitive user data
- Use eval() or similar unsafe patterns
- Commit environment files

### Always Do
- Use parameterized queries
- Validate all inputs
- Implement proper error handling
- Use secure authentication flows
- Follow principle of least privilege