import { useState, useMemo, useCallback } from 'react';
import { Copy, Check, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    obfuscate,
    analyzeText,
    generateObfuscatedTextCSS,
    wrapWithAriaLabel,
    normalizeThaiObfuscation,
    detectObfuscation,
    type TextAnalysis,
    type ObfuscationResult,
    type ObfuscationOptions,
} from '@utility-belt/thai-obfuscator';

type CopyFormat = 'plain' | 'html' | 'css';

// Strategy definitions with Thai explanations
const STRATEGIES = {
    simple: {
        name: 'Simple Homoglyph',
        thai: 'แทนที่ตัวอักษร',
        description: 'Replace Thai characters with look-alike Latin letters',
        descriptionThai: 'แทนที่ตัวอักษรไทยด้วยตัวอักษรภาษาอังกฤษที่มีรูปร่างคล้ายกัน',
        example: { original: 'รัก', obfuscated: 'sัn' },
        safe: true,
    },
    composite: {
        name: 'Composite Cluster',
        thai: 'จัดการกลุ่มอักษร',
        description: 'Handle complex Thai character clusters (consonant + vowel + tone)',
        descriptionThai: 'จัดการกลุ่มอักษรที่ซับซ้อน (พยัญชนะ + สระ + วรรณยุกต์)',
        example: { original: 'ดี', obfuscated: 'aี' },
        safe: true,
    },
    phonetic: {
        name: 'Phonetic Swap',
        thai: 'สลับเสียงเหมือนกัน',
        description: 'Replace with same-sound Thai consonants (ส↔ศ↔ษ)',
        descriptionThai: 'ใช้พยัญชนะไทยที่ออกเสียงเหมือนกัน เช่น ส↔ศ↔ษ, ท↔ฑ↔ฒ',
        example: { original: 'สวัสดี', obfuscated: 'ศวัศดี' },
        safe: true,
    },
    zeroWidth: {
        name: 'Zero-Width Injection',
        thai: 'แทรกอักขระล่องหน',
        description: 'Insert invisible characters to break text matching',
        descriptionThai: 'แทรกอักขระที่มองไม่เห็นเพื่อทำลายการจับคู่ข้อความ',
        example: { original: 'ขาย', obfuscated: 'ข​า​ย' },
        safe: true,
    },
};

// Preset configurations
const PRESETS = {
    safe: {
        name: 'Safe / ปลอดภัย',
        description: 'Zero-width only - looks 100% identical',
        descriptionThai: 'แทรกอักขระล่องหนเท่านั้น - ดูเหมือนเดิม 100%',
        strategies: ['zeroWidth'] as (keyof typeof STRATEGIES)[],
        density: 0.5,
        injectZeroWidth: true,
    },
    nativeThai: {
        name: 'Native Thai / ไทยแท้',
        description: 'Phonetic swap - 100% Thai, same pronunciation',
        descriptionThai: 'สลับพยัญชนะเสียงเหมือน - ไทย 100% อ่านเหมือนเดิม',
        strategies: ['phonetic', 'zeroWidth'] as (keyof typeof STRATEGIES)[],
        density: 0.6,
        injectZeroWidth: true,
    },
    balanced: {
        name: 'Balanced / สมดุล',
        description: 'Mix of techniques - good protection',
        descriptionThai: 'ผสมหลายเทคนิค - ป้องกันได้ดี',
        strategies: ['simple', 'composite'] as (keyof typeof STRATEGIES)[],
        density: 0.7,
        injectZeroWidth: false,
    },
    maximum: {
        name: 'Maximum / สูงสุด',
        description: 'All strategies enabled - maximum protection',
        descriptionThai: 'เปิดใช้ทุกเทคนิค - ป้องกันสูงสุด',
        strategies: ['simple', 'composite', 'phonetic', 'zeroWidth'] as (keyof typeof STRATEGIES)[],
        density: 1.0,
        injectZeroWidth: true,
    },
    custom: {
        name: 'Custom / กำหนดเอง',
        description: 'Choose your own strategies',
        descriptionThai: 'เลือกเทคนิคด้วยตัวเอง',
        strategies: [] as (keyof typeof STRATEGIES)[],
        density: 0.7,
        injectZeroWidth: false,
    },
};

type PresetKey = keyof typeof PRESETS;

