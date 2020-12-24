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
 * seasonalVariantIndex the shape of the golden cookie during a season;
 * may be 'undefined' (if season == '', or if the player did not paid attention to it).
 */
class FtHoFOutcome {
    gcOutcome: GCOutcome = GCOutcome.Frenzy;
    backfire: boolean = false;
    spellsCast: number = 0;
    season: '' | 'easter' | 'valentines' = '';
    seasonalVariantIndex: number | undefined = 0;
};

/* Instruments and manages an outcome frame in the user interface.
 */
class FtHoFOutcomeFrame {
    private static template = document
        .querySelector<HTMLTemplateElement>('#outcome-frame-template')!
        .content
        .querySelector<HTMLDivElement>('.outcome-frame')!;
    private div: HTMLDivElement;
    private successIcon: HTMLDivElement;
    private backfireIcon: HTMLDivElement;
    private gcOutcomeDivs: HTMLDivElement[];

    private easterIcon: HTMLDivElement;
    private valentinesIcon: HTMLDivElement;
    private easterSuccessVariantIcons: HTMLDivElement[];
    private easterBackfireVariantIcons: HTMLDivElement[];
    private valentinesVariantIcons: HTMLDivElement[];

    private outcome: FtHoFOutcome = new FtHoFOutcome();

    constructor() {
        this.div = FtHoFOutcomeFrame.template.cloneNode(true) as HTMLDivElement;

        this.successIcon = this.div.querySelector('.outcome-success-icon') as HTMLDivElement;
        this.backfireIcon = this.div.querySelector('.outcome-backfire-icon') as HTMLDivElement;

        this.gcOutcomeDivs = Array.from(
            this.div.querySelector('.gc-effect-list')!.children
        ) as HTMLDivElement[];

        this.easterIcon = this.div.querySelector('.easter-season-icon') as HTMLDivElement;
        this.valentinesIcon = this.div.querySelector('.valentines-season-icon') as HTMLDivElement;

        this.easterSuccessVariantIcons = [];
        this.easterBackfireVariantIcons = [];
        for(let div of this.div.querySelectorAll<HTMLDivElement>('.easter-bunny-icon')) {
            let index = Number(div.style.getPropertyValue('--index'));
            if(div.style.getPropertyValue('--wrath') == '') {
                this.easterSuccessVariantIcons[index] = div;
            } else {
                this.easterBackfireVariantIcons[index] = div;
            }
        }

        this.valentinesVariantIcons = [];
        for(let div of this.div.querySelectorAll<HTMLDivElement>('.valentines-heart-icon')) {
            let index = Number(div.style.getPropertyValue('--index'));
            this.valentinesVariantIcons[index] = div;
        }

        this.addHandlers();
    }

    public getOutcome() {
        return this.outcome;
    }

