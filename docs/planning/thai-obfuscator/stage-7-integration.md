# Stage 7: Web UI Integration

**Duration:** 2 days  
**Prerequisites:** Stage 1-6  
**Outputs:** Updated ThaiModifier tool in web app, options UI, live preview

---

## Objectives

1. Update the existing ThaiModifier tool to use the new library
2. Create an options panel for configuration
3. Add live preview and effectiveness indicators
4. Implement copy-to-clipboard with format options

---

## 7.1 Tool Registry Update

### apps/web/src/config/tools-registry.ts

Add/update the Thai Obfuscator tool entry:

```typescript
{
  id: 'thai-obfuscator',
  name: 'Thai Text Obfuscator',
  description: 'Transform Thai text into visually identical but machine-unreadable variants',
  category: 'text',
  icon: 'Shield',
  path: '/tools/thai-obfuscator',
  keywords: ['thai', 'obfuscate', 'homoglyph', 'anti-scraping', 'unicode'],
}
```

---

## 7.2 Component Structure

### apps/web/src/tools/ThaiObfuscator/index.tsx

```typescript
import React, { useState, useMemo, useCallback } from 'react';
import { 
  obfuscate, 
  analyzeText, 
  presets,
  generateObfuscatedTextCSS,
  wrapWithAriaLabel,
  type ObfuscationOptions,
  type PresetName,
  type TextAnalysis,
  type ObfuscationResult,
} from '@utility-belt/thai-obfuscator';

// Components
import { OptionsPanel } from './OptionsPanel';
import { EffectivenessIndicator } from './EffectivenessIndicator';
import { OutputDisplay } from './OutputDisplay';

export default function ThaiObfuscator() {
  // Input state
  const [input, setInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<PresetName>('balanced');
  const [customOptions, setCustomOptions] = useState<Partial<ObfuscationOptions>>({});
  const [useCustom, setUseCustom] = useState(false);
  
  // Derived state
  const options = useMemo(() => {
    return useCustom ? customOptions : presets[selectedPreset];
  }, [useCustom, customOptions, selectedPreset]);
  
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
  
  // Handlers
  const handleCopy = useCallback((format: 'plain' | 'html' | 'css') => {
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
    
    navigator.clipboard.writeText(textToCopy);
  }, [result, input]);
  
  return (
    <div className="thai-obfuscator">
      <div className="tool-header">
        <h1>Thai Text Obfuscator</h1>
        <p>Transform Thai text into visually identical but machine-unreadable variants</p>
      </div>
      
      <div className="tool-content">
        {/* Input Section */}
        <div className="input-section">
          <label htmlFor="thai-input">Input Thai Text</label>
          <textarea
            id="thai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความภาษาไทยที่นี่..."
            rows={6}
          />
          {analysis && <EffectivenessIndicator analysis={analysis} />}
        </div>
        
        {/* Options Section */}
        <OptionsPanel
          selectedPreset={selectedPreset}
          onPresetChange={setSelectedPreset}
          customOptions={customOptions}
          onCustomOptionsChange={setCustomOptions}
          useCustom={useCustom}
          onUseCustomChange={setUseCustom}
        />
        
        {/* Output Section */}
        {result && (
          <OutputDisplay
            result={result}
            original={input}
            onCopy={handleCopy}
          />
        )}
      </div>
    </div>
  );
}
```


---

## 7.3 Options Panel Component

### apps/web/src/tools/ThaiObfuscator/OptionsPanel.tsx

