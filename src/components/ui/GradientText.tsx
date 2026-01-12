import { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  variant?: 'brand' | 'bears' | 'bulls' | 'cubs' | 'sox' | 'hawks'
  className?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'
}

const gradients = {
  brand: 'from-[#FF0000] to-[#8B0000]',
  bears: 'from-[#0B162A] to-[#C83200]',
  bulls: 'from-[#CE1141] to-[#000000]',
  cubs: 'from-[#0E3386] to-[#CC3433]',
  sox: 'from-[#27251F] to-[#C4CED4]',
  hawks: 'from-[#CF0A2C] to-[#000000]',
}

export default function GradientText({
  children,
  variant = 'brand',
  className = '',
  as: Component = 'span',
}: GradientTextProps) {
  return (
    <Component
      className={`
        bg-gradient-to-r ${gradients[variant]}
        bg-clip-text text-transparent
        ${className}
      `}
    >
      {children}
    </Component>
  )
}
