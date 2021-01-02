[SLOW] tag for tests
====================

Several tests
(especially for brute-forcing)
are quite slow.
To make development more enjoyable,
tests which are expected to be slow are tagged with `[SLOW]`
and are prevented from run in `npm test`.
These are still accessible with `npm run test:all`.
