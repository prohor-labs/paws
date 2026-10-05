import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const qbQuestionTypeEnum = pgEnum("qb_question_type", ["mcq", "written"]);
export const qbStatusEnum = pgEnum("qb_status", ["draft", "review", "published", "archived"]);
export const qbSourceGroupEnum = pgEnum("qb_source_group", [
  "academic",
  "admission",
  "job",
  "other",
]);
export const qbSourceTypeEnum = pgEnum("qb_source_type", [
  "board",
  "university",
  "medical",
  "engineering",
  "bcs",
  "bank_job",
  "model_test",
  "other",
]);
export const qbTargetGroupEnum = pgEnum("qb_target_group", ["academic", "admission", "job"]);
export const qbExamTypeEnum = pgEnum("qb_exam_type", ["mcq", "written", "mixed"]);
export const qbSubmissionStatusEnum = pgEnum("qb_submission_status", [
  "pending_evaluation",
  "evaluated",
  "auto_evaluated",
]);

export const qbTargets = pgTable("qb_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  group: qbTargetGroupEnum("group").notNull().default("academic"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  orderIndex: integer("order_index").notNull().default(0),
  subjectCount: integer("subject_count").notNull().default(0),
  questionCount: integer("question_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const qbContainers = pgTable(
  "qb_containers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetId: uuid("target_id")
      .notNull()
      .references(() => qbTargets.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    iconUrl: text("icon_url"),
    orderIndex: integer("order_index").notNull().default(0),
    itemCount: integer("item_count").notNull().default(0),
    questionCount: integer("question_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("qb_containers_target_slug_unique").on(table.targetId, table.slug),
    index("qb_containers_target_order_idx").on(table.targetId, table.orderIndex),
  ],
);

export const qbSubjects = pgTable("qb_subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetId: uuid("target_id").references(() => qbTargets.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  code: text("code"),
  orderIndex: integer("order_index").notNull().default(0),
  chapterCount: integer("chapter_count").notNull().default(0),
  questionCount: integer("question_count").notNull().default(0),
});

export const qbContainerItems = pgTable(
  "qb_container_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    containerId: uuid("container_id")
      .notNull()
      .references(() => qbContainers.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").references(() => qbSubjects.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    iconUrl: text("icon_url"),
    orderIndex: integer("order_index").notNull().default(0),
    examSheetCount: integer("exam_sheet_count").notNull().default(0),
    questionCount: integer("question_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("qb_container_items_container_slug_unique").on(table.containerId, table.slug),
    index("qb_container_items_container_order_idx").on(table.containerId, table.orderIndex),
    index("qb_container_items_subject_idx").on(table.subjectId),
  ],
);

export const qbChapters = pgTable(
  "qb_chapters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => qbSubjects.id, { onDelete: "cascade" }),
    containerItemId: uuid("container_item_id").references(() => qbContainerItems.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    orderIndex: integer("order_index").notNull().default(0),
    topicCount: integer("topic_count").notNull().default(0),
    questionCount: integer("question_count").notNull().default(0),
  },
  (table) => [
    unique("qb_chapters_subject_slug_unique").on(table.subjectId, table.slug),
    index("qb_chapters_subject_order_idx").on(table.subjectId, table.orderIndex),
    index("qb_chapters_container_item_idx").on(table.containerItemId),
  ],
);

export const qbTopics = pgTable(
  "qb_topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    orderIndex: integer("order_index").notNull().default(0),
    questionCount: integer("question_count").notNull().default(0),
  },
  (table) => [
    index("qb_topics_parent_idx").on(table.parentId),
    index("qb_topics_slug_idx").on(table.slug),
    index("qb_topics_order_idx").on(table.orderIndex),
  ],
);

export const qbQuestions = pgTable(
  "qb_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topicId: uuid("topic_id").references(() => qbTopics.id, {
      onDelete: "set null",
    }),
    qType: qbQuestionTypeEnum("q_type").notNull().default("mcq"),
    questionText: text("question_text").notNull(),
    contextText: text("context_text"),
    explanation: text("explanation"),
    status: qbStatusEnum("status").notNull().default("published"),
    parentQuestionId: uuid("parent_question_id"),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("qb_questions_topic_idx").on(table.topicId),
    index("qb_questions_order_idx").on(table.orderIndex, table.id),
    index("qb_questions_status_order_idx").on(table.status, table.orderIndex, table.id),
  ],
);

export const qbQuestionOptions = pgTable(
  "qb_question_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => qbQuestions.id, { onDelete: "cascade" }),
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => [index("qb_question_options_q_idx").on(table.questionId, table.orderIndex)],
);

