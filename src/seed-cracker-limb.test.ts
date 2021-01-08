let isCompatibleWithAllMock = jest.fn();

jest.mock('./seed-outcome-compatibility', () => (
    {
        ...jest.requireActual('./seed-outcome-compatibility') as {},
        isCompatibleWithAll: isCompatibleWithAllMock,
    }
));

import { FtHoFOutcome } from './fthof-outcome';
import { SeedCrackerLimb } from './seed-cracker-limb';

test('SeedCrackerLimb basic functionality', done => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    expect(callback).not.toHaveBeenCalled();

    limb.onMessage({partCount: 26**3+1, part: 0});
    expect(callback).not.toHaveBeenCalled();

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual('aaaaa');
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual('done');
        done();
    });
    limb.onMessage(outcomeList);
});

test('SeedCrackerLimb reports completion', done => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockClear();
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual('aaaaa');
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(26**2);
        expect(m).toBeCloseTo(0.5, 10);
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(2*26**2);
        expect(m).toBeCloseTo(1, 10);
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual('done');
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(2*26**2); // Not a single extra call
        done();
    });
    limb.onMessage(outcomeList);
});

test('SeedCrackerLimb properly restarts computation if interrupted', done => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockClear();
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual('aaaaa');
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(26**2);
        expect(m).toBeCloseTo(0.5, 10);
        limb.onMessage(outcomeList); // Interrupt computation
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual('aaaaa');
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(2*26**2); // More calls
        expect(m).toBeCloseTo(0.5, 10);
    }).mockImplementationOnce((m: any) => {
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(3*26**2);
        expect(m).toBeCloseTo(1, 10);
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual('done');
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(3*26**2);
        isCompatibleWithAllMock.mockImplementation( () => fail("More calls happened") );
        done();
    });
    limb.onMessage(outcomeList);
});

test('SeedCrackerLimb aborts computation if two compatible seeds are found', done => {
    let callback = jest.fn();
    let limb = new SeedCrackerLimb(callback);
    limb.onMessage({partCount: 26**3/2, part: 0});

    let outcomeList = [new FtHoFOutcome()];
    isCompatibleWithAllMock.mockClear();
    isCompatibleWithAllMock.mockImplementation((_: any, seed: string) => {
        return seed == 'aaaaa' || seed == 'aaaac';
    });

    callback.mockImplementationOnce((m: any) => {
        expect(m).toEqual('aaaaa');
    }).mockImplementationOnce((m: any) => {
        expect(m).toEqual('aaaac');
        expect(isCompatibleWithAllMock).toHaveBeenCalledTimes(3);
        isCompatibleWithAllMock.mockImplementation( () => fail("More calls happened") );
        done();
    });
    limb.onMessage(outcomeList);
});
