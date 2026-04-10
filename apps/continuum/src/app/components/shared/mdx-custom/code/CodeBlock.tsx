/* eslint-disable */ // react-syntax-highlighter has no types
// @ts-nocheck
"use client";

import { Suspense } from "react";
import { motion } from "@rccyx/design/motion";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import docker from "react-syntax-highlighter/dist/cjs/languages/prism/docker";
import gherkin from "react-syntax-highlighter/dist/cjs/languages/prism/gherkin";
import go from "react-syntax-highlighter/dist/cjs/languages/prism/go";
import http from "react-syntax-highlighter/dist/cjs/languages/prism/http";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import rust from "react-syntax-highlighter/dist/cjs/languages/prism/rust";
import sass from "react-syntax-highlighter/dist/cjs/languages/prism/sass";
import sql from "react-syntax-highlighter/dist/cjs/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/cjs/languages/prism/yaml";
import oneDark from "react-syntax-highlighter/dist/cjs/styles/prism/one-dark";

import { cn, Skeleton } from "@rccyx/design/ui";
import { CopyButton } from "./CopyCode";

SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("docker", docker);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("http", http);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("sass", sass);
SyntaxHighlighter.registerLanguage("gherkin", gherkin);

export interface CodeBlockProps {
  language: string;
  code: string;
  id?: string;
  showLineNumbers?: boolean;
  className?: string;
  copy?: boolean;
}

export function CodeBlock({
  code,
  language,
  showLineNumbers,
  className,
  id,
  copy = true,
}: CodeBlockProps) {
  return (
    <Suspense fallback={<Skeleton height="14rem" />}>
      <motion.div
        id={id}
        animate={{ scale: 1, opacity: 0.9 }}
        initial={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          // not-prose stops Tailwind Typography from overriding pre/code
          "relative not-prose mx-2 my-2 rounded-2xl bg-black p-4 shadow-lg",
          className,
        )}
      >
        {copy && (
          <CopyButton code={code} className="absolute right-2 top-2 z-10" />
        )}

        <SyntaxHighlighter
          language={language}
          style={oneDark} // keep token colors
          // override the theme background inline so it is pure black
          customStyle={{
            background: "#000",
            margin: 0,
            padding: 0,
          }}
          codeTagProps={{
            style: { background: "transparent" },
          }}
          className="!m-0 overflow-auto !p-0 text-sm font-semibold"
          showLineNumbers={false}
          lineNumberStyle={{
            width: "3.25em",
            position: "sticky",
            left: 0,
            background: "#000",
            color: "rgba(255,255,255,0.35)",
            marginRight: "0.75rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </motion.div>
    </Suspense>
  );
}
