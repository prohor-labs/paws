"use client";

import * as React from "react";
import {
  Activity,
  ArrowLeft,
  Atom,
  BookOpen,
  Briefcase,
  Calculator,
  Chart,
  Check,
  ChevronDown,
  Cpu,
  Dna,
  Flask,
  Global,
  GraduationCap,
  Home,
  Language,
  Leaf,
  Lightbulb,
  Pulse,
} from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { CustomExamSubject } from "@/lib/consts/custom-exam";
import { cn, toBengaliNumber } from "@/lib/utils";

export type QTypeSelection = "mcq" | "written" | "mixed";

export interface SelectedTopicItem {
  id: string;
  name: string;
  questionCount: number;
}

export interface SelectedChapterItem {
  id: string;
  name: string;
  questionCount: number;
  topics?: SelectedTopicItem[];
}

export interface SubjectChapterGroup {
  readonly subjectId: string;
  readonly subjectName: string;
  readonly iconKey?: string;
  readonly chapters: readonly SelectedChapterItem[];
}

export type ExamStandardType = "all" | "university" | "engineering" | "medical" | "board" | "bcs";

export interface ExamStandardOption {
  id: ExamStandardType;
  title: string;
  subtitle: string;
  description: string;
  sourceTypes: string[];
  icon: React.ComponentType<{ className?: string }>;
  badgeText?: string;
}

export const EXAM_STANDARDS: ExamStandardOption[] = [
  {
    id: "all",
    title: "সব স্ট্যান্ডার্ড (মিশ্র)",
    subtitle: "সকল সোর্স অন্তর্ভুক্ত",
    description: "বিশ্ববিদ্যালয়, মেডিকেল, ইঞ্জিনিয়ারিং ও বোর্ড পরীক্ষার সকল প্রশ্ন মিলিয়ে।",
    sourceTypes: [],
    icon: Global,
    badgeText: "জনপ্রিয়",
  },
  {
    id: "university",
    title: "ভার্সিটি স্ট্যান্ডার্ড",
    subtitle: "জেনারেল বিশ্ববিদ্যালয় ভর্তি",
    description: "ঢাকা বিশ্ববিদ্যালয় (ক, খ, গ, ঘ), জাবি, রাবি, চবি ও জিএসটি গুচ্ছ ভর্তি প্রশ্ন।",
    sourceTypes: ["university"],
    icon: GraduationCap,
  },
  {
    id: "engineering",
    title: "ইঞ্জিনিয়ারিং স্ট্যান্ডার্ড",
    subtitle: "প্রকৌশল বিশ্ববিদ্যালয় ভর্তি",
    description: "বুয়েট, কুয়েট, রুয়েট, চুয়েট ও আইইউটি ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার প্রশ্ন।",
    sourceTypes: ["engineering"],
    icon: Cpu,
  },
  {
    id: "medical",
    title: "মেডিকেল স্ট্যান্ডার্ড",
    subtitle: "মেডিকেল ও ডেন্টাল ভর্তি",
    description: "সরকারি মেডিকেল ও ডেন্টাল কলেজ ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন।",
    sourceTypes: ["medical"],
    icon: Pulse,
  },
  {
    id: "board",
    title: "বোর্ড / এইচএসসি স্ট্যান্ডার্ড",
    subtitle: "একাডেমিক ও বোর্ড পরীক্ষা",
    description: "ঢাকা, রাজশাহী, চট্টগ্রাম ইত্যাদি সকল শিক্ষা বোর্ডের বিগত বছরের এইচএসসি প্রশ্ন।",
    sourceTypes: ["board"],
    icon: BookOpen,
  },
  {
    id: "bcs",
    title: "বিসিএস ও সরকারি চাকরি",
    subtitle: "চাকরি প্রস্তুতি",
    description: "বিসিএস প্রিলিমিনারি ও বিভিন্ন সরকারি ব্যাংক/মন্ত্রণালয়ের নিয়োগ প্রশ্ন।",
    sourceTypes: ["bcs", "bank_job"],
    icon: Briefcase,
  },
];

const TOTAL_STEPS = 4;
const STEP_NUMBERS = [1, 2, 3, 4] as const;

