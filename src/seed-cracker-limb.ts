import { FtHoFOutcome } from './fthof-outcome';
import { isCompatibleWithAll } from './seed-outcome-compatibility';
import { SeedIterator } from './seed-iterator';

type postMessageType = (message: string | number) => void;

// Helper
function isOutcomeArray(value: any): value is FtHoFOutcome[] {
    if(!Array.isArray(value)) return false;
    for(let o of value) {
        if(!(o instanceof FtHoFOutcome))
            return false;
    }
    return true;
}

export class SeedCrackerLimb {
    static readonly step = 26*26;
    private postMessage: postMessageType;
    private partCount: number = 1;
    private part: number = 0;

    // Control the iteration
    private iterator: SeedIterator = new SeedIterator(); // Dummy value, will be replaced onMessage
    private outcomes: FtHoFOutcome[] = [];
    private sentSeedCandidate: boolean = false;

    constructor(postMessage: postMessageType) {
        this.postMessage = postMessage;
    }

    onMessage(messageData: any) {
        if('partCount' in messageData && 'part' in messageData) {
            this.processConstructionMessage(+messageData.partCount, +messageData.part);
        } else if(isOutcomeArray(messageData)) {
            this.processOutcomeListMessage(messageData);
        } else {
            console.log("Error: wrong message data type received by SeedCrackerLimb.");
            return;
        }
    }

    private processConstructionMessage(partCount: number, part: number) {
        this.partCount = partCount;
        this.part = part;
    }

    private processOutcomeListMessage(outcomeList: FtHoFOutcome[]) {
        this.iterator = SeedIterator.rangePartition(this.partCount, this.part);
        this.outcomes = outcomeList;
        this.sentSeedCandidate = false;
        setTimeout(this.iterate.bind(this), 0);
        /* Theoretically, there is a memory leak here:
         * if processOutcomeListMessage is called while a setTimeout from iterate() is active,
         * there will now be two active iterate() callbacks which will alternate execution,
         * and will die together once the iteration ends.
         *
         * The iteration itself does not change
         * (because we are resetting this.iterator here)
         * but the callback stack increases by one.
         * Hence, if outcomeLists keep coming,
         * theoretically this could exhaust the memory.
         */
    }

    // The control of the "state machine"
    private iterate() {
        for(let i = 0; i < SeedCrackerLimb.step; i++) {
            let {value, done} = this.iterator.next();
            if(done) {
                // We're done, send message and abandon ship
                this.postMessage('done');
                return;
            }
            if(isCompatibleWithAll(this.outcomes, value!)) {
                // Found a candidate!
                this.postMessage(value!);
                if(this.sentSeedCandidate) {
                    // Found a duplicate! Let's abandon ship, too
                    return;
                }
                this.sentSeedCandidate = true;
            }
        }

        // Not done in this step, prepare for next round
        this.postMessage( this.iterator.progress() );
        setTimeout(this.iterate.bind(this), 0);
    }
}
