import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Settings, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  toJSON,
  presets,
  RubyHashParseError,
  type ParserOptions,
} from '@utility-belt/ruby-hash-parser';

type PresetName = keyof typeof presets;

const PRESET_INFO: Record<PresetName, { label: string; description: string }> =
{
  strict: {
    label: 'Strict JSON',
    description: 'Valid JSON output, null for special values',
  },
  preserving: {
    label: 'Preserving',
    description: 'Maximum data preservation with type info',
  },
  json5: {
    label: 'JSON5',
    description: 'JSON5 compatible with Infinity/NaN',
  },
  lenient: {
    label: 'Lenient',
    description: 'For parsing console/debug output',
  },
  pedantic: {
    label: 'Pedantic',
    description: 'Throws on any edge case',
  },
};

export default function RubyToJSON() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<RubyHashParseError | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<Partial<ParserOptions>>({});

  // Validation status (debounced)
  const [isValid, setIsValid] = useState(true);

  // Debounced parsing
  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      setIsValid(true);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const json = toJSON(input, options);
        setOutput(json);
        setError(null);
        setIsValid(true);
      } catch (err) {
        setOutput('');
        if (err instanceof RubyHashParseError) {
          setError(err);
        } else {
          setError(
            new RubyHashParseError(
              err instanceof Error ? err.message : 'Unknown error',
              1,
              1,
              null,
              []
            )
          );
        }
        setIsValid(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [input, options]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [output]);

  const setPreset = useCallback((preset: PresetName) => {
    setOptions(presets[preset]);
  }, []);

  const updateOption = useCallback(
    <K extends keyof ParserOptions>(key: K, value: ParserOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetOptions = useCallback(() => {
    setOptions({});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ruby to JSON Converter
          </h1>
          <p className="text-gray-600 mt-1">
            Convert Ruby hash syntax to valid JSON format
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <select
            onChange={(e) => setPreset(e.target.value as PresetName)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            defaultValue=""
          >
            <option value="" disabled>
              Load preset...
            </option>
            {Object.entries(PRESET_INFO).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showOptions
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Parser options"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Parser Options</h3>
            <button
              onClick={resetOptions}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Reset to defaults
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Non-Finite Numbers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Infinity/NaN
              </label>
              <select
                value={options.nonFiniteNumbers ?? 'null'}
                onChange={(e) =>
                  updateOption(
                    'nonFiniteNumbers',
                    e.target.value as ParserOptions['nonFiniteNumbers']
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="null">Convert to null</option>
                <option value="string">Convert to string</option>
                <option value="literal">Keep literal (JSON5)</option>
                <option value="error">Throw error</option>
              </select>
            </div>

            {/* Range Strategy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Range Objects
              </label>
              <select
                value={options.rangeStrategy ?? 'object'}
                onChange={(e) =>
                  updateOption(
                    'rangeStrategy',
                    e.target.value as ParserOptions['rangeStrategy']
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="object">Object (begin/end)</option>
                <option value="string">String ("1..10")</option>
                <option value="array">Expand to array</option>
              </select>
            </div>

            {/* Cyclic Strategy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cyclic References
              </label>
              <select
                value={options.cyclicStrategy ?? 'sentinel'}
                onChange={(e) =>
                  updateOption(
                    'cyclicStrategy',
                    e.target.value as ParserOptions['cyclicStrategy']
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="sentinel">[Circular] marker</option>
                <option value="null">Convert to null</option>
                <option value="error">Throw error</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="ruby-input"
              className="block text-sm font-medium text-gray-700"
            >
              Ruby Hash
            </label>
            {input && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isValid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                {isValid ? 'Valid' : 'Invalid'}
              </span>
            )}
          </div>
          <textarea
            id="ruby-input"
            className={cn(
              'w-full h-64 p-3 border rounded-lg resize-none font-mono text-sm',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              error && 'border-red-300 bg-red-50'
            )}
            placeholder={`{ :name => "Alice", age: 30, items: [1, 2, 3] }`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />

          {/* Error Display */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800">Parse Error</p>
                  <p className="text-sm text-red-700 mt-1">{error.message}</p>

                  {/* Source Context */}
                  {input && (
                    <div className="mt-3 font-mono text-xs bg-red-100 rounded p-2 overflow-x-auto">
                      {input.split('\n').slice(
                        Math.max(0, error.line - 2),
                        Math.min(input.split('\n').length, error.line + 1)
                      ).map((line, i) => {
                        const lineNum = Math.max(1, error.line - 1) + i;
                        const isErrorLine = lineNum === error.line;
                        return (
                          <div key={lineNum}>
                            <div
                              className={
                                isErrorLine ? 'text-red-900 font-bold' : 'text-red-700'
                              }
                            >
                              <span className="inline-block w-8 text-right mr-2 opacity-50">
                                {lineNum}
                              </span>
                              {line || ' '}
                            </div>
                            {isErrorLine && (
                              <div className="text-red-500">
                                <span className="inline-block w-8 mr-2" />
                                {' '.repeat(Math.max(0, error.column - 1))}^
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="json-output"
              className="block text-sm font-medium text-gray-700"
            >
              JSON Output
            </label>
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                output
                  ? 'hover:bg-gray-200 text-gray-600'
                  : 'text-gray-300 cursor-not-allowed'
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
            value={output}
            placeholder="Converted JSON will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
