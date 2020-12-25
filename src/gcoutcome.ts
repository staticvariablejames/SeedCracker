export enum GCOutcome { // Golden Cookie outcome
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
export default GCOutcome;

export const SuccessGCOutcomes = [
    GCOutcome.Frenzy,
    GCOutcome.Lucky,
    GCOutcome.ClickFrenzy,
    GCOutcome.CookieStorm,
    GCOutcome.Blab,
    GCOutcome.BuildingSpecial,
    GCOutcome.CookieStormDrop,
    GCOutcome.Sweet,
];

export const BackfireGCOutcomes = [
    GCOutcome.Sweet,
    GCOutcome.Clot,
    GCOutcome.Ruin,
    GCOutcome.CursedFinger,
    GCOutcome.ElderFrenzy,
];

export const AllGCOutcomes = Object.keys(GCOutcome)
    .filter(key => !isNaN(Number(key)))
    .map(key => Number(key) as GCOutcome);
