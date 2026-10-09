export type QBExamType = "mcq" | "written" | "mixed";

export type QBTargetGroup = "academic" | "admission" | "job";

export type QBQuestionType = "mcq" | "written";

export type QBSourceType =
  | "board"
  | "university"
  | "medical"
  | "engineering"
  | "bcs"
  | "bank_job"
  | "model_test"
  | "other";

export interface QBTarget {
  id: string;
  group?: QBTargetGroup;
  name: string;
  slug: string;
  orderIndex?: number;
  subjectCount?: number;
  questionCount?: number;
}

export interface QBContainer {
  id: string;
  targetId: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  orderIndex?: number;
  itemCount?: number;
  questionCount?: number;
}

export interface QBContainerItem {
  id: string;
  containerId: string;
  subjectId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  orderIndex?: number;
  examSheetCount?: number;
  questionCount?: number;
}

export interface QBSubject {
  id: string;
  targetId?: string | null;
  name: string;
  slug: string;
  code?: string | null;
  orderIndex?: number;
  chapterCount?: number;
  questionCount?: number;
}

export interface QBChapter {
  id: string;
  subjectId?: string;
  containerItemId?: string | null;
  name: string;
  slug: string;
  orderIndex?: number;
  topicCount?: number;
  questionCount?: number;
}

export interface QBTopic {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  orderIndex?: number;
  questionCount?: number;
}

export interface QBQuestionOption {
  id: string;
  optionText: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

export interface QBQuestionPart {
  id: string;
  partText: string;
  answerText?: string | null;
  marks?: string | number | null;
  orderIndex?: number;
}

export type QBSourceGroup = "academic" | "admission" | "job" | "other";

export interface QBSource {
  id: string;
  sourceGroup?: QBSourceGroup;
  type?: QBSourceType;
  name: string;
  slug: string;
  institution?: string | null;
  unit?: string | null;
  year?: number | null;
  questionCount?: number;
}

export interface QBExamSheet {
  id: string;
  containerItemId?: string | null;
  chapterId?: string | null;
  title: string;
  slug: string;
  examType: QBExamType;
  durationMinutes: number;
  totalMarks?: number | string | null;
  negativeMarks?: string | null;
  orderIndex?: number;
  questionCount: number;
}

export interface QBQuestion {
  id: string;
  topicId?: string | null;
  qType: QBQuestionType;
  questionText: string;
  contextText?: string | null;
  explanation?: string | null;
  options?: QBQuestionOption[];
  parts?: QBQuestionPart[];
  sources?: QBSource[];
  topic?: QBTopic | null;
}

export interface QBHubData {
  targets: QBTarget[];
}

export interface QBTargetDetailData {
  target: QBTarget;
  containers?: QBContainer[];
  subjects: QBSubject[];
}

export interface QBContainerDetailData {
  target: QBTarget;
  container: QBContainer;
  items: QBContainerItem[];
}

export interface QBItemDetailData {
  target: QBTarget;
  container: QBContainer;
  item: QBContainerItem;
  subject?: QBSubject | null;
  chapters: QBChapter[];
  examSheets?: QBExamSheet[];
}

export interface QBSubjectDetailData {
  target?: QBTarget | null;
  subject: QBSubject;
  chapters: QBChapter[];
}

export interface QBPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QBChapterQueryParams {
  page?: number;
  limit?: number;
  targetSlug?: string;
  containerSlug?: string;
  itemSlug?: string;
  container?: string;
  item?: string;
  source?: string;
  sourceId?: string;
  sourceSlug?: string;
  sourceType?: QBSourceType;
  examSheet?: string;
  examSheetId?: string;
  examSheetSlug?: string;
  subjectSlug?: string;
  topicId?: string;
  qType?: QBQuestionType;
}

export interface QBChapterDetailData {
  target?: QBTarget | null;
  container?: QBContainer | null;
  item?: QBContainerItem | null;
  subject?: QBSubject | null;
  chapter: QBChapter;
  subjects?: QBSubject[];
  chapters?: QBChapter[];
  topics: QBTopic[];
  questions: QBQuestion[];
  nextCursor?: string | null;
  pagination?: QBPagination;
}

export interface QBTreeContainerItem {
  id: string;
  name: string;
  slug: string;
  questionCount: number;
}

export interface QBTreeContainer {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  questionCount: number;
  items: QBTreeContainerItem[];
}

export interface QBTreeChapter {
  id: string;
  name: string;
  slug: string;
  questionCount: number;
}

export interface QBTreeSubject {
  id: string;
  name: string;
  slug: string;
  questionCount: number;
  chapters: QBTreeChapter[];
}

export interface QBTreeTarget {
  id: string;
  group?: QBTargetGroup;
  name: string;
  slug: string;
  containers?: QBTreeContainer[];
  subjects?: QBTreeSubject[];
}

export interface QBTree {
  targets: QBTreeTarget[];
  subjects: QBTreeSubject[];
}

export interface CreateCustomExamInput {
  title?: string;
  examType?: QBExamType;
  questionCount?: number;
  mcqCount?: number;
  writtenCount?: number;
  durationMinutes?: number;
  negativeMarks?: string;
  targetIds?: string[];
  subjectIds?: string[];
  chapterIds?: string[];
  topicIds?: string[];
  examSheetIds?: string[];
  sourceIds?: string[];
  sourceTypes?: QBSourceType[];
}

export interface CustomExamData {
  id: string;
  userId?: string | null;
  title: string;
  examType: QBExamType;
  questionCount: number;
  durationMinutes: number;
  negativeMarks: string;
  totalMarks: number | string;
  createdAt: string;
}

export interface CustomExamTakeData {
  exam: CustomExamData;
  questions: QBQuestion[];
}

export interface WrittenAnswerInput {
  questionId: string;
  partId?: string;
  pageNumber: number;
  imageUrl: string;
}

export interface SubmitCustomExamInput {
  answers: Record<string, string>;
  writtenAnswers?: WrittenAnswerInput[];
  timeSpentSeconds: number;
}

export interface CustomExamSubmissionData {
  id: string;
  customExamId: string;
  userId?: string | null;
  status: "pending_evaluation" | "evaluated" | "auto_evaluated";
  score: string;
  writtenScore: string;
  writtenTotalMarks: number | string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeSpentSeconds: number;
  answers: Record<string, string>;
  evaluatorId?: string | null;
  evaluatorFeedback?: string | null;
  evaluatedAt?: string | null;
  submittedAt: string;
}

export interface CustomExamWrittenSubmissionItem {
  id: string;
  questionId: string;
  partId?: string | null;
  pageNumber: number;
  imageUrl: string;
  annotatedImageUrl?: string | null;
  marksAwarded?: string | number | null;
  maxMarks?: string | number | null;
  feedback?: string | null;
}

export interface CustomExamSolveData {
  exam: CustomExamData;
  submission?: CustomExamSubmissionData | null;
  questions: QBQuestion[];
  studentAnswers: Record<string, string>;
  writtenSubmissions?: CustomExamWrittenSubmissionItem[];
}

export interface CreateExamResult {
  id: string;
  examId: string;
  title: string;
  totalQuestions: number;
  questionCount: number;
  durationMinutes: number;
  negativeMarks: string;
  examType: string;
}

export interface SubmitExamResult {
  id: string;
  submissionId: string;
  score: number | string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeSpentSeconds: number;
  status: string;
}
