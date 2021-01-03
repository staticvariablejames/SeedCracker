import { GCOutcome } from './gcoutcome';
import { FtHoFOutcome } from './fthof-outcome';
import { isCompatible, isCompatibleWithAll } from './seed-outcome-compatibility';

/* The examples in this section were obtained directly from the game.
 */

test('isCompatible basic functionality', () => {
    let o1 = new FtHoFOutcome();
    o1.backfire = false;
    o1.gcOutcome = GCOutcome.Lucky;
    o1.season = '';
    o1.spellsCast = 6;

    expect(isCompatible(o1, 'aaaaa')).toBe(true);

    let o2 = {...o1, spellsCast: 7} as FtHoFOutcome;
    expect(isCompatible(o2, 'aaaaa')).toBe(true);
    let o3 = {...o1, spellsCast: 8} as FtHoFOutcome;
    expect(isCompatible(o3, 'aaaaa')).toBe(true);
    let o4 = {...o1, spellsCast: 9} as FtHoFOutcome;
    expect(isCompatible(o4, 'aaaaa')).toBe(true);

    let o5 = {...o1, spellsCast: 10} as FtHoFOutcome;
    expect(isCompatible(o5, 'aaaaa')).toBe(false);

    expect(isCompatibleWithAll([o1, o2, o3, o4], 'aaaaa')).toBe(true);
    expect(isCompatibleWithAll([o1, o2, o3, o4, o5], 'aaaaa')).toBe(false);
});

test('isCompatible handles backfires', () => {
    let o1 = new FtHoFOutcome();
    o1.backfire = true;
    o1.gcOutcome = GCOutcome.Ruin;
    o1.season = '';
    o1.spellsCast = 7;
    expect(isCompatible(o1, 'bbbbb')).toBe(true);

    let o2 = {...o1, spellsCast: 8, gcOutcome: GCOutcome.Clot} as FtHoFOutcome;
    expect(isCompatible(o2, 'bbbbb')).toBe(true);
    let o3 = {...o1, spellsCast: 9, gcOutcome: GCOutcome.Clot} as FtHoFOutcome;
    expect(isCompatible(o3, 'bbbbb')).toBe(true);

    let o4 = {...o1, spellsCast: 10, gcOutcome: GCOutcome.Clot} as FtHoFOutcome;
    expect(isCompatible(o4, 'bbbbb')).toBe(false);

    expect(isCompatibleWithAll([o1, o2, o3], 'bbbbb')).toBe(true);
    expect(isCompatibleWithAll([o1, o2, o3, o4], 'bbbbb')).toBe(false);
});

test('isCompatible handles seasons', () => {
    let o1 = new FtHoFOutcome();
    o1.backfire = false;
    o1.gcOutcome = GCOutcome.ClickFrenzy;
    o1.season = 'valentines';
    o1.spellsCast = 6;

    expect(isCompatible(o1, 'ccccc')).toBe(true);

    let o2 = {...o1, spellsCast: 7} as FtHoFOutcome;
    expect(isCompatible(o2, 'ccccc')).toBe(true);
    let o3 = {...o1, spellsCast: 8} as FtHoFOutcome;
    expect(isCompatible(o3, 'ccccc')).toBe(true);
    let o4 = {...o1, spellsCast: 9} as FtHoFOutcome;
    expect(isCompatible(o4, 'ccccc')).toBe(true);

    let o5 = {...o1, spellsCast: 10} as FtHoFOutcome;
    expect(isCompatible(o5, 'ccccc')).toBe(false);
});

test('isCompatible handles seasonal variants', () => {
    let o1 = new FtHoFOutcome();
    o1.backfire = false;
    o1.gcOutcome = GCOutcome.Lucky;
    o1.season = 'valentines';
    o1.spellsCast = 26;
    o1.seasonalVariantIndex = 7;

    expect(isCompatible(o1, 'ddddd')).toBe(true);

    let o2 = {...o1, spellsCast: 27, seasonalVariantIndex: 0} as FtHoFOutcome;
    expect(isCompatible(o2, 'ddddd')).toBe(true);
    let o3 = {...o1, spellsCast: 28, season: 'easter', seasonalVariantIndex: 3} as FtHoFOutcome;
    expect(isCompatible(o3, 'ddddd')).toBe(true);
    let o4 = {...o1, spellsCast: 29, season: 'easter', seasonalVariantIndex: 0} as FtHoFOutcome;
    expect(isCompatible(o4, 'ddddd')).toBe(true);

    let o5 = {...o1, spellsCast: 30, season: 'easter', seasonalVariantIndex: 0} as FtHoFOutcome;
    expect(isCompatible(o5, 'ddddd')).toBe(false);
    o5.seasonalVariantIndex = 3;
    expect(isCompatible(o5, 'ddddd')).toBe(true);
    o5.seasonalVariantIndex = undefined;
    expect(isCompatible(o5, 'ddddd')).toBe(true);
});

test('isCompatible handles rare outcomes', () => {
    let o1 = new FtHoFOutcome();
    o1.backfire = true;
    o1.gcOutcome = GCOutcome.ElderFrenzy;
    o1.season = '';
    o1.spellsCast = 205;

    expect(isCompatible(o1, 'james')).toBe(true);
    o1.season = 'valentines'; // This outcome has the same result in/out of season
    expect(isCompatible(o1, 'james')).toBe(true);
    o1.seasonalVariantIndex = 0;
    expect(isCompatible(o1, 'james')).toBe(true);
    o1.season = 'easter';
    expect(isCompatible(o1, 'james')).toBe(true);
    o1.season = '';
    o1.seasonalVariantIndex = 2; // To make sure it is ignored when season === ''
    expect(isCompatible(o1, 'james')).toBe(true);

    let o2 = {...o1, spellsCast: 798, gcOutcome: GCOutcome.CursedFinger} as FtHoFOutcome;
    expect(isCompatible(o2, 'james')).toBe(true);

    let o3 = {...o1, spellsCast: 27430, gcOutcome: GCOutcome.Sweet} as FtHoFOutcome;
    expect(isCompatible(o3, 'james')).toBe(true);

    let o4 = {...o1, spellsCast: 124729, gcOutcome: GCOutcome.Sweet, backfire: false} as FtHoFOutcome;
    expect(isCompatible(o4, 'james')).toBe(true);
});
