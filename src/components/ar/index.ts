/**
 * AR Components
 *
 * WebXR and AR Quick Look components for stadium tours:
 * - ARQuickLookButton: iOS-specific using .usdz files
 * - ARTourButton: Universal with device detection
 * - ModelViewerFallback: Desktop 3D viewer
 * - AROverlay: Full WebXR experience (from homepage-v2)
 */

export { default as ARQuickLookButton } from './ARQuickLookButton'
export { default as ARTourButton } from './ARTourButton'
export { default as ModelViewerFallback } from './ModelViewerFallback'

// Legacy exports (if ARButton/AROverlay exist in this folder)
// export { default as AROverlay } from './AROverlay'
// export { ARButton, FloatingARButton } from './ARButton'
