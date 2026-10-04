import { db } from "../src/db";
import { qbQuestions, qbQuestionOptions } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { recalculateAllCounts } from "../src/services/qb-count.service";

const CHORCHA_TOKEN = process.env.CHORCHA_TOKEN;

function decodeChorcha(text: string | null | undefined, key: string | null): string {
  if (!text || !key) return text || "";
  const chars: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const diff = (text.charCodeAt(i) - key.charCodeAt(i % 16)) & 0xffff;
    chars.push(String.fromCharCode(diff));
  }
  return chars.join("").replace(/\0/g, "");
}

function cleanHtml(text: string | null | undefined): string {
  if (!text) return "";
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD\uFFF0-\uFFFF]/.test(text)) {
    return "";
  }
  return text.trim();
}

async function restoreMedicalOptions() {
  console.log("==========================================================");
  console.log("🚀 RESTORING MISSING MCQ OPTIONS FROM CHORCHA");
  console.log("==========================================================\n");

  const seriesConfigs = [
    { seriesId: "-KjN72iFB8", prefix: "MAT", name: "Medical (MBBS)" },
    { seriesId: "ee-AWP10mv", prefix: "DAT", name: "Dental (BDS)" },
    { seriesId: "z8xUZQqs6h", prefix: "AFMC", name: "Armed Forces (AFMC)" },
  ];

  let totalRestored = 0;

  for (const sc of seriesConfigs) {
    console.log(`\n▶ Streaming ${sc.name} (${sc.seriesId})...`);
    let page = 1;

    while (true) {
      const url = `https://api.chorcha.net/read/series/${sc.seriesId}?topic=root&page=${page}&filters=&label_filter=`;
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${CHORCHA_TOKEN}` },
        });
        if (!res.ok) {
          console.log(`  Finished ${sc.name} at page ${page} (HTTP ${res.status}).`);
          break;
        }

        const key = res.headers.get("x-chorcha-id");
        const json = await res.json();
        const questions = json.data?.questions || [];
        if (questions.length === 0) {
          console.log(`  Reached end of questions for ${sc.name} at page ${page}.`);
          break;
        }

        let pageRestored = 0;
        for (const q of questions) {
          const decQ = decodeChorcha(q.question, key).trim();
          const decA = decodeChorcha(q.A, key).trim();
          const decB = decodeChorcha(q.B, key).trim();
          const decC = decodeChorcha(q.C, key).trim();
          const decD = decodeChorcha(q.D, key).trim();
          const decSol = cleanHtml(decodeChorcha(q.solution, key));

          if (!decA && !decB) continue;

          // Find question in DB by matching questionText
          const [matchedQ] = await db
            .select({ id: qbQuestions.id, qType: qbQuestions.qType })
            .from(qbQuestions)
            .where(eq(qbQuestions.questionText, decQ));

          if (matchedQ) {
            const existingOpts = await db
              .select({ id: qbQuestionOptions.id })
              .from(qbQuestionOptions)
              .where(eq(qbQuestionOptions.questionId, matchedQ.id));

            if (existingOpts.length === 0) {
              await db
                .update(qbQuestions)
                .set({
                  qType: "mcq",
                  explanation: decSol || null,
                })
                .where(eq(qbQuestions.id, matchedQ.id));

              const optTexts = [
                { key: "A", text: decA, orderIndex: 1 },
                { key: "B", text: decB, orderIndex: 2 },
                { key: "C", text: decC, orderIndex: 3 },
                { key: "D", text: decD, orderIndex: 4 },
              ].filter((o) => o.text && o.text.trim().length > 0);

              for (const opt of optTexts) {
                await db.insert(qbQuestionOptions).values({
                  id: uuidv7(),
                  questionId: matchedQ.id,
                  optionText: opt.text,
                  isCorrect: opt.key === (q.answer || "").trim(),
                  orderIndex: opt.orderIndex,
                });
              }

              pageRestored++;
              totalRestored++;
            }
          }
        }

        console.log(`  ✓ Page ${page}: ${questions.length} fetched (${pageRestored} restored) | Total restored: ${totalRestored}`);
        page++;
        await new Promise((r) => setTimeout(r, 50));
      } catch (err) {
        console.error(`  ❌ Error processing page ${page}:`, err);
        break;
      }
    }
  }

  console.log(`\n==========================================================`);
  console.log(`🎉 RESTORATION COMPLETE: Restored ${totalRestored} questions!`);
  console.log(`==========================================================\n`);

  console.log("Recalculating all question counts...");
  await recalculateAllCounts();
  console.log("✓ All counts recalculated.");
}

restoreMedicalOptions()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  });
