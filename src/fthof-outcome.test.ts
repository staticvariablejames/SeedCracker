import {FtHoFOutcome} from './fthof-outcome';
import { GCOutcome } from './gcoutcome';

test('FtHoFOutcome equality works', () => {
    let outcome = new FtHoFOutcome();
    outcome.spellsCast = 6;
    outcome.backfire = true;
    outcome.gcOutcome = GCOutcome.Blab;
    outcome.season = '';
    expect(outcome.equals(null)).toBe(false);

    let otherOutcome = new FtHoFOutcome();
    expect(outcome.equals(otherOutcome)).toBe(false);
    otherOutcome.spellsCast = 6;
    expect(outcome.equals(otherOutcome)).toBe(false);
    otherOutcome.backfire = true;
    expect(outcome.equals(otherOutcome)).toBe(false);
    otherOutcome.gcOutcome = GCOutcome.Blab;
    expect(outcome.equals(otherOutcome)).toBe(true);

    otherOutcome.seasonalVariantIndex = 5;
    expect(outcome.equals(otherOutcome)).toBe(true); // seasonalVariant ignored if season == ''
    outcome.season = otherOutcome.season = 'valentines';
    expect(outcome.equals(otherOutcome)).toBe(false);
});

test('FtHoFOutcome.fromObjec works', () => {
    let outcome1 = new FtHoFOutcome(GCOutcome.Sweet, true, 42, 'valentines', 7);
    let outcome2 = new FtHoFOutcome(GCOutcome.Sweet, true, 42, '');
    let object = {...outcome1} as any;
    expect(object instanceof FtHoFOutcome).toBe(false);
    expect(FtHoFOutcome.fromObject(object) instanceof FtHoFOutcome).toBe(true);
    expect(FtHoFOutcome.fromObject(object)).toEqual(outcome1);

    object.backfire = 'true';
    expect(FtHoFOutcome.fromObject(object)).toBe(null);
    object.backfire = true;

    object.season = 'not a season';
    expect(FtHoFOutcome.fromObject(object)).toBe(null);
    object.season = 'valentines';

    object.seasonalVariantIndex = () => {};
    expect(FtHoFOutcome.fromObject(object)).toBe(null);
    object.seasonalVariantIndex = 0;

    delete object.seasonalVariantIndex;
    expect(FtHoFOutcome.fromObject(object)).toBe(null);
    object.season = '';
    expect(FtHoFOutcome.fromObject(object)).not.toBe(null);
    expect(FtHoFOutcome.fromObject(object)!.equals(outcome2)).toBe(true);
});
