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

    /* Attempts to convert the given object to a FtHoFOutcome.
     * Returns a FtHoFOutcome in case of success
     * (i.e. all data members are there and have the correct types and values)
     * and null otherwise.
     *
     * This function exists because transferring objects into web workers
     * serialize and deserialize them as if via JSON,
     * so any methods and class information are destroyed in the process.
     * Since the data members are still there,
     * this function converts them to a FtHoFOutcome.
     */
    static fromObject(obj: any): null | FtHoFOutcome {
        if(typeof obj != "object")
            return null;

        if(!('gcOutcome' in obj && typeof obj.gcOutcome == typeof GCOutcome.Sweet))
            return null;
        let gcOutcome: GCOutcome = obj.gcOutcome;
        if(!(gcOutcome in GCOutcome))
            return null;

        if(!('backfire' in obj && typeof obj.backfire == 'boolean'))
            return null;
        let backfire = obj.backfire;

        if(!('spellsCast' in obj && typeof obj.spellsCast == 'number'))
            return null;
        let spellsCast = obj.spellsCast;

        if(obj.season != '' && obj.season != 'valentines' && obj.season != 'easter')
            return null;
        let season = obj.season;

        let seasonalVariantIndex: number | undefined = undefined;
        if(season != '') {
            if(!('seasonalVariantIndex' in obj && typeof obj.seasonalVariantIndex == 'number'))
                return null;
            seasonalVariantIndex = obj.seasonalVariantIndex;
        }

        return new FtHoFOutcome(gcOutcome, backfire, spellsCast, season, seasonalVariantIndex);
    }
};
