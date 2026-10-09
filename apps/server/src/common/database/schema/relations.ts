import { relations } from "drizzle-orm/relations";
import { account, session, user, verification } from "./auth.js";
import {
  billingOrders,
  creditTransactions,
  dailyExplanationUsage,
  subscriptions,
  userBatchAccess,
  userCredits,
} from "./billing.js";
import {
  qbChapterSources,
  qbChapters,
  qbContainerItems,
  qbContainers,
  qbCustomExamQuestions,
  qbCustomExamSubmissions,
  qbCustomExams,
  qbCustomExamWrittenSubmissions,
  qbExamSheetQuestions,
  qbExamSheets,
  qbQuestionOptions,
  qbQuestionParts,
  qbQuestionSources,
  qbQuestions,
  qbSources,
  qbSubjects,
  qbTargets,
  qbTopics,
} from "./qb.js";
import {
  watchChannels,
  watchCommentLikes,
  watchComments,
  watchInteractions,
  watchPlaylistVideos,
  watchPlaylists,
  watchProgress,
  watchSubscriptions,
  watchVideos,
} from "./watch.js";

export const userRelations = relations(user, ({ one, many }) => ({
  accounts: many(account),
  sessions: many(session),
  subscription: one(subscriptions),
  credits: one(userCredits),
  orders: many(billingOrders),
  batchAccesses: many(userBatchAccess),
  creditTransactions: many(creditTransactions),
  dailyExplanationUsages: many(dailyExplanationUsage),
  qbCustomExams: many(qbCustomExams),
  qbCustomExamSubmissions: many(qbCustomExamSubmissions),
  qbEvaluatedSubmissions: many(qbCustomExamSubmissions, { relationName: "evaluator" }),
  watchSubscriptions: many(watchSubscriptions),
  watchComments: many(watchComments),
  watchCommentLikes: many(watchCommentLikes),
  watchInteractions: many(watchInteractions),
  watchProgresses: many(watchProgress),
}));

