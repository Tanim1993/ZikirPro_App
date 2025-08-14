import { CheckCircle } from "lucide-react";

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedBadge({ isVerified, size = "sm", className = "" }: VerifiedBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  return (
    <CheckCircle 
      className={`text-blue-500 ${sizeClasses[size]} ${className}`}
      fill="currentColor"
      data-testid="verified-badge"
    />
  );
}