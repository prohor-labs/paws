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
        {content}
      </ReactMarkdown>
    </div>
  );
});

RichText.displayName = "RichText";
