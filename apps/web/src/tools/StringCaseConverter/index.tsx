import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../../lib/utils";

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab";

export default function StringCaseConverter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<CaseType | null>(null);

  const toTitleCase = (str: string) =>
    str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const toSentenceCase = (str: string) =>
    str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

  const toCamelCase = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());

  const toSnakeCase = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

  const toKebabCase = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const conversions: { type: CaseType; label: string; value: string }[] = [
    { type: "upper", label: "UPPERCASE", value: input.toUpperCase() },
    { type: "lower", label: "lowercase", value: input.toLowerCase() },
    { type: "title", label: "Title Case", value: toTitleCase(input) },
    { type: "sentence", label: "Sentence case", value: toSentenceCase(input) },
    { type: "camel", label: "camelCase", value: toCamelCase(input) },
    { type: "snake", label: "snake_case", value: toSnakeCase(input) },
    { type: "kebab", label: "kebab-case", value: toKebabCase(input) },
  ];

  const copyToClipboard = async (text: string, type: CaseType) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API not available or permission denied
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">String Case Converter</h1>
        <p className="text-gray-600 mt-1">
          Convert text between different case formats instantly
        </p>
      </div>

      <div>
        <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
          Enter your text
        </label>
        <textarea
          id="input"
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Type or paste your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {conversions.map(({ type, label, value }) => (
          <div
            key={type}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <button
                onClick={() => copyToClipboard(value, type)}
                disabled={!input}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  input
                    ? "hover:bg-gray-200 text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                )}
                title="Copy to clipboard"
              >
                {copied === type ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-gray-900 font-mono text-sm break-all min-h-[1.5rem]">
              {input ? value : "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
