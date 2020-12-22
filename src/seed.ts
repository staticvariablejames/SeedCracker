enum GCOutcome { // Golden Cookie outcome
    Frenzy,
    Lucky,
    ClickFrenzy,
    CookieStorm,
    Blab,
    BuildingSpecial,
    CookieStormDrop,
    Sweet,
    Clot,
    Ruin,
    CursedFinger,
    ElderFrenzy,
    // These are in the same order that they show up in the HTML file
};

/* Represents an outcome from a FtHoF cast.
 * seasonalVariantIndex the shape of the golden cookie during a season.
 * If season == '', then seasonalVariantIndex is ignored.
 */
class FtHoFOutcome {
    gcOutcome: GCOutcome = GCOutcome.Frenzy;
    backfire: boolean = false;
    spellsCast: number = 0;
    season: '' | 'easter' | 'valentines' = '';
    seasonalVariantIndex: number = 0;
};

/* Instruments and manages an outcome frame in the user interface.
 */
class FtHoFOutcomeFrame {
    private div: HTMLDivElement;
    private successIcon: HTMLDivElement;
    private backfireIcon: HTMLDivElement;

    private outcome: FtHoFOutcome = new FtHoFOutcome();

    constructor() {
        this.div = document.querySelector('.outcome-frame') as HTMLDivElement;

        this.successIcon = this.div.querySelector('.outcome-success-icon') as HTMLDivElement;
        this.backfireIcon = this.div.querySelector('.outcome-backfire-icon') as HTMLDivElement;

        this.addHandlers();
    }

    public getOutcome() {
        return this.outcome;
    }

    private addHandlers() {
        this.successIcon.addEventListener('click', () => {
            this.successIcon.classList.add('selected');
            this.backfireIcon.classList.remove('selected');
            this.outcome.backfire = false;
        });
        this.backfireIcon.addEventListener('click', () => {
            this.successIcon.classList.remove('selected');
            this.backfireIcon.classList.add('selected');
            this.outcome.backfire = true;
        });
    }
}

let frameHandler = new FtHoFOutcomeFrame();