    public getDiv() {
        return this.div;
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

    private deselectSeasonalIcons(includeBigSelectors: boolean = true) {
        for(let div of this.easterBackfireVariantIcons)
            div.classList.remove('selected');
        for(let div of this.easterSuccessVariantIcons)
            div.classList.remove('selected');
        for(let div of this.valentinesVariantIcons)
            div.classList.remove('selected');
        if(includeBigSelectors) {
            this.easterIcon.classList.remove('selected');
            this.valentinesIcon.classList.remove('selected');
        }
    }

    private hideSeasonalIcons() {
        for(let div of this.easterBackfireVariantIcons)
            div.classList.add('inactive');
        for(let div of this.easterSuccessVariantIcons)
            div.classList.add('inactive');
        for(let div of this.valentinesVariantIcons)
            div.classList.add('inactive');
    }

    private showAppropriateEasterVariantIcons() {
        if(this.outcome.season != 'easter') return;
        let i = this.outcome.seasonalVariantIndex;
        this.hideSeasonalIcons();
        if(this.outcome.backfire) {
            for(let div of this.easterBackfireVariantIcons)
                div.classList.remove('inactive');
            if(i != undefined && i < this.easterBackfireVariantIcons.length)
                this.easterBackfireVariantIcons[i].classList.add('selected');
        } else {
            for(let div of this.easterSuccessVariantIcons)
                div.classList.remove('inactive');
            if(i != undefined && i < this.easterSuccessVariantIcons.length)
                this.easterSuccessVariantIcons[i].classList.add('selected');
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
            this.showAppropriateEasterVariantIcons();
        });
        this.backfireIcon.addEventListener('click', () => {
            this.successIcon.classList.remove('selected');
            this.backfireIcon.classList.add('selected');
            this.hideGCOutcomes(SuccessGCOutcomes);
            this.showGCOutcomes(BackfireGCOutcomes);
            // Correct order for handling GCOutcomes.Sweet
            this.outcome.backfire = true;
            this.showAppropriateEasterVariantIcons();
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

        this.easterIcon.addEventListener('click', () => {
            this.deselectSeasonalIcons();
            if(this.outcome.season == 'easter') {
                this.outcome.season = '';
            } else {
                this.outcome.season = 'easter';
                this.easterIcon.classList.add('selected');
            }
            this.outcome.seasonalVariantIndex = undefined;
            this.showAppropriateEasterVariantIcons();
        });

        this.valentinesIcon.addEventListener('click', () => {
            this.deselectSeasonalIcons();
            this.hideSeasonalIcons();
            if(this.outcome.season == 'valentines') {
                this.outcome.season = '';
            } else {
                this.outcome.season = 'valentines';
                this.valentinesIcon.classList.add('selected');
            }
            this.outcome.seasonalVariantIndex = undefined;

            for(let div of this.valentinesVariantIcons)
                div.classList.remove('inactive');
        });

        let makeVariantEventListener = (i: number, div: HTMLDivElement) => {
            div.addEventListener('click', () => {
                this.deselectSeasonalIcons(false);
                div.classList.add('selected');
                this.outcome.seasonalVariantIndex = i;
            });
        };
        for(let i in this.easterBackfireVariantIcons)
            makeVariantEventListener(+i, this.easterBackfireVariantIcons[i]);
        for(let i in this.easterSuccessVariantIcons)
            makeVariantEventListener(+i, this.easterSuccessVariantIcons[i]);
        for(let i in this.valentinesVariantIcons)
            makeVariantEventListener(+i, this.valentinesVariantIcons[i]);
    }
}

/* Manages the outcome list and the button to add elements to it.
 */
class OutcomeList {
    private outcomeFrames: FtHoFOutcomeFrame[] = [];

    private buttonDiv = document.getElementById('new-outcome-button') as HTMLDivElement;
    private listDiv = document.getElementById('outcome-list') as HTMLDivElement;

    private constructor() {
        this.addHandlers();
    }

    private addHandlers() {
        this.buttonDiv.addEventListener('click', () => {
            let frame = new FtHoFOutcomeFrame();
            this.outcomeFrames.push(frame);
            this.listDiv.insertBefore(frame.getDiv(), this.buttonDiv);
        });
        this.buttonDiv.click();
    }

    private static instance = new OutcomeList();

    static getOutcomes() {
        return OutcomeList.instance.outcomeFrames.map( frame => frame.getOutcome() );
    }
}

function crackSeed(list: FtHoFOutcome[]) {
    // TODO: actually implement this
    if(list.length < 5) return ['aaaaa', 'bbbbb', 'ccccc'];
    if(list.length == 5) return ['aaaaa'];
    return [];
}

class CrackSeedButton {
    static instance = new CrackSeedButton();
    private div = document.getElementById('cracking-result') as HTMLDivElement;
    private p = this.div.querySelector('p') as HTMLParagraphElement;
    private constructor() {
        this.div.addEventListener('click', () => {
            let seeds = crackSeed(OutcomeList.getOutcomes());
            if(seeds.length > 1) {
                this.p.textContent = `${seeds.length} viable seeds.
                    Cast FtHoF another time and click here again!`;
            } else if(seeds.length == 1) {
                this.p.textContent = `Seed cracked! Your seed is: ${seeds[0]}`;
            } else {
                this.p.textContent = `Something went wrong,
                    no viable seed found...
                    Double-check that the sequence of casts is correct,
                    reload the page, and try again.`;
            }
        });
    }
}
