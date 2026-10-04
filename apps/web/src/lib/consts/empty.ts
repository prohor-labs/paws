import type { QBChapter, QBQuestion, QBSubject, QBTopic } from "@/types";

export const EMPTY_QUESTIONS: readonly QBQuestion[] = Object.freeze([]);
export const EMPTY_SUBJECTS: readonly QBSubject[] = Object.freeze([]);
export const EMPTY_CHAPTERS: readonly QBChapter[] = Object.freeze([]);
export const EMPTY_TOPICS: readonly QBTopic[] = Object.freeze([]);
export const EMPTY_STRING_MAP: Readonly<Record<string, string>> = Object.freeze({});
