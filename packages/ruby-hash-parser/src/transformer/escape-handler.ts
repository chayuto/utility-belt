/**
 * Ruby Escape Sequence Handler
 *
 * Processes Ruby string escape sequences and converts them
 * to valid JavaScript/JSON strings.
 */

// Standard escape mappings
const SIMPLE_ESCAPES: Record<string, string> = {
    n: '\n',
    t: '\t',
    r: '\r',
    '\\': '\\',
    '"': '"',
    "'": "'",
    a: '\u0007', // Bell
    b: '\b', // Backspace
    e: '\u001B', // Escape
    f: '\f', // Form feed
    v: '\u000B', // Vertical tab
    s: ' ', // Space
    '0': '\0', // Null
};

/**
 * Process escape sequences in a double-quoted Ruby string
 */
export function processDoubleQuotedEscapes(content: string): string {
    let result = '';
    let i = 0;

    while (i < content.length) {
        if (content[i] === '\\' && i + 1 < content.length) {
            const next = content[i + 1];

            // Simple escapes
            if (next in SIMPLE_ESCAPES) {
                result += SIMPLE_ESCAPES[next];
                i += 2;
                continue;
            }

            // Octal escape: \0 to \377
            if (/[0-7]/.test(next)) {
                const match = content.slice(i + 1).match(/^[0-7]{1,3}/);
                if (match) {
                    const code = parseInt(match[0], 8);
                    result += String.fromCharCode(code);
                    i += 1 + match[0].length;
                    continue;
                }
            }

            // Hex escape: \xNN
            if (next === 'x') {
                const match = content.slice(i + 2).match(/^[0-9a-fA-F]{1,2}/);
                if (match) {
                    const code = parseInt(match[0], 16);
                    result += String.fromCharCode(code);
                    i += 2 + match[0].length;
                    continue;
                }
            }

            // Unicode escape: \uNNNN
            if (next === 'u') {
                // Braced form: \u{NNNNNN}
                if (content[i + 2] === '{') {
                    const endBrace = content.indexOf('}', i + 3);
                    if (endBrace !== -1) {
                        const hex = content.slice(i + 3, endBrace);
                        const code = parseInt(hex, 16);
                        result += String.fromCodePoint(code);
                        i = endBrace + 1;
                        continue;
                    }
                }
                // Standard form: \uNNNN
                const match = content.slice(i + 2).match(/^[0-9a-fA-F]{4}/);
                if (match) {
                    const code = parseInt(match[0], 16);
                    result += String.fromCharCode(code);
                    i += 6;
                    continue;
                }
            }

            // Control character: \C-x or \cx
            if (next === 'C' && content[i + 2] === '-') {
                const char = content[i + 3];
                if (char) {
                    result += String.fromCharCode(char.charCodeAt(0) & 0x1f);
                    i += 4;
                    continue;
                }
            }
            if (next === 'c') {
                const char = content[i + 2];
                if (char) {
                    result += String.fromCharCode(char.charCodeAt(0) & 0x1f);
                    i += 3;
                    continue;
                }
            }

            // Meta character: \M-x
            if (next === 'M' && content[i + 2] === '-') {
                const char = content[i + 3];
                if (char) {
                    result += String.fromCharCode(char.charCodeAt(0) | 0x80);
                    i += 4;
                    continue;
                }
            }

            // Unknown escape - keep the character after backslash
            result += content[i + 1];
            i += 2;
        } else {
            result += content[i];
            i++;
        }
    }

    return result;
}

/**
 * Process escape sequences in a single-quoted Ruby string
 * Only \\ and \' are processed
 */
export function processSingleQuotedEscapes(content: string): string {
    let result = '';
    let i = 0;

    while (i < content.length) {
        if (content[i] === '\\' && i + 1 < content.length) {
            const next = content[i + 1];
            if (next === '\\' || next === "'") {
                result += next;
                i += 2;
                continue;
            }
        }
        result += content[i];
        i++;
    }

    return result;
}

/**
 * Check if string contains non-UTF8 binary data
 */
export function containsBinaryData(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        // Check for invalid UTF-8 sequences or control chars
        if (code > 0x7f && code < 0xa0) {
            return true;
        }
    }
    return false;
}

/**
 * Handle binary data according to strategy
 */
export function handleBinaryData(
    str: string,
    strategy: 'base64' | 'array' | 'replacement' | 'error'
): string | number[] {
    switch (strategy) {
        case 'base64': {
            // Convert to base64
            const bytes = new Uint8Array(str.length);
            for (let i = 0; i < str.length; i++) {
                bytes[i] = str.charCodeAt(i);
            }
            return btoa(String.fromCharCode(...bytes));
        }

        case 'array':
            // Return byte array
            return Array.from(str).map((c) => c.charCodeAt(0));

        case 'replacement':
            // Replace invalid sequences with U+FFFD
            return str.replace(/[\x80-\x9F]/g, '\uFFFD');

        case 'error':
            throw new Error('Binary data encountered');
    }
}
