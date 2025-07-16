import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingSpinner = ({
  size = "md",
  text = "Cargando...",
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}
    >
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-brand-500 mb-2`}
      />
      <p className={`${textSizeClasses[size]} text-gray-600 animate-pulse`}>
        {text}
      </p>
    </div>
  );
};

// Page loading component
export const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <LoadingSpinner size="lg" text="Cargando página..." />
  </div>
);

// Section loading component
export const SectionLoader = ({ text = "Cargando contenido..." }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="md" text={text} />
  </div>
);

// Inline loading component
export const InlineLoader = ({ text = "Cargando..." }) => (
  <div className="flex items-center gap-2 text-gray-600">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span className="text-sm">{text}</span>
  </div>
);

export default LoadingSpinner;
