// Core UI Components (shadcn/ui)
export { Button, buttonVariants } from './Button'
export type { ButtonProps } from './Button'

export { Input } from './Input'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './Table'

// Legacy UI Components
export { default as TextArea } from './TextArea'
export type { TextAreaProps } from './TextArea'

export { default as Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

export { default as Checkbox } from './Checkbox'
export type { CheckboxProps } from './Checkbox'

export { default as Modal, ConfirmModal } from './Modal'
export type { ModalProps, ConfirmModalProps } from './Modal'

export { default as Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from './Dropdown'
export type { DropdownProps, DropdownItemProps, DropdownLabelProps } from './Dropdown'

export { TabGroup, TabList, Tab, TabPanels, TabPanel } from './Tabs'
export type { TabGroupProps, TabListProps, TabProps, TabPanelsProps, TabPanelProps } from './Tabs'

export { default as Avatar, AvatarGroup } from './Avatar'
export type { AvatarProps, AvatarGroupProps } from './Avatar'

export { ToastProvider, useToast } from './Toast'
export type { Toast, ToastType } from './Toast'

// Existing UI Components
export { Badge } from './Badge'
export { default as AnimatedCard } from './AnimatedCard'
export { default as GlassCard } from './GlassCard'
export { default as GlowCard } from './GlowCard'
export { default as AnimatedCounter } from './AnimatedCounter'
export { default as GradientText } from './GradientText'
export { default as GradientHeader } from './GradientHeader'
export { default as LoadingSpinner } from './LoadingSpinner'
export { default as LoadingDots } from './LoadingDots'
export { default as SkeletonLoader } from './SkeletonLoader'
export {
  default as Tooltip,
  Tooltip as TooltipComponent,
  HelpTooltip,
  InfoBadge,
  ShortcutTooltip,
  FeatureTooltip,
  FeatureTooltipProvider,
  useFeatureTooltips
} from './Tooltip'
export { default as PulsingDot } from './PulsingDot'
export { default as TeamColorBadge } from './TeamColorBadge'
export { default as ErrorCard } from './ErrorCard'
export { default as EmptyState } from './EmptyState'
export { default as ScrollReveal } from './ScrollReveal'
