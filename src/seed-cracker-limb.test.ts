let mockIsCompatibleWithAll = jest.fn();

jest.mock('./seed-outcome-compatibility', () => (
    {
        ...jest.requireActual('./seed-outcome-compatibility') as {},
        isCompatibleWithAll: mockIsCompatibleWithAll,
    }
));

jest.useFakeTimers();

import { FtHoFOutcome } from './fthof-outcome';
import { SeedCrackerLimb } from './seed-cracker-limb';
import { GCOutcome } from './gcoutcome';

test('SeedCrackerLimb basic functionality', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    expect(callback).not.toHaveBeenCalled();

    limb.onMessage({partCount: 26**3+1, part: 0}); // Note uneven partition
    expect(callback).not.toHaveBeenCalled();

    let outcomeList = [new FtHoFOutcome()];
    mockIsCompatibleWithAll.mockImplementation((_: any, seed: string) => {
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
    expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(26**2 - 1); // Note uneven partition
});

test('SeedCrackerLimb reports completion', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    mockIsCompatibleWithAll.mockClear();
    mockIsCompatibleWithAll.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 18, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(26**2);
        expect(m.logicalTime).toEqual(18);
        expect(m.progress).toBeCloseTo(0.5, 10);
    }).mockImplementationOnce((m: any) => {
        expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(2*26**2);
        expect(m.logicalTime).toEqual(18);
        expect(m.progress).toBeCloseTo(1, 10);
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 18, done: true} );
    });

    limb.onMessage(18);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(2*26**2); // Not a single extra call
});

test('SeedCrackerLimb aborts computation if a new reset message is sent', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    mockIsCompatibleWithAll.mockClear();
    mockIsCompatibleWithAll.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 19, seed: 'aaaaa'} );
        setTimeout(() => { // Having this on a setTimeout simulates an asynchronous message
            limb.onMessage(20); // Interrupt computation
        });
    }).mockImplementationOnce((m: any) => {
        // We should still see a progress report regardless, but only one
        expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(26**2);
        expect(m.logicalTime).toEqual(19);
        expect(m.progress).toBeCloseTo(0.5, 10);
    })

    limb.onMessage(19);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(26**2);
});

test('SeedCrackerLimb properly restarts computation if interrupted', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    mockIsCompatibleWithAll.mockClear();
    mockIsCompatibleWithAll.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 19, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(26**2);
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
        expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(2*26**2); // More calls
        expect(m.logicalTime).toEqual(20);
        expect(m.progress).toBeCloseTo(0.5, 10);
    }).mockImplementationOnce((m: any) => {
        expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(3*26**2);
        expect(m.logicalTime).toEqual(20);
        expect(m.progress).toBeCloseTo(1, 10);
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 20, done: true} );
        expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(3*26**2);
        mockIsCompatibleWithAll.mockImplementation( () => fail("More calls happened") );
    });

    limb.onMessage(19);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(3*26**2);
});

test('SeedCrackerLimb aborts computation if two compatible seeds are found', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    mockIsCompatibleWithAll.mockClear();
    mockIsCompatibleWithAll.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa' || seed == 'aaaac';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 21, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 21, seed: 'aaaac'} );
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 21, done: true} );
        mockIsCompatibleWithAll.mockImplementation( () => fail("More calls happened") );
    });

    limb.onMessage(21);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(3);
});

test('SeedCrackerLimb still works with FtHoFOutcome-like objects', () => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    expect(callback).not.toHaveBeenCalled();

    limb.onMessage({partCount: 26**3+1, part: 0}); // Note uneven partition
    expect(callback).not.toHaveBeenCalled();

    let outcome = new FtHoFOutcome(GCOutcome.ClickFrenzy, false, 2, '');
    let outcomeAsObject = {
        gcOutcome: GCOutcome.ClickFrenzy,
        backfire: false,
        spellsCast: 2,
        season: '',
    };
    let outcomeList = [outcomeAsObject]

    mockIsCompatibleWithAll.mockImplementation((list: FtHoFOutcome[], seed: string) => {
        return list.length == 1 && list[0].equals(outcome) && seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 17, seed: 'aaaaa'} );
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual( {logicalTime: 17, done: true} );
    });

    limb.onMessage(17);
    limb.onMessage(outcomeList);
    jest.runAllTimers();
    expect(mockIsCompatibleWithAll).toHaveBeenCalledTimes(26**2 - 1); // Note uneven partition
});