export const billingOrdersRelations = relations(billingOrders, ({ one }) => ({
  user: one(user, {
    fields: [billingOrders.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const verificationRelations = relations(verification, () => ({}));

export const qbTargetsRelations = relations(qbTargets, ({ many }) => ({
  qbContainers: many(qbContainers),
  qbSubjects: many(qbSubjects),
}));

export const qbSubjectsRelations = relations(qbSubjects, ({ one, many }) => ({
  qbTarget: one(qbTargets, { fields: [qbSubjects.targetId], references: [qbTargets.id] }),
  qbChapters: many(qbChapters),
  qbContainerItems: many(qbContainerItems),
}));

export const qbContainersRelations = relations(qbContainers, ({ one, many }) => ({
  qbTarget: one(qbTargets, { fields: [qbContainers.targetId], references: [qbTargets.id] }),
  qbContainerItems: many(qbContainerItems),
}));

export const qbContainerItemsRelations = relations(qbContainerItems, ({ one, many }) => ({
  qbContainer: one(qbContainers, {
    fields: [qbContainerItems.containerId],
    references: [qbContainers.id],
  }),
  qbSubject: one(qbSubjects, {
    fields: [qbContainerItems.subjectId],
    references: [qbSubjects.id],
  }),
  qbChapters: many(qbChapters),
  qbExamSheets: many(qbExamSheets),
}));

export const qbChaptersRelations = relations(qbChapters, ({ one, many }) => ({
  qbSubject: one(qbSubjects, { fields: [qbChapters.subjectId], references: [qbSubjects.id] }),
  qbContainerItem: one(qbContainerItems, {
    fields: [qbChapters.containerItemId],
    references: [qbContainerItems.id],
  }),
  qbTopics: many(qbTopics),
  qbExamSheets: many(qbExamSheets),
  qbChapterSources: many(qbChapterSources),
}));

export const qbTopicsRelations = relations(qbTopics, ({ one, many }) => ({
  qbChapter: one(qbChapters, { fields: [qbTopics.chapterId], references: [qbChapters.id] }),
  qbParentTopic: one(qbTopics, {
    fields: [qbTopics.parentTopicId],
    references: [qbTopics.id],
    relationName: "topicTree",
  }),
  qbChildTopics: many(qbTopics, { relationName: "topicTree" }),
  qbQuestions: many(qbQuestions),
}));

export const qbQuestionsRelations = relations(qbQuestions, ({ one, many }) => ({
  topic: one(qbTopics, { fields: [qbQuestions.topicId], references: [qbTopics.id] }),
  qbParentQuestion: one(qbQuestions, {
    fields: [qbQuestions.parentQuestionId],
    references: [qbQuestions.id],
    relationName: "questionTree",
  }),
  qbChildQuestions: many(qbQuestions, { relationName: "questionTree" }),
  options: many(qbQuestionOptions),
  parts: many(qbQuestionParts),
  questionSources: many(qbQuestionSources),
  qbExamSheetQuestions: many(qbExamSheetQuestions),
  qbCustomExamQuestions: many(qbCustomExamQuestions),
  qbCustomExamWrittenSubmissions: many(qbCustomExamWrittenSubmissions),
}));

export const qbQuestionOptionsRelations = relations(qbQuestionOptions, ({ one }) => ({
  qbQuestion: one(qbQuestions, {
    fields: [qbQuestionOptions.questionId],
    references: [qbQuestions.id],
  }),
}));

export const qbQuestionPartsRelations = relations(qbQuestionParts, ({ one, many }) => ({
  qbQuestion: one(qbQuestions, {
    fields: [qbQuestionParts.questionId],
    references: [qbQuestions.id],
  }),
  qbCustomExamWrittenSubmissions: many(qbCustomExamWrittenSubmissions),
}));

export const qbExamSheetsRelations = relations(qbExamSheets, ({ one, many }) => ({
  qbChapter: one(qbChapters, { fields: [qbExamSheets.chapterId], references: [qbChapters.id] }),
  qbContainerItem: one(qbContainerItems, {
    fields: [qbExamSheets.containerItemId],
    references: [qbContainerItems.id],
  }),
  qbExamSheetQuestions: many(qbExamSheetQuestions),
}));

export const qbSourcesRelations = relations(qbSources, ({ one, many }) => ({
  container: one(qbContainers, { fields: [qbSources.containerId], references: [qbContainers.id] }),
  containerItem: one(qbContainerItems, { fields: [qbSources.containerItemId], references: [qbContainerItems.id] }),
  qbQuestionSources: many(qbQuestionSources),
  qbChapterSources: many(qbChapterSources),
}));


export const qbQuestionSourcesRelations = relations(qbQuestionSources, ({ one }) => ({
  qbQuestion: one(qbQuestions, {
    fields: [qbQuestionSources.questionId],
    references: [qbQuestions.id],
  }),
  source: one(qbSources, {
    fields: [qbQuestionSources.sourceId],
    references: [qbSources.id],
  }),
}));

export const qbChapterSourcesRelations = relations(qbChapterSources, ({ one }) => ({
  qbChapter: one(qbChapters, {
    fields: [qbChapterSources.chapterId],
    references: [qbChapters.id],
  }),
  qbSource: one(qbSources, { fields: [qbChapterSources.sourceId], references: [qbSources.id] }),
}));

export const qbExamSheetQuestionsRelations = relations(qbExamSheetQuestions, ({ one }) => ({
  qbExamSheet: one(qbExamSheets, {
    fields: [qbExamSheetQuestions.examSheetId],
    references: [qbExamSheets.id],
  }),
  qbQuestion: one(qbQuestions, {
    fields: [qbExamSheetQuestions.questionId],
    references: [qbQuestions.id],
  }),
}));

export const qbCustomExamsRelations = relations(qbCustomExams, ({ one, many }) => ({
  user: one(user, { fields: [qbCustomExams.userId], references: [user.id] }),
  qbCustomExamQuestions: many(qbCustomExamQuestions),
  qbCustomExamSubmissions: many(qbCustomExamSubmissions),
}));

export const qbCustomExamQuestionsRelations = relations(qbCustomExamQuestions, ({ one }) => ({
  qbCustomExam: one(qbCustomExams, {
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
    qbCustomExam: one(qbCustomExams, {
      fields: [qbCustomExamSubmissions.customExamId],
      references: [qbCustomExams.id],
    }),
    user: one(user, { fields: [qbCustomExamSubmissions.userId], references: [user.id] }),
    evaluator: one(user, {
      fields: [qbCustomExamSubmissions.evaluatorId],
      references: [user.id],
      relationName: "evaluator",
    }),
    qbCustomExamWrittenSubmissions: many(qbCustomExamWrittenSubmissions),
  }),
);

export const qbCustomExamWrittenSubmissionsRelations = relations(
  qbCustomExamWrittenSubmissions,
  ({ one }) => ({
    qbQuestionPart: one(qbQuestionParts, {
      fields: [qbCustomExamWrittenSubmissions.partId],
      references: [qbQuestionParts.id],
    }),
    qbQuestion: one(qbQuestions, {
      fields: [qbCustomExamWrittenSubmissions.questionId],
      references: [qbQuestions.id],
    }),
    qbCustomExamSubmission: one(qbCustomExamSubmissions, {
      fields: [qbCustomExamWrittenSubmissions.submissionId],
      references: [qbCustomExamSubmissions.id],
    }),
  }),
);

export const watchChannelsRelations = relations(watchChannels, ({ many }) => ({
  watchVideos: many(watchVideos),
  watchPlaylists: many(watchPlaylists),
  watchSubscriptions: many(watchSubscriptions),
}));

export const watchVideosRelations = relations(watchVideos, ({ one, many }) => ({
  watchChannel: one(watchChannels, {
    fields: [watchVideos.channelId],
    references: [watchChannels.id],
  }),
  watchComments: many(watchComments),
  watchInteractions: many(watchInteractions),
  watchProgresses: many(watchProgress),
  watchPlaylistVideos: many(watchPlaylistVideos),
}));

export const watchPlaylistsRelations = relations(watchPlaylists, ({ one, many }) => ({
  watchChannel: one(watchChannels, {
    fields: [watchPlaylists.channelId],
    references: [watchChannels.id],
  }),
  watchPlaylistVideos: many(watchPlaylistVideos),
}));

export const watchPlaylistVideosRelations = relations(watchPlaylistVideos, ({ one }) => ({
  watchPlaylist: one(watchPlaylists, {
    fields: [watchPlaylistVideos.playlistId],
    references: [watchPlaylists.id],
  }),
  watchVideo: one(watchVideos, {
    fields: [watchPlaylistVideos.videoId],
    references: [watchVideos.id],
  }),
}));

export const watchCommentsRelations = relations(watchComments, ({ one, many }) => ({
  watchVideo: one(watchVideos, { fields: [watchComments.videoId], references: [watchVideos.id] }),
  user: one(user, { fields: [watchComments.userId], references: [user.id] }),
  watchParentComment: one(watchComments, {
    fields: [watchComments.parentId],
    references: [watchComments.id],
    relationName: "commentThread",
  }),
  watchReplies: many(watchComments, { relationName: "commentThread" }),
  likes: many(watchCommentLikes),
}));

export const watchSubscriptionsRelations = relations(watchSubscriptions, ({ one }) => ({
  user: one(user, { fields: [watchSubscriptions.userId], references: [user.id] }),
  watchChannel: one(watchChannels, {
    fields: [watchSubscriptions.channelId],
    references: [watchChannels.id],
  }),
}));

export const watchInteractionsRelations = relations(watchInteractions, ({ one }) => ({
  user: one(user, { fields: [watchInteractions.userId], references: [user.id] }),
  watchVideo: one(watchVideos, {
    fields: [watchInteractions.videoId],
    references: [watchVideos.id],
  }),
}));

export const watchProgressRelations = relations(watchProgress, ({ one }) => ({
  user: one(user, { fields: [watchProgress.userId], references: [user.id] }),
  watchVideo: one(watchVideos, { fields: [watchProgress.videoId], references: [watchVideos.id] }),
}));

export const watchCommentLikesRelations = relations(watchCommentLikes, ({ one }) => ({
  watchComment: one(watchComments, {
    fields: [watchCommentLikes.commentId],
    references: [watchComments.id],
  }),
  user: one(user, { fields: [watchCommentLikes.userId], references: [user.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(user, { fields: [subscriptions.userId], references: [user.id] }),
}));

export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(user, { fields: [userCredits.userId], references: [user.id] }),
}));

export const userBatchAccessRelations = relations(userBatchAccess, ({ one }) => ({
  user: one(user, { fields: [userBatchAccess.userId], references: [user.id] }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(user, { fields: [creditTransactions.userId], references: [user.id] }),
}));

export const dailyExplanationUsageRelations = relations(dailyExplanationUsage, ({ one }) => ({
  user: one(user, { fields: [dailyExplanationUsage.userId], references: [user.id] }),
}));
