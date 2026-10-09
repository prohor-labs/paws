import * as React from "react";
import { EmptyState, QuestionCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toBengaliNumber } from "@/lib/utils";
import type { QBChapter, QBQuestion, QBSubject, QBTopic } from "@/types";

export type QuestionTypeFilter = "all" | "mcq" | "written";

const QUESTIONS_PER_PAGE = 100;

interface TopicWiseViewProps {
  questions: readonly QBQuestion[];
  topics: readonly QBTopic[];
  subjects?: readonly QBSubject[];
  chapters?: readonly QBChapter[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  page?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  selectedSubjectSlug?: string;
  onSelectSubject?: (subjectSlug: string) => void;
  selectedChapterSlug?: string;
  onSelectChapter?: (chapterSlug: string) => void;
  selectedTopicId?: string;
  onSelectTopic?: (topicId: string) => void;
  qTypeFilter?: QuestionTypeFilter;
  onSelectQType?: (type: QuestionTypeFilter) => void;
  hideTopics?: boolean;
}

function getPageItems(currentPage: number, totalPages: number): (number | `ellipsis-${string}`)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis-end", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis-start", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}

export function TopicWiseView({
  questions,
  topics,
  subjects = [],
  chapters = [],
  answers,
  onSelectAnswer,
  page: controlledPage,
  totalPages: controlledTotalPages,
  totalCount: controlledTotalCount,
  onPageChange,
  selectedSubjectSlug = "all",
  onSelectSubject,
  selectedChapterSlug = "all",
  onSelectChapter,
  selectedTopicId: controlledSelectedTopicId,
  onSelectTopic,
  qTypeFilter: controlledQTypeFilter,
  onSelectQType,
  hideTopics = false,
}: TopicWiseViewProps) {
  const [internalTopicId, setInternalTopicId] = React.useState<string>("all");
  const [internalQType, setInternalQType] = React.useState<QuestionTypeFilter>("all");
  const [internalPage, setInternalPage] = React.useState<number>(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isServerDriven = Boolean(onPageChange);
  const selectedTopicId = controlledSelectedTopicId ?? internalTopicId;
  const qTypeFilter = controlledQTypeFilter ?? internalQType;
  const currentPage = controlledPage ?? internalPage;

  const childrenByParent = React.useMemo(() => {
    const map = new Map<string, QBTopic[]>();
    for (const topic of topics) {
      if (topic.parentId) {
        const list = map.get(topic.parentId) ?? [];
        list.push(topic);
        map.set(topic.parentId, list);
      }
    }
    return map;
  }, [topics]);

  const descendantIds = React.useCallback(
    (topicId: string): Set<string> => {
      const result = new Set<string>([topicId]);
      const stack = [topicId];
      while (stack.length > 0) {
        const current = stack.pop() as string;
        for (const child of childrenByParent.get(current) ?? []) {
          if (!result.has(child.id)) {
            result.add(child.id);
            stack.push(child.id);
          }
        }
      }
      return result;
    },
    [childrenByParent],
  );

  const mainTopics = React.useMemo(() => {
    return topics
      .filter((t) => !t.parentId)
      .map((t) => {
        const ids = descendantIds(t.id);
        const count = isServerDriven
          ? topics
              .filter((top) => ids.has(top.id))
              .reduce((acc, top) => acc + (top.questionCount ?? 0), 0)
          : questions.filter((q) => q.topicId && ids.has(q.topicId)).length;
        return { id: t.id, name: t.name, count };
      });
  }, [topics, questions, descendantIds, isServerDriven]);

  const subTopics = React.useMemo(() => {
    if (selectedTopicId === "all") return [];
    return (childrenByParent.get(selectedTopicId) ?? []).map((t) => {
      const ids = descendantIds(t.id);
      const count = isServerDriven
        ? topics
            .filter((top) => ids.has(top.id))
            .reduce((acc, top) => acc + (top.questionCount ?? 0), 0)
        : questions.filter((q) => q.topicId && ids.has(q.topicId)).length;
      return { id: t.id, name: t.name, count };
    });
  }, [selectedTopicId, childrenByParent, questions, descendantIds, isServerDriven, topics]);

  const handleSelectTopic = (topicId: string) => {
    if (onSelectTopic) {
      onSelectTopic(topicId);
    } else {
      setInternalTopicId(topicId);
      setInternalPage(1);
    }
  };

  const handleSelectQType = (type: QuestionTypeFilter) => {
    if (onSelectQType) {
      onSelectQType(type);
    } else {
      setInternalQType(type);
      setInternalPage(1);
    }
  };

  const filteredQuestions = React.useMemo(() => {
    if (isServerDriven) return questions;
    let result = questions;
    if (selectedTopicId !== "all") {
      const ids = descendantIds(selectedTopicId);
      result = result.filter((q) => q.topicId && ids.has(q.topicId));
    }
    if (qTypeFilter !== "all") {
      result = result.filter((q) => q.qType === qTypeFilter);
    }
    return result;
  }, [questions, selectedTopicId, qTypeFilter, descendantIds, isServerDriven]);

  const totalPages = isServerDriven
    ? (controlledTotalPages ?? 1)
    : Math.max(1, Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE));

  const paginatedQuestions = React.useMemo(() => {
    if (isServerDriven) return questions;
    const start = (currentPage - 1) * QUESTIONS_PER_PAGE;
    return filteredQuestions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [filteredQuestions, currentPage, isServerDriven, questions]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const pageNumbers = React.useMemo(
    () => getPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const totalDisplayCount = controlledTotalCount ?? questions.length;

  return (
    <div ref={containerRef} className="flex flex-col gap-3.5 mt-2 w-full">
      {subjects.length > 0 && (
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
            <Button
              type="button"
              variant={selectedSubjectSlug === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => onSelectSubject?.("all")}
              className="rounded-full text-xs font-bold cursor-pointer shrink-0 h-8 px-3.5 shadow-xs"
            >
              সব বিষয়
            </Button>
            {subjects.map((sub) => (
              <Button
                key={sub.id}
                type="button"
                variant={selectedSubjectSlug === sub.slug ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectSubject?.(sub.slug)}
                className="rounded-full text-xs font-bold cursor-pointer shrink-0 h-8 px-3.5 shadow-2xs border-border/80"
              >
                {sub.name}{" "}
                {sub.questionCount !== undefined && `(${toBengaliNumber(sub.questionCount)})`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {chapters.length > 0 && selectedSubjectSlug !== "all" && (
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
            <Button
              type="button"
              variant={selectedChapterSlug === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onSelectChapter?.("all")}
              className="rounded-lg text-xs font-semibold cursor-pointer shrink-0 h-7.5 px-3"
            >
              সকল অধ্যায়
            </Button>
            {chapters.map((ch) => (
              <Button
                key={ch.id}
                type="button"
                variant={selectedChapterSlug === ch.slug ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onSelectChapter?.(ch.slug)}
                className="rounded-lg text-xs font-semibold cursor-pointer shrink-0 h-7.5 px-3"
              >
                {ch.name}{" "}
                {ch.questionCount !== undefined && `(${toBengaliNumber(ch.questionCount)})`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!hideTopics && topics.length > 0 && selectedChapterSlug !== "all" && (
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
            <Button
              type="button"
              variant={selectedTopicId === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleSelectTopic("all")}
              className="rounded-lg text-xs font-semibold cursor-pointer shrink-0 h-7.5 px-3"
            >
              সকল টপিক ({toBengaliNumber(totalDisplayCount)})
            </Button>
            {topics.map((topic) => (
              <Button
                key={topic.id}
                type="button"
                variant={selectedTopicId === topic.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleSelectTopic(topic.id)}
                className="rounded-lg text-xs font-semibold cursor-pointer shrink-0 h-7.5 px-3"
              >
                {topic.name}{" "}
                {topic.questionCount !== undefined && `(${toBengaliNumber(topic.questionCount)})`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!hideTopics && chapters.length === 0 && mainTopics.length > 0 && (
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
            <Button
              type="button"
              variant={selectedTopicId === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleSelectTopic("all")}
              className="rounded-lg text-xs font-semibold cursor-pointer shrink-0 h-7.5 px-3"
            >
              সকল টপিক ({toBengaliNumber(totalDisplayCount)})
            </Button>
            {mainTopics.map((topic) => (
              <Button
                key={topic.id}
                type="button"
                variant={selectedTopicId === topic.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleSelectTopic(topic.id)}
                className="rounded-lg text-xs font-semibold cursor-pointer shrink-0 h-7.5 px-3"
              >
                {topic.name} ({toBengaliNumber(topic.count)})
              </Button>
            ))}
          </div>
        </div>
      )}

      {!hideTopics && chapters.length === 0 && subTopics.length > 0 && (
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full pl-1 border-l-2 border-primary/50">
            {subTopics.map((sub) => (
              <Button
                key={sub.id}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md text-[11px] font-medium h-6.5 px-2.5 shrink-0"
              >
                {sub.name} ({toBengaliNumber(sub.count)})
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex items-center justify-center gap-1.5 pt-0.5">
        <span className="text-xs text-muted-foreground font-semibold mr-1">টাইপ:</span>
        <Button
          type="button"
          variant={qTypeFilter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => handleSelectQType("all")}
          className="rounded-md text-xs h-7 px-3 cursor-pointer font-semibold shadow-2xs"
        >
          সকল
        </Button>
        <Button
          type="button"
          variant={qTypeFilter === "mcq" ? "default" : "secondary"}
          size="sm"
          onClick={() => handleSelectQType("mcq")}
          className="rounded-md text-xs h-7 px-3 cursor-pointer font-semibold shadow-2xs"
        >
          MCQ
        </Button>
        <Button
          type="button"
          variant={qTypeFilter === "written" ? "default" : "secondary"}
          size="sm"
          onClick={() => handleSelectQType("written")}
          className="rounded-md text-xs h-7 px-3 cursor-pointer font-semibold shadow-2xs"
        >
          Written
        </Button>
      </div>

      <div className="flex flex-col gap-4 mt-1">
        {paginatedQuestions.length > 0 ? (
          paginatedQuestions.map((q, qIndex) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={(currentPage - 1) * QUESTIONS_PER_PAGE + qIndex}
              selectedOptionId={answers[q.id]}
              onSelectOption={(optionId) => onSelectAnswer(q.id, optionId)}
            />
          ))
        ) : (
          <EmptyState
            title="কোনো প্রশ্ন পাওয়া যায়নি"
            description="এই টপিক বা ফিল্টারে বর্তমানে কোনো প্রশ্ন নেই।"
          />
        )}
      </div>

      {totalPages > 1 && (
        <Pagination className="my-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="পূর্ববর্তী"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {pageNumbers.map((p) => {
              if (typeof p === "string" && p.startsWith("ellipsis")) {
                return (
                  <PaginationItem key={p}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              const pageNum = p as number;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={currentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                    className="cursor-pointer size-8 text-xs font-semibold"
                  >
                    {toBengaliNumber(pageNum)}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                text="পরবর্তী"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
