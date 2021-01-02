import { GCOutcome } from './gcoutcome';
import { FtHoFOutcome } from './fthof-outcome';
import { SeedIterator } from './seed-iterator';
import seedrandom from 'seedrandom';

export interface SeedCrackerCallback {
    notifyFailure(): void; // Called if no seed matches the outcomes
    notifyDuplicate(): void; // Called if multiple seeds matches the outcomes
    notifySuccess(seed: string): void; // Called if a single seed matches the outcomes
    notifyProgress(percentage: number): void; // Called periodically
}

export function isCompatible(outcome: FtHoFOutcome, seed: string) {
    let prng = seedrandom(seed + '/' + outcome.spellsCast);
    if( (prng() < 0.15) != outcome.backfire )
        return false;

    // Generate the golden cookie
    if(outcome.season != '') {
        let variant;
        if(outcome.season == 'easter') {
            variant = Math.floor(prng() * 4);
        } else {
            variant = Math.floor(prng() * 8);
        }
        // In both branches, prng is called exactly once
        if(outcome.seasonalVariantIndex != undefined) {
            if(variant != outcome.seasonalVariantIndex)
                return false;
        }
        // The variant number does not depend on success/backfire status
    }
    prng(); prng(); // x, y coordinates (not used here)

    let gcChoices: GCOutcome[] = [];

    if(!outcome.backfire) {
        gcChoices.push(GCOutcome.Frenzy, GCOutcome.Lucky);
        gcChoices.push(GCOutcome.ClickFrenzy);
        if(prng() < 0.1) gcChoices.push(
            GCOutcome.CookieStorm, GCOutcome.CookieStorm, GCOutcome.Blab
        );
        if(prng() < 0.25) gcChoices.push(GCOutcome.BuildingSpecial);
        if(prng() < 0.15) gcChoices=[GCOutcome.CookieStormDrop];
        if(prng() < 0.0001) gcChoices.push(GCOutcome.Sweet);
    } else {
        gcChoices.push(GCOutcome.Clot, GCOutcome.Ruin);
        if(prng() < 0.1) gcChoices.push(GCOutcome.CursedFinger, GCOutcome.ElderFrenzy);
        if(prng() < 0.003) gcChoices.push(GCOutcome.Sweet);
        if(prng() < 0.1) gcChoices=[GCOutcome.Blab];
    }

    let gcOutcome = gcChoices[Math.floor(prng() * gcChoices.length)];

    return gcOutcome == outcome.gcOutcome;
}

function isCompatibleWithAll(outcomes: FtHoFOutcome[], seed: string) {
    for(let outcome of outcomes) {
        if(!isCompatible(outcome, seed)) return false;
    }
    return true;
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
