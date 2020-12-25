import GCOutcome from './gcoutcome.js';

/* Represents an outcome from a FtHoF cast.
 * seasonalVariantIndex the shape of the golden cookie during a season;
 * may be 'undefined' (if season == '', or if the player did not paid attention to it).
 */
export default class FtHoFOutcome {
    gcOutcome: GCOutcome = GCOutcome.Frenzy;
    backfire: boolean = false;
    spellsCast: number = 0;
    season: '' | 'easter' | 'valentines' = '';
    seasonalVariantIndex: number | undefined = 0;
};
