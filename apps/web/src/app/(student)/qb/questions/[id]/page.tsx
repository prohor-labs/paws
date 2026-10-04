"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { BookOpen } from "@/components/icons";
import { EmptyState, PageBreadcrumbs, PageLoading, QuestionCard } from "@/components/shared";
import { useQBQuestionDetail } from "@/hooks/use-question-bank";

export default function SingleQuestionPage() {
  const params = useParams<{ id: string }>();
  const questionId = params?.id || "";
  const { data: question, isLoading, error } = useQBQuestionDetail(questionId);

  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !question) {
    return (
      <EmptyState
        icon={BookOpen}
        title="প্রশ্ন পাওয়া যায়নি"
        description="অনুরোধকৃত প্রশ্নটি বিদ্যমান নেই অথবা অপসারিত হয়েছে।"
        actionText="প্রশ্নব্যাংকে ফিরে যান"
        actionHref="/qb"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6 w-full">
      <PageBreadcrumbs items={[{ label: "প্রশ্নব্যাংক", href: "/qb" }, { label: "প্রশ্ন বিস্তারিত" }]} />

      <QuestionCard
        question={question}
        index={0}
        selectedOptionId={selectedOptionId}
        onSelectOption={setSelectedOptionId}
      />
    </div>
  );
}
