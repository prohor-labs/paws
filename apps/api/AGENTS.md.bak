# AGENTS.md — Rules & Architectural Guidelines for `apps/api`

> **Note for AI Agents:** This document defines the engineering standards, pipeline workflows, database conventions, and scraping rules for all operations inside `apps/api`. Always review these instructions before executing or writing scripts.

---

## 1. Scraping & Ingestion Rules (Strict Source of Truth)

1. **NEVER Scrape by Topic Series:**
   - Scraping endpoints such as `/read/series/:seriesId?topic=root` drop un-tagged questions, truncate exam papers, and cause option/stem sequence misalignments.
   - **Always scrape by Exam ID:** Use `GET https://api.chorcha.net/read/:examId`. Every exam sheet on Chorcha corresponds to an explicit 16-character exam ID (e.g., `jp-Wlpg4y_TNk0Zy`).
2. **Decryption Cipher:**
   - Chorcha returns encrypted question strings. Always inspect the response header `x-chorcha-id` (a 16-character string) and decode every text field with rolling modulo difference cipher:
     `charDiff = (text.charCodeAt(i) - key.charCodeAt(i % 16)) & 0xffff`.
3. **External Asset Storage (S3 Migration):**
   - **Never store raw `assets.chorcha.net` URLs** in the database.
   - Stream/download each asset and upload it to the self-hosted S3 bucket (`https://study.storage.prohor.dev/qb/images/...`).
   - Deduplicate image uploads using in-memory content/URL caches.
4. **Position Preservation in Exam Sheets:**
   - An exam sheet represents a chronological test (Q1, Q2, ..., Q80).
   - Link questions using `qb_exam_sheet_questions` with `question_number = 1..N`.
   - Never randomly re-order, delete, or scramble question numbers.
   - Maintain 1-based `order_index` for options: A=1, B=2, C=3, D=4.
5. **Multi-Source Tag Preservation:**
   - Admission questions often appear across multiple universities and years (e.g. `tags: "BUP FST 23-24,BUP FST 22-23"` or `["DU A 19-20", "RU A 21-22"]`).
   - The pipeline preserves all sources in `sources: string[]`.
   - The importer resolves every source tag against `qb_sources` and inserts junction links into `qb_question_sources` and `qb_chapter_sources` for all matching sources.

---

## 2. Universal Text Formatting & LaTeX Standards

All question stems, options, and explanations must render flawlessly on web and mobile without runtime sanitization:

1. **Zero Raw HTML:**
   - Strip all `<p>`, `<div>`, `<br>`, `<sup>`, `<sub>`, `<span>`, `<b>`, `<i>`, and `<table>` tags.
   - Paragraphs use double newline `\n\n`.
2. **Standard MathJax / KaTeX Delimiters:**
   - Inline math: `$ ... $` (e.g., `$x^2 + y^2 = r^2$`, `$\text{H}_2\text{O}_2$`, `$20\text{ ms}^{-1}$`).
   - Block/display math: `$$ ... $$` on standalone lines.
   - **No legacy tokens:** Disallow `\( ... \)`, `\[ ... \]`, and `[imath]`.
3. **Word-for-Word Fidelity:**
   - Never paraphrase, shorten, or alter original Bengali question stems and options.
   - Fix only OCR formatting glitches, broken Bengali Dari punctuation (`।` vs `|`), and convert formulas/symbols into LaTeX.

---

## 3. Explanation Architecture & Distractor Analysis

Explanations must follow pedagogical standards:

1. **No Artificial Section Headers:**
   - DO NOT prefix text with artificial bold labels like `**ব্যাখ্যা:**`, `**সঠিক উত্তর (A):**`, or `**শর্টকাট:**`.
   - Explanations must flow naturally across paragraphs.
2. **Mandatory Distractor Rationale:**
   - For MCQs, analyze why wrong options are incorrect:
     `- (A) Option Text: specific reason why it is incorrect.`
3. **Breathing Room & Vertical Spacing:**
   - Separate distinct derivations and distractor items with double newlines (`\n\n`).

---

## 4. Autonomous Topic & Chapter Mapping (Do NOT Block on Empty DB)

1. **Do NOT Search for Pre-existing Exam Questions:**
   - Previous questions may have been pruned or reset. Never loop queries trying to find existing questions in `qb_exam_sheets` as references.
