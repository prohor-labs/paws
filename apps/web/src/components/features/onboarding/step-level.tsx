"use client";

import type { ComponentType } from "react";
import { Award, BookOpen, Check, DocumentText, GraduationCap } from "@/components/icons";
import { LEVEL_OPTIONS } from "@/lib/consts/onboarding";
import { cn } from "@/lib/utils";

interface StepLevelProps {
  selectedLevel: string;
  onSelectLevel: (levelId: string) => void;
}

const LEVEL_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  GraduationCap,
  BookOpen,
  DocumentText,
  Award,
};

export function StepLevel({ selectedLevel, onSelectLevel }: StepLevelProps) {
  return (
    <div className="flex flex-col gap-3">
      {LEVEL_OPTIONS.map((option) => {
        const Icon = LEVEL_ICONS[option.iconName] || BookOpen;
        const isSelected = selectedLevel === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectLevel(option.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all outline-none",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-2xs"
                : "border-border/80 bg-card hover:bg-muted/30 hover:border-border",
            )}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground truncate">{option.description}</span>
              </div>
            </div>

            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ml-2",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/40 bg-transparent",
              )}
            >
              {isSelected ? <Check size={12} /> : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
