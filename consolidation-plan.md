# FindYourKingZero Complete Canonical Consolidation Plan v∞.15

## Mission
Consolidate ALL scattered code into canonical 15/10 enterprise-grade architecture using parallel sub-agents.

## Axiom #1: Sub-agents do ALL work. I strategize only.

---

## Phase 1: Codebase Archaeology & Mapping (WAVE 1)

### T1: Map Auth System Architecture
**Agent**: Sparky-1 (Code Archaeologist)
**depends_on**: []
**Description**: 
- Deep analysis of `/src/lib/auth/index.tsx` (line 844 currently)
- Map all auth flows: OAuth, Magic Link, Biometric, Session Management
- Identify duplicate code between `/src/auth/canonical.tsx` and `/src/lib/auth/index.tsx`
- Document auth dependencies across the entire codebase
**Location**: 
- `/src/auth/canonical.tsx`
- `/src/lib/auth/index.tsx`
- `/src/hooks/useAuth.tsx` (if exists)
- `/src/integrations/supabase/client.ts`
**Acceptance Criteria**:
- [ ] Complete auth flow diagram documented
- [ ] All duplicate auth implementations identified
- [ ] List of all files importing auth functionality
- [ ] Security audit of auth patterns
**Validation**: Grep search for all auth imports and verify coverage

### T2: Map AI/ML System Architecture  
**Agent**: Sparky-2 (AI Systems Mapper)
**depends_on**: []
**Description**:
- Map all AI engines: EliteAIEngine, InfermaxAIEngine, AIBrain, LocalAI
- Analyze `/src/lib/ai/` structure
- Document AI service dependencies
- Map AI component hierarchy in `/src/components/ai/`
**Location**:
- `/src/lib/ai/`
- `/src/components/ai/`
- `/src/services/ai/`
- `/src/features/ai/`
**Acceptance Criteria**:
- [ ] All AI engines catalogued with purposes
- [ ] AI dependency graph created
- [ ] Duplicate AI utilities identified
- [ ] AI-to-feature mapping completed
**Validation**: Verify all AI imports resolve correctly

### T3: Map Feature Module Architecture
**Agent**: Sparky-3 (Feature Archaeologist)
**depends_on**: []
**Description**:
- Map all 20+ feature modules in `/src/features/`
- Identify which features have proper index.ts exports
- Find scattered feature code outside feature folders
- Document feature-to-feature dependencies
**Location**:
- `/src/features/*`
- `/src/pages/` (legacy scattered pages)
- `/src/components/` (feature-related components)
**Acceptance Criteria**:
- [ ] Complete feature inventory
- [ ] Missing index.ts files identified
- [ ] Scattered feature code locations documented
- [ ] Feature dependency matrix created
**Validation**: Ensure all feature imports work via `@/features/x`

### T4: Map Hooks & Utilities Architecture
**Agent**: Sparky-4 (Hooks & Utils Mapper)
**depends_on**: []
**Description**:
- Map all hooks in `/src/hooks/` including subdirectories
- Identify hook duplication across unified/, voice/, reusable/
- Map utility functions in `/src/lib/`, `/src/utils/`
- Document TanStack Query usage patterns
**Location**:
- `/src/hooks/`
- `/src/lib/` (non-AI utilities)
- `/src/utils/` (if exists)
- `/src/hooks/unified/`
**Acceptance Criteria**:
- [ ] Complete hooks inventory with purposes
- [ ] Duplicate hooks identified for consolidation
- [ ] Utility function organization plan
- [ ] TanStack Query pattern standardization plan
**Validation**: Verify hook exports from `@/hooks` work correctly

### T5: Map Components Architecture
**Agent**: Sparky-5 (Component Architect)
**depends_on**: []
**Description**:
- Map component organization in `/src/components/`
- Identify which components are feature-specific vs shared
- Document shadcn/ui usage and custom components
- Map component dependencies and props interfaces
**Location**:
- `/src/components/`
- `/src/components/ui/` (shadcn)
- `/src/components/auth/`
- `/src/components/chat/`
**Acceptance Criteria**:
- [ ] Complete component inventory
- [ ] Feature-specific vs shared classification
- [ ] Missing component exports identified
- [ ] Component dependency graph
**Validation**: All component imports resolve

