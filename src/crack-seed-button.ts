import { crackSeed } from './seed-cracker';
import { OutcomeList } from './outcome-list';

export class CrackSeedButton {
    static instance = new CrackSeedButton();
    private div = document.getElementById('cracking-result') as HTMLDivElement;
    private button = document.getElementById('crack-seed-button') as HTMLButtonElement;
    private constructor() {
        this.button.addEventListener('click', () => {
            let seeds = crackSeed(OutcomeList.getOutcomes());
            if(seeds.length > 1) {
                this.div.textContent = `${seeds.length} viable seeds.
                    Cast FtHoF another time and click here again!`;
            } else if(seeds.length == 1) {
                this.div.textContent = `Seed cracked! Your seed is: ${seeds[0]}`;
            } else {
                this.div.textContent = `Something went wrong,
                    no viable seed found...
                    Double-check that the sequence of casts is correct,
                    reload the page, and try again.`;
            }
        });
    }
}
