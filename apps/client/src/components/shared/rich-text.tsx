"use client";

import type { ComponentProps } from "react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import rehypeMathjaxSvg from "rehype-mathjax/svg";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Check, Copy } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { RichTextProps } from "@/types";

export type { RichTextProps };

function CodeBlock({ language, value }: { language?: string; value: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-border/70 bg-muted text-foreground text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/70 border-b border-border/40 select-none text-[11px] text-muted-foreground">
        <span className="font-semibold uppercase">{language || "code"}</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => copyToClipboard(value)}
          className="font-mono"
        >
          {isCopied ? <Check className="text-primary" /> : <Copy />}
          {isCopied ? "কপি হয়েছে!" : "কোড কপি করুন"}
        </Button>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="m-0 leading-relaxed font-mono whitespace-pre">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}

function formatMathText(str: string): string {
  if (!str) return "";
  const res = str;

  const parts = res.split(/(\$[^$]+\$)/g);
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    if (chunk?.startsWith("$") && chunk.endsWith("$")) continue;
    if (!chunk) continue;

    parts[i] = chunk.replace(
      /([a-zA-Z0-9_^\\+\-*/=><()]+(?:(?:\s*[+\-*/=><]\s*)[a-zA-Z0-9_^\\+\-*/=><()]+)*)/g,
      (match) => {
        const trimmed = match.trim();
        if (trimmed.length <= 1) return match;
        if (!/[=^/\\_]|\b(sin|cos|tan|sec|csc|cot|log|ln)\b/.test(trimmed)) {
          return match;
        }

        let math = trimmed;
        math = math.replace(
          /\(?d\^?(\d+)?([a-zA-Z])\)?\s*\/\s*\(?d([a-zA-Z])\^?(\d+)?\)?/g,
          (_, p1, v1, v2, p2) => {
            const pow1 = p1 ? `^{${p1}}` : "";
            const pow2 = p2 ? `^{${p2}}` : p1 ? `^{${p1}}` : "";
            return `\\frac{d${pow1}${v1}}{d${v2}${pow2}}`;
          },
        );
        math = math.replace(
          /(?<=^|[^a-zA-Z\\])d([a-zA-Z])\s*\/\s*d([a-zA-Z])(?=$|[^a-zA-Z])/g,
          "\\frac{d$1}{d$2}",
        );
        math = math.replace(/\^(-?\d+)/g, "^{$1}");
        math = math.replace(/([a-zA-Z0-9])(sin|cos|tan|sec|csc|cot|log|ln)\b/g, "$1\\$2");
        math = math.replace(/(?<!\\)\b(sin|cos|tan|sec|csc|cot|log|ln)\b/g, "\\$1");
        math = math.replace(/([a-zA-Z0-9)])\\frac/g, "$1 \\frac");

        return `$${math}$`;
      },
    );
  }

  return parts.join("");
}

export const RichText = React.memo(function RichText({ content, className }: RichTextProps) {
  const rehypePlugins: ComponentProps<typeof ReactMarkdown>["rehypePlugins"] = React.useMemo(
    () => [
      rehypeRaw,
      [
        rehypeMathjaxSvg,
        {
          fontCache: "global",
          internalSpeechTitles: false,
        },
      ],
    ],
    [],
  );

  const remarkPlugins: ComponentProps<typeof ReactMarkdown>["remarkPlugins"] = React.useMemo(
    () => [remarkGfm, [remarkMath, { singleDollarTextMath: true }]],
    [],
  );

  const formattedContent = React.useMemo(() => {
    return content ? formatMathText(content) : "";
  }, [content]);

  if (!content) return null;

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert break-words text-foreground leading-relaxed overflow-x-auto",
        "prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0",
        "prose-table:my-3 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-th:bg-muted/40",
        "prose-blockquote:border-l-4 prose-blockquote:border-brand/60 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const isInline = !match && !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-brand dark:text-brand"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <CodeBlock
                language={match ? match[1] : undefined}
                value={String(children).replace(/\n$/, "")}
              />
            );
          },
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
});

RichText.displayName = "RichText";
