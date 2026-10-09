"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bookmark, Lock, Share, Sparkle } from "@/components/icons";
import { RichText } from "@/components/shared/rich-text";
import { ShareSheet } from "@/components/shared/share-sheet";
import { UpgradeDialog } from "@/components/shared/upgrade-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useBillingStatus, useRevealExplanation } from "@/hooks/use-billing";
import { cn, toBengaliNumber } from "@/lib/utils";
import type { QBQuestion } from "@/types";

const DEFAULT_OPTION_KEYS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];

interface WrittenPageItem {
  pageNumber: number;
  imageUrl: string;
}

export interface EvaluatedScriptItem {
  id: string;
  pageNumber: number;
  imageUrl: string;
  annotatedImageUrl?: string | null;
  marksAwarded?: string | number | null;
  maxMarks?: string | number | null;
  feedback?: string | null;
}

export interface QuestionCardProps {
  question: QBQuestion;
  index: number;
  showAnswer?: boolean;
  selectedOptionId?: string | null;
  onSelectOption?: (optionId: string) => void;
  writtenPages?: WrittenPageItem[];
  onWrittenPagesChange?: (pages: WrittenPageItem[]) => void;
  evaluatedScripts?: EvaluatedScriptItem[];
  interactiveMode?: "practice" | "live_exam" | "view";
}

import Link from "next/link";

interface QuestionHeaderProps {
  index: number;
  sources?: QBQuestion["sources"];
  topic?: QBQuestion["topic"];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  questionId: string;
}

