import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export default function RubyToJSON() {
  const [rubyInput, setRubyInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const convertToJSON = () => {
    try {
      setError("");
      // Simple Ruby hash to JSON converter
      // This is a basic implementation - can be extended for more complex cases
      let processed = rubyInput
        // Convert Ruby symbols to strings
        .replace(/:(\w+)\s*=>/g, '"$1":')
        // Convert => to :
        .replace(/=>/g, ':')
        // Convert nil to null
        .replace(/\bnil\b/g, 'null')
        // Convert true/false (already valid in JSON)
        .replace(/\btrue\b/g, 'true')
        .replace(/\bfalse\b/g, 'false')
        // Add quotes to unquoted keys
        .replace(/(\w+):/g, '"$1":');

      // Try to parse to validate
      const parsed = JSON.parse(processed);
      setJsonOutput(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setError(`Conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setJsonOutput("");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ruby to JSON Converter</h1>
        <p className="text-gray-600 mt-1">
          Convert Ruby hash syntax to valid JSON format
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="ruby-input" className="block text-sm font-medium text-gray-700 mb-2">
            Ruby Hash
          </label>
          <textarea
            id="ruby-input"
            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder="{ :name => 'John', :age => 30, :active => true }"
            value={rubyInput}
            onChange={(e) => setRubyInput(e.target.value)}
          />
          <button
            onClick={convertToJSON}
            disabled={!rubyInput}
            className={cn(
              "mt-4 px-4 py-2 rounded-lg font-medium transition-colors",
              rubyInput
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            Convert to JSON
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="json-output" className="block text-sm font-medium text-gray-700">
              JSON Output
            </label>
            <button
              onClick={copyToClipboard}
              disabled={!jsonOutput}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                jsonOutput
                  ? "hover:bg-gray-200 text-gray-600"
                  : "text-gray-300 cursor-not-allowed"
              )}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <textarea
            id="json-output"
            className="w-full h-64 p-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-sm"
            readOnly
            value={jsonOutput}
            placeholder="Converted JSON will appear here..."
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
