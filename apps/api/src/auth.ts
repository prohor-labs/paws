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
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
      updateUserInfoOnLink: true,
    },
    skipStateCookieCheck: true,
  },
  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        defaultValue: false,
        input: true,
      },
      level: {
        type: "string",
        required: false,
        input: true,
      },
      track: {
        type: "string",
        required: false,
        input: true,
      },
      dailyReminderEnabled: {
        type: "boolean",
        defaultValue: true,
        input: true,
      },
    },
  },
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"],
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: true,
    },
    useSecureCookies: true,
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
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: process.env.EMAIL_FROM || "Prohor Auth <auth@prohor.dev>",
                to: email,
                subject: "Pawfessor - লগইন ম্যাজিক লিংক",
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
                    <h2 style="color: #111827; margin-top: 0; margin-bottom: 12px; font-size: 20px;">Pawfessor-এ স্বাগতম! 🐾</h2>
                    <p style="color: #4b5563; font-size: 14px; line-height: 22px; margin-bottom: 24px;">
                      আপনার অ্যাকাউন্টে সরাসরি লগইন করতে নিচের বাটনে ক্লিক করুন। এই লিংকটি সাময়িক সময়ের জন্য কার্যকর থাকবে।
                    </p>
                    <div style="margin: 28px 0; text-align: center;">
                      <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
                        লগইন করুন
                      </a>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin-top: 32px; border-top: 1px solid #f3f4f6; pt-4; margin-bottom: 0;">
                      আপনি যদি এই রিকোয়েস্ট না করে থাকেন, তবে নির্দ্বিধায় এই ইমেইলটি উপেক্ষা করতে পারেন।
                    </p>
                  </div>
                `,
              }),
            });
            if (!res.ok) {
              const errBody = await res.text();
              console.error("Resend send error:", errBody);
            }
          } catch (e) {
            console.error("Failed to send magic link via Resend:", e);
          }
        } else {
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
