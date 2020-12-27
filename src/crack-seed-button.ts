import crackSeed from './seed-cracker';
import OutcomeList from './outcome-list';

export class CrackSeedButton {
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
