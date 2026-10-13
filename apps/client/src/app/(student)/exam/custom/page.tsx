"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import * as React from "react";
import type {
  ExamStandardType,
  QTypeSelection,
  SelectedChapterItem,
  SubjectChapterGroup,
} from "@/components/exam";
import { PageLoading } from "@/components/shared";
import { useCreateCustomExam, useQBTree } from "@/hooks/use-question-bank";
import { useSession } from "@/lib/auth";
import { type CustomExamSubject, deriveSubjectIconKey } from "@/lib/consts/custom-exam";
import { chapterLevelLabel } from "@/lib/consts/qb";
import { toBengaliNumber } from "@/lib/utils";
import type { CreateCustomExamInput } from "@/types";

const stepLoading = () => <PageLoading />;

const CustomExamStep1 = dynamic(() => import("@/components/exam").then((m) => m.CustomExamStep1), {
  ssr: false,
  loading: stepLoading,
});
const CustomExamStep2 = dynamic(() => import("@/components/exam").then((m) => m.CustomExamStep2), {
  ssr: false,
  loading: stepLoading,
});
const CustomExamStepStandard = dynamic(
  () => import("@/components/exam").then((m) => m.CustomExamStepStandard),
  { ssr: false, loading: stepLoading },
);
const CustomExamStep4 = dynamic(() => import("@/components/exam").then((m) => m.CustomExamStep4), {
  ssr: false,
  loading: stepLoading,
});

