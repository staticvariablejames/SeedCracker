/* This tests only the SeedCracker class,
 * which is responsible for mananging the several SeedCrakerWorker's
 * and is where the complex logic of seed-cracker.ts resides.
 */
let mockSeedCrackerWorker = jest.fn();

jest.mock('./seed-cracker-worker', () => (
    {
        SeedCrackerWorker: mockSeedCrackerWorker,
    }
));

let mockCallback = {
    notifyFailure: jest.fn(),
    notifyDuplicate: jest.fn(),
    notifySuccess: jest.fn(),
    notifyProgress: jest.fn(),
};

let postMessageCallbacks: jest.Mock[] = [];

beforeEach( () => {
    postMessageCallbacks = [];
    mockSeedCrackerWorker.mockImplementation(() => {
        let callback = jest.fn();
        postMessageCallbacks.push(callback);
        return { postMessage: callback };
    });
});

import { SeedCrackerWorker } from './seed-cracker-worker';
import { SeedCracker } from './seed-cracker';

test("The mock works", () => {
    expect(postMessageCallbacks.length).toBe(0);
    new SeedCrackerWorker(1, 2, null as any);
    new SeedCrackerWorker(1, 2, null as any);
    expect(postMessageCallbacks.length).toBe(2);
    /* Note that there is no need to supply or preserve the "boss" parameter
     * (as Jest saves that automatically, in the .mock.calls attribute,
     * and providing the appropriate part numbers when calling boss.onMessage
     * is enough to test the behavior of the class.
     */
    expect(postMessageCallbacks[0]).not.toBe(postMessageCallbacks[1]);
});

test("Basic SeedCracker functionality works", () => {
    let boss = new SeedCracker(mockCallback, 4);
    expect(mockSeedCrackerWorker).toHaveBeenCalledTimes(4);
    expect(mockSeedCrackerWorker).toHaveBeenNthCalledWith(1, 4, 0, boss);
    expect(mockSeedCrackerWorker).toHaveBeenNthCalledWith(2, 4, 1, boss);
    expect(mockSeedCrackerWorker).toHaveBeenNthCalledWith(3, 4, 2, boss);
    expect(mockSeedCrackerWorker).toHaveBeenNthCalledWith(4, 4, 3, boss);

    let outcomeList: any[] = [];
    boss.updateOutcomeList(outcomeList);
    for(let i = 0; i < 4; i++) {
        expect(postMessageCallbacks[i]).toHaveBeenCalledTimes(2);
        expect(postMessageCallbacks[i]).toHaveBeenNthCalledWith(1, 1);
        expect(postMessageCallbacks[i]).toHaveBeenNthCalledWith(2, outcomeList);
    }

    boss.onMessage(0, {logicalTime: 1, progress: 0.5});
    expect(mockCallback.notifyProgress).toHaveBeenCalled();
    expect(mockCallback.notifyProgress.mock.calls[0][0]).toBeCloseTo(0.125, 10);

    boss.onMessage(1, {logicalTime: 1, progress: 0.5});
    expect(mockCallback.notifyProgress).toHaveBeenCalledTimes(2);
    expect(mockCallback.notifyProgress.mock.calls[1][0]).toBeCloseTo(0.25, 10);

    boss.onMessage(0, {logicalTime: 1, progress: 1});
    expect(mockCallback.notifyProgress).toHaveBeenCalledTimes(3);
    expect(mockCallback.notifyProgress.mock.calls[2][0]).toBeCloseTo(0.375, 10);

    boss.onMessage(1, {logicalTime: 1, seed: 'jaaaa'});
    expect(mockCallback.notifySuccess).not.toHaveBeenCalled();

    boss.onMessage(0, {logicalTime: 1, done: true});
    boss.onMessage(1, {logicalTime: 1, done: true});
    boss.onMessage(2, {logicalTime: 1, done: true});
    boss.onMessage(3, {logicalTime: 1, done: true});
    expect(mockCallback.notifySuccess).toHaveBeenCalledWith('jaaaa');
});

