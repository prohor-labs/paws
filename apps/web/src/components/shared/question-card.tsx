"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bookmark, CheckCircle, Share } from "@/components/icons";
import { RichText } from "@/components/shared/rich-text";
import { ShareDialog } from "@/components/shared/share-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn, toBengaliNumber } from "@/lib/utils";
import type { QBQuestion } from "@/types";

const DEFAULT_OPTION_KEYS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];

interface WrittenPageItem {
  pageNumber: number;
  imageUrl: string;
}

interface EvaluatedScriptItem {
  id: string;
  pageNumber: number;
  imageUrl: string;
  annotatedImageUrl?: string | null;
  marksAwarded?: string | null;
  maxMarks?: number | null;
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
  topics?: QBQuestion["topics"];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  questionId: string;
}

function QuestionHeader({
  index,
  sources,
  topics,
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

        {topics && topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {topics.map((t) => (
              <span
                key={t.id}
                className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-muted text-muted-foreground inline-flex items-center"
              >
                {t.name}
              </span>
            ))}
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
  explanation,
  title = "ব্যাখ্যা",
}: {
  explanation: string;
  title?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:p-4 text-xs sm:text-sm text-foreground animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 font-semibold text-primary text-xs">
        <CheckCircle size={15} />
        <span>{title}</span>
      </div>
      <RichText content={explanation} className="text-muted-foreground mt-0.5" />
    </div>
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
        <QuestionExplanation explanation={question.explanation} title="সমাধান / ব্যাখ্যা" />
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
        topics={question.topics}
        isBookmarked={isBookmarked}
        onToggleBookmark={handleToggleBookmark}
        questionId={question.id}
      />

      <ShareDialog
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
