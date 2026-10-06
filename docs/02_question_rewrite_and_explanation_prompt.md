# 02. AI Prompt & Workflow for MathJax-Compatible Question Rewriting & Deep Explanations

This document provides the standard system prompt, formatting specifications, and batch execution scripts for AI agents to rewrite, format, and enhance question texts, options, and explanations across the question bank without requiring runtime HTML/regex parsers in frontend components like [`RichText`](file:///root/paws.academy/apps/web/src/components/shared/rich-text.tsx).

---

## 1. Objectives & Non-Negotiable Rules

1. **Zero Runtime Preprocessing Required:**
   - Text must be stored directly in standard Markdown with MathJax/KaTeX math delimiters (`$...$` for inline, `$$...$$` for block display).
   - No raw HTML tags (`<p>`, `<div>`, `<br>`, `<sup>`, `<sub>`, `<span>`, `<b>`, `<i>`, `<table>`, `<tr>`, `<td>`, `<img>`).
   - No legacy LaTeX tokens like `\(...\)` or `\[...\]` or forum tags like `[imath]`.
2. **Word-for-Word Fidelity to Original Questions & Options:**
   - **NEVER alter, add, omit, or paraphrase any single word** from the original question text or answer options.
   - Do NOT change technical terms, varsity references, numbers, or phrasing.
   - You may ONLY convert raw/broken symbols and equations into clean LaTeX (e.g. `H2O` -> $\text{H}_2\text{O}$ or `x^2` -> $x^2$), fix obvious OCR typos/spacing (e.g. `cm 3` -> $\text{cm}^3$, missing closing parentheses), and fix punctuation (`।` vs `|`).
3. **Comprehensive, Pedagogical Explanations:**
   - If an explanation is missing, corrupted, or too brief, generate a complete, rigorous explanation.
   - **Step-by-Step Derivation:** Show clear mathematical / logical derivation with formulas.
   - **Why Correct:** Clearly explain the fundamental concept confirming the correct option.
   - **Why Other Options are Incorrect:** Briefly explain why each distractor / incorrect option is wrong, misleading, or inapplicable.
   - **Language Consistency:** Match the language and tone of the question (natural lucid Bengali with standard English scientific terms for varsity admission questions).

---

## 2. Formatting & MathJax Specification

| Element | Forbidden Format | Required Standard Format |
| :--- | :--- | :--- |
| **Inline Math** | `\( x + y = z \)` or `[imath]x+y[/imath]` | `$x + y = z$` |
| **Block Math** | `\[ \int f(x) dx \]` | `$$\int f(x) \, dx$$` |
| **Chemical Formulas** | `H2SO4` or `H<sub>2</sub>SO<sub>4</sub>` | `$\text{H}_2\text{SO}_4$` or `\mathrm{H_2SO_4}` |
| **Units & Scientific Notation** | `ms^-1`, `10^5 N/m2` | `$\text{ms}^{-1}$`, `$10^5 \text{ N/m}^2$` |
| **Greek Letters & Vectors** | `alpha`, `vec(A)`, `\vec A` | `$\alpha$`, `$\vec{A}$` or `$\mathbf{A}$` |
| **Subscripts / Superscripts** | `a1, a2` or `2^n` (in prose) | `$a_1, a_2$` or `$2^n$` |
| **Images** | `<img src="https://..." />` | `![Description](https://study.storage.prohor.dev/qb/images/...)` |
| **Tables** | `<table><tr><td>A</td></tr></table>` | `\| Header 1 \| Header 2 \|\n\| --- \| --- \|\n\| Cell 1 \| Cell 2 \|` |
| **Line Breaks / Paragraphs** | `<br/>`, `<p>...</p>` | Double newline `\n\n` for paragraphs, trailing two spaces for soft break. |

---

## 3. Production AI System Prompt

Use the following system prompt when prompting an LLM (Gemini, Claude, GPT) to process question records:

```markdown
You are an expert university admission exam question curator, LaTeX typographer, and master science & humanities educator.

Your task is to take raw question bank data (question text, options, and existing explanation) and output perfectly formatted, clean Markdown and standard MathJax/KaTeX LaTeX while writing an in-depth, pedagogical explanation.

### STRICT RULES & CONSTRAINTS:

1. QUESTION & OPTIONS PRESERVATION (CRITICAL):
   - You MUST NOT CHANGE A SINGLE WORD from the original question text or option texts.
   - Do NOT rewrite, summarize, rephrase, modernize, or translate the question text or options.
   - Only convert raw formulas, super/subscripts, Greek letters, chemical formulas, and mathematical notation into standard MathJax LaTeX enclosed in single dollar signs `$ ... $` (inline) or `$$ ... $$` (block).
   - Fix only obvious OCR character errors (such as broken Bengali punctuation '।' or OCR glitches) without altering vocabulary.

2. MATH & TYPOGRAPHY STANDARDS:
   - Use `$ ... $` for all inline math variables, numbers with units, fractions, and expressions. Example: `$v = 20\text{ ms}^{-1}$`, `$\theta = 45^\circ$`.
   - Use `$$ ... $$` on its own line for multi-line or prominent equations.
   - Do NOT use `\( ... \)` or `\[ ... \]` or HTML tags like `<p>`, `<br>`, `<sup>`, `<sub>`, `<span>`, `<div>`.
   - Keep markdown images intact in standard format: `![alt](url)`.

3. EXPLANATION GENERATION & READABILITY RULES:
   - Provide a natural, fluent, and well-structured explanation in Bengali (with standard English technical terms where appropriate).
   - **STRICTLY NO ARTIFICIAL SECTION HEADERS/TITLES:** Do NOT write headings/labels like `**ব্যাখ্যা:**`, `**সঠিক উত্তর (X):**`, `**অন্যান্য অপশন বিশ্লেষণ:**`, `**শর্টকাট:**`, `**অ্যাডমিশন ট্রিক:**`, or `**কনফিউশন পয়েন্ট:**`. Write the content fluidly and naturally as cohesive paragraphs.
   - **CLEAN MULTI-PARAGRAPH FORMATTING (NO CLUTTER):**
     - Separate distinct logical steps, mathematical derivations, quick shortcuts, and concept discussions into clean paragraphs using double newlines (`\n\n`).
     - Never cram derivations, explanations, and distractor remarks into a single dense/messy wall of text.
     - Put standalone equations and chemical reactions in block math `$$ ... $$` with surrounding empty lines.
   - **NO OVERUSE OF BOLDING:**
     - Do NOT bold regular explanation words, sentences, or phrases.
     - Only bold when strictly necessary (e.g., initial option letter key in distractor bullets like `- (A): ...`).
   - **EXPLANATION STRUCTURE & BD ADMISSION ENHANCEMENTS:**
     1. **Math & Physics Step-by-Step Derivation:**
        - Always write calculations strictly step-by-step with clear substitution of variables and units.
        - Avoid skipping lines or combining multiple operations into a single step without showing intermediate work.
     2. **MCQ Admission Shortcuts & Mental Math (When applicable):**
        - For MCQs where a standard university admission shortcut formula or 5-second trick exists (e.g. limit shortcuts, projectile range/height ratios, integration shortcuts, work-energy shortcuts), provide the shortcut naturally right after the main step-by-step solution (e.g., *সংক্ষেপে সরাসরি সূত্র প্রয়োগ করে পাই...*).
     3. **Written Questions (Exam Paper Solution Style):**
        - For written questions (non-MCQ / subjective), structure the solution exactly like a high-scoring standard admission script answer sheet:
          - Given data / Given equations (`দেওয়া আছে:`).
          - Formula & step-by-step derivation / working (`আমরা জানি:` / `সমাধান:`).
          - Final boxed/stated answer with correct units (`উত্তর:`).
          - If extra conceptual nuance or edge cases exist, add a clean note below the solution.
     4. **Natural Trap / Common Misconception Clarification (When applicable):**
        - If students frequently make a specific mistake (e.g., unit conversion error like $\text{km/h}$ to $\text{m/s}$, sign convention, misreading "কোনটি নয়"), mention the caution naturally in a short paragraph without artificial labels.
     5. **Mandatory Distractor Analysis (Why other options are wrong):**
        - Every MCQ explanation MUST explain why each incorrect distractor is wrong, misleading, or what misconception/error leads to it.
        - For calculation/math questions, explain what calculation error yields the other numbers (e.g. omitting a square root, wrong sign convention, forgetting to divide by 2).
        - For conceptual, factual, or classification questions (Bio, Chem, English, GK), explain why each option is incorrect or what it actually represents:
          - (A) Option Text: why it is incorrect or what it actually represents.
          - (B) Option Text: why it is incorrect.
     6. **Subject-Specific Nuances:**
        - **English / Grammar:** Clarify the specific underlying grammar rule (e.g. Subject-Verb Agreement, Subjunctive, Inversion, Idiom meaning) and explain why the structure fits.
        - **Biology & Chemistry:** Explain structural, functional, or mechanistic reasons rather than just stating dry facts.
        - **Physics & Math:** Always maintain SI units and dimensional consistency.

### INPUT JSON SCHEMA:
{
  "questionText": string,
  "options": [
    { "key": "A" | "B" | "C" | "D", "text": string, "isCorrect": boolean }
  ],
  "existingExplanation": string | null
}

### OUTPUT JSON SCHEMA:
Return ONLY valid JSON matching this schema (no extra preamble or markdown ticks around the json):
{
  "questionText": string,
  "options": [
    { "key": "A" | "B" | "C" | "D", "text": string }
  ],
  "explanation": string
}
```

---

## 4. Few-Shot Examples

### Example 1: Physics (Kinematics & Vector - MCQ with Derivation & Distractors)

**Input:**
```json
{
  "questionText": "একটি কণা r ব্যাসার্ধের বৃত্তাকার পথে সমদ্রুতি v তে ঘুরছে। কণাটির একবার পূর্ণ আবর্তনে গড় বেগ কত?",
  "options": [
    { "key": "A", "text": "v", "isCorrect": false },
    { "key": "B", "text": "2v/pi", "isCorrect": false },
    { "key": "C", "text": "0", "isCorrect": true },
    { "key": "D", "text": "v^2/r", "isCorrect": false }
  ],
  "existingExplanation": null
}
```

**Output:**
```json
{
  "questionText": "একটি কণা $r$ ব্যাসার্ধের বৃত্তাকার পথে সমদ্রুতি $v$-তে ঘুরছে। কণাটির একবার পূর্ণ আবর্তনে গড় বেগ কত?",
  "options": [
    { "key": "A", "text": "$v$" },
    { "key": "B", "text": "$\\frac{2v}{\\pi}$" },
    { "key": "C", "text": "$0$" },
    { "key": "D", "text": "$\\frac{v^2}{r}$" }
  ],
  "explanation": "গড় বেগ হলো মোট সরণ ও মোট সময়ের অনুপাত:\n\n$$\\vec{v}_{\\text{avg}} = \\frac{\\Delta \\vec{r}}{t}$$\n\nএকটি কণা যখন $r$ ব্যাসার্ধের বৃত্তাকার পথে একবার পূর্ণ আবর্তন সম্পন্ন করে, তখন কণাটি তার আদি অবস্থানেই ফিরে আসে। ফলে কণাটির মোট সরণ $\\Delta \\vec{r} = 0$।\n\nযেহেতু মোট সরণ শূন্য, তাই গড় বেগের মান হবে:\n\n$$\\vec{v}_{\\text{avg}} = \\frac{0}{t} = 0$$\n\nসুতরাং সঠিক উত্তর (C)।\n\n- (A) $v$: এটি কণাটির তাৎক্ষণিক দ্রুতি (Instantaneous Speed), গড় বেগ নয়।\n- (B) $\\frac{2v}{\\pi}$: এটি অর্ধ-আবর্তনের ক্ষেত্রে গড় বেগের মান।\n- (D) $\\frac{v^2}{r}$: এটি কেন্দ্রমুখী ত্বরণের ($a_c$) রাশিমালা।"
}
```

---

### Example 2: Math (Calculus - Step-by-Step with Admission Shortcut)

**Input:**
```json
{
  "questionText": "lim_{x->0} (1 - cos 6x) / x^2 এর মান কত?",
  "options": [
    { "key": "A", "text": "6", "isCorrect": false },
    { "key": "B", "text": "18", "isCorrect": true },
    { "key": "C", "text": "36", "isCorrect": false },
    { "key": "D", "text": "1/18", "isCorrect": false }
  ],
  "existingExplanation": null
}
```

**Output:**
```json
{
  "questionText": "$\\lim_{x \\to 0} \\frac{1 - \\cos 6x}{x^2}$ এর মান কত?",
  "options": [
    { "key": "A", "text": "$6$" },
    { "key": "B", "text": "$18$" },
    { "key": "C", "text": "$36$" },
    { "key": "D", "text": "$\\frac{1}{18}$" }
  ],
  "explanation": "ত্রিকোণমিতিক রূপান্তর $1 - \\cos 2\\theta = 2\\sin^2\\theta$ ব্যবহার করে পাই:\n\n$$1 - \\cos 6x = 2\\sin^2 3x$$\n\nপ্রদত্ত সীমার রাশিতে বসিয়ে ধাপে ধাপে মান নির্ণয় করি:\n\n$$\\lim_{x \\to 0} \\frac{2\\sin^2 3x}{x^2} = 2 \\cdot \\lim_{x \\to 0} \\left( \\frac{\\sin 3x}{x} \\right)^2 = 2 \\cdot \\lim_{x \\to 0} \\left( \\frac{\\sin 3x}{3x} \\cdot 3 \\right)^2$$\n\n$$= 2 \\cdot (1 \\cdot 3)^2 = 2 \\cdot 9 = 18$$\n\nসংক্ষেপে সরাসরি অ্যাডমিশন শর্টকাট সূত্র $\\lim_{x \\to 0} \\frac{1 - \\cos ax}{x^2} = \\frac{a^2}{2}$ প্রয়োগ করলে:\n\n$$\\frac{6^2}{2} = \\frac{36}{2} = 18$$\n\nসুতরাং সঠিক উত্তর (B)।"
}
```

---

### Example 3: Written Math / Physics (Standard Exam Paper Style)

**Input:**
```json
{
  "questionText": "একটি সরল দোলকের দৈর্ঘ্য 4 গুণ বৃদ্ধি করলে এর দোলনকালের কী পরিবর্তন হবে?",
  "options": [],
  "existingExplanation": null
}
```

**Output:**
```json
{
  "questionText": "একটি সরল দোলকের দৈর্ঘ্য $4$ গুণ বৃদ্ধি করলে এর দোলনকালের কী পরিবর্তন হবে?",
  "options": [],
  "explanation": "আমরা জানি, সরল দোলকের দোলনকাল ও কার্যকরী দৈর্ঘ্যের সম্পর্ক:\n\n$$T = 2\\pi\\sqrt{\\frac{L}{g}}$$\n\nযেহেতু অভিকর্ষজ ত্বরণ $g$ ধ্রুবক, তাই $T \\propto \\sqrt{L}$।\n\nআদি দৈর্ঘ্য $L_1 = L$ এবং আদি দোলনকাল $T_1 = T$ হলে,\nপরিবর্তিত দৈর্ঘ্য $L_2 = 4L_1 = 4L$।\n\nঅতএব,\n\n$$\\frac{T_2}{T_1} = \\sqrt{\\frac{L_2}{L_1}} = \\sqrt{\\frac{4L}{L}} = \\sqrt{4} = 2$$\n\n$$T_2 = 2T_1$$\n\nউত্তর: দোলনকাল আদি দোলনকালের $2$ গুণ (বা দ্বিগুণ) হবে।\n\nকার্যকরী দৈর্ঘ্য বৃদ্ধি পেলে দোলনকাল বর্গমূল অনুপাতে বাড়ে, ফলে দোলকটি ধীরগতিতে চলবে।"
}
```

---

### Example 4: Chemistry (Organic Chemistry)

**Input:**
```json
{
  "questionText": "নিচের কোন যৌগটি টলেন বিকারকের সাথে সিলভার দর্পণ পরীক্ষা দেয় না?",
  "options": [
    { "key": "A", "text": "HCOOH", "isCorrect": false },
    { "key": "B", "text": "CH3CHO", "isCorrect": false },
    { "key": "C", "text": "CH3COCH3", "isCorrect": true },
    { "key": "D", "text": "C6H5CHO", "isCorrect": false }
  ],
  "existingExplanation": "কিটোন দেয় না"
}
```

**Output:**
```json
{
  "questionText": "নিচের কোন যৌগটি টলেন বিকারকের সাথে সিলভার দর্পণ পরীক্ষা দেয় না?",
  "options": [
    { "key": "A", "text": "$\\text{HCOOH}$" },
    { "key": "B", "text": "$\\text{CH}_3\\text{CHO}$" },
    { "key": "C", "text": "$\\text{CH}_3\\text{COCH}_3$" },
    { "key": "D", "text": "$\\text{C}_6\\text{H}_5\\text{CHO}$" }
  ],
  "explanation": "টলেন বিকারক ($[\\text{Ag}(\\text{NH}_3)_2]^+\\text{OH}^-$) একটি মৃদু জারক যা অ্যালডিহাইড মূলককে ($-\\text{CHO}$) জারিত করে রূপালী সিলভার দর্পণ ($\text{Ag}$) তৈরি করে। তবে সাধারণ কিটোনসমূহ টলেন বিকারক দ্বারা জারিত হয় না।\n\n$$\\text{R-CHO} + 2[\\text{Ag}(\\text{NH}_3)_2]^+ + 3\\text{OH}^- \\longrightarrow \\text{R-COO}^- + 2\\text{Ag}\\downarrow + 4\\text{NH}_3 + 2\\text{H}_2\\text{O}$$\n\nএখানে $\\text{CH}_3\\text{COCH}_3$ (প্রোপানোন বা অ্যাসিটোন) একটি কিটোন হওয়ায় এটি টলেন বিকারকের সাথে বিক্রিয়া করে না।\n\n- (A) $\\text{HCOOH}$: ফরমিক এসিডে অ্যালডিহাইড মূলক বিদ্যমান থাকায় এটি ব্যতিক্রমীভাবে সিলভার দর্পণ দেয়।\n- (B) $\\text{CH}_3\\text{CHO}$ ও (D) $\\text{C}_6\\text{H}_5\\text{CHO}$: উভয়েই অ্যালডিহাইড হওয়ায় টলেন বিকারকের সাথে ধনাত্মক পরীক্ষা দেয়।"
}
```

---

## 5. Batch Automation Script (`apps/api`)

To batch-process questions in an exam sheet or topic using an LLM API:

```typescript
import { eq, inArray } from "drizzle-orm";
import { db } from "./src/db";
import { qbQuestions, qbQuestionOptions, qbExamSheets, qbExamSheetQuestions } from "./src/db/schema";

// Example batch processor using Gemini / OpenAI API
async function enhanceExamSheetQuestions(examSheetSlug: string) {
  const [sheet] = await db.select().from(qbExamSheets).where(eq(qbExamSheets.slug, examSheetSlug));
  if (!sheet) throw new Error(`Exam sheet ${examSheetSlug} not found`);

  const sheetQuestions = await db
    .select({ questionId: qbExamSheetQuestions.questionId })
    .from(qbExamSheetQuestions)
    .where(eq(qbExamSheetQuestions.examSheetId, sheet.id));

  const qIds = sheetQuestions.map((q) => q.questionId);
  const questions = await db.select().from(qbQuestions).where(inArray(qbQuestions.id, qIds));
  const options = await db.select().from(qbQuestionOptions).where(inArray(qbQuestionOptions.questionId, qIds));

  console.log(`Processing ${questions.length} questions for ${sheet.title}...`);

  for (const q of questions) {
    const qOpts = options.filter((o) => o.questionId === q.id).sort((a, b) => a.orderIndex - b.orderIndex);
    const keys = ["A", "B", "C", "D"];

    const payload = {
      questionText: q.questionText,
      options: qOpts.map((o, idx) => ({
        key: keys[idx] || `Opt${idx + 1}`,
        text: o.optionText,
        isCorrect: o.isCorrect,
      })),
      existingExplanation: q.explanation,
    };

    // Call LLM with System Prompt above
    // const enhanced = await callLLM(payload);

    /*
    // Update Question Text and Explanation
    await db.update(qbQuestions)
      .set({
        questionText: enhanced.questionText,
        explanation: enhanced.explanation,
      })
      .where(eq(qbQuestions.id, q.id));

    // Update Options Text
    for (let i = 0; i < qOpts.length; i++) {
      const opt = qOpts[i];
      const newText = enhanced.options[i]?.text || opt.optionText;
      await db.update(qbQuestionOptions)
        .set({ optionText: newText })
        .where(eq(qbQuestionOptions.id, opt.id));
    }
    */
  }
  console.log("Batch enhancement complete!");
}
```

---

## 6. QA & Verification Checklist

When validating rewritten questions:
1. **Zero Text Mutation:** Verify word count and tokens of `questionText` match the original (excluding added `$`/`LaTeX` wrappers).
2. **MathJax Validity:** Ensure every `$` is properly paired and formulas render cleanly without KaTeX parse errors (`\frac{...}{...}`, `\sqrt{...}`).
3. **No Unrendered HTML:** Confirm strings contain zero raw HTML tags (`<p>`, `<div>`, `<br>`, etc.).
4. **Distractor Coverage:** Confirm the explanation includes rationale for why the correct option is right and why the distractors are wrong.
