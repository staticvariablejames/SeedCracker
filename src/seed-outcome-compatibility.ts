import { GCOutcome } from './gcoutcome';
import { FtHoFOutcome } from './fthof-outcome';
import seedrandom from 'seedrandom';

export function isCompatible(outcome: FtHoFOutcome, seed: string) {
    let prng = seedrandom(seed + '/' + outcome.spellsCast);
    if( (prng() < 0.85) == outcome.backfire )
        return false;

    // Generate the golden cookie
    if(outcome.season != '') {
        let variant;
        if(outcome.season == 'easter') {
            variant = Math.floor(prng() * 4);
        } else {
            variant = Math.floor(prng() * 8);
        }
        // In both branches, prng is called exactly once
        if(outcome.seasonalVariantIndex != undefined) {
            if(variant != outcome.seasonalVariantIndex)
                return false;
        }
        // The variant number does not depend on success/backfire status
    }
    prng(); prng(); // x, y coordinates (not used here)

    let gcChoices: GCOutcome[] = [];

    if(!outcome.backfire) {
        gcChoices.push(GCOutcome.Frenzy, GCOutcome.Lucky);
        gcChoices.push(GCOutcome.ClickFrenzy); // We assume no dragonflight
        if(prng() < 0.1) gcChoices.push(
            GCOutcome.CookieStorm, GCOutcome.CookieStorm, GCOutcome.Blab
        );
        if(prng() < 0.25) gcChoices.push(GCOutcome.BuildingSpecial); // We assume >= 10 buildings
        if(prng() < 0.15) gcChoices=[GCOutcome.CookieStormDrop];
        if(prng() < 0.0001) gcChoices.push(GCOutcome.Sweet);
    } else {
        gcChoices.push(GCOutcome.Clot, GCOutcome.Ruin);
        if(prng() < 0.1) gcChoices.push(GCOutcome.CursedFinger, GCOutcome.ElderFrenzy);
        if(prng() < 0.003) gcChoices.push(GCOutcome.Sweet);
        if(prng() < 0.1) gcChoices=[GCOutcome.Blab];
    }

    let gcOutcome = gcChoices[Math.floor(prng() * gcChoices.length)];

    return gcOutcome == outcome.gcOutcome;
}

export function isCompatibleWithAll(outcomes: FtHoFOutcome[], seed: string) {
    for(let outcome of outcomes) {
        if(!isCompatible(outcome, seed)) return false;
    }
    return true;
}
