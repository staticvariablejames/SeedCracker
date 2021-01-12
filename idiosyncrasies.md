[SLOW] tag for tests
====================

Several tests
(especially for brute-forcing)
are quite slow.
To make development more enjoyable,
tests which are expected to be slow are tagged with `[SLOW]`
and are prevented from run in `npm test`.
These are still accessible with `npm run test:all`.


`gh-pages` branch for "deploying"
=================================

No production builds are available in the `master` branch.
Instead,
the Javascript output (Webpacked, minified etc.)
is available in the `gh-pages` branch.
This keeps the diffs in the `master` branch clean.
