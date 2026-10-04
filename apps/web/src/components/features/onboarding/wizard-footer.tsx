"use client";

import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ONBOARDING_STEPS } from "@/lib/consts/onboarding";

interface WizardFooterProps {
  currentStep: number;
  isSubmitting: boolean;
  isContinueDisabled: boolean;
  onPrevious: () => void;
  onSkip: () => void;
}

export function WizardFooter({
  currentStep,
  isSubmitting,
  isContinueDisabled,
  onPrevious,
  onSkip,
}: WizardFooterProps) {
  const activeStepConfig = ONBOARDING_STEPS[currentStep - 1] || ONBOARDING_STEPS[0];

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <div>
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="px-3 text-xs sm:text-sm gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>পূর্ববর্তী</span>
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {currentStep > 1 && activeStepConfig.optional ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={isSubmitting}
            className="px-3 text-xs sm:text-sm"
          >
            স্কিপ করুন
          </Button>
        ) : null}

        <Button
          type="submit"
          disabled={isContinueDisabled}
          className="h-10 min-w-28 rounded-xl px-5 text-xs sm:text-sm font-semibold gap-1.5 shadow-xs"
        >
          {isSubmitting ? (
            <Spinner className="size-4" />
          ) : (
            <>
              <span>পরবর্তী</span>
              <ArrowRight size={14} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
