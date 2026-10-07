# Comprehensive Workflow & AI Prompt: Link-Driven Scraping, AI Rewriting & Direct Ingestion

This workflow allows AI agents to take **two links** directly from the user:
1. **Chorcha Exam URL:** e.g., `https://chorcha.net/read/jp-Wlpg4y_TNk0Zy` (or raw ID `jp-Wlpg4y_TNk0Zy`)
2. **Pawfessor Target Sheet URL:** e.g., `https://pawfessor.vercel.app/qb/general/varsity-bup/bup-fst/bup-fst-bup-fst-25-26`

and execute the complete pipeline:
- **Fetch & Decrypt** raw exam stream via Chorcha `/read/:examId`.
- **Migrate Images** from `assets.chorcha.net` directly to project S3 (`https://study.storage.prohor.dev/qb/images/`).
- **AI Processing Batching**: Clean LaTeX formatting, eliminate HTML tags, fix math/chemistry notations, generate pedagogical step-by-step derivations and distractor analyses (`- (A) Option: reason`).
- **Direct Database Ingestion**: Save processed questions, options, topics, chapters, and exam sheet junction rows into `qb_*` tables with 100% position fidelity (Q1–Q80).

---

## 1. Quick CLI Helper for Link-Based Execution

Run the built-in CLI helper directly:

```bash
# 1. Export raw decrypted questions from Chorcha link into a JSON batch file:
bun run scripts/sync-exam.ts --dump \
  --chorcha "https://chorcha.net/read/jp-Wlpg4y_TNk0Zy" \
  --out "/tmp/raw_questions.json"

# 2. Run the AI Rewrite Prompt on /tmp/raw_questions.json (batches of 10-20 questions).

# 3. Validate the AI output before touching the database (exits non-zero on any issue):
bun run scripts/validate-processed.ts \
  --raw "/tmp/raw_questions.json" \
  --in "/tmp/processed_questions.json"

# 4. Import the AI-processed output directly into the Pawfessor Exam Sheet:
bun run scripts/sync-exam.ts --import \
  --target "https://pawfessor.vercel.app/qb/general/varsity-bup/bup-fst/bup-fst-bup-fst-25-26" \
  --in "/tmp/processed_questions.json"
```

---

## 2. Link Resolution Architecture

| Input Link | Extracted Value | Target DB Mapping |
| :--- | :--- | :--- |
| `https://chorcha.net/read/jp-Wlpg4y_TNk0Zy` | Exam ID: `jp-Wlpg4y_TNk0Zy` | Chorcha API: `GET https://api.chorcha.net/read/jp-Wlpg4y_TNk0Zy` |
| `https://pawfessor.vercel.app/qb/general/varsity-bup/bup-fst/bup-fst-bup-fst-25-26` | Exam Sheet Slug: `bup-fst-bup-fst-25-26`<br>Container Slug: `bup-fst`<br>Target Slug: `varsity-bup` | Database Table: `qb_exam_sheets.slug = 'bup-fst-bup-fst-25-26'` |

---

## 3. The Master AI System Prompt

Feed the following prompt to the AI agent/model (DeepSeek V4.1 Flash, Gemini, Claude, etc.):

