import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const qbExamType = pgEnum("qb_exam_type", ["mcq", "written", "mixed"]);
export const qbQuestionType = pgEnum("qb_question_type", ["mcq", "written"]);
export const qbSourceGroup = pgEnum("qb_source_group", ["academic", "admission", "job", "other"]);
export const qbSourceType = pgEnum("qb_source_type", [
  "board",
  "university",
  "medical",
  "engineering",
  "bcs",
  "bank_job",
  "model_test",
  "other",
]);
export const qbStatus = pgEnum("qb_status", ["draft", "review", "published", "archived"]);
export const qbSubmissionStatus = pgEnum("qb_submission_status", [
  "pending_evaluation",
  "evaluated",
  "auto_evaluated",
]);
export const qbTargetGroup = pgEnum("qb_target_group", ["academic", "admission", "job"]);
export const qbEducationLevel = pgEnum("qb_education_level", [
  "jsc",
  "ssc",
  "hsc",
  "admission",
  "job",
  "other",
]);

export const qbTargets = pgTable(
  "qb_targets",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    group: qbTargetGroup().default("academic").notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    subjectCount: integer("subject_count").default(0).notNull(),
    questionCount: integer("question_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("qb_targets_slug_unique").on(table.slug),
    check("qb_targets_counts_check", sql`${table.subjectCount} >= 0 and ${table.questionCount} >= 0`),
  ],
);

export const qbSubjects = pgTable(
  "qb_subjects",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    targetId: uuid("target_id"),
    level: qbEducationLevel("level").default("hsc").notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    code: text(),
    orderIndex: integer("order_index").default(0).notNull(),
    chapterCount: integer("chapter_count").default(0).notNull(),
    questionCount: integer("question_count").default(0).notNull(),
  },
  (table) => [
    index("qb_subjects_target_idx").using("btree", table.targetId.asc().nullsLast()),
    index("qb_subjects_level_idx").using("btree", table.level.asc().nullsLast()),
    unique("qb_subjects_slug_unique").on(table.slug),
    foreignKey({
      columns: [table.targetId],
      foreignColumns: [qbTargets.id],
      name: "qb_subjects_target_id_qb_targets_id_fk",
    }).onDelete("set null"),
    check(
      "qb_subjects_counts_check",
      sql`${table.chapterCount} >= 0 and ${table.questionCount} >= 0`,
    ),
  ],
);

export const qbContainers = pgTable(
  "qb_containers",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    targetId: uuid("target_id").notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    iconUrl: text("icon_url"),
    orderIndex: integer("order_index").default(0).notNull(),
    itemCount: integer("item_count").default(0).notNull(),
    questionCount: integer("question_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("qb_containers_target_order_idx").using(
      "btree",
      table.targetId.asc().nullsLast(),
      table.orderIndex.asc().nullsLast(),
    ),
    unique("qb_containers_target_slug_unique").on(table.targetId, table.slug),
    foreignKey({
      columns: [table.targetId],
      foreignColumns: [qbTargets.id],
      name: "qb_containers_target_id_qb_targets_id_fk",
    }).onDelete("cascade"),
    check(
      "qb_containers_counts_check",
      sql`${table.itemCount} >= 0 and ${table.questionCount} >= 0`,
    ),
  ],
);

export const qbContainerItems = pgTable(
  "qb_container_items",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    containerId: uuid("container_id").notNull(),
    subjectId: uuid("subject_id"),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    iconUrl: text("icon_url"),
    orderIndex: integer("order_index").default(0).notNull(),
    examSheetCount: integer("exam_sheet_count").default(0).notNull(),
    questionCount: integer("question_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("qb_container_items_container_order_idx").using(
      "btree",
      table.containerId.asc().nullsLast(),
      table.orderIndex.asc().nullsLast(),
    ),
    index("qb_container_items_subject_idx").using("btree", table.subjectId.asc().nullsLast()),
    unique("qb_container_items_container_slug_unique").on(table.containerId, table.slug),
    foreignKey({
      columns: [table.containerId],
      foreignColumns: [qbContainers.id],
      name: "qb_container_items_container_id_qb_containers_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.subjectId],
      foreignColumns: [qbSubjects.id],
      name: "qb_container_items_subject_id_qb_subjects_id_fk",
    }).onDelete("set null"),
    check(
      "qb_container_items_counts_check",
      sql`${table.examSheetCount} >= 0 and ${table.questionCount} >= 0`,
    ),
  ],
);

