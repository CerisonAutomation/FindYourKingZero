// 🏗️ Micro-Frontend Architecture - Dating Feature Module
export { default as DatingGrid } from './components/DatingGrid';
export { default as ProfileView } from './components/ProfileView';
export { default as FilterDialog } from './components/FilterDialog';
export { default as MatchCard } from './components/MatchCard';
export { useDatingLogic } from './hooks/useDatingLogic';
export { useOptimizedQuery } from './hooks/useOptimizedQuery';
export { useDatingStore } from './store/useDatingStore';
export type { DatingStore, FilterState, Profile, Match } from './types';