export const qbQuestionParts = pgTable(
  "qb_question_parts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => qbQuestions.id, { onDelete: "cascade" }),
    partText: text("part_text").notNull(),
    answerText: text("answer_text"),
    marks: numeric("marks"),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => [
    unique("qb_question_parts_order_unique").on(table.questionId, table.orderIndex),
    index("qb_question_parts_q_idx").on(table.questionId, table.orderIndex),
  ],
);

export const qbSources = pgTable("qb_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceGroup: qbSourceGroupEnum("source_group").notNull().default("academic"),
  type: qbSourceTypeEnum("type").notNull().default("board"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  institution: text("institution"),
  unit: text("unit"),
  year: integer("year"),
  questionCount: integer("question_count").notNull().default(0),
});

export const qbQuestionSources = pgTable(
  "qb_question_sources",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => qbQuestions.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => qbSources.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.questionId, table.sourceId] }),
    index("qb_question_sources_source_idx").on(table.sourceId),
    index("qb_question_sources_q_idx").on(table.questionId),
  ],
);

export const qbChapterSources = pgTable(
  "qb_chapter_sources",
  {
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => qbChapters.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => qbSources.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "qb_chapter_sources_pk",
      columns: [table.chapterId, table.sourceId],
    }),
    index("qb_chapter_sources_source_idx").on(table.sourceId),
  ],
);

export const qbChapterSourcesRelations = relations(qbChapterSources, ({ one }) => ({
  chapter: one(qbChapters, {
    fields: [qbChapterSources.chapterId],
    references: [qbChapters.id],
  }),
  source: one(qbSources, {
    fields: [qbChapterSources.sourceId],
    references: [qbSources.id],
  }),
}));

export const qbQuestionChapters = pgTable(
  "qb_question_chapters",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => qbQuestions.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => qbChapters.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "qb_question_chapters_pk",
      columns: [table.questionId, table.chapterId],
    }),
    index("qb_question_chapters_chapter_idx").on(table.chapterId),
    index("qb_question_chapters_ch_q_idx").on(table.chapterId, table.questionId),
  ],
);

export const qbQuestionChaptersRelations = relations(qbQuestionChapters, ({ one }) => ({
  question: one(qbQuestions, {
    fields: [qbQuestionChapters.questionId],
    references: [qbQuestions.id],
  }),
  chapter: one(qbChapters, {
    fields: [qbQuestionChapters.chapterId],
    references: [qbChapters.id],
  }),
}));

export const qbExamSheets = pgTable(
  "qb_exam_sheets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    containerItemId: uuid("container_item_id").references(() => qbContainerItems.id, {
      onDelete: "cascade",
    }),
    chapterId: uuid("chapter_id").references(() => qbChapters.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    examType: qbExamTypeEnum("exam_type").notNull().default("mcq"),
    durationMinutes: integer("duration_minutes").notNull().default(30),
    totalMarks: numeric("total_marks"),
    negativeMarks: text("negative_marks").default("0.25"),
    orderIndex: integer("order_index").notNull().default(0),
    questionCount: integer("question_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("qb_exam_sheets_container_item_idx").on(table.containerItemId),
    index("qb_exam_sheets_chapter_order_idx").on(table.chapterId, table.orderIndex),
  ],
);

export const qbExamSheetQuestions = pgTable(
  "qb_exam_sheet_questions",
  {
    examSheetId: uuid("exam_sheet_id")
      .notNull()
      .references(() => qbExamSheets.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => qbQuestions.id, { onDelete: "cascade" }),
    questionNumber: integer("question_number").notNull().default(1),
  },
  (table) => [
    primaryKey({
      name: "qb_exam_sheet_questions_pk",
      columns: [table.examSheetId, table.questionId],
    }),
    index("qb_exam_sheet_q_sheet_idx").on(table.examSheetId, table.questionNumber),
    index("qb_exam_sheet_q_question_idx").on(table.questionId),
  ],
);

export const qbExamSheetQuestionsRelations = relations(qbExamSheetQuestions, ({ one }) => ({
  examSheet: one(qbExamSheets, {
    fields: [qbExamSheetQuestions.examSheetId],
    references: [qbExamSheets.id],
  }),
  question: one(qbQuestions, {
    fields: [qbExamSheetQuestions.questionId],
    references: [qbQuestions.id],
  }),
}));

export const qbCustomExams = pgTable(
  "qb_custom_exams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    examType: qbExamTypeEnum("exam_type").notNull().default("mcq"),
    questionCount: integer("question_count").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    negativeMarks: text("negative_marks").notNull().default("0.25"),
    totalMarks: integer("total_marks").notNull().default(0),
    config: text("config"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("qb_custom_exams_user_created_idx").on(table.userId, table.createdAt),
    index("qb_custom_exams_created_idx").on(table.createdAt),
    index("qb_custom_exams_type_idx").on(table.examType),
  ],
);