export const qbChapters = pgTable(
  "qb_chapters",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    subjectId: uuid("subject_id").notNull(),
    containerItemId: uuid("container_item_id"),
    name: text().notNull(),
    slug: text().notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    topicCount: integer("topic_count").default(0).notNull(),
    questionCount: integer("question_count").default(0).notNull(),
  },
  (table) => [
    index("qb_chapters_container_order_idx").using(
      "btree",
      table.containerItemId.asc().nullsLast(),
      table.orderIndex.asc().nullsLast(),
    ),
    index("qb_chapters_subject_order_idx").using(
      "btree",
      table.subjectId.asc().nullsLast(),
      table.orderIndex.asc().nullsLast(),
    ),
    unique("qb_chapters_subject_slug_unique").on(table.subjectId, table.slug),
    foreignKey({
      columns: [table.containerItemId],
      foreignColumns: [qbContainerItems.id],
      name: "qb_chapters_container_item_id_qb_container_items_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.subjectId],
      foreignColumns: [qbSubjects.id],
      name: "qb_chapters_subject_id_qb_subjects_id_fk",
    }).onDelete("cascade"),
    check(
      "qb_chapters_counts_check",
      sql`${table.topicCount} >= 0 and ${table.questionCount} >= 0`,
    ),
    check("qb_chapters_order_check", sql`${table.orderIndex} >= 0`),
  ],
);

export const qbSources = pgTable(
  "qb_sources",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    containerId: uuid("container_id"),
    containerItemId: uuid("container_item_id"),
    sourceGroup: qbSourceGroup("source_group").default("academic").notNull(),
    type: qbSourceType().default("board").notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    institution: text(),
    unit: text(),
    year: integer(),
    questionCount: integer("question_count").default(0).notNull(),
  },
  (table) => [
    index("qb_sources_container_id_idx").using("btree", table.containerId.asc().nullsLast()),
    index("qb_sources_container_item_id_idx").using("btree", table.containerItemId.asc().nullsLast()),
    unique("qb_sources_slug_unique").on(table.slug),
    foreignKey({
      columns: [table.containerId],
      foreignColumns: [qbContainers.id],
      name: "qb_sources_container_id_qb_containers_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.containerItemId],
      foreignColumns: [qbContainerItems.id],
      name: "qb_sources_container_item_id_qb_container_items_id_fk",
    }).onDelete("set null"),
    check("qb_sources_question_count_check", sql`${table.questionCount} >= 0`),
  ],
);

export const qbTopics = pgTable(
  "qb_topics",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    chapterId: uuid("chapter_id").notNull(),
    parentTopicId: uuid("parent_topic_id"),
    name: text().notNull(),
    slug: text().notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    questionCount: integer("question_count").default(0).notNull(),
  },
  (table) => [
    index("qb_topics_chapter_order_idx").using(
      "btree",
      table.chapterId.asc().nullsLast(),
      table.orderIndex.asc().nullsLast(),
    ),
    index("qb_topics_parent_topic_idx").using("btree", table.parentTopicId.asc().nullsLast()),
    uniqueIndex("qb_topics_chapter_slug_unique").on(table.chapterId, table.slug),
    foreignKey({
      columns: [table.parentTopicId],
      foreignColumns: [table.id],
      name: "qb_topics_parent_topic_id_qb_topics_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.chapterId],
      foreignColumns: [qbChapters.id],
      name: "qb_topics_chapter_id_qb_chapters_id_fk",
    }).onDelete("cascade"),
    check("qb_topics_question_count_check", sql`${table.questionCount} >= 0`),
    check("qb_topics_order_check", sql`${table.orderIndex} >= 0`),
  ],
);

