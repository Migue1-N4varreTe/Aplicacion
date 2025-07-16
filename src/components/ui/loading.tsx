import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  centered?: boolean;
}

export function Loading({
  size = "md",
  text = "Cargando...",
  className,
  centered = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const containerClasses = cn(
    "flex items-center gap-2 text-gray-600",
    centered && "justify-center min-h-[200px]",
    className,
  );

  return (
    <div className={containerClasses}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className={textSizeClasses[size]}>{text}</span>}
    </div>
  );
}

export function LoadingSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={cn(
        "border-gray-300 border-t-brand-600 rounded-full animate-spin",
        sizeClasses[size],
        className,
      )}
    />
  );
}

export function LoadingPage({
  text = "Cargando página...",
}: {
  text?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{text}</h2>
        <p className="text-gray-500">Esto solo tomará un momento</p>
      </div>
    </div>
  );
}

export function LoadingOverlay({
  isLoading,
  text = "Procesando...",
  children,
}: {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
}

export default Loading;