### T6: Map Services & API Architecture
**Agent**: Sparky-6 (Services Mapper)
**depends_on**: []
**Description**:
- Map all services in `/src/services/`
- Analyze API client patterns
- Map Supabase integration points
- Document WebSocket/realtime usage
**Location**:
- `/src/services/`
- `/src/integrations/`
- `/src/api/` (if exists)
- `/src/graphql/` (if exists)
**Acceptance Criteria**:
- [ ] Complete services inventory
- [ ] API client patterns documented
- [ ] Supabase integration points mapped
- [ ] Realtime/WS usage documented
**Validation**: Service imports work, no broken API clients

---

## Phase 2: Consolidation Strategy (WAVE 2)

### T7: Design Canonical Auth Consolidation
**Agent**: Sparky-7 (Auth Consolidation Designer)
**depends_on**: [T1]
**Description**:
- Design merged auth system combining `/src/auth/canonical.tsx` + `/src/lib/auth/index.tsx`
- Create migration plan for auth consumers
- Design unified auth hook API
- Plan biometric auth integration
**Location**:
- Design documents only (no code changes yet)
**Acceptance Criteria**:
- [ ] Consolidated auth architecture design
- [ ] Migration strategy for existing auth imports
- [ ] Unified API specification
- [ ] Backward compatibility plan
**Validation**: Design reviewed and approved

### T8: Design Canonical AI Consolidation
**Agent**: Sparky-8 (AI Consolidation Designer)
**depends_on**: [T2]
**Description**:
- Design unified AI engine architecture
- Consolidate EliteAIEngine + InfermaxAIEngine + AIBrain patterns
- Design canonical AI hook API
- Plan ML services consolidation
**Location**:
- Design documents
**Acceptance Criteria**:
- [ ] Unified AI engine design
- [ ] Canonical AI hook specification
- [ ] ML services consolidation plan
- [ ] AI component standardization
**Validation**: AI architecture design complete

### T9: Design Feature Module Consolidation
**Agent**: Sparky-9 (Feature Consolidation Designer)
**depends_on**: [T3]
**Description**:
- Design complete feature module standard
- Create feature index.ts template
- Design feature-to-feature communication patterns
- Plan feature dependency injection
**Location**:
- Design templates
**Acceptance Criteria**:
- [ ] Feature module standard documented
- [ ] Index.ts template created
- [ ] Feature communication patterns designed
- [ ] Dependency injection plan
**Validation**: Feature standard approved

---

## Phase 3: Execute Consolidation (WAVE 3)

### T10: Consolidate Auth System
**Agent**: Sparky-10 (Auth Consolidator)
**depends_on**: [T1, T7]
**Description**:
- Execute auth consolidation per T7 design
- Merge `/src/auth/canonical.tsx` with `/src/lib/auth/index.tsx`
- Update all auth imports across codebase
- Ensure zero regression
**Location**:
- `/src/auth/canonical.tsx`
- `/src/lib/auth/index.tsx`
- All files importing auth
**Acceptance Criteria**:
- [ ] Single canonical auth file
- [ ] All auth imports updated
- [ ] No duplicate auth code
- [ ] TypeScript compiles
- [ ] No runtime regressions
**Validation**: Full type check + runtime test

### T11: Consolidate AI System
**Agent**: Sparky-11 (AI Consolidator)
**depends_on**: [T2, T8]
**Description**:
- Execute AI consolidation per T8 design
- Create unified AI engine
- Consolidate AI hooks
- Standardize AI components
**Location**:
- `/src/lib/ai/canonical.ts`
- `/src/components/ai/`
- AI-related features
**Acceptance Criteria**:
- [ ] Unified AI engine
- [ ] Canonical AI hooks
- [ ] Standardized AI components
- [ ] No duplicate AI code
**Validation**: AI imports work, type check passes

