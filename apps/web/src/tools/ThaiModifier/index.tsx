import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  removeToneMarks,
  removeVowels,
  thaiToArabicNumerals,
  arabicToThaiNumerals,
  addSpacesBetweenThaiEnglish,
  countThaiCharacters,
  hasThaiCharacters,
} from "@my-toolkit/thai-text-modifier";

type ModificationType = 
  | "removeToneMarks" 
  | "removeVowels" 
  | "thaiToArabic" 
  | "arabicToThai" 
  | "addSpaces";

export default function ThaiModifier() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<ModificationType | null>(null);

  const modifications: { type: ModificationType; label: string; value: string }[] = [
    { type: "removeToneMarks", label: "Remove Tone Marks", value: removeToneMarks(input) },
    { type: "removeVowels", label: "Remove Vowels", value: removeVowels(input) },
    { type: "thaiToArabic", label: "Thai → Arabic Numerals", value: thaiToArabicNumerals(input) },
    { type: "arabicToThai", label: "Arabic → Thai Numerals", value: arabicToThaiNumerals(input) },
    { type: "addSpaces", label: "Add Thai-English Spaces", value: addSpacesBetweenThaiEnglish(input) },
  ];

  const copyToClipboard = async (text: string, type: ModificationType) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API not available or permission denied
    }
  };

  const thaiCharCount = countThaiCharacters(input);
  const hasThai = hasThaiCharacters(input);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thai Text Modifier</h1>
        <p className="text-gray-600 mt-1">
          Modify Thai text with various transformations
        </p>
      </div>

      <div>
        <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
          Enter Thai text
        </label>
        <textarea
          id="input"
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Type or paste your Thai text here... (e.g., สวัสดีครับ Hello123)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {input && (
          <div className="mt-2 text-sm text-gray-600">
            Thai characters: {thaiCharCount} | Contains Thai: {hasThai ? "Yes" : "No"}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modifications.map(({ type, label, value }) => (
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
            <p className="text-gray-900 text-sm break-all min-h-[1.5rem] font-thai">
              {input ? value : "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
