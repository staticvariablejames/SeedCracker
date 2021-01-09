/* This class encapsulates the behavior of a worker thread for seed cracking.
 *
 * The SeedCracker class manages a number of SeedCrackerLimbs;
 * that class dispatches FtHoFOutcome[] to the limbs,
 * who then test all seeds in its own partition to search for compatible seeds
 * and report the results to SeedCracker.
 *
 * The (minimal) web worker code is implemented in seed-cracker.worker.ts;
 * the only thing the web worker does is transfer messages to and from the limb.
 * This separation helps with testing.
 *
 * Upon creation, the limb expects a "constructor message"
 * with type { partCount: number, part: number }.
 * The semantics are the same as in SeedIterator.rangePartition.
 *
 * Afterwards the limb expects "set/reset messages",
 * which comprise a single number,
 * and "computation messages",
 * which contains an FtHoFOutcome array.
 *
 * The "set/reset message" is a single number which essentially represents a logical clock.
 * Receiving this message halts whatever computation is being performed.
 * Every message sent by this object has a 'time' attribute,
 * which corresponds to the last number received in such a message.
 *
 * A "computation message" is a single FtHoFOutcome array.
 * Once such an array arrives,
 * the limb iterates through all seeds in its partition,
 * looking for seeds which are compatible with the outcome array.
 * Should any matching seed be found, the seed itself is immediately sent back in a message.
 * If two matching seeds are found,
 * the limb sends the second seed, too, and halts computation.
 *
 * Once the search finishes, a message { logicalTime: number, done: true } is sent.
 * "Finishes" means either reaching the end of iteration after finding zero or one compatible seeds,
 * or right after finding the second compatible seed.
 *
 * The limb periodically sends a "progress message":
 * a number between 0 and 1 representing the completion percentage.
 *
 * The limb assumes that between any two "computation messages", a "set/reset message" is sent.
 */
import { FtHoFOutcome } from './fthof-outcome';
import { isCompatibleWithAll } from './seed-outcome-compatibility';
import { SeedIterator } from './seed-iterator';

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
    private postMessage: (m: any) => void;
    private partCount: number = 1;
    private part: number = 0;

    // Control the iteration
    private iterator: SeedIterator = new SeedIterator(); // Dummy value
    private outcomes: FtHoFOutcome[] = [];
    private sentSeedCandidate: boolean = false;
    private logicalTime: number = 0;
    private timeoutId: ReturnType<typeof setTimeout> | null = null;

    /* Constructs a SeedCrackerLimb which will post messages to the given callback.
     *
     * The valid types of messages are:
     *
     *      { logicalTime: number, progress: number }
     * Will be a number between 0 and 1, indicating completion percentage
     *
     *      { logicalTime: number, seed: string }
     * Will be a 5-character string, which is a seed candidate
     *
     *      { logicalTime: number, done: true }
     * If the iteration is done.
     */
    constructor(postMessage: (m: any) => void) {
        this.postMessage = postMessage;
    }

    /* Should be called with the data of a MessageEvent.
     * Accepted data types:
     *
     *      { partCount: number, part: number }
     * "Constructs" the object.
     * The arguments have the same semantics as in SeedIterator.rangePartition.
     *
     *      number
     * Sets the given number to be the new logical time and resets computation.
     *
     *      FtHoFOutcome[]
     * Sets (or replaces) the list of outcomes that seeds must be compatible with.
     */
    onMessage(messageData: any) {
        if(typeof messageData == 'number') {
            this.processResetMessage(messageData);
        } else if('partCount' in messageData && 'part' in messageData) {
            this.processConstructionMessage(+messageData.partCount, +messageData.part);
        } else if(isOutcomeArray(messageData)) {
            this.processOutcomeListMessage(messageData);
        } else {
            console.log("Error: wrong message data type received by SeedCrackerLimb.");
            return;
        }
    }

    private processResetMessage(newLogicalTime: number) {
        this.logicalTime = newLogicalTime;
        if(this.timeoutId) {
            clearTimeout(this.timeoutId);
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
        this.timeoutId = setTimeout(this.iterate.bind(this), 0);
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
                this.postMessage( {logicalTime: this.logicalTime, done: true} );
                return;
            }
            if(isCompatibleWithAll(this.outcomes, value!)) {
                // Found a candidate!
                this.postMessage( {logicalTime: this.logicalTime, seed: value} );
                if(this.sentSeedCandidate) {
                    // Found a duplicate! Let's abandon ship, too
                    this.postMessage( {logicalTime: this.logicalTime, done: true} );
                    return;
                }
                this.sentSeedCandidate = true;
            }
        }

        // Not done in this step, prepare for next round
        this.postMessage( {logicalTime: this.logicalTime, progress: this.iterator.progress()} );
        this.timeoutId = setTimeout(this.iterate.bind(this), 0);
    }
}
