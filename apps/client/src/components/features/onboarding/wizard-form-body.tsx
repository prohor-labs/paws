"use client";

import { type EducationalStandard, ONBOARDING_STEPS } from "@/lib/consts/onboarding";
import { StepLevel } from "./step-level";
import { StepProfile } from "./step-profile";
import { StepSchedule } from "./step-schedule";
import { StepSubjects } from "./step-subjects";

interface WizardFormBodyProps {
  currentStep: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  selectedLevel: EducationalStandard;
  selectedStream: string;
  selectedSchedule: string;
  enableDailyReminder: boolean;
  onFullNameChange: (name: string) => void;
  onAvatarUrlChange: (url: string) => void;
  onSelectLevel: (level: EducationalStandard) => void;
  onSelectStream: (streamId: string) => void;
  onSelectSchedule: (schedule: string) => void;
  onToggleDailyReminder: (enabled: boolean) => void;
}

export function WizardFormBody({
  currentStep,
  fullName,
  email,
  avatarUrl,
  selectedLevel,
  selectedStream,
  selectedSchedule,
  enableDailyReminder,
  onFullNameChange,
  onAvatarUrlChange,
  onSelectLevel,
  onSelectStream,
  onSelectSchedule,
  onToggleDailyReminder,
}: WizardFormBodyProps) {
  const activeStepConfig = ONBOARDING_STEPS[currentStep - 1] || ONBOARDING_STEPS[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {activeStepConfig.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">{activeStepConfig.description}</p>
      </div>

      <div>
        {currentStep === 1 ? (
          <StepProfile
            fullName={fullName}
            email={email}
            avatarUrl={avatarUrl}
            onFullNameChange={onFullNameChange}
            onAvatarUrlChange={onAvatarUrlChange}
          />
        ) : null}

        {currentStep === 2 ? (
          <StepLevel selectedLevel={selectedLevel} onSelectLevel={onSelectLevel} />
        ) : null}

        {currentStep === 3 ? (
          <StepSubjects
            selectedLevel={selectedLevel}
            selectedStream={selectedStream}
            onSelectStream={onSelectStream}
          />
        ) : null}

        {currentStep === 4 ? (
          <StepSchedule
            selectedSchedule={selectedSchedule}
            enableDailyReminder={enableDailyReminder}
            onSelectSchedule={onSelectSchedule}
            onToggleDailyReminder={onToggleDailyReminder}
          />
        ) : null}
      </div>
    </div>
  );
}
