import { FtHoFOutcome } from './fthof-outcome';
import { isCompatibleWithAll } from './seed-outcome-compatibility';
import { SeedIterator } from './seed-iterator';

export interface SeedCrackerCallback {
    notifyFailure(): void; // Called if no seed matches the outcomes
    notifyDuplicate(): void; // Called if multiple seeds matches the outcomes
    notifySuccess(seed: string): void; // Called if a single seed matches the outcomes
    notifyProgress(percentage: number): void; // Called periodically
}

/* Creates an object that traverses through all seeds,
 * looking for a seed that matches all the outcomes in outcomeList.
 */
export class SeedCracker {
    static readonly chunk = 26*26; // Do work in chunks of 26*26 seeds
    private outcomeList: FtHoFOutcome[] = [];
    private iterator: SeedIterator = new SeedIterator();
    private candidateSeed: string = "";
    timeoutID: number = 0;

    constructor(private callback: SeedCrackerCallback) {
    }

    private compatibleList(outcomeList: FtHoFOutcome[]) {
        if(outcomeList.length < this.outcomeList.length)
            return false;
        for(let i = 0; i < this.outcomeList.length; i++) {
            if(!this.outcomeList[i].equals(outcomeList[i]))
                return false;
        }
        return true;
    }

    updateOutcomeList(newOutcomeList: FtHoFOutcome[]) {
        if(this.compatibleList(newOutcomeList)) {
            // Great! All seeds discarded so far are indeed useless
            if(!isCompatibleWithAll(newOutcomeList, this.candidateSeed))
                this.candidateSeed = "";
        } else {
            // The work done so far has to be discarded
            this.iterator = new SeedIterator();
            this.candidateSeed = "";
        }

        this.outcomeList = newOutcomeList;
        this.scheduleWork();
    }

    private scheduleWork() {
        this.timeoutID = setTimeout(this.doWork.bind(this));
    }

    private doWork() {
        for(let i = 0; i < SeedCracker.chunk; i++) {
            let { value, done } = this.iterator.next();
            if(done) {
                if(this.candidateSeed == "") {
                    this.callback.notifyFailure();
                } else {
                    this.callback.notifySuccess(this.candidateSeed);
                }
                return;
            }
            let seed = value!;
            if(isCompatibleWithAll(this.outcomeList, seed)) {
                if(this.candidateSeed == "") {
                    this.candidateSeed = seed;
                } else {
                    this.callback.notifyDuplicate();
                    this.iterator.rewind();
                    return;
                }
            }
        }
        this.callback.notifyProgress( this.iterator.index() / (26**SeedIterator.n) );
        this.scheduleWork();
    }
}
