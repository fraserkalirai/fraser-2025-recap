import { ReactNode } from "react";
import ErrorCard from '@/src/components/ui/ErrorCard';

type BaseCardType = "chart" | "table" | "default";

interface BaseCardProps {
  children: ReactNode;
  type?: BaseCardType;
  className?: string;
  padding?: boolean;
  isLoading?: boolean;
  isError?: boolean;
}

const CARD_STYLES: Record<BaseCardType, string> = {
  default: "",
  chart: "flex-1 min-h-0",
  table: "flex flex-col flex-1 min-h-0",
};

export default function BaseCard({
  children,
  type = "default",
  className = "",
  padding = false,
  isLoading = false,
  isError = false,
}: BaseCardProps) {
  const additionalStyle = CARD_STYLES[type];
  const paddingClasses = padding ? "p-4 lg:p-8" : "";

  if (isLoading) {
    return (
      <div
        className={`w-full h-full bg-blue-50 dark:bg-blue-950 rounded-lg shadow-lg animate-pulse ${paddingClasses} ${additionalStyle} ${className}`}
      >
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-blue-50 dark:bg-blue-950 rounded-lg shadow-lg ${paddingClasses} ${additionalStyle} ${className}`}
    >
      {isError ? <ErrorCard /> : children}
    </div>
  );
}