export const qbCustomExamQuestions = pgTable(
  "qb_custom_exam_questions",
  {
    customExamId: uuid("custom_exam_id")
      .notNull()
      .references(() => qbCustomExams.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => qbQuestions.id, { onDelete: "cascade" }),
    questionNumber: integer("question_number").notNull().default(1),
  },
  (table) => [
    primaryKey({ columns: [table.customExamId, table.questionId] }),
    index("qb_custom_exam_q_exam_idx").on(table.customExamId, table.questionNumber),
    index("qb_custom_exam_q_question_idx").on(table.questionId),
  ],
);

export const qbCustomExamSubmissions = pgTable(
  "qb_custom_exam_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customExamId: uuid("custom_exam_id")
      .notNull()
      .references(() => qbCustomExams.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }),
    status: qbSubmissionStatusEnum("status").notNull().default("auto_evaluated"),
    score: text("score").notNull().default("0"),
    writtenScore: text("written_score").notNull().default("0"),
    writtenTotalMarks: integer("written_total_marks").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    wrongCount: integer("wrong_count").notNull().default(0),
    unansweredCount: integer("unanswered_count").notNull().default(0),
    timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
    answers: text("answers").notNull().default("{}"),
    evaluatorId: uuid("evaluator_id"),
    evaluatorFeedback: text("evaluator_feedback"),
    evaluatedAt: timestamp("evaluated_at", {
      withTimezone: true,
      mode: "date",
    }),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("qb_custom_exam_subs_user_date_idx").on(table.userId, table.submittedAt),
    index("qb_custom_exam_subs_exam_date_idx").on(table.customExamId, table.submittedAt),
    index("qb_custom_exam_subs_status_idx").on(table.status),
    index("qb_custom_exam_subs_evaluator_idx").on(table.evaluatorId),
  ],
);

export const qbCustomExamWrittenSubmissions = pgTable(
  "qb_custom_exam_written_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => qbCustomExamSubmissions.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => qbQuestions.id, { onDelete: "cascade" }),
    partId: uuid("part_id").references(() => qbQuestionParts.id, {
      onDelete: "set null",
    }),
    pageNumber: integer("page_number").notNull().default(1),
    imageUrl: text("image_url").notNull(),
    annotatedImageUrl: text("annotated_image_url"),
    marksAwarded: text("marks_awarded"),
    maxMarks: integer("max_marks"),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("qb_custom_exam_written_sub_idx").on(table.submissionId),
    index("qb_custom_exam_written_q_idx").on(table.questionId),
    index("qb_custom_exam_written_part_idx").on(table.partId),
  ],
);

export const qbTargetsRelations = relations(qbTargets, ({ many }) => ({
  containers: many(qbContainers),
  subjects: many(qbSubjects),
}));

export const qbContainersRelations = relations(qbContainers, ({ one, many }) => ({
  target: one(qbTargets, {
    fields: [qbContainers.targetId],
    references: [qbTargets.id],
  }),
  items: many(qbContainerItems),
}));

export const qbContainerItemsRelations = relations(qbContainerItems, ({ one, many }) => ({
  container: one(qbContainers, {
    fields: [qbContainerItems.containerId],
    references: [qbContainers.id],
  }),
  subject: one(qbSubjects, {
    fields: [qbContainerItems.subjectId],
    references: [qbSubjects.id],
  }),
  examSheets: many(qbExamSheets),
  chapters: many(qbChapters),
}));

export const qbSubjectsRelations = relations(qbSubjects, ({ one, many }) => ({
  target: one(qbTargets, {
    fields: [qbSubjects.targetId],
    references: [qbTargets.id],
  }),
  containerItems: many(qbContainerItems),
  chapters: many(qbChapters),
}));

export const qbChaptersRelations = relations(qbChapters, ({ one, many }) => ({
  subject: one(qbSubjects, {
    fields: [qbChapters.subjectId],
    references: [qbSubjects.id],
  }),
  containerItem: one(qbContainerItems, {
    fields: [qbChapters.containerItemId],
    references: [qbContainerItems.id],
  }),
  topics: many(qbTopics),
  examSheets: many(qbExamSheets),
}));

export const qbTopicsRelations = relations(qbTopics, ({ one, many }) => ({
  parent: one(qbTopics, {
    fields: [qbTopics.parentId],
    references: [qbTopics.id],
    relationName: "topic_subtopics",
  }),
  subtopics: many(qbTopics, { relationName: "topic_subtopics" }),
}));

export const qbQuestionsRelations = relations(qbQuestions, ({ one, many }) => ({
  topic: one(qbTopics, {
    fields: [qbQuestions.topicId],
    references: [qbTopics.id],
  }),
  questionChapters: many(qbQuestionChapters),
  chapterSources: many(qbChapterSources),
  options: many(qbQuestionOptions),
  parts: many(qbQuestionParts),
  questionSources: many(qbQuestionSources),
  examSheetQuestions: many(qbExamSheetQuestions),
}));

