import { sql } from "drizzle-orm";
import * as fs from "fs";
import { db } from "./src/db";

async function main() {
  const file = fs.readFileSync("./src/db/migrations/0013_add_chapter_sources.sql", "utf-8");
  const stmts = file.split("--> statement-breakpoint");
  for (const stmt of stmts) {
    if (stmt.trim()) {
      await db.execute(sql.raw(stmt));
    }
  }
}
main().then(() => process.exit(0));