2. **Direct Hash & Name Mapping:**
   - When a question has a Chorcha `topicHint` hash (e.g. `3D7A9sEP2v`), map it directly to `qb_topics.slug`.
   - When `topicHint` is `null` or unmapped, **classify it directly from the question text** into standard HSC chapters (e.g. `জৈব রসায়ন`, `ম্যাট্রিক্স ও নির্ণায়ক`, `চল তড়িৎ`, `কোষ ও এর গঠন`, `Preposition & Appropriate Preposition`).
   - The importer automatically resolves these names against `qb_chapters.name` and `qb_topics.name`.

---

## 5. Known Pitfalls & Best Fixes (From Production Runs)

1. **Chapter Name Matching Quirks (Whitespace / Encoding):**
   - Do NOT rely on strict `inArray(qbChapters.name, [...])` in scripts. Some chapter names in `qb_chapters` contain trailing spaces or slight spelling variants.
   - Use normalized `.trim().toLowerCase()` and substring or `LIKE` matches when querying.
2. **Comprehensive Bengali Orthography & Unicode Normalization (Wildcard Rules):**
   - Automatically normalize all nukta variants (`য` ↔ `য়`, `র` ↔ `ড়` / `ঢ়`, `ড` ↔ `ড়`, `ঢ` ↔ `ঢ়`), vowel kar diacritics, and consonant signs (`ৎ` ↔ `ত্`, `ং` ↔ `ঙ`, `ঃ` ↔ `:`, `ঁ`) to standard modern Bengali orthography (Unicode NFC).
   - Standardize punctuation (`।` vs `|`, quotes, dashes) and strip invisible zero-width artifacts (`\u200B`, orphaned `\u200C`/`\u200D`).
   - Treat all such Unicode and spelling corrections as valid typographic cleanup, not text mutations.
3. **Language Leakage Prevention:**
   - Never allow non-Bengali characters (e.g. Devanagari/Hindi `এককসহ`) to slip into generated Bengali explanations.
4. **Ambiguous or Faulty Official Exam Stems (e.g. Q47, Q50):**
   - NEVER edit the question stem or options to "correct" the exam paper (e.g., keep 'কোষগহ্বর ছোট' intact).
   - Write explanations that explain the official key while accurately clarifying the underlying biological/physical principles.
   - If Chorcha's tag contradicts the actual question (e.g., velocity kinematics tagged under 'Rocket Propulsion'), override the tag with the true syllabus topic.
5. **Image-Only Options Preservation:**
   - When question options contain only `<p><img src="..." /></p>` (e.g. graphs, circuit diagrams), regex-based text tag strippers can reduce them to empty strings unless image markdown (`![...](url)`) is preserved.
   - Always ensure images are uploaded to S3 first, and options retain their markdown image links.
6. **One-Time Taxonomy Cache & Batch Ingestion:**
   - Querying the DB sequentially for 80 questions causes slow network/DB roundtrips. Always load `scripts/taxonomy-dump.json` (or preload cache once) and perform bulk batch inserts for questions, options, chapters, and junction rows.

---

## 6. Database Integrity & Maintenance Rules

1. **Known Format Invariants Handled by AI Pipeline:**
   - Empty HTML artifacts (`<p></p>`, `<p><br></p>`) must be trimmed.
   - Dummy question parts (`Option A`, `Skip`, `Done`, `N/A`) must not exist.
   - Question type (`q_type`) must accurately reflect `mcq` vs `written`.
2. **Aggregations & Cache Recalculation:**
   - After any batch insert, update, or deletion, **always run `recalculateAllCounts()`** from `src/services/qb-count.service.ts` to sync question counts across `qb_topics`, `qb_chapters`, `qb_sources`, and `qb_exam_sheets`.

---

## 6. Main Reusable Scripts in `apps/api/scripts/`

- [`apps/api/scripts/prompt.md`](file:///root/paws.academy/apps/api/scripts/prompt.md): Master AI prompt and specifications for end-to-end question formatting, topic mapping, and pedagogical explanation generation.
- [`apps/api/scripts/chorcha-exam-importer.ts`](file:///root/paws.academy/apps/api/scripts/chorcha-exam-importer.ts): Core ingestion module that decrypts, migrates images, maps topics/chapters, and persists exam sheets.
- [`apps/api/scripts/sync-exam.ts`](file:///root/paws.academy/apps/api/scripts/sync-exam.ts): Unified CLI tool to fetch bundle URLs, single exams, format LaTeX, and import directly to database.
- [`apps/api/scripts/validate-processed.ts`](file:///root/paws.academy/apps/api/scripts/validate-processed.ts): Pre-import validator that diffs AI output against the raw dump and blocks ingestion on fidelity/format issues.
