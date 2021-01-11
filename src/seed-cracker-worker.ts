import { FtHoFOutcome } from './fthof-outcome';
import { SeedCracker } from './seed-cracker';

/* Thin wrapper around the worker in seed-cracker.worker.ts.
 * This class could very well be included in './seed-cracker' as a non-exported class,
 * but then it would be impossible to mock it (<https://stackoverflow.com/a/55193363>).
 * Thus,
 * this file only exists to support unit testing.
 */
export class SeedCrackerWorker {
    private worker: Worker;

    /* partCount and part have the same semantics as SeedIterator.rangePartition.
     * boss is the object that should be called when the worker posts messages.
     */
    constructor(partCount: number, part: number, boss: SeedCracker) {
        this.worker = new Worker('./dist/seed-cracker.worker.js');
        this.worker.onmessage = (ev: MessageEvent) => boss.onMessage(part, ev.data);
        this.worker.postMessage({partCount, part});
    }

    /* Sends a new message to the worker.
     * See accepted message types in SeedCrackerLimb.
     */
    postMessage(m: FtHoFOutcome[] | number) {
        this.worker.postMessage(m);
    }
}
