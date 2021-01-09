let isCompatibleWithAllMock = jest.fn();

jest.mock('./seed-outcome-compatibility', () => (
    {
        ...jest.requireActual('./seed-outcome-compatibility') as {},
        isCompatibleWithAll: isCompatibleWithAllMock,
    }
));

jest.useFakeTimers();

import { FtHoFOutcome } from './fthof-outcome';
import { SeedCrackerLimb } from './seed-cracker-limb';

test('SeedCrackerLimb basic functionality', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    expect(callback).not.toHaveBeenCalled();

    limb.onMessage({partCount: 26**3+1, part: 0}); // Note uneven partition
    expect(callback).not.toHaveBeenCalled();

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 17, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 17, done: true} );
    });

    limb.onMessage(17);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(26**2 - 1); // Note uneven partition
});

test('SeedCrackerLimb reports completion', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockClear();
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 18, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(26**2);
        expect(m.logicalTime).toEqual(18);
        expect(m.progress).toBeCloseTo(0.5, 10);
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(2*26**2);
        expect(m.logicalTime).toEqual(18);
        expect(m.progress).toBeCloseTo(1, 10);
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 18, done: true} );
    });

    limb.onMessage(18);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(2*26**2); // Not a single extra call
});

test('SeedCrackerLimb aborts computation if a new reset message is sent', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockClear();
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 19, seed: 'aaaaa'} );
        setTimeout(() => { // Having this on a setTimeout simulates an asynchronous message
            limb.onMessage(20); // Interrupt computation
        });
    }).mockImplementationOnce((m: any) => {
        // We should still see a progress report regardless, but only one
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(26**2);
        expect(m.logicalTime).toEqual(19);
        expect(m.progress).toBeCloseTo(0.5, 10);
    })

    limb.onMessage(19);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(26**2);
});

test('SeedCrackerLimb properly restarts computation if interrupted', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockClear();
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 19, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(26**2);
        expect(m.logicalTime).toEqual(19);
        expect(m.progress).toBeCloseTo(0.5, 10);
        setTimeout(() => {
            // This is ran after the current timeout runs,
            // but before setTimeout set by the current invocation runs.
            limb.onMessage(20); // Interrupt computation
            limb.onMessage(outcomeList); // Start new one
        });
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 20, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(2*26**2); // More calls
        expect(m.logicalTime).toEqual(20);
        expect(m.progress).toBeCloseTo(0.5, 10);
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(3*26**2);
        expect(m.logicalTime).toEqual(20);
        expect(m.progress).toBeCloseTo(1, 10);
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 20, done: true} );
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(3*26**2);
        isCompatibleWithAllMock.mockImplementation( () => fail("More calls happened") );
    });

    limb.onMessage(19);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(3*26**2);
});

test('SeedCrackerLimb aborts computation if two compatible seeds are found', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockClear();
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa' || seed == 'aaaac';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 21, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 21, seed: 'aaaac'} );
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(3);
        isCompatibleWithAllMock.mockImplementation( () => fail("More calls happened") );
    });

    limb.onMessage(21);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(3);
});
