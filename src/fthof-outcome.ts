import { GCOutcome } from './gcoutcome';

/* Represents an outcome from a FtHoF cast.
 * seasonalVariantIndex the shape of the golden cookie during a season;
 * may be 'undefined' (if season == '', or if the player did not paid attention to it).
 */
export class FtHoFOutcome {
    constructor(
        public gcOutcome: GCOutcome = GCOutcome.Frenzy,
        public backfire: boolean = false,
        public spellsCast: number = 0,
        public season: '' | 'easter' | 'valentines' = '',
        public seasonalVariantIndex: number | undefined = undefined
    ) {
    }

    equals(rhs: any) {
        if(!(rhs instanceof FtHoFOutcome)) return false;
        if(this.gcOutcome !== rhs.gcOutcome) return false;
        if(this.backfire !== rhs.backfire) return false;
        if(this.spellsCast !== rhs.spellsCast) return false;
        if(this.season !== rhs.season) return false;
        if(this.season !== ''
            && this.seasonalVariantIndex !== rhs.seasonalVariantIndex) return false;
        return true;
    }
};