const QUESTION_TYPE_OPTIONS = [
  { id: "mcq", label: "বহুনির্বাচনী (MCQ)" },
  { id: "written", label: "লিখিত (CQ / Written)" },
  { id: "mixed", label: "বহুনির্বাচনী + লিখিত (MCQ + CQ)" },
] as const;

function SubjectIconRenderer({ iconKey }: { iconKey?: string }) {
  switch (iconKey) {
    case "BookOpen":
      return <BookOpen className="size-5 text-primary" />;
    case "Global":
      return <Global className="size-5 text-emerald-500" />;
    case "Atom":
      return <Atom className="size-5 text-blue-500" />;
    case "Flask":
      return <Flask className="size-5 text-amber-500" />;
    case "Dna":
      return <Dna className="size-5 text-rose-500" />;
    case "Lightbulb":
      return <Lightbulb className="size-5 text-yellow-500" />;
    case "Pulse":
      return <Pulse className="size-5 text-purple-500" />;
    case "Language":
      return <Language className="size-5 text-indigo-500" />;
    case "Chart":
      return <Chart className="size-5 text-teal-500" />;
    case "Leaf":
      return <Leaf className="size-5 text-emerald-600" />;
    case "Home":
      return <Home className="size-5 text-orange-500" />;
    case "Calculator":
      return <Calculator className="size-6 text-cyan-500" />;
    case "Cpu":
      return <Cpu className="size-5 text-violet-500" />;
    case "Briefcase":
      return <Briefcase className="size-5 text-sky-500" />;
    default:
      return <Activity className="size-5 text-primary" />;
  }
}

function StepProgress({ step }: { step: number }) {
  return (
    <div className="flex justify-between w-full gap-1.5">
      {STEP_NUMBERS.map((number) => (
        <div
          key={number}
          className={cn("w-full h-1.5 rounded-[3px]", number <= step ? "bg-primary" : "bg-muted")}
        />
      ))}
    </div>
  );
}

function StepHeader({
  step,
  title,
  subtitle,
  onBack,
  backLabel,
}: {
  step: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pb-3 border-b border-border/40 flex flex-col gap-2">
      {onBack && (
        <div className="flex w-full justify-start">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-xl px-3 py-1.5 h-8 gap-1.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer max-w-full"
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">{backLabel || "পিছনে"}</span>
          </Button>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold shrink-0">
          স্টেপ {toBengaliNumber(step)}/{toBengaliNumber(TOTAL_STEPS)}
        </Badge>
      </div>
      <StepProgress step={step} />
    </div>
  );
}

/* =========================================================================
   STEP 1: SUBJECT SELECTION
   ========================================================================= */

interface CustomExamStep1Props {
  subjects: readonly CustomExamSubject[];
  selectedSubjectIds: string[];
  onToggleSubject: (subject: CustomExamSubject) => void;
  onNext: () => void;
}

export function CustomExamStep1({
  subjects,
  selectedSubjectIds,
  onToggleSubject,
  onNext,
}: CustomExamStep1Props) {
  const selectedSet = React.useMemo(() => new Set(selectedSubjectIds), [selectedSubjectIds]);
  const [query, setQuery] = React.useState("");

  const filteredSubjects = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return subjects;
    return subjects.filter(
      (sub) => sub.name.toLowerCase().includes(q) || sub.targetName?.toLowerCase().includes(q),
    );
  }, [subjects, query]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">বিষয় নির্বাচন করো</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              যে যে বিষয়ে পরীক্ষা দিতে চাও সেগুলো সিলেক্ট করো
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              aria-label="বিষয় খুঁজুন"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="বিষয় খুঁজুন..."
              className="w-full sm:w-56 rounded-full border border-border bg-background px-4 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[36px]"
            />
            <Badge variant="secondary" className="px-2.5 py-1 text-xs font-bold shrink-0">
              স্টেপ ১/{toBengaliNumber(TOTAL_STEPS)}
            </Badge>
          </div>
        </div>

        {filteredSubjects.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">কোনো বিষয় খুঁজে পাওয়া যায়নি।</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {filteredSubjects.map((sub) => {
              const isSelected = selectedSet.has(sub.id);
              const isDisabled = sub.questionCount === 0;
              return (
                <button
                  key={sub.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onToggleSubject(sub)}
                  className={cn(
                    "group relative w-full text-left bg-card transition-all border rounded-xl sm:rounded-2xl overflow-hidden shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring min-h-[54px]",
                    isDisabled
                      ? "border-border/50 opacity-50 cursor-not-allowed"
                      : "hover:bg-muted/40 cursor-pointer",
                    !isDisabled &&
                      (isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                        : "border-border/80 hover:border-primary/40"),
                  )}
                >
                  <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "size-8 sm:size-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          isSelected ? "bg-primary/15" : "bg-muted/70 group-hover:bg-muted",
                        )}
                      >
                        <SubjectIconRenderer iconKey={sub.iconKey} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3
                          className={cn(
                            "text-xs sm:text-sm font-semibold truncate transition-colors",
                            isSelected
                              ? "text-primary font-bold"
                              : "text-foreground group-hover:text-primary",
                          )}
                        >
                          {sub.name}
                        </h3>
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          {isDisabled
                            ? "কোনো প্রশ্ন নেই"
                            : `${toBengaliNumber(sub.questionCount ?? 0)} টি প্রশ্ন`}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "size-5 rounded-md border flex items-center justify-center transition-all shrink-0 ml-2",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border/80 bg-background group-hover:border-primary/50",
                      )}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[2.5]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSubjectIds.length > 0 && (
        <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] sm:bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4">
          <div className="pointer-events-auto w-full max-w-3xl flex items-center justify-between gap-2.5 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl sm:rounded-full border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
            <span className="text-xs sm:text-sm font-semibold text-foreground pl-1.5 sm:pl-2 truncate">
              {toBengaliNumber(selectedSubjectIds.length)} টি বিষয় নির্বাচিত
            </span>
            <Button
              type="button"
              onClick={onNext}
              className="rounded-lg sm:rounded-full px-5 sm:px-8 py-2 h-9 sm:h-10 text-xs sm:text-sm font-bold shadow-md cursor-pointer shrink-0 min-h-[38px]"
            >
              এগিয়ে যাও
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   STEP 2: CHAPTERS & TOPICS SELECTION
   ========================================================================= */

