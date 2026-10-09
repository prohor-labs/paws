export type QBQuestionTypeValue = 'mcq' | 'written' | 'mixed';
export type QBSourceGroupValue = 'academic' | 'admission' | 'job' | 'other';
export type QBSourceTypeValue =
  | 'board'
  | 'university'
  | 'medical'
  | 'engineering'
  | 'bcs'
  | 'bank_job'
  | 'model_test'
  | 'other';

export interface MappableSource {
  id: string;
  sourceGroup?: QBSourceGroupValue | null;
  type?: QBSourceTypeValue | null;
  name: string;
  slug: string;
  institution: string | null;
  unit: string | null;
  year: number | null;
}

export interface MappableTopic {
  id: string;
  parentTopicId: string | null;
  name: string;
  slug: string;
  orderIndex: number;
}

export interface MappableQuestion {
  id: string;
  topicId: string | null;
  qType: 'mcq' | 'written';
  questionText: string;
  contextText: string | null;
  explanation: string | null;
  options: Array<{
    id: string;
    optionText: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
  parts: Array<{
    id: string;
    partText: string;
    answerText: string | null;
    marks: number | string | null;
    orderIndex: number;
  }>;
  questionSources: Array<{ source: MappableSource }>;
  topic: MappableTopic | null;
}

export function mapQuestion(question: MappableQuestion, options: { includeAnswers: boolean }) {
  const topic = question.topic
    ? {
        id: question.topic.id,
        parentTopicId: question.topic.parentTopicId,
        name: question.topic.name,
        slug: question.topic.slug,
        orderIndex: question.topic.orderIndex,
      }
    : null;

  return {
    id: question.id,
    topicId: question.topicId,
    qType: question.qType,
    questionText: question.questionText,
    contextText: question.contextText,
    explanation: options.includeAnswers ? question.explanation : null,
    options: question.options.map((option) => ({
      id: option.id,
      optionText: option.optionText,
      isCorrect: options.includeAnswers ? option.isCorrect : undefined,
      orderIndex: option.orderIndex,
    })),
    parts: question.parts.map((part) => ({
      id: part.id,
      partText: part.partText,
      answerText: options.includeAnswers ? part.answerText : null,
      marks: part.marks,
      orderIndex: part.orderIndex,
    })),
    sources: question.questionSources.map((questionSource) => ({
      id: questionSource.source.id,
      sourceGroup: questionSource.source.sourceGroup,
      type: questionSource.source.type,
      name: questionSource.source.name,
      slug: questionSource.source.slug,
      institution: questionSource.source.institution,
      unit: questionSource.source.unit,
      year: questionSource.source.year,
    })),
    topic,
    topics: topic ? [topic] : [],
  };
}
