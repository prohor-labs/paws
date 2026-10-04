import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins/magic-link";
import { v7 as uuidv7 } from "uuid";
import { db } from "./db";
import * as schema from "./db/schema";
import { env } from "./lib/env";
import { isTrustedOrigin, STATIC_TRUSTED_ORIGINS } from "./lib/origins";

export const auth = betterAuth({
  appName: "Pawfessor",
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!env.isProduction) {
          console.info(`Magic link for ${email}: ${url}`);
        }
      },
    }),
  ],
  trustedOrigins: async (request) => {
    const origins = new Set(STATIC_TRUSTED_ORIGINS);
    const origin = request?.headers.get("origin");
    if (origin && isTrustedOrigin(origin)) {
      origins.add(origin);
    }
    return [...origins];
  },
});
