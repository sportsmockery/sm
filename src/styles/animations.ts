// Animation definitions for SportsMockery
// These correspond to keyframes in globals.css

export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleIn: 'animate-scale-in',
  shimmer: 'animate-shimmer',
  ticker: 'animate-ticker',
}

// Duration classes
export const durations = {
  fast: 'duration-150',
  normal: 'duration-300',
  slow: 'duration-500',
  slower: 'duration-700',
}

// Easing classes
export const easings = {
  default: 'ease-out',
  bounce: 'ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
  smooth: 'ease-[cubic-bezier(0.4,0,0.2,1)]',
}

// Stagger delays
export const staggerDelays = [
  'stagger-1',
  'stagger-2',
  'stagger-3',
  'stagger-4',
  'stagger-5',
]

// Transition presets
export const transitions = {
  all: 'transition-all duration-300 ease-out',
  transform: 'transition-transform duration-300 ease-out',
  opacity: 'transition-opacity duration-300 ease-out',
  colors: 'transition-colors duration-200 ease-out',
  shadow: 'transition-shadow duration-300 ease-out',
}