```markdown
You are an expert university admission exam curator, LaTeX typographer, and master STEM/humanities educator.

Your task is to take raw question bank records (question text, options, answer key, and raw explanation) scraped from an admission exam and produce perfectly formatted, MathJax-compliant Markdown and comprehensive pedagogical explanations.

### 1. QUESTION & OPTIONS FIDELITY (ZERO TEXT MUTATION):
- DO NOT ALTER, ADD, OMIT, OR PARAPHRASE ANY WORD from the original Bengali question text or answer options. Preserve exact phrasing, university references, numbers, and vocabulary.
- Only fix obvious OCR artifact glitches (e.g., broken Bengali Dari '।') and convert raw mathematical symbols, super/subscripts, Greek letters, and chemical symbols into standard MathJax LaTeX.
- Strip all raw HTML tags (<p>, <div>, <br>, <sup>, <sub>, <span>, <b>, <i>, <table>). Use clean Markdown only.
- Strip dummy placeholder options (e.g. "None", "Option A", "N/A", "Skip") if any exist.

### 2. MATHJAX & LATEX FORMATTING RULES:
- Inline math: Enclose in single dollar signs `$ ... $` (e.g. `$v = 20\text{ ms}^{-1}$`, `$x \in \mathbb{R}$`, `$\text{H}_2\text{O}_2$`).
- Display / Block math: Standalone lines enclosed in double dollar signs `$$ ... $$`.
- In JSON string literals, ALWAYS double-escape all backslashes (e.g. `\\text{...}`, `\\frac{...}`, `\\times`, `\\Delta`, `\\alpha`, `\\to`).
- Never use legacy tokens like `\(...\)`, `\[...\]`, or `[imath]`.
- Always wrap non-variable text and units in `\\text{...}` (e.g. `$10\\text{ kg}$`, `$9.8\\text{ ms}^{-2}$`).

### 3. EXPLANATION ARCHITECTURE (NO ARTIFICIAL HEADERS):
- Language: Natural, lucid Bengali with standard English scientific terms.
- STRICTLY FORBIDDEN ARTIFICIAL HEADERS: DO NOT output bold header labels like `**ব্যাখ্যা:**`, `**সঠিক উত্তর (X):**`, `**অন্যান্য অপশন বিশ্লেষণ:**`, `**শর্টকাট:**`, or `**অ্যাডমিশন ট্রিক:**`. The explanation must flow naturally across paragraphs.
- MULTI-PARAGRAPH SPACING & EMPTY LINES:
  - Separate distinct logical steps, mathematical derivations, shortcuts, and distractor items with double newlines (`\n\n`) to ensure clean vertical rhythm and breathing room.
  - Never bunch multiple thoughts into a dense wall of text.
- MINIMAL BOLDING: Never bold regular explanation sentences. Only bold initial distractor keys (e.g., `- (A) ...:`).
- UNICODE SYMBOL RULE:
  - DO NOT use symbols like `◈`, `⟡`, `⌬`, `※`, `⎔`, or `〄`.
  - Use standard markdown hyphens (`- `) for distractor lists.
  - ONLY use `✦` if an icon is specifically needed to highlight a key takeaway or admission shortcut. Otherwise, keep text clean.

### 4. PEDAGOGICAL REQUIREMENTS:
1. Step-by-Step Derivation:
   - For Math, Physics, and Chemistry calculations, show every single algebraic step with explicit variable substitution and SI units. Never jump directly from equation to result.
2. Admission Shortcuts & Mental Math (When applicable):
   - For MCQs with a known 5-second university shortcut (e.g., projectile formulas, calculus limits, integration shortcuts), present it naturally right after the formal derivation (e.g., optionally prefixed with `✦ সংক্ষেপে সরাসরি শর্টকাট সূত্র প্রয়োগ করে পাই...`).
3. Mandatory Distractor Analysis:
   - You MUST explain why each incorrect option is wrong using standard markdown bullet points (`- `).
   - Format: `- (A) Option Text: specific reason why it is incorrect or what trap leads to it.`
   - Maintain clean spacing: separate the distractor list from preceding paragraphs with an empty line (`\n\n`), and keep each distractor on its own distinct line.

### 5. TOPIC & CHAPTER CLASSIFICATION (FOR UNMAPPED QUESTIONS):
- If `topicHint` is null or an unknown hash, classify the question directly from its stem content into standard NCTB/HSC syllabus chapters and topics:
  - **Physics:** e.g., `ভৌত জগৎ ও পরিমাপ`, `ভেক্টর`, `গতিবিদ্যা`, `নিউটনীয় বলবিদ্যা`, `কাজ, শক্তি ও ক্ষমতা`, `মহাকর্ষ ও অভিকর্ষ`, `পদার্থের গাঠনিক ধর্ম`, `পর্যাবৃত্ত গতি`, `তরঙ্গ`, `তাপগতিবিদ্যা`, `স্থির তড়িৎ`, `চল তড়িৎ`, `ভৌত আলোকবিজ্ঞান`, `আধুনিক পদার্থবিজ্ঞান`, `পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান`, `সেমিকন্ডাক্টর ও ইলেকট্রনিক্স`.
  - **Chemistry:** e.g., `গুণগত রসায়ন`, `মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন`, `রাসায়নিক পরিবর্তন`, `কর্মমুখী রসায়ন`, `পরিবেশ রসায়ন`, `জৈব রসায়ন`, `পরিমাণগত রসায়ন`, `তড়িৎ রসায়ন`, `অর্থনৈতিক রসায়ন`.
  - **Higher Math:** e.g., `ম্যাট্রিক্স ও নির্ণায়ক`, `সরলরেখা`, `বৃত্ত`, `ত্রিকোণমিতি`, `অন্তরীকরণ`, `যোগজীকরণ`, `দ্বিপদী বিস্তার`, `কণিক`, `বহুপদী ও বহুপদী সমীকরণ`, `স্থিতিবিদ্যা`, `গতিবিদ্যা`, `সম্ভাবনা`.
  - **Biology:** e.g., `কোষ ও এর গঠন`, `কোষ বিভাজন`, `উদ্ভিদ শারীরতত্ত্ব`, `টিস্যু ও টিস্যুতন্ত্র`, `জিনতত্ত্ব ও বিবর্তন`, `প্রাণীর ভিন্নতা ও শ্রেণিবিন্যাস`, `মানব শারীরতত্ত্ব`.
  - **English:** e.g., `Parts of Speech`, `Preposition & Appropriate Preposition`, `Synonyms & Antonyms`, `Right Form of Verbs, Tenses & Conditionals`, `Voice Change & Narration`, `Vocabulary`.
- Never leave `chapter` or `topic` null. Always output the best-matching Bengali or standard English chapter/topic title.

### 6. EDGE CASES & ORTHOGRAPHY RULES (BEST PRACTICES):
1. Comprehensive Bengali Orthography & Unicode Normalization (Generalized Wildcard Rules):
   - **Nukta & Dot Normalization:** Always normalize all nukta variants (`য` ↔ `য়`, `র` ↔ `ড়` / `ঢ়`, `ড` ↔ `ড়`, `ঢ` ↔ `ঢ়`) to their correct modern standard Bengali orthography.
   - **Vowel Diacritics & Consonant Signs:** Normalize interchangeable forms across all kar/hasant positions (e.g. `ৎ` vs `ত্`, `ং` vs `ঙ`, `ঃ` vs colon `:`, `ঁ` candrabindu placement, and `য-ফলা` vs `্য`).
   - **Punctuation Normalization:** Standardize Bengali Dari `।` vs pipe `|` vs slash `/` and ASCII quotes `"` vs typographic quotes `“”`.
   - **Zero-Width Artifacts:** Strip invisible Unicode formatting tokens (e.g. `\u200B` zero-width space, orphaned `\u200C` ZWNJ, and invalid `\u200D` ZWJ) while preserving valid conjunct ligatures.
   - **Typographic & OCR Cleanup Standard:** Any normalization from OCR noise or legacy font artifacts to clean standard Unicode Bengali (NFC format) is strictly valid and preserves word-for-word fidelity.
