import { FtHoFOutcome } from './fthof-outcome';
import { SeedCrackerWorker } from './seed-cracker-worker';

export interface SeedCrackerCallback {
    notifyFailure(): void; // Called if no seed matches the outcomes
    notifyDuplicate(seeds: string[]): void; // Called if multiple seeds matches the outcomes
    notifySuccess(seed: string): void; // Called if a single seed matches the outcomes
    notifyProgress(percentage: number): void; // Called periodically
}

/* Creates an object that traverses through all seeds,
 * looking for a seed that matches all the outcomes in outcomeList.
 */
export class SeedCracker {
    private readonly workers: SeedCrackerWorker[];
    private readonly callback: SeedCrackerCallback;

    // State machine control variables
    private logicalTime: number = 0;
    private pendingWorkers: number = 0; // Dummy value
    private completionPercentage: number[] = []; // Dummy value
    private seedCandidates: string[] = []; // Dummy value

    constructor(callback: SeedCrackerCallback, partCount: number) {
        this.callback = callback;
        this.workers = Array(partCount);
        for(let i = 0; i < partCount; i++) {
            this.workers[i] = new SeedCrackerWorker(partCount, i, this);
        }
    }

    updateOutcomeList(newOutcomeList: FtHoFOutcome[]) {
        this.logicalTime++;
        this.pendingWorkers = this.workers.length;
        this.completionPercentage = Array(this.workers.length).fill(0);
        this.seedCandidates = [];
        for(let worker of this.workers) {
            worker.postMessage(this.logicalTime);
            worker.postMessage(newOutcomeList);
        }
    }

    onMessage(part: number, message: any) {
        if(message.logicalTime != this.logicalTime) {
            // Extraneous message from old iteration.
            return;
        } else if('done' in message) {
            this.processCompletionMessage(part);
        } else if('progress' in message) {
            this.processProgressMessage(part, message.progress);
        } else if('seed' in message) {
            this.processSeedMessage(part, message.seed);
        } else {
            console.log("Extraneous message: " + message);
        }
    }

    private processCompletionMessage(_: number) {
        this.pendingWorkers--;
        if(this.pendingWorkers > 0) return;

        if(this.seedCandidates.length == 0) {
            this.callback.notifyFailure();
        } else if(this.seedCandidates.length == 1) {
            this.callback.notifySuccess(this.seedCandidates[0]);
        } else {
            // Nothing to do, as the notifyDuplicate is sent in processSeedMessage.
        }
    }

    private processProgressMessage(part: number, percentage: number) {
        this.completionPercentage[part] = percentage;
        let progress = this.completionPercentage.reduce( (a, b) => a+b, 0 ) / this.workers.length;
        this.callback.notifyProgress(progress);
    }

    private processSeedMessage(_: number, seed: string) {
        this.seedCandidates.push(seed);

        if(this.seedCandidates.length > 1) {
            // Advance clock and clear workers
            this.logicalTime++;
            for(let worker of this.workers) {
                worker.postMessage(this.logicalTime);
            }

            // Notify the callback
            this.callback.notifyDuplicate(this.seedCandidates);
        }
    }
}