function QuestionHeader({
  index,
  sources,
  topic,
  isBookmarked,
  onToggleBookmark,
  questionId,
}: QuestionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {toBengaliNumber(index + 1)}
        </span>

        {topic && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-muted text-muted-foreground inline-flex items-center">
              {topic.name}
            </span>
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {sources.map((src) => (
              <span
                key={src.id}
                className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground inline-flex items-center"
              >
                {src.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onToggleBookmark}
          aria-label="বুকমার্ক"
          className={cn("size-8 rounded-lg", isBookmarked && "text-primary")}
        >
          <Bookmark size={16} />
        </Button>
        <Button
          render={<Link href={`/qb/questions/${questionId}`} />}
          variant="ghost"
          size="icon-sm"
          aria-label="প্রশ্নের বিস্তারিত দেখুন"
          title="প্রশ্নের বিস্তারিত দেখুন"
          className="size-8 rounded-lg"
        >
          <Share size={16} />
        </Button>
      </div>
    </div>
  );
}

interface McqOptionsProps {
  options: NonNullable<QBQuestion["options"]>;
  selectedOptionId: string | null;
  isRevealed: boolean;
  interactiveMode: "practice" | "live_exam" | "view";
  onSelectOption: (optionId: string) => void;
}

function McqOptions({
  options,
  selectedOptionId,
  isRevealed,
  interactiveMode,
  onSelectOption,
}: McqOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
      {options.map((opt, optIndex) => {
        const isSelected = selectedOptionId === opt.id;
        const isCorrect = opt.isCorrect === true;

        let optionStyle = isSelected
          ? "border-primary bg-primary/10 text-primary font-medium shadow-2xs"
          : "border-border bg-card/60 hover:bg-muted/40 hover:border-primary/40 text-foreground";

        if (isRevealed) {
          if (isCorrect) {
            optionStyle =
              "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-medium";
          } else if (isSelected && !isCorrect) {
            optionStyle = "border-destructive bg-destructive/10 text-destructive font-medium";
          } else {
            optionStyle = "border-border/40 opacity-50 text-muted-foreground";
          }
        }

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectOption(opt.id)}
            disabled={
              (isRevealed && interactiveMode === "practice") ||
              (interactiveMode === "live_exam" && Boolean(selectedOptionId))
            }
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-left text-xs sm:text-sm transition-colors duration-150 cursor-pointer disabled:cursor-default",
              optionStyle,
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                isRevealed && isCorrect
                  ? "border-emerald-500 bg-emerald-500 text-white font-bold"
                  : isRevealed && isSelected && !isCorrect
                    ? "border-destructive bg-destructive text-white font-bold"
                    : isSelected
                      ? "border-primary bg-primary text-primary-foreground font-bold"
                      : "border-border/80 bg-muted/60 text-muted-foreground",
              )}
            >
              {DEFAULT_OPTION_KEYS[optIndex] || String.fromCharCode(65 + optIndex)}
            </span>
            <div className="flex-1 min-w-0">
              <RichText content={opt.optionText} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface WrittenPartsProps {
  parts: NonNullable<QBQuestion["parts"]>;
  defaultExplanation?: string | null;
  defaultValue?: string[];
  interactiveMode?: "practice" | "live_exam" | "view";
}

function stripLeadingPartLabel(text: string): string {
  return text.replace(/^\s*(\([ক-হa-zA-Z0-9ivxIVX]+\)|[ক-হa-zA-Z0-9ivxIVX]+[.)।])\s*/u, "");
}

function WrittenParts({
  parts,
  defaultExplanation,
  defaultValue,
  interactiveMode = "practice",
}: WrittenPartsProps) {
  if (interactiveMode === "live_exam") {
    return (
      <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
        {parts.map((part, pIdx) => {
          const label = DEFAULT_OPTION_KEYS[pIdx] || `(${toBengaliNumber(pIdx + 1)})`;

          return (
            <div
              key={part.id}
              className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/60 bg-muted/20"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary mt-0.5">
                {label}
              </span>
              <div className="font-medium text-xs sm:text-sm text-foreground flex-1 min-w-0 leading-relaxed">
                <RichText content={stripLeadingPartLabel(part.partText)} className="prose-p:my-0" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="pt-2 border-t border-border/40">
      <Accordion
        defaultValue={defaultValue || parts.map((p) => p.id)}
        className="w-full divide-y divide-border/40"
      >
        {parts.map((part, pIdx) => {
          const label = DEFAULT_OPTION_KEYS[pIdx] || `(${toBengaliNumber(pIdx + 1)})`;

          return (
            <AccordionItem key={part.id} value={part.id} className="py-1 border-b-0">
              <AccordionTrigger className="hover:no-underline py-2.5 px-0 text-left cursor-pointer gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0 pr-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary mt-0.5">
                    {label}
                  </span>
                  <div className="font-medium text-xs sm:text-sm text-foreground flex-1 min-w-0 leading-relaxed">
                    <RichText
                      content={stripLeadingPartLabel(part.partText)}
                      className="prose-p:my-0"
                    />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0.5 pb-2.5 px-0">
                <div className="pl-3 border-l-2 border-primary/50 py-1 text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                  <div className="text-[11px] font-semibold text-primary mb-1">সমাধান:</div>
                  <RichText
                    content={part.answerText || defaultExplanation || "সমাধান নির্দেশিকা সংরক্ষিত নেই"}
                    className="prose-p:my-0"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function QuestionExplanation({
  questionId,
  explanation: initialExplanation,
  title = "সমাধান / ব্যাখ্যা",
  onUnlockClick,
}: {
  questionId?: string;
  explanation: string;
  title?: string;
  onUnlockClick?: () => void;
}) {
  const [revealedExplanation, setRevealedExplanation] = React.useState<string | null>(
    initialExplanation || null,
  );
  const [isLocked, setIsLocked] = React.useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);
  const requestedRef = React.useRef(false);

  const { data: billingStatus } = useBillingStatus();
  const revealMutation = useRevealExplanation();

  const isPro = billingStatus?.subscription?.isPro ?? false;
  const limit = billingStatus?.explanationQuota?.limit ?? 10;
  const remaining = isPro ? Infinity : (billingStatus?.explanationQuota?.remaining ?? limit);

  React.useEffect(() => {
    if (requestedRef.current || isPro || !questionId) return;
    requestedRef.current = true;

    if (remaining <= 0) {
      setIsLocked(true);
      return;
    }

    revealMutation
      .mutateAsync(questionId)
      .then((res) => {
        if (res.explanation) {
          setRevealedExplanation(res.explanation);
        }
        setIsLocked(false);
      })
      .catch((err: { code?: string; status?: number; error?: { code?: string } }) => {
        if (
          err?.code === "DAILY_LIMIT_REACHED" ||
          err?.status === 403 ||
          err?.error?.code === "DAILY_LIMIT_REACHED" ||
          remaining <= 0
        ) {
          setIsLocked(true);
        }
      });
  }, [questionId, isPro, remaining, revealMutation]);

  const handleOpenUpgrade = () => {
    if (onUnlockClick) {
      onUnlockClick();
    } else {
      setIsUpgradeOpen(true);
    }
  };

  const quotaBadge = isPro ? (
    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
      প্রো মেম্বার • আনলিমিটেড ব্যাখ্যা
    </span>
  ) : (
    <span className="text-[11px] font-medium text-muted-foreground">
      দৈনিক বাকি: {toBengaliNumber(remaining)}/{toBengaliNumber(limit)}
    </span>
  );

  return (
    <>
      <div className="pt-3 border-t border-border/40 mt-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {quotaBadge}
            {!isPro && (
              <button
                type="button"
                onClick={handleOpenUpgrade}
                className="text-[11px] font-semibold text-primary hover:underline ml-1 cursor-pointer bg-transparent border-none p-0"
              >
                আপগ্রেড
              </button>
            )}
          </div>
        </div>

        {isLocked ? (
          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-6 text-center">
            <div className="select-none blur-xs opacity-25 text-xs leading-relaxed text-muted-foreground">
              {revealedExplanation ||
                initialExplanation ||
                "এখানে প্রশ্নের সম্পূর্ণ বিস্তারিত ব্যাখ্যা ও সলিউশন রয়েছে। সঠিক কনসেপ্ট এবং শর্টকাট টেকনিকসহ বিস্তারিত আলোচনা..."}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-4 backdrop-blur-xs">
              <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-2 border border-amber-500/20">
                <Lock className="size-4.5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                দৈনিক ফ্রি {toBengaliNumber(limit)}টি ব্যাখ্যার সীমা শেষ!
              </h4>
              <p className="text-xs text-muted-foreground mt-1 mb-3 max-w-sm">
                আনলিমিটেড ব্যাখ্যা, শর্টকাট ট্রিকস ও AI ডাউট সলভার পেতে প্রো-তে আপগ্রেড করো।
              </p>
              <Button
                size="sm"
                onClick={handleOpenUpgrade}
                className="bg-gradient-to-r from-teal-500 to-indigo-600 font-semibold text-xs text-white shadow-sm hover:opacity-95 cursor-pointer"
              >
                <Sparkle className="size-3.5 fill-white mr-1.5" />
                আনলিমিটেড আনলক করো
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <RichText
              content={revealedExplanation || initialExplanation}
              className="text-foreground text-xs sm:text-sm"
            />
            {!isPro && (
              <div className="mt-3 pt-2.5 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="text-[11px]">দৈনিক আরও দ্রুত প্রস্তুতি ও আনলিমিটেড ব্যাখ্যার জন্য</span>
                <button
                  type="button"
                  onClick={handleOpenUpgrade}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  <Sparkle className="size-3 text-primary" />
                  <span>প্রো আপগ্রেড করুন →</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <UpgradeDialog
        open={isUpgradeOpen}
        onOpenChange={setIsUpgradeOpen}
        onUpgrade={() => {
          setIsUpgradeOpen(false);
          window.location.href = "/checkout";
        }}
      />
    </>
  );
}

function useQuestionOptionSelection(
  controlledSelectedOptionId: string | null | undefined,
  controlledOnSelectOption?: (optionId: string) => void,
  interactiveMode: QuestionCardProps["interactiveMode"] = "practice",
  showAnswer = false,
) {
  const [internalSelectedOptionId, setInternalSelectedOptionId] = React.useState<string | null>(
    null,
  );
  const [internalRevealed, setInternalRevealed] = React.useState<boolean>(showAnswer);

  const selectedOptionId =
    controlledSelectedOptionId !== undefined
      ? controlledSelectedOptionId
      : internalSelectedOptionId;

  const isRevealed =
    interactiveMode === "live_exam"
      ? false
      : showAnswer || internalRevealed || Boolean(selectedOptionId);

  const handleSelectOption = (optionId: string) => {
    if (interactiveMode === "live_exam") {
      controlledOnSelectOption?.(optionId);
      return;
    }

    if (controlledOnSelectOption) {
      controlledOnSelectOption(optionId);
    } else {
      setInternalSelectedOptionId(optionId);
    }
    setInternalRevealed(true);
  };

  return { selectedOptionId, isRevealed, handleSelectOption };
}

import { WrittenAnswerUploader } from "@/components/exam/written-answer-uploader";

interface QuestionAnswersProps {
  question: QuestionCardProps["question"];
  options: NonNullable<QuestionCardProps["question"]["options"]>;
  parts: NonNullable<QuestionCardProps["question"]["parts"]>;
  selectedOptionId: string | null;
  isRevealed: boolean;
  interactiveMode?: "practice" | "live_exam" | "view";
  showAnswer: boolean;
  onSelectOption: (optionId: string) => void;
  writtenPages?: WrittenPageItem[];
  onWrittenPagesChange?: (pages: WrittenPageItem[]) => void;
  evaluatedScripts?: EvaluatedScriptItem[];
}

function QuestionAnswers({
  question,
  options,
  parts,
  selectedOptionId,
  isRevealed,
  interactiveMode = "practice",
  showAnswer,
  onSelectOption,
  writtenPages,
  onWrittenPagesChange,
  evaluatedScripts,
}: QuestionAnswersProps) {
  const isMcq = question.qType === "mcq" || options.length > 0;
  const isWritten = question.qType === "written" || parts.length > 0;

  return (
    <>
      {isMcq && options.length > 0 && (
        <McqOptions
          options={options}
          selectedOptionId={selectedOptionId}
          isRevealed={isRevealed}
          interactiveMode={interactiveMode}
          onSelectOption={onSelectOption}
        />
      )}

      {isWritten && parts.length > 0 && (
        <WrittenParts
          parts={parts}
          defaultExplanation={question.explanation}
          defaultValue={showAnswer || isRevealed ? parts.map((p) => p.id) : []}
          interactiveMode={interactiveMode}
        />
      )}

      {isWritten &&
        (interactiveMode === "live_exam" ||
          (writtenPages && writtenPages.length > 0) ||
          (evaluatedScripts && evaluatedScripts.length > 0)) && (
          <WrittenAnswerUploader
            questionId={question.id}
            writtenPages={writtenPages}
            onWrittenPagesChange={onWrittenPagesChange}
            evaluatedScripts={evaluatedScripts}
            interactiveMode={interactiveMode}
          />
        )}

      {isRevealed && parts.length === 0 && question.explanation && (
        <QuestionExplanation
          questionId={question.id}
          explanation={question.explanation}
          title="সমাধান / ব্যাখ্যা"
        />
      )}
    </>
  );
}

export function QuestionCard({
  question,
  index,
  showAnswer = false,
  selectedOptionId: controlledSelectedOptionId,
  onSelectOption: controlledOnSelectOption,
  writtenPages,
  onWrittenPagesChange,
  evaluatedScripts,
  interactiveMode = "practice",
}: QuestionCardProps) {
  const options = question.options || [];
  const rawParts = question.parts || [];
  const _isWritten = question.qType === "written" || rawParts.length > 0;

  const parts = React.useMemo(() => {
    if (rawParts.length === 0) return [];
    const seen = new Set<string>();
    const uniqueParts: typeof rawParts = [];
    for (const p of rawParts) {
      const key = p.partText.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueParts.push(p);
      }
    }
    // If the only part is identical to questionText, don't duplicate it
    if (
      uniqueParts.length === 1 &&
      uniqueParts[0]?.partText?.trim() === question.questionText?.trim()
    ) {
      return [];
    }
    return uniqueParts;
  }, [rawParts, question.questionText]);

  const stemText = question.questionText || question.contextText || "";

  const { selectedOptionId, isRevealed, handleSelectOption } = useQuestionOptionSelection(
    controlledSelectedOptionId,
    controlledOnSelectOption,
    interactiveMode,
    showAnswer,
  );

  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = React.useState<boolean>(false);

  const handleToggleBookmark = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    if (next) {
      toast.success("প্রশ্নটি বুকমার্কে সংরক্ষিত হয়েছে!");
    } else {
      toast.info("প্রশ্নটি বুকমার্ক থেকে সরানো হয়েছে");
    }
  };

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 rounded-xl border border-border/80 bg-card p-3.5 sm:p-5 shadow-xs transition-shadow duration-200 hover:shadow-sm">
      <QuestionHeader
        index={index}
        sources={question.sources}
        topic={question.topic}
        isBookmarked={isBookmarked}
        onToggleBookmark={handleToggleBookmark}
        questionId={question.id}
      />

      <ShareSheet
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        url={`/qb/questions/${question.id}`}
        title="প্রশ্ন শেয়ার করুন"
        shareText={question.questionText}
      />

      <div className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
        <RichText content={stemText} />
      </div>

      <QuestionAnswers
        question={question}
        options={options}
        parts={parts}
        selectedOptionId={selectedOptionId}
        isRevealed={isRevealed}
        interactiveMode={interactiveMode}
        showAnswer={showAnswer}
        onSelectOption={handleSelectOption}
        writtenPages={writtenPages}
        onWrittenPagesChange={onWrittenPagesChange}
        evaluatedScripts={evaluatedScripts}
      />
    </div>
  );
}