```typescript
import React from 'react';
import type { ObfuscationOptions, PresetName } from '@utility-belt/thai-obfuscator';

interface OptionsPanelProps {
  selectedPreset: PresetName;
  onPresetChange: (preset: PresetName) => void;
  customOptions: Partial<ObfuscationOptions>;
  onCustomOptionsChange: (options: Partial<ObfuscationOptions>) => void;
  useCustom: boolean;
  onUseCustomChange: (useCustom: boolean) => void;
}

const PRESET_DESCRIPTIONS: Record<PresetName, string> = {
  maximum: 'Full protection - all strategies enabled',
  balanced: 'Good protection with readability (recommended)',
  subtle: 'Minimal changes - light protection',
  invisible: 'Zero-width injection only - no visual change',
  traditional: 'Optimized for traditional Thai fonts',
};

export function OptionsPanel({
  selectedPreset,
  onPresetChange,
  customOptions,
  onCustomOptionsChange,
  useCustom,
  onUseCustomChange,
}: OptionsPanelProps) {
  return (
    <div className="options-panel">
      <h3>Configuration</h3>
      
      {/* Preset Selection */}
      <div className="preset-selector">
        <label>Preset</label>
        <select
          value={useCustom ? 'custom' : selectedPreset}
          onChange={(e) => {
            if (e.target.value === 'custom') {
              onUseCustomChange(true);
            } else {
              onUseCustomChange(false);
              onPresetChange(e.target.value as PresetName);
            }
          }}
        >
          {Object.keys(PRESET_DESCRIPTIONS).map((preset) => (
            <option key={preset} value={preset}>
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        <p className="preset-description">
          {useCustom ? 'Custom configuration' : PRESET_DESCRIPTIONS[selectedPreset]}
        </p>
      </div>
      
      {/* Custom Options (shown when useCustom is true) */}
      {useCustom && (
        <div className="custom-options">
          {/* Density Slider */}
          <div className="option-row">
            <label>Density: {(customOptions.density ?? 1) * 100}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={(customOptions.density ?? 1) * 100}
              onChange={(e) => onCustomOptionsChange({
                ...customOptions,
                density: parseInt(e.target.value) / 100,
              })}
            />
          </div>
          
          {/* Tone Strategy */}
          <div className="option-row">
            <label>Tone Mark Strategy</label>
            <select
              value={customOptions.toneStrategy ?? 'latin'}
              onChange={(e) => onCustomOptionsChange({
                ...customOptions,
                toneStrategy: e.target.value as 'latin' | 'remove' | 'retain',
              })}
            >
              <option value="latin">Convert to Latin diacritics</option>
              <option value="remove">Remove tone marks</option>
              <option value="retain">Keep Thai marks (risky)</option>
            </select>
          </div>
          
          {/* Font Style */}
          <div className="option-row">
            <label>Target Font Style</label>
            <select
              value={customOptions.fontStyle ?? 'loopless'}
              onChange={(e) => onCustomOptionsChange({
                ...customOptions,
                fontStyle: e.target.value as 'loopless' | 'traditional' | 'any',
              })}
            >
              <option value="loopless">Loopless (Kanit, Sarabun)</option>
              <option value="traditional">Traditional (Angsana)</option>
              <option value="any">Any font</option>
            </select>
          </div>
          
          {/* Zero-Width Injection */}
          <div className="option-row">
            <label>
              <input
                type="checkbox"
                checked={customOptions.injectZeroWidth ?? false}
                onChange={(e) => onCustomOptionsChange({
                  ...customOptions,
                  injectZeroWidth: e.target.checked,
                })}
              />
              Inject zero-width characters
            </label>
          </div>
          
          {/* Min Confidence */}
          <div className="option-row">
            <label>Min Confidence: {((customOptions.minConfidence ?? 0.6) * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={(customOptions.minConfidence ?? 0.6) * 100}
              onChange={(e) => onCustomOptionsChange({
                ...customOptions,
                minConfidence: parseInt(e.target.value) / 100,
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 7.4 Effectiveness Indicator

### apps/web/src/tools/ThaiObfuscator/EffectivenessIndicator.tsx

```typescript
import React from 'react';
import type { TextAnalysis } from '@utility-belt/thai-obfuscator';

interface EffectivenessIndicatorProps {
  analysis: TextAnalysis;
}

