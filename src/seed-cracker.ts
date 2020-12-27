import { FtHoFOutcome } from './fthof-outcome';

export function crackSeed(list: FtHoFOutcome[]) {
    // TODO: actually implement this
    if(list.length < 5) return ['aaaaa', 'bbbbb', 'ccccc'];
    if(list.length == 5) return ['aaaaa'];
    return [];
}
