import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#07090f] disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-blue-500/15 border border-blue-400/30 text-blue-300 hover:bg-blue-500/25 hover:border-blue-400/55 hover:text-blue-200',
        teal:
          'bg-teal-500/10 border border-teal-400/25 text-teal-400/80 hover:bg-teal-500/20 hover:border-teal-400/50 hover:text-teal-300',
        ghost:
          'border border-transparent text-blue-400/60 hover:bg-blue-500/10 hover:border-blue-400/25 hover:text-blue-300',
        notion:
          'bg-[rgba(180,200,255,0.07)] border-0 text-[#b0c8f0] font-medium hover:bg-[rgba(180,200,255,0.13)] hover:text-[#ccdeff]',
        destructive:
          'bg-red-500/10 border border-red-400/25 text-red-400/80 hover:bg-red-500/20 hover:border-red-400/45 hover:text-red-300',
      },
      size: {
        default: 'h-7 px-3 rounded-md',
        sm:      'h-6 px-2.5 rounded',
        lg:      'h-8 px-4 rounded-md',
        icon:    'h-7 w-7 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
