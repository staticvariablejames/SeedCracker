/* Iterates through every possible seed ('aaaaa' through 'zzzzz') in lexicographical order,
 * using little memory.
 */
export class SeedIterator {
    static readonly n = 5;
    static readonly a = 'a'.charCodeAt(0);
    static readonly z = 'z'.charCodeAt(0);
    state: number[] = [];

    private currentIndex: number = 0; // Incremented on each .next()
    index() { return this.currentIndex; }

    private current() {
        return this.state.map( c => String.fromCharCode(c) ).join('');
    }
    next(): {value: string, done: false} | {value: undefined, done: true}
    {
        this.currentIndex++;
        if(this.state.length == 0) {
            this.state = Array(SeedIterator.n).fill(SeedIterator.a);
            return { value: this.current(), done: false };
        } else {
            let i = SeedIterator.n-1;
            while(i>=0 && this.state[i] == SeedIterator.z) {
                this.state[i] = SeedIterator.a;
                i--;
            }
            if(i == -1) return { value: undefined, done: true };
            this.state[i]++;
            return { value: this.current(), done: false };
        }
    }

    /* Steps the iterator back a single step.
     * Rewinding is not possible before the first next() call
     * or after iteration has finished.
     */
    rewind() {
        this.currentIndex--;
        let i = SeedIterator.n-1;
        while(i>=0 && this.state[i] == SeedIterator.a) {
            this.state[i] = SeedIterator.z;
            i--;
        }
        this.state[i]--;
    }
};
