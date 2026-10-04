"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { PlusFrame } from "@/components/auth";
import { ONBOARDING_STEPS, TRACK_PRESETS } from "@/lib/consts/onboarding";
import { type UpdateUserInput, getAuthClient, updateUser, useSession } from "@/lib/sdk";
import { StepReady } from "./step-ready";
import { WizardFooter } from "./wizard-footer";
import { WizardFormBody } from "./wizard-form-body";

export function OnboardingWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.image || "");
  const [selectedLevel, setSelectedLevel] = useState("admission");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "higher-math",
    "physics",
    "chemistry",
    "ict",
  ]);
  const [selectedSchedule, setSelectedSchedule] = useState("1h");
  const [enableDailyReminder, setEnableDailyReminder] = useState(true);

  const queryClient = useQueryClient();
  const updateProfile = useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      toast.error("প্রোফাইল আপডেট করতে সমস্যা হয়েছে");
    },
  });

  const totalSteps = ONBOARDING_STEPS.length;
  const isLastStep = currentStep === totalSteps;
  const isSubmitting = updateProfile.isPending;
  const progressPercent = isLastStep
    ? 100
    : Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  const handleNext = (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (currentStep === 1) {
      const trimmed = (fullName || user?.name || "").trim();
      if (!trimmed) {
        toast.error("অনুগ্রহ করে আপনার নাম প্রদান করুন");
        return;
      }
      if ((fullName && fullName !== user?.name) || (avatarUrl && avatarUrl !== user?.image)) {
        updateProfile.mutate(
          {
            name: trimmed,
            image: avatarUrl || undefined,
          },
          {
            onSuccess: () => {
              if (currentStep < totalSteps) {
                setCurrentStep((prev) => prev + 1);
              }
            },
          },
        );
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    const selectedSubjectSet = new Set(selectedSubjects);
    const activeTrack =
      TRACK_PRESETS.find(
        (preset) =>
          preset.subjects.length === selectedSubjects.length &&
          preset.subjects.every((s) => selectedSubjectSet.has(s)),
      ) || TRACK_PRESETS[0];

    updateProfile.mutate(
      {
        name: (fullName || user?.name || "").trim() || undefined,
        image: avatarUrl || user?.image || undefined,
        level: selectedLevel,
        track: activeTrack.id,
        dailyReminderEnabled: enableDailyReminder,
        onboardingCompleted: true,
      },
      {
        onSuccess: async () => {
          toast.success("অনবোর্ডিং সফলভাবে সম্পন্ন হয়েছে!");
          try {
            await getAuthClient().getSession();
          } catch {
            // ignore
          }
          router.replace("/dashboard");
          router.refresh();
        },
      },
    );
  };

  const isContinueDisabled =
    (currentStep === 1 && !fullName.trim()) ||
    (currentStep === 3 && selectedSubjects.length === 0) ||
    isSubmitting;

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <PlusFrame className="bg-background/95 p-6 sm:p-8 shadow-xs">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-1 w-32 sm:w-40 bg-muted/60 overflow-hidden rounded-full">
            <div
              className="h-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            {isLastStep ? (
              <span className="text-foreground font-semibold">প্রস্তুত</span>
            ) : (
              <span>
                ধাপ {currentStep} / {totalSteps}
              </span>
            )}
          </div>
        </div>

        {isLastStep ? (
          <StepReady
            fullName={fullName}
            email={user?.email || ""}
            avatarUrl={avatarUrl}
            selectedLevel={selectedLevel}
            selectedSubjects={selectedSubjects}
            selectedSchedule={selectedSchedule}
            onGoToDashboard={handleFinish}
            isLoading={isSubmitting}
          />
        ) : (
          <form onSubmit={handleNext} className="flex flex-col gap-6">
            <WizardFormBody
              currentStep={currentStep}
              fullName={fullName}
              email={user?.email || ""}
              avatarUrl={avatarUrl}
              selectedLevel={selectedLevel}
              selectedSubjects={selectedSubjects}
              selectedSchedule={selectedSchedule}
              enableDailyReminder={enableDailyReminder}
              onFullNameChange={setFullName}
              onAvatarUrlChange={setAvatarUrl}
              onSelectLevel={setSelectedLevel}
              onSetSubjects={setSelectedSubjects}
              onSelectSchedule={setSelectedSchedule}
              onToggleDailyReminder={setEnableDailyReminder}
            />

            <WizardFooter
              currentStep={currentStep}
              isSubmitting={isSubmitting}
              isContinueDisabled={isContinueDisabled}
              onPrevious={handlePrevious}
              onSkip={handleSkip}
            />
          </form>
        )}
      </PlusFrame>

      <p className="text-center text-xs text-muted-foreground">
        এই পছন্দগুলো পরবর্তীতে যেকোনো সময় সেটিংস থেকে পরিবর্তন করতে পারবেন।
      </p>
    </div>
  );
}
