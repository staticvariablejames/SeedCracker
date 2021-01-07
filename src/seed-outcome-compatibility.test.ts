import { GCOutcome } from './gcoutcome';
import { FtHoFOutcome } from './fthof-outcome';
import { isCompatible, isCompatibleWithAll } from './seed-outcome-compatibility';

/* The examples in this section were obtained directly from the game.
 */

test('isCompatible basic functionality', () => {
    let o1 = new FtHoFOutcome(GCOutcome.Lucky, false, 6, '');
    expect(isCompatible(o1, 'aaaaa')).toBe(true);
    let o2 = new FtHoFOutcome(GCOutcome.Lucky, false, 7, '');
    expect(isCompatible(o2, 'aaaaa')).toBe(true);
    let o3 = new FtHoFOutcome(GCOutcome.Lucky, false, 8, '');
    expect(isCompatible(o3, 'aaaaa')).toBe(true);
    let o4 = new FtHoFOutcome(GCOutcome.Lucky, false, 9, '');
    expect(isCompatible(o4, 'aaaaa')).toBe(true);

    let o5 = new FtHoFOutcome(GCOutcome.Lucky, false, 10, '');
    expect(isCompatible(o5, 'aaaaa')).toBe(false);

    expect(isCompatibleWithAll([o1, o2, o3, o4], 'aaaaa')).toBe(true);
    expect(isCompatibleWithAll([o1, o2, o3, o4, o5], 'aaaaa')).toBe(false);
});

test('isCompatible handles backfires', () => {
    let o1 = new FtHoFOutcome(GCOutcome.Ruin, true, 7, '');
    expect(isCompatible(o1, 'bbbbb')).toBe(true);
    let o2 = new FtHoFOutcome(GCOutcome.Clot, true, 8, '');
    expect(isCompatible(o2, 'bbbbb')).toBe(true);
    let o3 = new FtHoFOutcome(GCOutcome.Clot, true, 9, '');
    expect(isCompatible(o3, 'bbbbb')).toBe(true);

    let o4 = new FtHoFOutcome(GCOutcome.Clot, true, 10, '');
    expect(isCompatible(o4, 'bbbbb')).toBe(false);

    expect(isCompatibleWithAll([o1, o2, o3], 'bbbbb')).toBe(true);
    expect(isCompatibleWithAll([o1, o2, o3, o4], 'bbbbb')).toBe(false);
});

test('isCompatible handles seasons', () => {
    let o1 = new FtHoFOutcome(GCOutcome.ClickFrenzy, false, 6, 'valentines');
    expect(isCompatible(o1, 'ccccc')).toBe(true);
    let o2 = new FtHoFOutcome(GCOutcome.ClickFrenzy, false, 7, 'valentines');
    expect(isCompatible(o2, 'ccccc')).toBe(true);
    let o3 = new FtHoFOutcome(GCOutcome.ClickFrenzy, false, 8, 'valentines');
    expect(isCompatible(o3, 'ccccc')).toBe(true);
    let o4 = new FtHoFOutcome(GCOutcome.ClickFrenzy, false, 9, 'valentines');
    expect(isCompatible(o4, 'ccccc')).toBe(true);

    let o5 = new FtHoFOutcome(GCOutcome.ClickFrenzy, false, 10, 'valentines');
    expect(isCompatible(o5, 'ccccc')).toBe(false);
});

test('isCompatible handles seasonal variants', () => {
    let o1 = new FtHoFOutcome(GCOutcome.Lucky, false, 26, 'valentines', 7);
    expect(isCompatible(o1, 'ddddd')).toBe(true);
    let o2 = new FtHoFOutcome(GCOutcome.Lucky, false, 27, 'valentines', 0);
    expect(isCompatible(o2, 'ddddd')).toBe(true);
    let o3 = new FtHoFOutcome(GCOutcome.Lucky, false, 28, 'easter', 3);
    expect(isCompatible(o3, 'ddddd')).toBe(true);
    let o4 = new FtHoFOutcome(GCOutcome.Lucky, false, 29, 'easter', 0);
    expect(isCompatible(o4, 'ddddd')).toBe(true);

    let o5 = new FtHoFOutcome(GCOutcome.Lucky, false, 30, 'easter', 0);
    expect(isCompatible(o5, 'ddddd')).toBe(false);
    o5.seasonalVariantIndex = 3;
    expect(isCompatible(o5, 'ddddd')).toBe(true);
    o5.seasonalVariantIndex = undefined;
    expect(isCompatible(o5, 'ddddd')).toBe(true);
});

test('isCompatible handles rare outcomes', () => {
    let o1 = new FtHoFOutcome(GCOutcome.ElderFrenzy, true, 205, '');
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

    let o2 = new FtHoFOutcome(GCOutcome.CursedFinger, true, 798, '');
    expect(isCompatible(o2, 'james')).toBe(true);
    let o3 = new FtHoFOutcome(GCOutcome.Sweet, true, 27430, '');
    expect(isCompatible(o3, 'james')).toBe(true);
    let o4 = new FtHoFOutcome(GCOutcome.Sweet, false, 124729, '');
    expect(isCompatible(o4, 'james')).toBe(true);
});
