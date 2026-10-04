"use client";

import Link from "next/link";
import { CheckCircle, Clock, Play, Refresh, Trophy, XCircle } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, toBengaliNumber } from "@/lib/utils";

export type ExamSolveFilter = "all" | "correct" | "wrong" | "unanswered";

interface ExamResultSummaryProps {
  exam: {
    id: string;
    title: string;
    questionCount: number;
    durationMinutes: number;
  };
  submission: {
    score: string;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    timeSpentSeconds: number;
  } | null;
  totalQuestions: number;
  accuracy: number;
  filter: ExamSolveFilter;
  onFilterChange: (filter: ExamSolveFilter) => void;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${toBengaliNumber(secs)} সেকেন্ড`;
  }
  return `${toBengaliNumber(mins)} মিনিট ${toBengaliNumber(secs)} সেকেন্ড`;
}

export function ExamResultSummary({
  exam,
  submission,
  totalQuestions,
  accuracy,
  filter,
  onFilterChange,
  correctCount,
  wrongCount,
  unansweredCount,
}: ExamResultSummaryProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Trophy className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {exam.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              মোট প্রশ্ন: {toBengaliNumber(totalQuestions)} টি • নির্ধারিত সময়:{" "}
              {toBengaliNumber(exam.durationMinutes)} মিনিট
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/exam/custom" />}
            className="rounded-xl font-semibold gap-1.5 cursor-pointer"
          >
            <Refresh className="size-3.5" />
            <span>নতুন পরীক্ষা</span>
          </Button>
          <Button
            size="sm"
            render={<Link href={`/exam/${exam.id}/take`} />}
            className="rounded-xl font-bold gap-1.5 shadow-2xs cursor-pointer"
          >
            <Play className="size-3.5 fill-current" />
            <span>পুনরায় দিন</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
        <div className="flex flex-col p-4 rounded-xl bg-primary/5 border border-primary/15">
          <span className="text-xs font-medium text-muted-foreground">অর্জিত স্কোর</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-primary font-mono">
              {toBengaliNumber(submission?.score || "0")}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              / {toBengaliNumber(totalQuestions)}
            </span>
          </div>
        </div>

        <div className="flex flex-col p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">সঠিক উত্তর</span>
            <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {toBengaliNumber(correctCount)}
          </span>
        </div>

        <div className="flex flex-col p-4 rounded-xl bg-destructive/5 border border-destructive/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">ভুল উত্তর</span>
            <XCircle className="size-4 text-destructive" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-destructive font-mono mt-1">
            {toBengaliNumber(wrongCount)}
          </span>
        </div>

        <div className="flex flex-col p-4 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">সময় ও নির্ভুলতা</span>
            <Clock className="size-4 text-muted-foreground" />
          </div>
          <span className="text-sm sm:text-base font-bold text-foreground font-mono mt-1 line-clamp-1">
            {toBengaliNumber(accuracy)}% নির্ভুল
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
            ব্যয়িত সময়: {formatDuration(submission?.timeSpentSeconds || 0)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pt-5 border-t border-border/60 mt-5 no-scrollbar">
        {[
          { id: "all", label: "সব প্রশ্ন", count: totalQuestions },
          { id: "correct", label: "সঠিক উত্তর", count: correctCount },
          { id: "wrong", label: "ভুল উত্তর", count: wrongCount },
          { id: "unanswered", label: "উত্তর দেওয়া হয়নি", count: unansweredCount },
        ].map((tab) => {
          const isActive = filter === tab.id;
          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(tab.id as ExamSolveFilter)}
              className={cn(
                "h-9 px-3.5 rounded-lg text-xs font-bold gap-2 cursor-pointer shrink-0",
                !isActive &&
                  "border-border/70 text-muted-foreground hover:text-foreground bg-muted/30",
              )}
            >
              <span>{tab.label}</span>
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className={cn(
                  "px-1.5 py-0 text-[10px] font-mono h-4.5 min-w-4.5 justify-center",
                  isActive
                    ? "bg-primary-foreground text-primary font-bold"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {toBengaliNumber(tab.count)}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
