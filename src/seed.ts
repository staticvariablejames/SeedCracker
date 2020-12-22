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

const SuccessGCOutcomes = [
    GCOutcome.Frenzy,
    GCOutcome.Lucky,
    GCOutcome.ClickFrenzy,
    GCOutcome.CookieStorm,
    GCOutcome.Blab,
    GCOutcome.BuildingSpecial,
    GCOutcome.CookieStormDrop,
    GCOutcome.Sweet,
];

const BackfireGCOutcomes = [
    GCOutcome.Sweet,
    GCOutcome.Clot,
    GCOutcome.Ruin,
    GCOutcome.CursedFinger,
    GCOutcome.ElderFrenzy,
];

const AllGCOutcomes = Object.keys(GCOutcome)
    .filter(key => !isNaN(Number(key)))
    .map(key => Number(key) as GCOutcome);

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
    private gcOutcomeDivs: HTMLDivElement[];

    private outcome: FtHoFOutcome = new FtHoFOutcome();

    constructor() {
        this.div = document.querySelector('.outcome-frame') as HTMLDivElement;

        this.successIcon = this.div.querySelector('.outcome-success-icon') as HTMLDivElement;
        this.backfireIcon = this.div.querySelector('.outcome-backfire-icon') as HTMLDivElement;

        this.gcOutcomeDivs = Array.from(
            this.div.querySelector('.gc-effect-list')!.children
        ) as HTMLDivElement[];

        this.addHandlers();
    }

    public getOutcome() {
        return this.outcome;
    }

    private showGCOutcomes(list: GCOutcome[]) {
        for(let i of list) {
            this.gcOutcomeDivs[i].classList.remove('inactive');
        }
    }
    private hideGCOutcomes(list: GCOutcome[]) {
        for(let i of list) {
            this.gcOutcomeDivs[i].classList.add('inactive');
        }
    }

    private addHandlers() {
        this.successIcon.addEventListener('click', () => {
            this.successIcon.classList.add('selected');
            this.backfireIcon.classList.remove('selected');
            this.hideGCOutcomes(BackfireGCOutcomes);
            this.showGCOutcomes(SuccessGCOutcomes);
            // Correct order for handling GCOutcomes.Sweet
            this.outcome.backfire = false;
        });
        this.backfireIcon.addEventListener('click', () => {
            this.successIcon.classList.remove('selected');
            this.backfireIcon.classList.add('selected');
            this.hideGCOutcomes(SuccessGCOutcomes);
            this.showGCOutcomes(BackfireGCOutcomes);
            // Correct order for handling GCOutcomes.Sweet
            this.outcome.backfire = true;
        });

        for(let i of AllGCOutcomes) {
            this.gcOutcomeDivs[i].addEventListener('click', () => {
                // brute-force implementation
                for(let div of this.gcOutcomeDivs) {
                    div.classList.remove('selected');
                }
                this.gcOutcomeDivs[i].classList.add('selected');
                this.outcome.gcOutcome = i;
            });
        }
    }
}

let frameHandler = new FtHoFOutcomeFrame();