export function EffectivenessIndicator({ analysis }: EffectivenessIndicatorProps) {
  const getColor = (value: number) => {
    if (value >= 0.8) return 'green';
    if (value >= 0.5) return 'yellow';
    return 'red';
  };
  
  return (
    <div className="effectiveness-indicator">
      <div className="indicator-row">
        <span>Thai Content:</span>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${analysis.thaiRatio * 100}%`,
              backgroundColor: getColor(analysis.thaiRatio),
            }}
          />
        </div>
        <span>{(analysis.thaiRatio * 100).toFixed(0)}%</span>
      </div>
      
      <div className="indicator-row">
        <span>Est. Effectiveness:</span>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${analysis.estimatedEffectiveness * 100}%`,
              backgroundColor: getColor(analysis.estimatedEffectiveness),
            }}
          />
        </div>
        <span>{(analysis.estimatedEffectiveness * 100).toFixed(0)}%</span>
      </div>
      
      {analysis.recommendations.length > 0 && (
        <div className="recommendations">
          <strong>Recommendations:</strong>
          <ul>
            {analysis.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```


---

## 7.5 Output Display Component

### apps/web/src/tools/ThaiObfuscator/OutputDisplay.tsx

```typescript
import React, { useState } from 'react';
import type { ObfuscationResult } from '@utility-belt/thai-obfuscator';

interface OutputDisplayProps {
  result: ObfuscationResult;
  original: string;
  onCopy: (format: 'plain' | 'html' | 'css') => void;
}

export function OutputDisplay({ result, original, onCopy }: OutputDisplayProps) {
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const handleCopy = (format: 'plain' | 'html' | 'css') => {
    onCopy(format);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <div className="output-display">
      <h3>Obfuscated Output</h3>
      
      {/* Visual Comparison */}
      <div className="comparison">
        <div className="comparison-item">
          <label>Original</label>
          <div className="text-display original">{original}</div>
        </div>
        <div className="comparison-item">
          <label>Obfuscated</label>
          <div 
            className="text-display obfuscated"
            style={{ fontFamily: "'Kanit', sans-serif" }}
          >
            {result.output}
          </div>
        </div>
      </div>
      
      {/* Copy Buttons */}
      <div className="copy-buttons">
        <button onClick={() => handleCopy('plain')}>
          {copied === 'plain' ? '✓ Copied!' : 'Copy Text'}
        </button>
        <button onClick={() => handleCopy('html')}>
          {copied === 'html' ? '✓ Copied!' : 'Copy with aria-label'}
        </button>
        <button onClick={() => handleCopy('css')}>
          {copied === 'css' ? '✓ Copied!' : 'Copy CSS'}
        </button>
      </div>
      
      {/* Statistics Toggle */}
      <button 
        className="stats-toggle"
        onClick={() => setShowStats(!showStats)}
      >
        {showStats ? 'Hide' : 'Show'} Statistics
      </button>
      
      {showStats && (
        <div className="statistics">
          <table>
            <tbody>
              <tr>
                <td>Total Clusters</td>
                <td>{result.stats.totalClusters}</td>
              </tr>
              <tr>
                <td>Obfuscated</td>
                <td>{result.stats.obfuscatedClusters}</td>
              </tr>
              <tr>
                <td>Obfuscation Ratio</td>
                <td>{(result.stats.obfuscationRatio * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Avg Confidence</td>
                <td>{(result.stats.averageConfidence * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Processing Time</td>
                <td>{result.stats.processingTimeMs.toFixed(2)}ms</td>
              </tr>
            </tbody>
          </table>
          
          <h4>Strategy Breakdown</h4>
          <ul>
            {Object.entries(result.stats.strategyBreakdown).map(([strategy, count]) => (
              <li key={strategy}>{strategy}: {count}</li>
            ))}
          </ul>
          
          {result.warnings.length > 0 && (
            <>
              <h4>Warnings</h4>
              <ul className="warnings">
                {result.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 7.6 Styles

### apps/web/src/tools/ThaiObfuscator/styles.css

```css
@import url('https://fonts.googleapis.com/css2?family=Kanit&display=swap');

.thai-obfuscator {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.tool-header h1 {
  margin-bottom: 0.5rem;
}

.tool-header p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.input-section textarea {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-family: 'Kanit', sans-serif;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  resize: vertical;
}

.options-panel {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.preset-selector select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.preset-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.custom-options {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.option-row {
  margin-bottom: 1rem;
}

.option-row label {
  display: block;
  margin-bottom: 0.25rem;
}

.option-row input[type="range"] {
  width: 100%;
}

.effectiveness-indicator {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.indicator-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

.text-display {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  min-height: 100px;
  font-size: 1.1rem;
  word-break: break-word;
}

.text-display.obfuscated {
  font-family: 'Kanit', sans-serif;
}

.copy-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.copy-buttons button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  cursor: pointer;
}

.copy-buttons button:hover {
  background: var(--bg-secondary);
}

.statistics {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.statistics table {
  width: 100%;
  border-collapse: collapse;
}

.statistics td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.statistics td:last-child {
  text-align: right;
  font-family: monospace;
}

.warnings {
  color: var(--warning-color);
}
```

---

## Deliverables Checklist

- [ ] Update tools-registry.ts with Thai Obfuscator entry
- [ ] Main ThaiObfuscator component
- [ ] OptionsPanel component with preset/custom toggle
- [ ] EffectivenessIndicator component
- [ ] OutputDisplay component with copy functionality
- [ ] CSS styles with Kanit font import
- [ ] Integration tests for UI components
- [ ] Accessibility testing (keyboard navigation, screen reader)
- [ ] Mobile responsive layout

---

## Notes

1. **Font Loading:** Import Kanit from Google Fonts for consistent rendering.

2. **Live Preview:** Use `useMemo` to avoid re-obfuscating on every render.

3. **Copy Formats:** Provide plain text, HTML with aria-label, and CSS options.

4. **Error Handling:** Gracefully handle obfuscation errors in the UI.

5. **Performance:** For large inputs, consider debouncing the obfuscation.