export const qbQuestions = pgTable(
  "qb_questions",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    topicId: uuid("topic_id"),
    qType: qbQuestionType("q_type").default("mcq").notNull(),
    questionText: text("question_text").notNull(),
    contextText: text("context_text"),
    explanation: text(),
    status: qbStatus().default("published").notNull(),
    parentQuestionId: uuid("parent_question_id"),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("qb_questions_status_order_idx").using(
      "btree",
      table.status.asc().nullsLast(),
      table.orderIndex.asc().nullsLast(),
      table.id.asc().nullsLast(),
    ),
    index("qb_questions_topic_idx").using("btree", table.topicId.asc().nullsLast()),
    index("qb_questions_topic_status_idx").using(
      "btree",
      table.topicId.asc().nullsLast(),
      table.status.asc().nullsLast(),
    ),
    index("qb_questions_published_order_idx")
      .using("btree", table.orderIndex.asc().nullsLast(), table.id.asc().nullsLast())
      .where(sql`${table.status} = 'published'`),
    index("qb_questions_parent_question_idx").using(
      "btree",
      table.parentQuestionId.asc().nullsLast(),
    ),
    index("qb_questions_text_trgm_idx").using("gin", table.questionText.op("gin_trgm_ops")),
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [qbTopics.id],
      name: "qb_questions_topic_id_qb_topics_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.parentQuestionId],
      foreignColumns: [table.id],
      name: "qb_questions_parent_question_id_qb_questions_id_fk",
    }).onDelete("cascade"),
    check("qb_questions_order_check", sql`${table.orderIndex} >= 0`),
  ],
);

export const qbQuestionOptions = pgTable(
  "qb_question_options",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    questionId: uuid("question_id").notNull(),
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [
    unique("qb_question_options_question_order_unique").on(table.questionId, table.orderIndex),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [qbQuestions.id],
      name: "qb_question_options_question_id_qb_questions_id_fk",
    }).onDelete("cascade"),
    check("qb_question_options_order_check", sql`${table.orderIndex} >= 0`),
  ],
);

export const qbQuestionParts = pgTable(
  "qb_question_parts",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    questionId: uuid("question_id").notNull(),
    partText: text("part_text").notNull(),
    answerText: text("answer_text"),
    marks: numeric({ precision: 6, scale: 2 }),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [
    unique("qb_question_parts_order_unique").on(table.questionId, table.orderIndex),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [qbQuestions.id],
      name: "qb_question_parts_question_id_qb_questions_id_fk",
    }).onDelete("cascade"),
    check("qb_question_parts_marks_check", sql`${table.marks} is null or ${table.marks} >= 0`),
    check("qb_question_parts_order_check", sql`${table.orderIndex} >= 0`),
  ],
);

export const qbExamSheets = pgTable(
  "qb_exam_sheets",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    containerItemId: uuid("container_item_id"),
    chapterId: uuid("chapter_id"),
    title: text().notNull(),
    slug: text().notNull(),
    examType: qbExamType("exam_type").default("mcq").notNull(),
    durationMinutes: integer("duration_minutes").default(30).notNull(),
    totalMarks: numeric("total_marks", { precision: 8, scale: 2 }),
    negativeMarks: numeric("negative_marks", { precision: 6, scale: 2 }).default("0.25"),
    orderIndex: integer("order_index").default(0).notNull(),
    questionCount: integer("question_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("qb_exam_sheets_chapter_order_idx").using(
      "btree",
      table.chapterId.asc().nullsLast(),
      table.orderIndex.asc().nullsLast(),
    ),
    index("qb_exam_sheets_container_item_idx").using(
      "btree",
      table.containerItemId.asc().nullsLast(),
    ),
    unique("qb_exam_sheets_container_slug_unique").on(table.containerItemId, table.slug),
    unique("qb_exam_sheets_chapter_slug_unique").on(table.chapterId, table.slug),
    foreignKey({
      columns: [table.chapterId],
      foreignColumns: [qbChapters.id],
      name: "qb_exam_sheets_chapter_id_qb_chapters_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.containerItemId],
      foreignColumns: [qbContainerItems.id],
      name: "qb_exam_sheets_container_item_id_qb_container_items_id_fk",
    }).onDelete("cascade"),
    check(
      "qb_exam_sheets_scope_check",
      sql`${table.containerItemId} is not null or ${table.chapterId} is not null`,
    ),
    check("qb_exam_sheets_duration_check", sql`${table.durationMinutes} > 0`),
    check(
      "qb_exam_sheets_marks_check",
      sql`(${table.totalMarks} is null or ${table.totalMarks} >= 0) and (${table.negativeMarks} is null or ${table.negativeMarks} >= 0)`,
    ),
    check("qb_exam_sheets_question_count_check", sql`${table.questionCount} >= 0`),
  ],
);