export const qbQuestionOptionsRelations = relations(qbQuestionOptions, ({ one }) => ({
  question: one(qbQuestions, {
    fields: [qbQuestionOptions.questionId],
    references: [qbQuestions.id],
  }),
}));

export const qbQuestionPartsRelations = relations(qbQuestionParts, ({ one }) => ({
  question: one(qbQuestions, {
    fields: [qbQuestionParts.questionId],
    references: [qbQuestions.id],
  }),
}));

export const qbSourcesRelations = relations(qbSources, ({ many }) => ({
  questionSources: many(qbQuestionSources),
  chapterSources: many(qbChapterSources),
}));

export const qbQuestionSourcesRelations = relations(qbQuestionSources, ({ one }) => ({
  question: one(qbQuestions, {
    fields: [qbQuestionSources.questionId],
    references: [qbQuestions.id],
  }),
  source: one(qbSources, {
    fields: [qbQuestionSources.sourceId],
    references: [qbSources.id],
  }),
}));

export const qbExamSheetsRelations = relations(qbExamSheets, ({ one, many }) => ({
  containerItem: one(qbContainerItems, {
    fields: [qbExamSheets.containerItemId],
    references: [qbContainerItems.id],
  }),
  chapter: one(qbChapters, {
    fields: [qbExamSheets.chapterId],
    references: [qbChapters.id],
  }),
  questions: many(qbExamSheetQuestions),
}));

export const qbCustomExamsRelations = relations(qbCustomExams, ({ one, many }) => ({
  user: one(user, {
    fields: [qbCustomExams.userId],
    references: [user.id],
  }),
  questions: many(qbCustomExamQuestions),
  submissions: many(qbCustomExamSubmissions),
}));

export const qbCustomExamQuestionsRelations = relations(qbCustomExamQuestions, ({ one }) => ({
  customExam: one(qbCustomExams, {
    fields: [qbCustomExamQuestions.customExamId],
    references: [qbCustomExams.id],
  }),
  question: one(qbQuestions, {
    fields: [qbCustomExamQuestions.questionId],
    references: [qbQuestions.id],
  }),
}));

export const qbCustomExamSubmissionsRelations = relations(
  qbCustomExamSubmissions,
  ({ one, many }) => ({
    customExam: one(qbCustomExams, {
      fields: [qbCustomExamSubmissions.customExamId],
      references: [qbCustomExams.id],
    }),
    user: one(user, {
      fields: [qbCustomExamSubmissions.userId],
      references: [user.id],
    }),
    writtenSubmissions: many(qbCustomExamWrittenSubmissions),
  }),
);

export const qbCustomExamWrittenSubmissionsRelations = relations(
  qbCustomExamWrittenSubmissions,
  ({ one }) => ({
    submission: one(qbCustomExamSubmissions, {
      fields: [qbCustomExamWrittenSubmissions.submissionId],
      references: [qbCustomExamSubmissions.id],
    }),
    question: one(qbQuestions, {
      fields: [qbCustomExamWrittenSubmissions.questionId],
      references: [qbQuestions.id],
    }),
    part: one(qbQuestionParts, {
      fields: [qbCustomExamWrittenSubmissions.partId],
      references: [qbQuestionParts.id],
    }),
  }),
);

export type QBTargetTable = typeof qbTargets.$inferSelect;
export type QBContainerTable = typeof qbContainers.$inferSelect;
export type QBContainerItemTable = typeof qbContainerItems.$inferSelect;
export type QBSubjectTable = typeof qbSubjects.$inferSelect;
export type QBChapterTable = typeof qbChapters.$inferSelect;
export type QBQuestionTable = typeof qbQuestions.$inferSelect;
export type QBQuestionOptionTable = typeof qbQuestionOptions.$inferSelect;
export type QBQuestionPartTable = typeof qbQuestionParts.$inferSelect;
export type QBQuestionSourceTable = typeof qbQuestionSources.$inferSelect;
export type QBSourceTable = typeof qbSources.$inferSelect;
export type QBTopicTable = typeof qbTopics.$inferSelect;
export type QBExamSheetTable = typeof qbExamSheets.$inferSelect;
export type QBExamSheetQuestionTable = typeof qbExamSheetQuestions.$inferSelect;
export type QBCustomExamTable = typeof qbCustomExams.$inferSelect;
export type QBCustomExamQuestionTable = typeof qbCustomExamQuestions.$inferSelect;
export type QBCustomExamSubmissionTable = typeof qbCustomExamSubmissions.$inferSelect;
export type QBCustomExamWrittenSubmissionTable = typeof qbCustomExamWrittenSubmissions.$inferSelect;
