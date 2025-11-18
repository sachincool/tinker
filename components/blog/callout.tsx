"use client";

import React from "react";
import { Info, AlertCircle, Lightbulb, Zap, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  type?: "info" | "warning" | "tip" | "insight" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    bgClass: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    iconClass: "text-blue-600 dark:text-blue-400",
    titleClass: "text-blue-900 dark:text-blue-200",
  },
  warning: {
    icon: AlertCircle,
    bgClass: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
    iconClass: "text-yellow-600 dark:text-yellow-400",
    titleClass: "text-yellow-900 dark:text-yellow-200",
  },
  tip: {
    icon: Lightbulb,
    bgClass: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    iconClass: "text-green-600 dark:text-green-400",
    titleClass: "text-green-900 dark:text-green-200",
  },
  insight: {
    icon: Zap,
    bgClass: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
    iconClass: "text-purple-600 dark:text-purple-400",
    titleClass: "text-purple-900 dark:text-purple-200",
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    titleClass: "text-emerald-900 dark:text-emerald-200",
  },
};

export function Callout({ type = "info", title, children, className }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  const defaultTitles = {
    info: "Information",
    warning: "Warning",
    tip: "Tip",
    insight: "Key Insight",
    success: "Success",
  };

  return (
    <div
      className={cn(
        "my-8 rounded-xl border-2 p-6 shadow-lg transition-all duration-300 hover:shadow-xl",
        config.bgClass,
        className
      )}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Icon className={cn("h-6 w-6", config.iconClass)} />
        </div>
        <div className="flex-1 space-y-2">
          {title !== undefined && title !== null && (
            <div className={cn("font-bold text-lg", config.titleClass)}>
              {title || defaultTitles[type]}
            </div>
          )}
          {title === undefined && (
            <div className={cn("font-bold text-lg", config.titleClass)}>
              {defaultTitles[type]}
            </div>
          )}
          <div className="text-sm md:text-base leading-relaxed text-foreground/90">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
