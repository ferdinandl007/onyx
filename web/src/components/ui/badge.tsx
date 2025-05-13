import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant,
  color,
  icon: Icon,
  size = "sm",
  circle,
  tooltip,
  ...props
}: BadgeProps & {
  icon?: React.ElementType;
  size?: "sm" | "md" | "xs";
  circle?: boolean;
  tooltip?: string;
}) {
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    xs: "px-1.5 py-0.25 text-[.5rem]",
  };

  const BadgeContent = (
    <div
      className={cn(
        "flex-none inline-flex items-center whitespace-nowrap overflow-hidden",
        badgeVariants({ variant }),
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(
            "mr-1 flex-shrink-0",
            size === "sm" ? "h-3 w-3" : size === "xs" ? "h-2 w-2" : "h-4 w-4"
          )}
        />
      )}
      {circle && (
        <div
          className={cn(
            "mr-2 rounded-full bg-current opacity-80 flex-shrink-0",
            size === "xs" ? "h-2 w-2" : "h-2.5 w-2.5"
          )}
        />
      )}
      <span className="truncate">{props.children}</span>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{BadgeContent}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return BadgeContent;
}

export { Badge, badgeVariants };
