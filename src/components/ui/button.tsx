import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:scale-[0.99] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_oklch(1_0_0/0.08)_inset,0_1px_0_oklch(1_0_0/0.12)_inset,0_8px_28px_-6px_oklch(0.55_0.2_259/0.45)] hover:scale-[1.01] hover:bg-primary/92",
        destructive:
          "bg-destructive/95 text-destructive-foreground shadow-sm hover:bg-destructive hover:scale-[1.01]",
        outline:
          "border border-white/12 bg-white/[0.04] text-foreground shadow-none backdrop-blur-md hover:bg-white/[0.08] hover:border-white/16",
        secondary:
          "border border-white/8 bg-white/[0.06] text-secondary-foreground shadow-none backdrop-blur-sm hover:bg-white/[0.1]",
        ghost: "hover:bg-white/[0.06] hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:scale-100 active:scale-100",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs font-medium",
        lg: "h-10 rounded-xl px-8",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
