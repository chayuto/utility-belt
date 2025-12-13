import { useState, useMemo, useCallback } from 'react';
import { Copy, Check, Shield, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    obfuscate,
    analyzeText,
    presets,
    generateObfuscatedTextCSS,
    wrapWithAriaLabel,
    type PresetName,
    type TextAnalysis,
    type ObfuscationResult,
} from '@utility-belt/thai-obfuscator';

type CopyFormat = 'plain' | 'html' | 'css';

const PRESET_DESCRIPTIONS: Record<PresetName, string> = {
    maximum: 'Full protection - all strategies enabled',
    balanced: 'Good protection with readability (recommended)',
    subtle: 'Minimal changes - light protection',
    invisible: 'Zero-width injection only - no visual change',
    traditional: 'Optimized for traditional Thai fonts',
};

export default function ThaiObfuscator() {
    const [input, setInput] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<PresetName>('balanced');
    const [copied, setCopied] = useState<CopyFormat | null>(null);
    const [showStats, setShowStats] = useState(false);

    const options = useMemo(() => {
        return presets[selectedPreset];
    }, [selectedPreset]);

    const analysis = useMemo<TextAnalysis | null>(() => {
        if (!input.trim()) return null;
        return analyzeText(input);
    }, [input]);

    const result = useMemo<ObfuscationResult | null>(() => {
        if (!input.trim()) return null;
        try {
            return obfuscate(input, options);
        } catch (e) {
            console.error('Obfuscation error:', e);
            return null;
        }
    }, [input, options]);

    const handleCopy = useCallback(async (format: CopyFormat) => {
        if (!result) return;

        let textToCopy: string;
        switch (format) {
            case 'html':
                textToCopy = wrapWithAriaLabel(result.output, input);
                break;
            case 'css':
                textToCopy = generateObfuscatedTextCSS();
                break;
            default:
                textToCopy = result.output;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(format);
            setTimeout(() => setCopied(null), 2000);
        } catch {
            // Clipboard API not available
        }
    }, [result, input]);

    const getColor = (value: number) => {
        if (value >= 0.8) return 'bg-green-500';
        if (value >= 0.5) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Thai Text Obfuscator</h1>
                </div>
                <p className="text-gray-600 mt-1">
                    Transform Thai text into visually identical but machine-unreadable variants
                </p>
            </div>

            {/* Input Section */}
            <div>
                <label htmlFor="thai-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Input Thai Text
                </label>
                <textarea
                    id="thai-input"
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-thai"
                    placeholder="พิมพ์ข้อความภาษาไทยที่นี่..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                {/* Analysis Indicators */}
                {analysis && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 w-36">Thai Content:</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all", getColor(analysis.thaiRatio))}
                                    style={{ width: `${analysis.thaiRatio * 100}%` }}
                                />
                            </div>
                            <span className="text-gray-700 w-12 text-right">{(analysis.thaiRatio * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 w-36">Est. Effectiveness:</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all", getColor(analysis.estimatedEffectiveness))}
                                    style={{ width: `${analysis.estimatedEffectiveness * 100}%` }}
                                />
                            </div>
                            <span className="text-gray-700 w-12 text-right">{(analysis.estimatedEffectiveness * 100).toFixed(0)}%</span>
                        </div>
                        {analysis.recommendations.length > 0 && (
                            <div className="text-sm text-amber-600 flex items-start gap-1">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{analysis.recommendations[0]}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preset Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preset</label>
                <select
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value as PresetName)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    {(Object.keys(PRESET_DESCRIPTIONS) as PresetName[]).map((preset) => (
                        <option key={preset} value={preset}>
                            {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </option>
                    ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">{PRESET_DESCRIPTIONS[selectedPreset]}</p>
            </div>

            {/* Output Section */}
            {result && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Obfuscated Output</h3>

                    {/* Side-by-side Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-sm font-medium text-gray-500 block mb-2">Original</span>
                            <p className="text-gray-900 font-thai break-all min-h-[3rem]">{input}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <span className="text-sm font-medium text-blue-600 block mb-2">Obfuscated</span>
                            <p className="text-gray-900 break-all min-h-[3rem]" style={{ fontFamily: "'Kanit', sans-serif" }}>
                                {result.output}
                            </p>
                        </div>
                    </div>

                    {/* Copy Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {(['plain', 'html', 'css'] as CopyFormat[]).map((format) => (
                            <button
                                key={format}
                                onClick={() => handleCopy(format)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                                    copied === format
                                        ? "bg-green-100 border-green-500 text-green-700"
                                        : "bg-white border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {copied === format ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                {format === 'plain' && 'Copy Text'}
                                {format === 'html' && 'Copy with aria-label'}
                                {format === 'css' && 'Copy CSS'}
                            </button>
                        ))}
                    </div>

                    {/* Stats Toggle */}
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {showStats ? 'Hide' : 'Show'} Statistics
                    </button>

                    {showStats && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-gray-600">Total Clusters:</span>
                                <span className="text-gray-900 font-mono">{result.stats.totalClusters}</span>
                                <span className="text-gray-600">Obfuscated:</span>
                                <span className="text-gray-900 font-mono">{result.stats.obfuscatedClusters}</span>
                                <span className="text-gray-600">Ratio:</span>
                                <span className="text-gray-900 font-mono">{(result.stats.obfuscationRatio * 100).toFixed(1)}%</span>
                                <span className="text-gray-600">Avg Confidence:</span>
                                <span className="text-gray-900 font-mono">{(result.stats.averageConfidence * 100).toFixed(1)}%</span>
                                <span className="text-gray-600">Processing Time:</span>
                                <span className="text-gray-900 font-mono">{result.stats.processingTimeMs.toFixed(2)}ms</span>
                            </div>

                            <div className="pt-2 border-t border-gray-200">
                                <span className="text-gray-600">Strategy Breakdown:</span>
                                <ul className="mt-1 ml-4 list-disc">
                                    {Object.entries(result.stats.strategyBreakdown).map(([strategy, count]) => (
                                        <li key={strategy} className="text-gray-700">
                                            {strategy}: {count as number}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {result.warnings.length > 0 && (
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="text-amber-600">Warnings:</span>
                                    <ul className="mt-1 ml-4 list-disc text-amber-600">
                                        {result.warnings.slice(0, 3).map((warning: string, i: number) => (
                                            <li key={i}>{warning}</li>
                                        ))}
                                        {result.warnings.length > 3 && (
                                            <li>...and {result.warnings.length - 3} more</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