interface CustomExamStep2Props {
  headerLabel: string;
  chapterLabel: string;
  chapterGroups: readonly SubjectChapterGroup[];
  selectedChapterIds: string[];
  selectedTopicIds: string[];
  onToggleChapter: (chapterId: string) => void;
  onToggleTopic: (topicId: string, chapterId: string) => void;
  onToggleGroupAll: (group: SubjectChapterGroup) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CustomExamStep2({
  headerLabel,
  chapterGroups,
  selectedChapterIds,
  selectedTopicIds,
  onToggleChapter,
  onToggleTopic,
  onToggleGroupAll,
  onBack,
  onNext,
}: CustomExamStep2Props) {
  const selectedChapterSet = React.useMemo(() => new Set(selectedChapterIds), [selectedChapterIds]);
  const selectedTopicSet = React.useMemo(() => new Set(selectedTopicIds), [selectedTopicIds]);
  const [expandedTopics, setExpandedTopics] = React.useState<Record<string, boolean>>({});

  const toggleTopicExpand = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTopics((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const totalSelectedCount = selectedChapterIds.length + selectedTopicIds.length;

  return (
    <div className="flex flex-col gap-4">
      <StepHeader
        step={2}
        title="অধ্যায় ও টপিক নির্বাচন"
        subtitle="অধ্যায় বা নির্দিষ্ট টপিক বেছে নিন"
        onBack={onBack}
        backLabel={headerLabel}
      />

      <Accordion
        defaultValue={chapterGroups.map((g) => g.subjectId)}
        className="flex flex-col gap-3 mt-1"
      >
        {chapterGroups.map((group) => {
          const groupSelectedCount = group.chapters.filter((c) =>
            selectedChapterSet.has(c.id),
          ).length;
          const isGroupAllSelected =
            group.chapters.length > 0 && groupSelectedCount === group.chapters.length;

          return (
            <div
              key={group.subjectId}
              className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs"
            >
              <AccordionItem value={group.subjectId} className="border-none">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <SubjectIconRenderer iconKey={group.iconKey} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {group.subjectName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {groupSelectedCount > 0
                          ? `${toBengaliNumber(groupSelectedCount)}/${toBengaliNumber(group.chapters.length)} টি অধ্যায় সিলেক্টেড`
                          : `মোট ${toBengaliNumber(group.chapters.length)} টি অধ্যায়`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleGroupAll(group);
                      }}
                      className="h-7 px-2.5 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary/10 cursor-pointer"
                    >
                      {isGroupAllSelected ? "সব আনচেক" : "সব সিলেক্ট"}
                    </Button>
                    <AccordionTrigger className="p-1 hover:no-underline" />
                  </div>
                </div>

                <AccordionContent className="p-3 pb-3">
                  {group.chapters.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-muted-foreground">
                      এই বিষয়ে কোনো অধ্যায় নেই।
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {group.chapters.map((chapter) => {
                        const isChapterChecked = selectedChapterSet.has(chapter.id);
                        const hasTopics = (chapter.topics?.length ?? 0) > 0;
                        const isTopicsOpen = expandedTopics[chapter.id] ?? false;

                        return (
                          <div
                            key={chapter.id}
                            className={cn(
                              "rounded-xl border transition-all overflow-hidden",
                              isChapterChecked
                                ? "border-primary/60 bg-primary/5"
                                : "border-border/60 bg-background",
                            )}
                          >
                            <div className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-muted/30">
                              <button
                                type="button"
                                onClick={() => onToggleChapter(chapter.id)}
                                className="flex items-center gap-2.5 min-w-0 pr-2 cursor-pointer bg-transparent border-none text-left flex-1"
                              >
                                <Checkbox
                                  checked={isChapterChecked}
                                  onCheckedChange={() => onToggleChapter(chapter.id)}
                                  className="pointer-events-none"
                                  aria-label={chapter.name}
                                />
                                <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                  {chapter.name}
                                </span>
                              </button>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  {toBengaliNumber(chapter.questionCount)} টি প্রশ্ন
                                </span>
                                {hasTopics && (
                                  <button
                                    type="button"
                                    onClick={(e) => toggleTopicExpand(chapter.id, e)}
                                    className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-0.5 cursor-pointer border-none bg-transparent"
                                    title="টপিক দেখুন"
                                    aria-expanded={isTopicsOpen}
                                    aria-label={`${chapter.name} টপিক দেখুন`}
                                  >
                                    <span>টপিক</span>
                                    <ChevronDown
                                      className={cn(
                                        "size-3.5 transition-transform",
                                        isTopicsOpen && "rotate-180",
                                      )}
                                    />
                                  </button>
                                )}
                              </div>
                            </div>

                            {hasTopics && isTopicsOpen && (
                              <div className="px-4 py-2 border-t border-border/40 bg-muted/10 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {chapter.topics?.map((topic) => {
                                  const isTopicChecked =
                                    isChapterChecked || selectedTopicSet.has(topic.id);
                                  return (
                                    <button
                                      type="button"
                                      key={topic.id}
                                      onClick={() => onToggleTopic(topic.id, chapter.id)}
                                      className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 cursor-pointer text-xs border-none bg-transparent"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Checkbox
                                          checked={isTopicChecked}
                                          onCheckedChange={() =>
                                            onToggleTopic(topic.id, chapter.id)
                                          }
                                          className="pointer-events-none size-3.5"
                                          aria-label={topic.name}
                                        />
                                        <span className="truncate text-foreground text-[11px]">
                                          {topic.name}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-muted-foreground shrink-0">
                                        {toBengaliNumber(topic.questionCount)} Q
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>

      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] sm:bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4">
        <div className="pointer-events-auto w-full max-w-3xl flex items-center justify-between gap-2.5 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl sm:rounded-full border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
          <span className="text-xs sm:text-sm font-semibold text-foreground pl-1.5 sm:pl-2 truncate">
            {totalSelectedCount > 0
              ? `${toBengaliNumber(selectedChapterIds.length)} টি অধ্যায় নির্বাচিত`
              : "সকল অধ্যায় অন্তর্ভুক্ত"}
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="rounded-lg sm:rounded-full px-3 sm:px-4 py-1.5 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm font-semibold border-border/80 bg-background hover:bg-muted text-foreground cursor-pointer shrink-0 min-h-[36px]"
            >
              পিছনে
            </Button>
            <Button
              type="button"
              onClick={onNext}
              className="rounded-lg sm:rounded-full px-4 sm:px-8 py-1.5 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm font-bold shadow-md cursor-pointer shrink-0 min-h-[36px]"
            >
              এগিয়ে যাও
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 3: EXAM STANDARD / SOURCE SELECTION
   ========================================================================= */

interface CustomExamStepStandardProps {
  headerLabel: string;
  selectedStandard: ExamStandardType;
  selectedSourceTypes: string[];
  onSelectStandard: (standard: ExamStandardType, sourceTypes: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CustomExamStepStandard({
  headerLabel,
  selectedStandard,
  onSelectStandard,
  onBack,
  onNext,
}: CustomExamStepStandardProps) {
  const activeStandardObj =
    EXAM_STANDARDS.find((s) => s.id === selectedStandard) || EXAM_STANDARDS[0];

  return (
    <div className="flex flex-col gap-4">
      <StepHeader
        step={3}
        title="পরীক্ষার স্ট্যান্ডার্ড নির্বাচন"
        subtitle="কোন ধরনের পরীক্ষার স্ট্যান্ডার্ডে প্রশ্ন চান নির্বাচন করুন"
        onBack={onBack}
        backLabel={headerLabel}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
        {EXAM_STANDARDS.map((std) => {
          const isSelected = selectedStandard === std.id;
          const Icon = std.icon;

          return (
            <button
              key={std.id}
              type="button"
              onClick={() => onSelectStandard(std.id, std.sourceTypes)}
              className={cn(
                "group relative w-full text-left bg-card p-4 rounded-2xl border transition-all shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer min-h-[90px]",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                  : "border-border/80 hover:border-primary/40 hover:bg-muted/30",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5",
                      isSelected
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/80 text-muted-foreground group-hover:text-primary",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          "text-xs sm:text-sm font-bold truncate",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {std.title}
                      </h4>
                      {std.badgeText && (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
                          {std.badgeText}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-foreground/80 mt-0.5">
                      {std.subtitle}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {std.description}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "size-5 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border/80 bg-background group-hover:border-primary/50",
                  )}
                >
                  {isSelected && <Check className="size-3.5 stroke-[2.5]" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] sm:bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4">
        <div className="pointer-events-auto w-full max-w-3xl flex items-center justify-between gap-2.5 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl sm:rounded-full border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
          <span className="text-xs sm:text-sm font-semibold text-foreground pl-1.5 sm:pl-2 truncate">
            {activeStandardObj.title}
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="rounded-lg sm:rounded-full px-3 sm:px-4 py-1.5 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm font-semibold border-border/80 bg-background hover:bg-muted text-foreground cursor-pointer shrink-0 min-h-[36px]"
            >
              পিছনে
            </Button>
            <Button
              type="button"
              onClick={onNext}
              className="rounded-lg sm:rounded-full px-4 sm:px-8 py-1.5 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm font-bold shadow-md cursor-pointer shrink-0 min-h-[36px]"
            >
              এগিয়ে যাও
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 4: QUESTION TYPES, COUNTS & EXAM SETTINGS
   ========================================================================= */

interface CustomExamStep4Props {
  headerLabel: string;
  selectedQType: QTypeSelection;
  questionCount: number;
  mcqCount: number;
  writtenCount: number;
  durationMinutes: number;
  isNegativeMarking: boolean;
  selectedChapters: readonly SelectedChapterItem[];
  selectedStandard: ExamStandardType;
  isPending: boolean;
  onQTypeChange: (type: QTypeSelection) => void;
  onQuestionCountChange: (count: number) => void;
  onMcqCountChange: (count: number) => void;
  onWrittenCountChange: (count: number) => void;
  onDurationMinutesChange: (duration: number) => void;
  onNegativeMarkingChange: (enabled: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const MCQ_PRESETS = [10, 15, 20, 25, 30, 50, 75, 100];
const WRITTEN_PRESETS = [2, 3, 5, 8, 10, 15];
const DURATION_PRESETS = [15, 20, 30, 45, 60, 90];

export function CustomExamStep4({
  headerLabel,
  selectedQType,
  questionCount,
  mcqCount,
  writtenCount,
  durationMinutes,
  isNegativeMarking,
  selectedChapters,
  selectedStandard,
  isPending,
  onQTypeChange,
  onQuestionCountChange,
  onMcqCountChange,
  onWrittenCountChange,
  onDurationMinutesChange,
  onNegativeMarkingChange,
  onBack,
  onSubmit,
}: CustomExamStep4Props) {
  const standardObj = EXAM_STANDARDS.find((s) => s.id === selectedStandard) || EXAM_STANDARDS[0];

  const totalEffectiveQuestions =
    selectedQType === "mixed" ? mcqCount + writtenCount : questionCount;

  return (
    <div className="flex flex-col gap-4">
      <StepHeader
        step={4}
        title="পরীক্ষার সেটিংস ও ধরণ"
        subtitle="প্রশ্নের সংখ্যা, ধরণ ও সময় নির্ধারণ করুন"
        onBack={onBack}
        backLabel={headerLabel}
      />

      <FieldGroup className="gap-5 mt-2">
        {/* 1. Question Type Selection */}
        <Field className="gap-2">
          <FieldLabel className="text-xs sm:text-sm font-semibold text-foreground">
            প্রশ্নের ধরণ নির্বাচন
          </FieldLabel>
          <div className="p-1.5 grid w-full gap-2 items-stretch border bg-card border-border/80 rounded-2xl grid-cols-1 sm:grid-cols-3 shadow-xs">
            {QUESTION_TYPE_OPTIONS.map((item) => {
              const isSelected = selectedQType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onQTypeChange(item.id as QTypeSelection)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-center cursor-pointer transition-all duration-200 select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* 2. Question Counts based on Question Type */}
        {selectedQType === "mcq" && (
          <Card className="p-4 rounded-2xl border-border/80 shadow-xs">
            <CardContent className="p-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs sm:text-sm font-bold text-foreground">
                  মোট MCQ প্রশ্ন সংখ্যা
                </FieldLabel>
                <div className="relative w-24">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={questionCount}
                    onChange={(e) =>
                      onQuestionCountChange(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                    }
                    className="w-full rounded-xl pr-8 h-9 font-bold text-center bg-muted/20"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                    টি
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MCQ_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onQuestionCountChange(preset)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                      questionCount === preset
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border/60 hover:bg-muted text-foreground",
                    )}
                  >
                    {toBengaliNumber(preset)} টি
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedQType === "written" && (
          <Card className="p-4 rounded-2xl border-border/80 shadow-xs">
            <CardContent className="p-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs sm:text-sm font-bold text-foreground">
                  মোট লিখিত / সিকিউ (CQ) প্রশ্ন সংখ্যা
                </FieldLabel>
                <div className="relative w-24">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={questionCount}
                    onChange={(e) =>
                      onQuestionCountChange(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
                    }
                    className="w-full rounded-xl pr-8 h-9 font-bold text-center bg-muted/20"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                    টি
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {WRITTEN_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onQuestionCountChange(preset)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                      questionCount === preset
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border/60 hover:bg-muted text-foreground",
                    )}
                  >
                    {toBengaliNumber(preset)} টি
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedQType === "mixed" && (
          <Card className="p-4 rounded-2xl border-border/80 shadow-xs space-y-4">
            <CardContent className="p-0 flex flex-col gap-4">
              {/* MCQ Count */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    বহুনির্বাচনী (MCQ) প্রশ্ন সংখ্যা
                  </span>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={mcqCount}
                      onChange={(e) =>
                        onMcqCountChange(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                      }
                      className="w-full rounded-xl pr-8 h-8 font-bold text-center bg-muted/20"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      টি
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 25, 30, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onMcqCountChange(preset)}
                      className={cn(
                        "px-2.5 py-0.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                        mcqCount === preset
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border/60 hover:bg-muted text-foreground",
                      )}
                    >
                      {toBengaliNumber(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Written Count */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    লিখিত (CQ / Written) প্রশ্ন সংখ্যা
                  </span>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={writtenCount}
                      onChange={(e) =>
                        onWrittenCountChange(Math.max(1, Math.min(30, Number(e.target.value) || 1)))
                      }
                      className="w-full rounded-xl pr-8 h-8 font-bold text-center bg-muted/20"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      টি
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[2, 3, 4, 5, 8, 10].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onWrittenCountChange(preset)}
                      className={cn(
                        "px-2.5 py-0.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                        writtenCount === preset
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border/60 hover:bg-muted text-foreground",
                      )}
                    >
                      {toBengaliNumber(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mixed Summary Badge */}
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">মোট মিশ্র প্রশ্ন:</span>
                <span className="font-bold text-primary">
                  {toBengaliNumber(mcqCount + writtenCount)} টি ({toBengaliNumber(mcqCount)} MCQ +{" "}
                  {toBengaliNumber(writtenCount)} CQ)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. Duration Selection */}
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs">
          <CardContent className="p-0 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <FieldLabel className="text-xs sm:text-sm font-bold text-foreground">
                পরীক্ষার সময় (মিনিট)
              </FieldLabel>
              <div className="relative w-24">
                <Input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) =>
                    onDurationMinutesChange(
                      Math.max(1, Math.min(180, Number(e.target.value) || 20)),
                    )
                  }
                  className="w-full rounded-xl pr-8 h-9 font-bold text-center bg-muted/20"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                  মি.
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onDurationMinutesChange(preset)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                    durationMinutes === preset
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border/60 hover:bg-muted text-foreground",
                  )}
                >
                  {toBengaliNumber(preset)} মি.
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Negative Marking & Summary */}
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-foreground">নেগেটিভ মার্কিং</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {isNegativeMarking
                  ? "চালু (প্রতি ভুল উত্তরে ০.২৫ মার্ক কাটা যাবে)"
                  : "বন্ধ (ভুল উত্তরের জন্য কোনো মার্ক কাটা যাবে না)"}
              </span>
            </div>
            <Switch
              checked={isNegativeMarking}
              onCheckedChange={onNegativeMarkingChange}
              aria-label="নেগেটিভ মার্কিং সক্রিয় করুন"
            />
          </CardContent>
        </Card>

        {/* 5. Review Selected Items Accordion */}
        <Accordion className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <AccordionItem value="selected-summary" className="border-none">
            <AccordionTrigger className="px-4 py-3.5 text-xs sm:text-sm font-medium hover:no-underline">
              <span>
                নির্বাচিত বিবরণ দেখুন ({standardObj.title} · {toBengaliNumber(selectedChapters.length)}{" "}
                টি অধ্যায়)
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-col gap-2 pt-1 border-t border-border/40 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">স্ট্যান্ডার্ড:</span>
                  <span className="font-semibold text-foreground">{standardObj.title}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedChapters.length === 0 ? (
                    <span className="text-muted-foreground">সকল অধ্যায় অন্তর্ভুক্ত থাকবে।</span>
                  ) : (
                    selectedChapters.map((chapter) => (
                      <Badge
                        key={chapter.id}
                        variant="outline"
                        className="px-2.5 py-1 text-xs font-medium"
                      >
                        {chapter.name}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </FieldGroup>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] sm:bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4">
        <div className="pointer-events-auto w-full max-w-3xl flex items-center justify-between gap-2 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl sm:rounded-full border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex flex-col min-w-0 pl-1 sm:pl-2">
            <span className="text-xs sm:text-sm font-bold text-foreground truncate">
              {toBengaliNumber(totalEffectiveQuestions)} টি প্রশ্ন ·{" "}
              {toBengaliNumber(durationMinutes)} মিনিট
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
              {standardObj.title} {isNegativeMarking ? "• নেগেটিভ ০.২৫" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isPending}
              className="rounded-lg sm:rounded-full px-3 sm:px-4 py-1.5 sm:py-2 h-8 sm:h-9 text-xs sm:text-sm font-semibold border-border/80 bg-background hover:bg-muted text-foreground cursor-pointer shrink-0 min-h-[36px]"
            >
              পিছনে
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              isLoading={isPending}
              className="rounded-lg sm:rounded-full px-5 sm:px-8 py-2 h-9 sm:h-10 text-xs sm:text-sm font-bold bg-green-600 hover:bg-green-700 text-white shadow-md cursor-pointer shrink-0 min-h-[38px]"
            >
              পরীক্ষা শুরু করো
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