export const qbExamSheetQuestions = pgTable(
  "qb_exam_sheet_questions",
  {
    examSheetId: uuid("exam_sheet_id").notNull(),
    questionId: uuid("question_id").notNull(),
    questionNumber: integer("question_number").default(1).notNull(),
  },
  (table) => [
    index("qb_exam_sheet_q_question_idx").using("btree", table.questionId.asc().nullsLast()),
    unique("qb_exam_sheet_q_sheet_number_unique").on(table.examSheetId, table.questionNumber),
    primaryKey({
      columns: [table.examSheetId, table.questionId],
      name: "qb_exam_sheet_questions_pk",
    }),
    foreignKey({
      columns: [table.examSheetId],
      foreignColumns: [qbExamSheets.id],
      name: "qb_exam_sheet_questions_exam_sheet_id_qb_exam_sheets_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [qbQuestions.id],
      name: "qb_exam_sheet_questions_question_id_qb_questions_id_fk",
    }).onDelete("cascade"),
    check("qb_exam_sheet_q_number_check", sql`${table.questionNumber} > 0`),
  ],
);



export const qbQuestionSources = pgTable(
  "qb_question_sources",
  {
    questionId: uuid("question_id").notNull(),
    sourceId: uuid("source_id").notNull(),
  },
  (table) => [
    index("qb_question_sources_source_idx").using("btree", table.sourceId.asc().nullsLast()),
    index("qb_question_sources_source_question_idx").using(
      "btree",
      table.sourceId.asc().nullsLast(),
      table.questionId.asc().nullsLast(),
    ),
    primaryKey({
      columns: [table.questionId, table.sourceId],
      name: "qb_question_sources_question_id_source_id_pk",
    }),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [qbQuestions.id],
      name: "qb_question_sources_question_id_qb_questions_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [qbSources.id],
      name: "qb_question_sources_source_id_qb_sources_id_fk",
    }).onDelete("cascade"),
  ],
);

export const qbChapterSources = pgTable(
  "qb_chapter_sources",
  {
    chapterId: uuid("chapter_id").notNull(),
    sourceId: uuid("source_id").notNull(),
  },
  (table) => [
    index("qb_chapter_sources_source_idx").using("btree", table.sourceId.asc().nullsLast()),
    primaryKey({ columns: [table.chapterId, table.sourceId], name: "qb_chapter_sources_pk" }),
    foreignKey({
      columns: [table.chapterId],
      foreignColumns: [qbChapters.id],
      name: "qb_chapter_sources_chapter_id_qb_chapters_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [qbSources.id],
      name: "qb_chapter_sources_source_id_qb_sources_id_fk",
    }).onDelete("cascade"),
  ],
);

export const qbCustomExams = pgTable(
  "qb_custom_exams",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    userId: uuid("user_id"),
    title: text().notNull(),
    examType: qbExamType("exam_type").default("mcq").notNull(),
    questionCount: integer("question_count").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    negativeMarks: numeric("negative_marks", { precision: 6, scale: 2 })
      .default("0.25")
      .notNull(),
    totalMarks: numeric("total_marks", { precision: 8, scale: 2 }).default("0").notNull(),
    config: jsonb().default(sql`'{}'::jsonb`).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("qb_custom_exams_created_idx").using("btree", table.createdAt.asc().nullsLast()),
    index("qb_custom_exams_user_created_idx").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.createdAt.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "qb_custom_exams_user_id_user_id_fk",
    }).onDelete("set null"),
    check("qb_custom_exams_duration_check", sql`${table.durationMinutes} > 0`),
    check("qb_custom_exams_question_count_check", sql`${table.questionCount} > 0`),
    check(
      "qb_custom_exams_marks_check",
      sql`${table.negativeMarks} >= 0 and ${table.totalMarks} >= 0`,
    ),
  ],
);

export const qbCustomExamQuestions = pgTable(
  "qb_custom_exam_questions",
  {
    customExamId: uuid("custom_exam_id").notNull(),
    questionId: uuid("question_id").notNull(),
    questionNumber: integer("question_number").default(1).notNull(),
  },
  (table) => [
    index("qb_custom_exam_q_question_idx").using("btree", table.questionId.asc().nullsLast()),
    unique("qb_custom_exam_q_exam_number_unique").on(table.customExamId, table.questionNumber),
    primaryKey({
      columns: [table.customExamId, table.questionId],
      name: "qb_custom_exam_questions_custom_exam_id_question_id_pk",
    }),
    foreignKey({
      columns: [table.customExamId],
      foreignColumns: [qbCustomExams.id],
      name: "qb_custom_exam_questions_custom_exam_id_qb_custom_exams_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [qbQuestions.id],
      name: "qb_custom_exam_questions_question_id_qb_questions_id_fk",
    }).onDelete("cascade"),
    check("qb_custom_exam_q_number_check", sql`${table.questionNumber} > 0`),
  ],
);

