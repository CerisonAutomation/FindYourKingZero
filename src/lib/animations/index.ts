/**
 * Elite Animation System - Main Index
 * Production-grade animation exports
 */

// Animation Presets
export {
  presets,
  type AnimationPreset,
  type SpringOptions,
  type PresetName,
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  slideInUp,
  slideInLeft,
  slideInRight,
  zoomIn,
  zoomOut,
  springBounce,
  elasticIn,
  magneticPull,
  gravityFall,
  pulse,
  shake,
  jello,
  float,
  flip3D,
  rotate3D,
  swipeLeft,
  swipeRight,
  matchPop,
  heartBurst,
  profileReveal,
  staggerContainer,
  staggerItem,
  createStaggerDelay,
  createSpringTransition,
  combineAnimations,
} from './presets';

// Animation Components
export {
  Reveal,
  StaggerContainer,
  StaggerItem,
  MagneticCard,
  SwipeableCard,
} from './components';

// Re-export from components for convenience
export { default } from './components';
