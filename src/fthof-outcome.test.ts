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
