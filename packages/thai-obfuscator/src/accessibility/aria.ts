/**
 * Accessibility utilities for obfuscated text
 * 
 * IMPORTANT: Screen readers will struggle with obfuscated text.
 * These helpers provide the original text via aria-label.
 * 
 * TRADE-OFF: Sophisticated scrapers may read aria-label,
 * defeating the obfuscation purpose. Use judiciously.
 */

export interface AriaOptions {
    /** HTML tag to use */
    tag: 'span' | 'div' | 'p';

    /** Additional CSS classes */
    className?: string;

    /** Additional attributes */
    attributes?: Record<string, string>;
}

const DEFAULT_ARIA_OPTIONS: AriaOptions = {
    tag: 'span',
};

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Wrap obfuscated text with aria-label containing original
 */
export function wrapWithAriaLabel(
    obfuscated: string,
    original: string,
    options: Partial<AriaOptions> = {}
): string {
    const opts = { ...DEFAULT_ARIA_OPTIONS, ...options };

    const attrs = [
        `aria-label="${escapeHtml(original)}"`,
        opts.className ? `class="${opts.className}"` : '',
        ...Object.entries(opts.attributes || {}).map(
            ([key, value]) => `${key}="${escapeHtml(value)}"`
        ),
    ].filter(Boolean).join(' ');

    return `<${opts.tag} ${attrs}>${escapeHtml(obfuscated)}</${opts.tag}>`;
}

/**
 * Generate hidden original text for screen readers
 * Uses visually-hidden CSS pattern
 */
export function generateScreenReaderText(
    obfuscated: string,
    original: string
): string {
    return `
<span aria-hidden="true">${escapeHtml(obfuscated)}</span>
<span class="sr-only">${escapeHtml(original)}</span>
  `.trim();
}

/**
 * Generate CSS for screen-reader-only class
 */
export function getScreenReaderOnlyCSS(): string {
    return `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
  `.trim();
}
