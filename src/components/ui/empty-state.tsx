import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "w-12 h-12 text-4xl",
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "py-16",
      icon: "w-16 h-16 text-6xl",
      title: "text-xl",
      description: "text-base",
    },
    lg: {
      container: "py-24",
      icon: "w-20 h-20 text-8xl",
      title: "text-2xl",
      description: "text-lg",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        "text-center max-w-md mx-auto",
        classes.container,
        className,
      )}
    >
      {Icon && (
        <div className={cn("text-gray-400 mb-4", classes.icon)}>
          {typeof Icon === "function" ? <Icon /> : Icon}
        </div>
      )}

      <h3 className={cn("font-semibold text-gray-900 mb-2", classes.title)}>
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-gray-600 mb-6 max-w-sm mx-auto",
            classes.description,
          )}
        >
          {description}
        </p>
      )}

      {action && (
        <div className="space-y-3">
          {action.href ? (
            <Button asChild className="btn-gradient">
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button onClick={action.onClick} className="btn-gradient">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
