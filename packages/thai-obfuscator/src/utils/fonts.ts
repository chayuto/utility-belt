/**
 * Font recommendation system for optimal obfuscation
 */

export interface FontRecommendation {
    /** Font family name */
    family: string;

    /** Font style category */
    style: 'loopless' | 'traditional';

    /** Effectiveness score (0-1) */
    effectiveness: number;

    /** Google Fonts URL (if available) */
    googleFontsUrl?: string;

    /** Notes about the font */
    notes: string;
}

/**
 * Recommended fonts for Thai obfuscation
 * Ordered by effectiveness for loopless style
 */
export const RECOMMENDED_FONTS: FontRecommendation[] = [
    {
        family: 'Kanit',
        style: 'loopless',
        effectiveness: 0.95,
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Kanit',
        notes: 'Excellent Latin-Thai convergence. Best for obfuscation.',
    },
    {
        family: 'Sarabun',
        style: 'loopless',
        effectiveness: 0.92,
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Sarabun',
        notes: 'Clean sans-serif with good homoglyph support.',
    },
    {
        family: 'Prompt',
        style: 'loopless',
        effectiveness: 0.90,
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Prompt',
        notes: 'Modern geometric sans-serif.',
    },
    {
        family: 'Sukhumvit Set',
        style: 'loopless',
        effectiveness: 0.88,
        notes: 'Apple system font for Thai. macOS/iOS only.',
    },
    {
        family: 'Noto Sans Thai',
        style: 'loopless',
        effectiveness: 0.85,
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai',
        notes: 'Google Noto family. Wide Unicode support.',
    },
    {
        family: 'IBM Plex Sans Thai',
        style: 'loopless',
        effectiveness: 0.85,
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai',
        notes: 'IBM corporate font with Thai support.',
    },
    {
        family: 'Angsana New',
        style: 'traditional',
        effectiveness: 0.50,
        notes: 'Traditional looped font. Lower obfuscation effectiveness.',
    },
    {
        family: 'Cordia New',
        style: 'traditional',
        effectiveness: 0.55,
        notes: 'Traditional font. Windows system font.',
    },
];

/**
 * Generate CSS font-family declaration
 */
export function generateFontStack(style: 'loopless' | 'traditional' = 'loopless'): string {
    const fonts = RECOMMENDED_FONTS
        .filter(f => f.style === style)
        .sort((a, b) => b.effectiveness - a.effectiveness)
        .map(f => `'${f.family}'`);

    return `font-family: ${fonts.join(', ')}, sans-serif;`;
}

/**
 * Generate Google Fonts import URL
 */
export function generateGoogleFontsUrl(
    families: string[] = ['Kanit', 'Sarabun']
): string {
    const params = families
        .map(f => `family=${encodeURIComponent(f)}`)
        .join('&');
    return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/**
 * Generate complete CSS for obfuscated text container
 */
export function generateObfuscatedTextCSS(className: string = 'obfuscated-text'): string {
    return `
@import url('${generateGoogleFontsUrl()}');

.${className} {
  ${generateFontStack('loopless')}
  /* Prevent text selection to deter copy-paste */
  user-select: none;
  -webkit-user-select: none;
}

/* Allow selection on hover for usability */
.${className}:hover {
  user-select: text;
  -webkit-user-select: text;
}
  `.trim();
}
