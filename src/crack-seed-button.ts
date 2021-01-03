import { SeedCrackerCallback, SeedCracker } from './seed-cracker';
import { OutcomeList } from './outcome-list';

export class CrackSeedButton implements SeedCrackerCallback {
    static instance = new CrackSeedButton();
    private div = document.getElementById('cracking-result') as HTMLDivElement;
    private button = document.getElementById('crack-seed-button') as HTMLButtonElement;
    private seedCracker: SeedCracker;
    private constructor() {
        this.seedCracker = new SeedCracker(this);
        this.button.addEventListener('click', () => {
            this.seedCracker.updateOutcomeList(OutcomeList.getOutcomes());
        });
    }

    notifyFailure() {
        this.div.textContent = `Something went wrong,
            no viable seed found...
            Double-check that the sequence of casts is correct,
            cast FtHoF only when there are no on-screen golden cookies,
            do not have Dragonflight active,
            make sure you own at least 10 buildings,
            reload the page, and try again.`;
    }
    notifySuccess(seed: string) {
        this.div.textContent = `Success! Your seed is ${seed}`;
    }
    notifyProgress(progress: number) {
        this.div.textContent = `${Math.floor(progress*10000)/100}% seeds scanned...`;
    }
    notifyDuplicate() {
        this.div.textContent = `Multiple viable seeds.
            Cast FtHoF another time and click here again!`;
    }
}
