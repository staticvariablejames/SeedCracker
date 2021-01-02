export class SeedIterator {
    /* Constructs a seed iterator that will iterate over all seeds between 'aaaaa' and 'zzzzz'
     * (inclusive),
     * in lexicographical order.
     *
     * If begin and end are provided,
     * the iteration range is changed to [begin, end).
     * For example, SeedIterator(2, 5) will iterate through 'aaaac', 'aaaad' and 'aaaae'.
     */
    constructor(begin: number = 0, end: number = 26 ** SeedIterator.n) {
        this.currentIndex = begin;
        this.end = end;
    }

    /* Partitions the range ['aaaaa', 'zzzzz'] and returns an iterator for each part.
     *
     * More specifically, if
     *  i1 = rangePartition(n, 0);
     *  i2 = rangePartition(n, 1);
     *  ...
     *  in = rangePartition(n, n-1);
     * then each iterator will iterate through a subrange of the seed space ['aaaaa', 'zzzzz'],
     * without missing or overlapping.
     *
     * The parts have roughly the same size.
     * partCount and part are assumed to be integers and 0 <= part < partCount.
     *
     * Note that each call to rangePartition is independent.
     */
    static rangePartition(partCount: number, part: number) {
        let step = (26 ** SeedIterator.n) / partCount;
        if(part == partCount - 1) {
            // Sidestep floating-point errors
            return new SeedIterator( Math.floor(part * step) );
        } else {
            return new SeedIterator( Math.floor(part * step), Math.floor((part+1) * step) );
        }
    }

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

    next(): {value: string, done: false} | {value: undefined, done: true} {
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