export default function ThaiObfuscator() {
    const [input, setInput] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('safe');
    const [selectedStrategies, setSelectedStrategies] = useState<(keyof typeof STRATEGIES)[]>(['zeroWidth']);
    const [density, setDensity] = useState(0.5);
    const [injectZeroWidth, setInjectZeroWidth] = useState(true);
    const [copied, setCopied] = useState<CopyFormat | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Handle preset change
    const handlePresetChange = useCallback((preset: PresetKey) => {
        setSelectedPreset(preset);
        if (preset !== 'custom') {
            const config = PRESETS[preset];
            setSelectedStrategies(config.strategies);
            setDensity(config.density);
            setInjectZeroWidth(config.injectZeroWidth);
        }
    }, []);

    // Handle strategy toggle
    const toggleStrategy = useCallback((strategy: keyof typeof STRATEGIES) => {
        setSelectedPreset('custom');
        setSelectedStrategies(prev =>
            prev.includes(strategy)
                ? prev.filter(s => s !== strategy)
                : [...prev, strategy]
        );
    }, []);

    const options = useMemo<Partial<ObfuscationOptions>>(() => {
        return {
            density,
            strategies: selectedStrategies.length > 0 ? selectedStrategies : ['zeroWidth'],
            injectZeroWidth,
            fontStyle: 'loopless' as const,
            toneStrategy: 'latin' as const,
            minConfidence: 0.5,
        };
    }, [selectedStrategies, density, injectZeroWidth]);

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

    // Detection analysis of output
    const detection = useMemo(() => {
        if (!result) return null;
        return detectObfuscation(result.output);
    }, [result]);

    // Normalized version
    const normalized = useMemo(() => {
        if (!result) return null;
        return normalizeThaiObfuscation(result.output);
    }, [result]);

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
            {/* Header with Thai */}
            <div>
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Thai Text Obfuscator</h1>
                </div>
                <p className="text-gray-600 mt-1">
                    แปลงข้อความไทยให้มองเห็นเหมือนเดิม แต่บอทอ่านไม่ออก
                </p>
                <p className="text-gray-500 text-sm">
                    Transform Thai text into visually identical but machine-unreadable variants
                </p>
            </div>

            {/* Input Section */}
            <div>
                <label htmlFor="thai-input" className="block text-sm font-medium text-gray-700 mb-2">
                    ข้อความต้นฉบับ / Input Thai Text
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
                            <span className="text-gray-600 w-36">เนื้อหาภาษาไทย:</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all", getColor(analysis.thaiRatio))}
                                    style={{ width: `${analysis.thaiRatio * 100}%` }}
                                />
                            </div>
                            <span className="text-gray-700 w-12 text-right">{(analysis.thaiRatio * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 w-36">ประสิทธิภาพ:</span>
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
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        โหมด / Preset
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {(Object.entries(PRESETS) as [PresetKey, typeof PRESETS[PresetKey]][]).map(([key, preset]) => (
                            <button
                                key={key}
                                onClick={() => handlePresetChange(key)}
                                className={cn(
                                    "p-2 rounded-lg border text-left transition-all text-sm",
                                    selectedPreset === key
                                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                )}
                            >
                                <div className="font-medium text-gray-900 truncate">{preset.name}</div>
                                <div className="text-xs text-gray-500 truncate">{preset.descriptionThai}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Strategy Checkboxes */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                            เทคนิคที่ใช้ / Strategies
                        </label>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {showAdvanced ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(Object.entries(STRATEGIES) as [keyof typeof STRATEGIES, typeof STRATEGIES[keyof typeof STRATEGIES]][]).map(([key, strategy]) => (
                            <label
                                key={key}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                    selectedStrategies.includes(key)
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                )}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedStrategies.includes(key)}
                                    onChange={() => toggleStrategy(key)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{strategy.thai}</span>
                                        <span className="text-xs text-gray-500">({strategy.name})</span>
                                    </div>
                                    {showAdvanced && (
                                        <>
                                            <p className="text-sm text-gray-600 mt-1">{strategy.descriptionThai}</p>
                                            <div className="mt-2 text-xs bg-gray-100 rounded p-2 font-mono">
                                                <span className="text-gray-500">{strategy.example.original}</span>
                                                <span className="text-gray-400 mx-2">→</span>
                                                <span className="text-blue-600">{strategy.example.obfuscated}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Density Slider */}
                {showAdvanced && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                                ความหนาแน่น / Density: {(density * 100).toFixed(0)}%
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={injectZeroWidth}
                                    onChange={(e) => {
                                        setInjectZeroWidth(e.target.checked);
                                        setSelectedPreset('custom');
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-gray-600">+ อักขระล่องหน</span>
                            </label>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={density}
                            onChange={(e) => {
                                setDensity(parseFloat(e.target.value));
                                setSelectedPreset('custom');
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-gray-500">
                            ค่าสูง = เปลี่ยนตัวอักษรมากขึ้น / Higher = more characters transformed
                        </p>
                    </div>
                )}
            </div>

            {/* Output Section */}
            {result && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">ผลลัพธ์ / Output</h3>

                    {/* Side-by-side Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-sm font-medium text-gray-500 block mb-2">ต้นฉบับ / Original</span>
                            <p className="text-gray-900 font-thai break-all min-h-[3rem]">{input}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <span className="text-sm font-medium text-blue-600 block mb-2">แปลงแล้ว / Obfuscated</span>
                            <p className="text-gray-900 break-all min-h-[3rem]" style={{ fontFamily: "'Kanit', sans-serif" }}>
                                {result.output}
                            </p>
                        </div>
                    </div>

                    {/* Detection Status */}
                    {detection && (
                        <div className="flex flex-wrap gap-2 text-sm">
                            <span className={cn(
                                "px-2 py-1 rounded-full",
                                detection.hasZeroWidth ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                            )}>
                                {detection.hasZeroWidth ? '✓' : '○'} อักขระล่องหน
                            </span>
                            <span className={cn(
                                "px-2 py-1 rounded-full",
                                detection.hasLatinMix ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                            )}>
                                {detection.hasLatinMix ? '✓' : '○'} ผสมภาษาอังกฤษ
                            </span>
                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                ระดับซ่อน: {(detection.suspicionScore * 100).toFixed(0)}%
                            </span>
                        </div>
                    )}

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
                                {format === 'plain' && 'คัดลอกข้อความ'}
                                {format === 'html' && 'คัดลอก HTML'}
                                {format === 'css' && 'คัดลอก CSS'}
                            </button>
                        ))}
                    </div>

                    {/* Stats Toggle */}
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {showStats ? 'ซ่อนสถิติ' : 'แสดงสถิติ'}
                    </button>

                    {showStats && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-gray-600">จำนวนกลุ่มอักษร:</span>
                                <span className="text-gray-900 font-mono">{result.stats.totalClusters}</span>
                                <span className="text-gray-600">ถูกเปลี่ยน:</span>
                                <span className="text-gray-900 font-mono">{result.stats.obfuscatedClusters}</span>
                                <span className="text-gray-600">สัดส่วน:</span>
                                <span className="text-gray-900 font-mono">{(result.stats.obfuscationRatio * 100).toFixed(1)}%</span>
                                <span className="text-gray-600">ความมั่นใจเฉลี่ย:</span>
                                <span className="text-gray-900 font-mono">{(result.stats.averageConfidence * 100).toFixed(1)}%</span>
                                <span className="text-gray-600">เวลาประมวลผล:</span>
                                <span className="text-gray-900 font-mono">{result.stats.processingTimeMs.toFixed(2)}ms</span>
                            </div>

                            <div className="pt-2 border-t border-gray-200">
                                <span className="text-gray-600">ใช้เทคนิค:</span>
                                <ul className="mt-1 ml-4 list-disc">
                                    {Object.entries(result.stats.strategyBreakdown).map(([strategy, count]) => (
                                        <li key={strategy} className="text-gray-700">
                                            {strategy}: {count as number}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Normalization test */}
                            {normalized && (
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="text-gray-600">ทดสอบถอดรหัส:</span>
                                    <p className="text-gray-700 mt-1 font-thai">{normalized}</p>
                                </div>
                            )}

                            {result.warnings.length > 0 && (
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="text-amber-600">คำเตือน:</span>
                                    <ul className="mt-1 ml-4 list-disc text-amber-600">
                                        {result.warnings.slice(0, 3).map((warning: string, i: number) => (
                                            <li key={i}>{warning}</li>
                                        ))}
                                        {result.warnings.length > 3 && (
                                            <li>...และอีก {result.warnings.length - 3} รายการ</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Usage Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">💡 คำแนะนำการใช้งาน</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                    <li>• <strong>ปลอดภัย:</strong> ใช้เฉพาะอักขระล่องหน - มองเหมือนข้อความปกติ 100%</li>
                    <li>• <strong>ไทยแท้:</strong> สลับพยัญชนะเสียงเหมือนกัน - คนไทยอ่านออกเหมือนเดิม</li>
                    <li>• <strong>ผสม:</strong> ใช้หลายเทคนิครวมกันเพื่อเพิ่มประสิทธิภาพ</li>
                    <li>• ควรใช้ฟอนต์ไร้หัว (Loopless) เช่น Kanit, Prompt, Sarabun</li>
                </ul>
            </div>
        </div>
    );
}
