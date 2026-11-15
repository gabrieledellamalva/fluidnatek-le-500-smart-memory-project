# Fluidnatek + REA: visual interview investigation

This demo mounts the real `RunConfig` screen and its real numeric input component with synthetic project, formulation and machine-setup props. It is an isolated component-level app fixture, not a connection to the complete production platform. Firebase authentication and production services are unchanged; they are not imported by this entry. Saving deliberately throws instead of writing to a database.

## Start before the interview

Use Node 24.22.1 for REA. The repository app also supports other Node versions, but the REA runtime has its own pinned requirements.

```sh
npm ci
npm run demo:build
npm run demo
```

Open http://127.0.0.1:4321. The provided ZIP also includes a prebuilt `demo/site` folder; with that folder present `npm run demo:build` is optional for viewing the prepared versions. `npm run demo` itself uses Node built-ins only.

If your Mac currently has Node 26.8.1 and no nvm:

```sh
npm exec --yes --package=node@24.22.1 -- npm run demo
```

Do the install and first REA download before the interview. Chrome or Brave must already be installed. `REA_CHROME` can name its executable. `REA_ENTRY` can name a local REA `scripts/rea.mjs` entry; otherwise the button uses the official npm package `rea-agents@6.9.0`.

## What to show

1. In **Prima**, clear HV−, type `-`, pause briefly, then type `3` and press Tab. It becomes positive `3` because React's effect clears the incomplete draft.
2. Explain the invariant: an unfinished text draft is not yet a numeric value, but the user must be allowed to finish it.
3. Show the REA evidence pane. The static bundle analysis was actually run; it retains artifact hashes, function spans and explicit partial graph coverage. Source-map association and source review connect those spans to NumericField. REA did not automatically diagnose this UI defect.
4. Show the correction: keep text while focused; continue formatting and clamping on blur, and synchronize external values when not editing.
5. In **Dopo la correzione**, repeat the same keys. The value stays negative `-3`.
6. On a prepared Mac, the **Esegui cattura browser con REA** button asks REA to launch two disposable browsers, capture the same sequence and show the observed values and resulting screenshot. It reports errors instead of displaying a fabricated success.

For the interview, keep the bug branch and PR open and walk through the actual code change. If you use the prepared corrected build, say that it was prepared before the call. To apply the patch live, use an untouched worktree at the base revision, reproduce, apply the reviewed diff, rebuild the corrected view and rerun the capture. Do not imply the prebuilt view is a live modification.

## Actual validation

- Original field: negative-draft and leading-decimal tests fail; external synchronization passes.
- Corrected field: 3/3 rendering tests pass (`npm run test:numeric-input`).
- Existing `npm test`: 5/5 pass.
- `npm run lint`: TypeScript passes.
- Both demo bundles build.
- Actual browser interaction: original final HV− is `3`; corrected final HV− is `-3`, including a pause after the sign.
- REA 6.9.0 analyzed the 84,907-byte original app chunk: 19,325 AST nodes visited, 4,000 semantic nodes retained; coverage is partial at the configured ceiling. Eight function nodes lie in the source-map-associated NumericField interval.
- REA's own Chromium launch could not run in the execution container because Unix sockets are unavailable. The Mac capture route is implemented, schema-validated and remains unverified end to end on macOS. The interface labels this gap.
- This is not live machine telemetry, a live Firestore session, or proof of an error in the physical LE-500 controller.

Generated evidence and static builds are ignored in Git. The deliverable ZIP carries the prepared bundles and the actual static REA Evidence. Browser screenshots are generated only by a successful local REA run.
