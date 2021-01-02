/* Iterates through every possible seed ('aaaaa' through 'zzzzz') in lexicographical order,
 * using little memory.
 */
export class SeedIterator {
    static readonly n = 5;
    static readonly a = 'a'.charCodeAt(0);
    static readonly z = 'z'.charCodeAt(0);

    /* Converts a numerical index to the corresponding seed value.
     * For example, indexToSeed(28, 5) == 'aaabc'.
     * The seed wraps around, so indexToSeed(26*26, 2) == 'aa'.
     */
    static indexToSeed(index: number, n: number = SeedIterator.n) {
        let seed = '';
        for(let i = 0; i < n; i++) {
            seed = String.fromCharCode((index % 26) + SeedIterator.a) + seed;
            index = Math.floor(index/26);
        }
        return seed;
    }

    // The last value to be iterated
    private end: number;
    private currentIndex: number;
    index() { return this.currentIndex; }

    constructor(begin: number = 0, end: number = 26 ** SeedIterator.n ) {
        this.currentIndex = begin;
        this.end = end;
    }

    next(): {value: string, done: false} | {value: undefined, done: true}
    {
        if(this.currentIndex == this.end) {
            return { value: undefined, done: true };
        } else {
            return { value: SeedIterator.indexToSeed(this.currentIndex++), done: false };
        }
    }

    /* Steps the iterator back a single step.
     * Rewinding may return nonsensical values before the first next() call
     * or after iteration has finished.
     */
    rewind() {
        this.currentIndex--;
    }
};
