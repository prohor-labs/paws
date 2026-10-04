import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "ClaudeBot",
          "Bytespider",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
          "Diffbot",
          "FacebookBot",
          "ImagesiftBot",
        ],
        disallow: ["/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/exam/*/take"],
      },
    ],
  };
}
