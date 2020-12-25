import FtHoFOutcomeFrame from './fthof-outcome-frame.js';

/* Manages the outcome list and the button to add elements to it.
 */
export default class OutcomeList {
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
