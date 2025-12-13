/**
 * Seeded pseudo-random number generator (Mulberry32)
 * Provides reproducible randomness for testing and consistency
 */
export function createSeededRandom(seed: number): () => number {
    let state = seed;

    return function (): number {
        state |= 0;
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Create a random function - seeded or Math.random
 */
export function createRandom(seed?: number): () => number {
    if (seed !== undefined) {
        return createSeededRandom(seed);
    }
    return Math.random;
}
