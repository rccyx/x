import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "@rccyx/design/icons";

import { Button, Textarea } from "@rccyx/design/ui";

import type { BlockEditorProps } from "../types";

const LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "bash",
  "css",
  "html",
  "json",
  "yaml",
  "markdown",
  "sql",
] as const;

function LanguageSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex w-[180px] items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{value}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <div className="bg-card absolute z-10 mt-1 w-[180px] rounded-md border shadow-lg">
          <div className="max-h-[200px] overflow-y-auto p-1">
            {LANGUAGES.map((lang) => (
              <div
                key={lang}
                className={`cursor-pointer rounded px-2 py-1.5 text-sm font-semibold ${
                  value === lang
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => {
                  onValueChange(lang);
                  setIsOpen(false);
                }}
              >
                {lang}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CodeBlockEditor({
  value,
  onChange,
  isPreview,
}: BlockEditorProps) {
  // Persist default once if missing
  useEffect(() => {
    if (!value.language) {
      onChange({ ...value, language: "typescript" });
    }
  }, [value.language, onChange, value]);

  if (isPreview) {
    return null;
  }

  const selectedLanguage = value.language ?? "typescript";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold font-medium">Language:</label>
        <LanguageSelect
          value={selectedLanguage}
          onValueChange={(language: string) => onChange({ ...value, language })}
        />
      </div>

      <Textarea
        value={value.code ?? ""}
        onChange={(e) => onChange({ ...value, code: e.target.value })}
        placeholder="Enter code..."
        className="min-h-[200px] w-full font-mono"
      />
    </div>
  );
}