export default function CustomExamPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as
    | (NonNullable<typeof session>["user"] & {
        educationalStandard?: string | null;
        track?: string | null;
      })
    | undefined;

  const initialCategory = React.useMemo(() => {
    const std = user?.educationalStandard;
    if (std === "job") return "job";
    if (std === "hsc") return "hsc";
    if (std === "ssc") return "ssc";
    return "admission";
  }, [user?.educationalStandard]);

  const initialStream = React.useMemo(() => {
    const trk = user?.track;
    if (trk === "commerce" || trk === "humanities" || trk === "science") return trk;
    return "science";
  }, [user?.track]);

  const { data: tree, isLoading: treeLoading } = useQBTree();
  const createExamMutation = useCreateCustomExam();

  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [selectedSubjectIds, setSelectedSubjectIds] = React.useState<string[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = React.useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = React.useState<string[]>([]);

  // Step 3: Exam standard & sources
  const [selectedStandard, setSelectedStandard] = React.useState<ExamStandardType>("all");
  const [selectedSourceTypes, setSelectedSourceTypes] = React.useState<string[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = React.useState<string[]>([]);

  // Step 4: Question type, counts, duration, negative marking
  const [selectedQType, setSelectedQType] = React.useState<QTypeSelection>("mcq");
  const [questionCount, setQuestionCount] = React.useState<number>(25);
  const [mcqCount, setMcqCount] = React.useState<number>(25);
  const [writtenCount, setWrittenCount] = React.useState<number>(5);
  const [durationMinutes, setDurationMinutes] = React.useState<number>(20);
  const [isNegativeMarking, setIsNegativeMarking] = React.useState<boolean>(true);

  const allSubjects = React.useMemo<CustomExamSubject[]>(() => {
    const targetMap = new Map((tree?.targets ?? []).map((t) => [t.id, t]));
    const targetSlugMap = new Map((tree?.targets ?? []).map((t) => [t.slug, t]));

    return (tree?.subjects ?? [])
      .map((subject) => {
        const target =
          (subject.targetId ? targetMap.get(subject.targetId) : undefined) ??
          (subject.targetSlug ? targetSlugMap.get(subject.targetSlug) : undefined);

        let group: "academic" | "admission" | "job" = target?.group ?? "academic";
        if (!target?.group) {
          if (subject.targetSlug === "job" || subject.slug.startsWith("job-")) {
            group = "job";
          } else if (subject.targetSlug?.includes("admission") || subject.slug.includes("-sub_")) {
            group = "admission";
          }
        }

        return {
          id: subject.id,
          name: subject.name,
          iconKey: deriveSubjectIconKey(subject.name),
          questionCount: subject.questionCount,
          group,
          targetName: target?.name,
          targetSlug: target?.slug ?? subject.targetSlug ?? undefined,
          educationLevel: subject.educationLevel ?? undefined,
          stream: subject.stream ?? undefined,
        };
      })
      .sort((a, b) => b.questionCount - a.questionCount);
  }, [tree]);

  const subjectsById = React.useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        chapters: Array<{
          id: string;
          name: string;
          questionCount: number;
          topics?: Array<{ id: string; name: string; questionCount: number }>;
        }>;
      }
    >();
    for (const subject of tree?.subjects ?? []) {
      map.set(subject.id, {
        name: subject.name,
        chapters: subject.chapters,
      });
    }
    return map;
  }, [tree]);

  const selectedSubjectIdSet = React.useMemo(
    () => new Set(selectedSubjectIds),
    [selectedSubjectIds],
  );
  const selectedChapterIdSet = React.useMemo(
    () => new Set(selectedChapterIds),
    [selectedChapterIds],
  );

  const selectedSubjects = React.useMemo(
    () => allSubjects.filter((s) => selectedSubjectIdSet.has(s.id)),
    [allSubjects, selectedSubjectIdSet],
  );

  const chapterGroups = React.useMemo<SubjectChapterGroup[]>(() => {
    return selectedSubjects.map((subject) => {
      const meta = subjectsById.get(subject.id);
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        iconKey: subject.iconKey,
        chapters: (meta?.chapters ?? []).map((ch) => ({
          id: ch.id,
          name: ch.name,
          questionCount: ch.questionCount,
          topics: ch.topics ?? [],
        })),
      };
    });
  }, [selectedSubjects, subjectsById]);

  const handleToggleSubject = (subject: CustomExamSubject) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subject.id) ? prev.filter((id) => id !== subject.id) : [...prev, subject.id],
    );
  };

  const toggleChapterSelection = (chapterId: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId],
    );
  };

  const toggleTopicSelection = (topicId: string, _chapterId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId],
    );
  };

  const toggleGroupAllSelection = (group: SubjectChapterGroup) => {
    const groupChapterIds = group.chapters.map((c) => c.id);
    const groupChapterIdSet = new Set(groupChapterIds);
    const areAllSelected = groupChapterIds.every((id) => selectedChapterIdSet.has(id));
    if (areAllSelected) {
      setSelectedChapterIds((prev) => prev.filter((id) => !groupChapterIdSet.has(id)));
    } else {
      setSelectedChapterIds((prev) => Array.from(new Set([...prev, ...groupChapterIds])));
    }
  };

  const handleSelectStandard = (standard: ExamStandardType, sourceTypes: string[]) => {
    setSelectedStandard(standard);
    setSelectedSourceTypes(sourceTypes);
  };

  const _toggleSourceSelection = (sourceId: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId],
    );
  };

  const chapterLabel = React.useMemo(
    () =>
      chapterLevelLabel(
        selectedSubjects.some((s) => s.group && s.group !== "academic") ? "admission" : "academic",
      ),
    [selectedSubjects],
  );

  const headerLabel = React.useMemo(() => {
    if (selectedSubjects.length === 0) return "কাস্টম পরীক্ষা";
    if (selectedSubjects.length === 1) return selectedSubjects[0].name;
    return `${selectedSubjects[0].name} ও আরও ${toBengaliNumber(selectedSubjects.length - 1)}টি`;
  }, [selectedSubjects]);

  const selectedChapters = React.useMemo<SelectedChapterItem[]>(() => {
    if (selectedChapterIdSet.size === 0) return [];
    return chapterGroups
      .flatMap((group) => group.chapters)
      .filter((chapter) => selectedChapterIdSet.has(chapter.id))
      .map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
        questionCount: chapter.questionCount,
      }));
  }, [chapterGroups, selectedChapterIdSet]);

  const handleStartExam = async () => {
    const subjectsWithSelectedChapters = new Set(
      chapterGroups
        .filter((group) => group.chapters.some((c) => selectedChapterIdSet.has(c.id)))
        .map((group) => group.subjectId),
    );
    const subjectIdsToSend = selectedSubjectIds.filter(
      (id) => !subjectsWithSelectedChapters.has(id),
    );
    const chapterIdsToSend = selectedChapterIds;
    const fallbackSubjectIds =
      subjectIdsToSend.length === 0 && chapterIdsToSend.length === 0
        ? selectedSubjectIds
        : subjectIdsToSend;

    const totalCount = selectedQType === "mixed" ? mcqCount + writtenCount : questionCount;

    try {
      const res = await createExamMutation.mutateAsync({
        title: `${headerLabel} কাস্টম পরীক্ষা`,
        examType: selectedQType,
        questionCount: totalCount || 25,
        mcqCount: selectedQType === "mixed" ? mcqCount : undefined,
        writtenCount: selectedQType === "mixed" ? writtenCount : undefined,
        durationMinutes: durationMinutes || 20,
        negativeMarks: isNegativeMarking ? "0.25" : "0",
        subjectIds: fallbackSubjectIds,
        chapterIds: chapterIdsToSend,
        topicIds: selectedTopicIds,
        sourceTypes:
          selectedSourceTypes.length > 0
            ? (selectedSourceTypes as NonNullable<CreateCustomExamInput["sourceTypes"]>)
            : undefined,
        sourceIds: selectedSourceIds,
      });
      if (res?.id) router.push(`/exam/${res.id}/take`);
    } catch {
      router.push("/qb");
    }
  };

  if (treeLoading) {
    return <PageLoading />;
  }

  return (
    <div className="w-full pb-28">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch">
        {currentStep === 1 && (
          <CustomExamStep1
            subjects={allSubjects}
            selectedSubjectIds={selectedSubjectIds}
            initialCategory={initialCategory}
            initialStream={initialStream}
            onToggleSubject={handleToggleSubject}
            onNext={() => {
              if (selectedSubjectIds.length > 0) {
                setCurrentStep(2);
              }
            }}
          />
        )}

        {currentStep === 2 && (
          <CustomExamStep2
            headerLabel={headerLabel}
            chapterLabel={chapterLabel}
            chapterGroups={chapterGroups}
            selectedChapterIds={selectedChapterIds}
            selectedTopicIds={selectedTopicIds}
            onToggleChapter={toggleChapterSelection}
            onToggleTopic={toggleTopicSelection}
            onToggleGroupAll={toggleGroupAllSelection}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <CustomExamStepStandard
            headerLabel={headerLabel}
            selectedStandard={selectedStandard}
            selectedSourceTypes={selectedSourceTypes}
            onSelectStandard={handleSelectStandard}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <CustomExamStep4
            headerLabel={headerLabel}
            selectedQType={selectedQType}
            questionCount={questionCount}
            mcqCount={mcqCount}
            writtenCount={writtenCount}
            durationMinutes={durationMinutes}
            isNegativeMarking={isNegativeMarking}
            selectedChapters={selectedChapters}
            selectedStandard={selectedStandard}
            isPending={createExamMutation.isPending}
            onQTypeChange={setSelectedQType}
            onQuestionCountChange={setQuestionCount}
            onMcqCountChange={setMcqCount}
            onWrittenCountChange={setWrittenCount}
            onDurationMinutesChange={setDurationMinutes}
            onNegativeMarkingChange={setIsNegativeMarking}
            onBack={() => setCurrentStep(3)}
            onSubmit={handleStartExam}
          />
        )}
      </div>
    </div>
  );
}
