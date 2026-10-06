import { eq } from "drizzle-orm";
import { db } from "../db";
import { qbQuestions, qbQuestionOptions } from "../db/schema";

export async function runUpdates(updates: any[]) {
  for (const u of updates) {
    await db.update(qbQuestions)
      .set({
        questionText: u.questionText,
        explanation: u.explanation
      })
      .where(eq(qbQuestions.id, u.id));

    if (u.options && u.options.length > 0) {
      for (const opt of u.options) {
        await db.update(qbQuestionOptions)
          .set({ optionText: opt.text })
          .where(eq(qbQuestionOptions.id, opt.id));
      }
    }
  }
}