### T12: Consolidate Feature Modules
**Agent**: Sparky-12 (Feature Consolidator)
**depends_on**: [T3, T9]
**Description**:
- Create proper index.ts for ALL features missing them
- Move scattered feature code to proper feature folders
- Update imports across codebase
- Standardize feature exports
**Location**:
- `/src/features/*/index.ts`
- Scattered feature code
**Acceptance Criteria**:
- [ ] All features have index.ts
- [ ] No scattered feature code
- [ ] All feature imports canonical
- [ ] Feature dependencies resolved
**Validation**: All `@/features/*` imports work

### T13: Consolidate Hooks & Utilities
**Agent**: Sparky-13 (Hooks Consolidator)
**depends_on**: [T4]
**Description**:
- Consolidate duplicate hooks
- Create canonical hooks index
- Organize utilities into `/src/lib/utilities/`
- Standardize TanStack Query patterns
**Location**:
- `/src/hooks/`
- `/src/lib/utilities/` (create)
**Acceptance Criteria**:
- [ ] No duplicate hooks
- [ ] Canonical hooks index
- [ ] Organized utilities
- [ ] Standardized query patterns
**Validation**: Hook imports work

### T14: Consolidate Components
**Agent**: Sparky-14 (Component Consolidator)
**depends_on**: [T5]
**Description**:
- Move feature-specific components to feature folders
- Create shared components index
- Standardize component exports
- Update all component imports
**Location**:
- `/src/components/`
- Feature component folders
**Acceptance Criteria**:
- [ ] Feature components in feature folders
- [ ] Shared components indexed
- [ ] Standardized exports
- [ ] All imports updated
**Validation**: Component imports work

### T15: Consolidate Services
**Agent**: Sparky-15 (Services Consolidator)
**depends_on**: [T6]
**Description**:
- Consolidate service patterns
- Create canonical services index
- Standardize API clients
- Organize integrations
**Location**:
- `/src/services/`
- `/src/integrations/`
**Acceptance Criteria**:
- [ ] Unified service patterns
- [ ] Canonical services index
- [ ] Standardized API clients
- [ ] Organized integrations
**Validation**: Service imports work

---

## Phase 4: Final Verification (WAVE 4)

### T16: 360° E2E Audit
**Agent**: Sparky-16 (E2E Auditor)
**depends_on**: [T10, T11, T12, T13, T14, T15]
**Description**:
- Run comprehensive E2E audit
- Verify all imports resolve
- Check for runtime errors
- Validate TypeScript compilation
**Acceptance Criteria**:
- [ ] TypeScript compilation passes
- [ ] No broken imports
- [ ] No runtime errors
- [ ] All features functional
**Validation**: Full E2E test suite

### T17: Documentation & README Update
**Agent**: Sparky-17 (Documentarian)
**depends_on**: [T16]
**Description**:
- Update README with canonical architecture
- Document new import patterns
- Create architecture decision records
- Update contribution guidelines
**Acceptance Criteria**:
- [ ] README updated
- [ ] Import patterns documented
- [ ] ADRs created
- [ ] Guidelines updated
**Validation**: Documentation reviewed

### T18: Final Polish & Optimization
**Agent**: Sparky-18 (Polisher)
**depends_on**: [T16, T17]
**Description**:
- Final code polish
- Remove dead code
- Optimize bundle size
- Final type check
**Acceptance Criteria**:
- [ ] Dead code removed
- [ ] Bundle optimized
- [ ] Types strict
- [ ] 15/10 quality achieved
**Validation**: Final quality gate

---

## Success Criteria

1. **Single Import Point**: Everything accessible via canonical paths
2. **Zero Duplication**: No duplicate code anywhere
3. **Full Type Safety**: TypeScript strict mode passes
4. **No Regressions**: All features still work
5. **15/10 Quality**: Enterprise-grade, maintainable, scalable

## Canonical Import Paths

```typescript
// Auth
import { useAuth, AuthProvider, ProtectedRoute } from '@/auth';

// Features
import { GridPage, RightNowFeed } from '@/features/grid';
import { ChatThread, MessagesPage } from '@/features/chat';
// ... etc for all features

// AI
import { useUnifiedAI, useLocalAI } from '@/lib/ai';

// Hooks
import { useDating, useEvents } from '@/hooks';

// Components
import { Button, Card } from '@/components/ui';
```
