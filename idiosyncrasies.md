Unit Tests vs Integration Tests
===============================

Unit tests for the classes/functions in `file.ts`
are written in `file.test.ts`, in the same directory as `file.ts`.

Integration tests also end with `.test.ts`,
are placed in the `test/` directory,
and require the server spawned by `npm start` to be active.


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


Cookie Clicker Webpage should be cached for testing
===================================================

Tests assume that a local copy of <https://orteil.dashnet.org/cookieclicker/>
is available under the `cache/cookieclicker/` subdirectory,
so that, for example,
the file `cookieclicker/img/icons.png` exists.

This is because the integration tests redirect e.g. a request to
<https://orteil.dashnet.org/cookieclicker/img/icons.png>
to the local file 'cookieclicker/img/icons.png'.