export const qbCustomExamSubmissions = pgTable(
  "qb_custom_exam_submissions",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    customExamId: uuid("custom_exam_id").notNull(),
    userId: uuid("user_id"),
    status: qbSubmissionStatus().default("auto_evaluated").notNull(),
    score: numeric({ precision: 6, scale: 2 }).default("0").notNull(),
    writtenScore: numeric("written_score", { precision: 6, scale: 2 }).default("0").notNull(),
    writtenTotalMarks: numeric("written_total_marks", { precision: 6, scale: 2 })
      .default("0")
      .notNull(),
    correctCount: integer("correct_count").default(0).notNull(),
    wrongCount: integer("wrong_count").default(0).notNull(),
    unansweredCount: integer("unanswered_count").default(0).notNull(),
    timeSpentSeconds: integer("time_spent_seconds").default(0).notNull(),
    answers: jsonb().default({}).notNull(),
    evaluatorId: uuid("evaluator_id"),
    evaluatorFeedback: text("evaluator_feedback"),
    evaluatedAt: timestamp("evaluated_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("qb_custom_exam_subs_evaluator_idx").using("btree", table.evaluatorId.asc().nullsLast()),
    index("qb_custom_exam_subs_exam_date_idx").using(
      "btree",
      table.customExamId.asc().nullsLast(),
      table.submittedAt.asc().nullsLast(),
    ),
    index("qb_custom_exam_subs_status_idx")
      .using("btree", table.status.asc().nullsLast())
      .where(sql`${table.status} = 'pending_evaluation'`),
    index("qb_custom_exam_subs_user_date_idx").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.submittedAt.asc().nullsLast(),
    ),
    index("qb_custom_exam_subs_answers_gin_idx").using(
      "gin",
      sql`${table.answers} jsonb_path_ops`,
    ),
    foreignKey({
      columns: [table.customExamId],
      foreignColumns: [qbCustomExams.id],
      name: "qb_custom_exam_submissions_custom_exam_id_qb_custom_exams_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "qb_custom_exam_submissions_user_id_user_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.evaluatorId],
      foreignColumns: [user.id],
      name: "qb_custom_exam_submissions_evaluator_id_user_id_fk",
    }).onDelete("set null"),
    check(
      "qb_custom_exam_subs_marks_check",
      sql`${table.score} >= 0 and ${table.writtenScore} >= 0 and ${table.writtenTotalMarks} >= 0`,
    ),
    check(
      "qb_custom_exam_subs_counts_check",
      sql`${table.correctCount} >= 0 and ${table.wrongCount} >= 0 and ${table.unansweredCount} >= 0 and ${table.timeSpentSeconds} >= 0`,
    ),
  ],
);

export const qbCustomExamWrittenSubmissions = pgTable(
  "qb_custom_exam_written_submissions",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    submissionId: uuid("submission_id").notNull(),
    questionId: uuid("question_id").notNull(),
    partId: uuid("part_id"),
    pageNumber: integer("page_number").default(1).notNull(),
    imageUrl: text("image_url").notNull(),
    annotatedImageUrl: text("annotated_image_url"),
    marksAwarded: numeric("marks_awarded", { precision: 6, scale: 2 }),
    maxMarks: numeric("max_marks", { precision: 6, scale: 2 }),
    feedback: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("qb_custom_exam_written_part_idx").using("btree", table.partId.asc().nullsLast()),
    index("qb_custom_exam_written_q_idx").using("btree", table.questionId.asc().nullsLast()),
    index("qb_custom_exam_written_sub_idx").using("btree", table.submissionId.asc().nullsLast()),
    foreignKey({
      columns: [table.partId],
      foreignColumns: [qbQuestionParts.id],
      name: "qb_custom_exam_written_submissions_part_id_qb_question_parts_id",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [qbQuestions.id],
      name: "qb_custom_exam_written_submissions_question_id_qb_questions_id_",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.submissionId],
      foreignColumns: [qbCustomExamSubmissions.id],
      name: "qb_custom_exam_written_submissions_submission_id_qb_custom_exam",
    }).onDelete("cascade"),
    check(
      "qb_custom_exam_written_marks_check",
      sql`(${table.marksAwarded} is null or ${table.marksAwarded} >= 0) and (${table.maxMarks} is null or ${table.maxMarks} >= 0)`,
    ),
    check("qb_custom_exam_written_page_check", sql`${table.pageNumber} > 0`),
  ],
);