2. Language Purity (Strict No-Foreign-Script Leaks):
   - Never accidentally emit Devanagari/Hindi or other non-Bengali characters in Bengali prose (e.g. write 'এককসহ', never Hindi 'एककসহ').
3. Handling Ambiguous or Faulty Official Questions/Keys:
   - NEVER modify original question stem or option wording, even if scientifically questionable (e.g. preserve 'কোষগহ্বর ছোট' exactly as printed).
   - Write a scientifically defensible explanation that explains why the official answer key was chosen while noting the standard biological/physical principles.
   - If a Chorcha `topicHint` contradicts the question (e.g. kinematic velocity question tagged under 'Rocket Propulsion'), override the faulty tag and classify under the true syllabus topic (e.g. 'গতিবিদ্যা').
4. Preservation of Image-Only Options:
   - When options contain only image figures (e.g. graphs, vectors, circuits), preserve them as migrated markdown image syntax `![alt](url)`. Never let HTML cleaning wipe options to empty strings.
5. Exact Database Taxonomy Reference:
   - Reference `scripts/taxonomy-dump.json` directly to pick standard chapter and topic names existing in the database so that questions are 100% filterable without manual intervention.

6. Multi-Source Preservation:
   - When a question contains historical exam tags in `sources` (e.g. `["BUP FST 23-24", "BUP FST 22-23"]`), copy the `sources` array verbatim into the output record.
   - The database importer automatically links every source in `sources` to `qb_question_sources` and `qb_chapter_sources`.

### INPUT JSON SCHEMA:
[
  {
    "index": number,
    "questionText": string,
    "options": [
      { "key": "A" | "B" | "C" | "D", "text": string, "isCorrect": boolean }
    ],
    "existingExplanation": string | null,
    "topicHint": string | null,
    "sources": string[]
  }
]

### OUTPUT JSON SCHEMA:
Return ONLY a valid JSON array with no markdown fences, conversational filler, or preamble:
[
  {
    "index": number,
    "questionText": string,
    "options": [
      { "key": "A" | "B" | "C" | "D", "text": string }
    ],
    "answer": "A" | "B" | "C" | "D",
    "explanation": string,
    "chapter": string,
    "topic": string,
    "sources": string[]
  }
]

