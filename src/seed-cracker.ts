import { FtHoFOutcome } from './fthof-outcome';
import seedrandom from 'seedrandom';

class SeedIterator {
    static readonly n = 5;
    static readonly a = 'a'.charCodeAt(0);
    static readonly z = 'z'.charCodeAt(0);
    state: number[] = [];
    current() {
        return this.state.map( c => String.fromCharCode(c) ).join('');
    }
    next(): {value: string, done: false} | {value: undefined, done: true}
    {
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
}

let allSeeds = {
    [Symbol.iterator]() {
        return new SeedIterator();
    }
};

export function isCompatible(outcome: FtHoFOutcome, seed: string) {
    let prng = seedrandom(seed + '/' + outcome.spellsCast);
    if( (prng() < 0.15) != outcome.backfire )
        return false;

    return true;
}

function isCompatibleWithAll(outcomes: FtHoFOutcome[], seed: string) {
    for(let outcome of outcomes) {
        if(!isCompatible(outcome, seed)) return false;
    }
    return true;
}

export function crackSeed(outcomes: FtHoFOutcome[]) {
    let compatible: string[] = [];
    for(let seed of allSeeds) {
        if(isCompatibleWithAll(outcomes, seed))
            compatible.push(seed);
    }
    return compatible;
}