test("SeedCracker identifies failures", () => {
    let boss = new SeedCracker(mockCallback, 4);
    boss.updateOutcomeList([]);

    boss.onMessage(0, {logicalTime: 1, done: true});
    boss.onMessage(1, {logicalTime: 1, done: true});
    boss.onMessage(2, {logicalTime: 1, done: true});
    boss.onMessage(3, {logicalTime: 1, done: true});
    expect(mockCallback.notifySuccess).not.toHaveBeenCalled();
    expect(mockCallback.notifyFailure).toHaveBeenCalled();
});

test("SeedCracker identifies duplicates", () => {
    let boss = new SeedCracker(mockCallback, 4);
    boss.updateOutcomeList([]);

    boss.onMessage(0, {logicalTime: 1, seed: 'aaaac'});
    boss.onMessage(0, {logicalTime: 1, seed: 'aaaae'});
    boss.onMessage(0, {logicalTime: 1, done: true});

    for(let i = 0; i < 4; i++) {
        // Three calls: time update, outcome list update, time update
        expect(postMessageCallbacks[i]).toHaveBeenCalledTimes(3);
        expect(postMessageCallbacks[i]).toHaveBeenLastCalledWith(2);
    }

    boss.onMessage(1, {logicalTime: 1, done: true});
    boss.onMessage(2, {logicalTime: 1, done: true});
    boss.onMessage(3, {logicalTime: 1, done: true});

    expect(mockCallback.notifySuccess).not.toHaveBeenCalled();
    expect(mockCallback.notifyFailure).not.toHaveBeenCalled();
    expect(mockCallback.notifyDuplicate).toHaveBeenCalledWith(['aaaac', 'aaaae']);
});

test("SeedCracker identifies duplicates across different workers", () => {
    let boss = new SeedCracker(mockCallback, 4);
    boss.updateOutcomeList([]);

    boss.onMessage(0, {logicalTime: 1, seed: 'aaaac'});
    boss.onMessage(1, {logicalTime: 1, seed: 'jaaae'});

    for(let i = 0; i < 4; i++) {
        // Three calls: time update, outcome list update, time update
        expect(postMessageCallbacks[i]).toHaveBeenCalledTimes(3);
        expect(postMessageCallbacks[i]).toHaveBeenLastCalledWith(2);
    }

    expect(mockCallback.notifySuccess).not.toHaveBeenCalled();
    expect(mockCallback.notifyFailure).not.toHaveBeenCalled();
    expect(mockCallback.notifyDuplicate).toHaveBeenCalledWith(['aaaac', 'jaaae']);
});

test("SeedCracker restarts computation if given another outcome list", () => {
    let boss = new SeedCracker(mockCallback, 4);
    boss.updateOutcomeList([]);

    boss.onMessage(0, {logicalTime: 1, seed: 'aaaac'});
    boss.onMessage(0, {logicalTime: 1, progress: 0.5});
    boss.onMessage(1, {logicalTime: 1, done: true});

    for(let i = 0; i < 4; i++) {
        expect(postMessageCallbacks[i]).toHaveBeenCalledTimes(2);
    }

    boss.updateOutcomeList([]);
    for(let i = 0; i < 4; i++) {
        expect(postMessageCallbacks[i]).toHaveBeenCalledTimes(4);
        expect(postMessageCallbacks[i]).toHaveBeenLastCalledWith([]);
    }

    boss.onMessage(0, {logicalTime: 1, seed: 'aaaae'}); // Should be ignored
    boss.onMessage(3, {logicalTime: 2, seed: 'zzzzz'});

    boss.onMessage(0, {logicalTime: 2, done: true});
    boss.onMessage(1, {logicalTime: 2, done: true});
    boss.onMessage(2, {logicalTime: 2, done: true});
    boss.onMessage(3, {logicalTime: 2, done: true});

    expect(mockCallback.notifyFailure).not.toHaveBeenCalled();
    expect(mockCallback.notifyDuplicate).not.toHaveBeenCalled();
    expect(mockCallback.notifySuccess).toHaveBeenCalledWith('zzzzz');
});