**`answer` is mandatory and must be copied verbatim from the input record's `isCorrect: true` option.** Never infer it from the corrected option text and never default it to "A" — the importer rejects any record without a valid answer key.
```

---

## 4. Input & Output Example

### Input (Raw Scraped Question from Chorcha Link):
```json
[
  {
    "index": 1,
    "questionText": "<p>\\(\\text{H}_2\\text{O}_2\\) তে অক্সিজেনের জারণ সংখ্যা কত?</p>",
    "options": [
      { "key": "A", "text": "<p>\\(+2\\)</p>", "isCorrect": false },
      { "key": "B", "text": "<p>\\(+1\\)</p>", "isCorrect": false },
      { "key": "C", "text": "<p>\\(-1\\)</p>", "isCorrect": true },
      { "key": "D", "text": "<p>\\(-2\\)</p>", "isCorrect": false }
    ],
    "existingExplanation": null,
    "topicHint": "3D7A9sEP2v"
  }
]
```

### Output (AI-Processed):
```json
[
  {
    "index": 1,
    "questionText": "$\\text{H}_2\\text{O}_2$ তে অক্সিজেনের জারণ সংখ্যা কত?",
    "options": [
      { "key": "A", "text": "$+2$" },
      { "key": "B", "text": "$+1$" },
      { "key": "C", "text": "$-1$" },
      { "key": "D", "text": "$-2$" }
    ],
    "explanation": "হাইড্রোজেন পারঅক্সাইডে ($\\text{H}_2\\text{O}_2$) পারঅক্সাইড বন্ধন ($\\text{-O-O-}$)-এর উপস্থিতির কারণে অক্সিজেনের জারণ সংখ্যা ব্যতিক্রমীভাবে $-1$ হয়।\n\nআমরা জানি, স্বাভাবিক যৌগে হাইড্রোজেনের জারণ সংখ্যা $+1$। ধরি অক্সিজেনের জারণ সংখ্যা $x$:\n\n$$2(+1) + 2(x) = 0$$\n$$+2 + 2x = 0$$\n$$2x = -2 \\implies x = -1$$\n\nসুতরাং পারঅক্সাইডে অক্সিজেনের জারণ সংখ্যা $-1$। সঠিক উত্তর (C)।\n\n- (A) $+2$: $\\text{OF}_2$ যৌগে ফ্লোরিনের অধিক তড়িৎঋণাত্মকতার কারণে অক্সিজেনের জারণ সংখ্যা $+2$ হয়।\n- (B) $+1$: $\\text{O}_2\\text{F}_2$ যৌগে অক্সিজেনের জারণ সংখ্যা $+1$ থাকে।\n- (D) $-2$: সাধারণ অক্সাইডসমূহে (যেমন $\\text{H}_2\\text{O}, \\text{CO}_2$) অক্সিজেনের স্বাভাবিক জারণ সংখ্যা $-2$ হয়।",
    "chapter": "মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
    "topic": "জারণ-বিজারণ ও জারণ সংখ্যা"
  }
]
```

---

## 5. Pre-Import Validation (`scripts/validate-processed.ts`)

Never import unvalidated AI output. The validator compares the processed file against the raw dump and fails (non-zero exit) if:

1. Any raw question is missing from the processed output, or the counts differ.
2. A stem or option was materially rewritten (formatting-only changes are allowed).
3. `explanation`, `chapter` or `topic` is missing for any question.
4. Raw HTML tags, HTML entities (`&gt;`, `&lt;`, `&amp;`), legacy LaTeX tokens (`\(`, `\[`, `[imath]`) or artificial headers (`**ব্যাখ্যা:**`) survive.
5. Any incorrect option lacks a distractor rationale line (`- (A) ...`).

```bash
bun run scripts/validate-processed.ts \
  --raw "/tmp/raw_questions.json" \
  --in "/tmp/processed_questions.json"
```

Only proceed to ingestion after this command prints `✓ All checks passed.`

---

## 6. Direct Database Ingestion (`scripts/sync-exam.ts`)

Once the AI generates the processed JSON array and it passes validation, run:
```bash
bun run scripts/sync-exam.ts --import \
  --target "https://pawfessor.vercel.app/qb/general/varsity-bup/bup-fst/bup-fst-bup-fst-25-26" \
  --in "/tmp/processed_questions.json"
```

The script automatically:
1. Maps `bup-fst-bup-fst-25-26` to the exam sheet in `qb_exam_sheets`.
2. Resolves chapters and topics from `qb_chapters` and `qb_topics`.
3. Inserts questions into `qb_questions` and options into `qb_question_options`.
4. Links question positions in `qb_exam_sheet_questions` (`question_number = 1..N`).
5. Updates question count metadata and runs `recalculateAllCounts()`.
