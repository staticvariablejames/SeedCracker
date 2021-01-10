/* Thin web worker wrapper around SeedCrackerLimb.
 *
 * The separation between SeedCrackerLimb and this file helps with testing.
 * The code directly in this file is not tested,
 * but it is simple enough that it should be correct by inspection.
 */
import { SeedCrackerLimb } from './seed-cracker-limb';

const ctx: Worker = self as any;
const limb = new SeedCrackerLimb((m: any) => ctx.postMessage(m));

ctx.onmessage = (ev: MessageEvent) => {
    limb.onMessage(ev.data);
}
