import FtHoFOutcome from './fthof-outcome.js';

export default function crackSeed(list: FtHoFOutcome[]) {
    // TODO: actually implement this
    if(list.length < 5) return ['aaaaa', 'bbbbb', 'ccccc'];
    if(list.length == 5) return ['aaaaa'];
    return [];
}
