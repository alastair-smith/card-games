# Retro watch list

Patterns a retro saw once and chose to watch rather than write a rule for.
Each retro checks for them; see step 1 of `SKILL.md`.

| Pattern                                                                                                                                                                                                              | Seen in sessions                                    | Retros without it |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------- |
| Adding a story for an edge case another story already covers, e.g. a game story for stickers on every tag when the player strip's story already shows it                                                             | 2026-10-30 (`4d3d8f54-0392-416a-9118-7e8c83d1dfde`) | 4                 |
| Committing without checking that staging worked, so a commit goes out half done, e.g. `git add` failing on a path already removed with `git rm` while the commit went ahead                                          | 2026-10-30 (`4d3d8f54-0392-416a-9118-7e8c83d1dfde`) | 4                 |
| Pushing without running `pnpm format:fix` across the change, so CI's Lint job finds the errors first, e.g. generated SVGs Biome couldn't parse; or running the undocumented `pnpm lint` instead of the format script | 2026-11-02 (`78153c9b-91d4-4efd-88e4-65a59adc3dd6`) | 2                 |
| Giving a new control its own focus, hover, selected or border styles instead of an existing component's variants, e.g. `ButtonGroupChoice` before it took `Button`'s secondary and primary variants and focus ring   | 2026-11-01 (`62ab084d-4021-43cb-9b4e-f29cf898ce55`) | 1                 |
| Existing `CLAUDE.md` rule not followed: a diagram not updated in the PR that changed the flow it shows                                                                                                               | 2026-11-01 (`62ab084d-4021-43cb-9b4e-f29cf898ce55`) | 1                 |
| Existing `CLAUDE.md` rule not followed: comments longer than their reason, or restating what the classes say, e.g. exact widths in the hand's comment                                                                | 2026-11-01 (`62ab084d-4021-43cb-9b4e-f29cf898ce55`) | 1                 |
| Existing `CLAUDE.md` rule not followed: a state left unchecked in a layout change, e.g. the empty hand collapsing before the first deal                                                                              | 2026-11-01 (`62ab084d-4021-43cb-9b4e-f29cf898ce55`) | 1                 |
| Existing `CLAUDE.md` rule not followed: a control built from buttons with a role instead of the native input, e.g. radio buttons as `<button role="radio">`                                                          | 2026-11-01 (`62ab084d-4021-43cb-9b4e-f29cf898ce55`) | 1                 |
| Existing `raise-pr` rule not followed: a PR description's Details longer than a reviewer needs                                                                                                                       | 2026-11-01 (`62ab084d-4021-43cb-9b4e-f29cf898ce55`) | 1                 |
| Existing `run-retro` step 4 not followed: a drafted rule that names the incident's details rather than the principle, e.g. calling out `playwright test --list`                                                      | 2026-11-07 (`88a05b01-be7c-4a65-ac1b-d9248524d962`) | 1                 |
| Existing `run-retro` step 4 not followed: a drafted rule that doesn't say what it leaves out, so it could be read too widely, e.g. "do a real run" read as "run the E2E games more"                                  | 2026-11-07 (`88a05b01-be7c-4a65-ac1b-d9248524d962`) | 1                 |
| A new page built to the letter of the issue but thinner than the sites around it, e.g. a Storybook Introduction of three bare links, before it took nav-styled links, its purpose and guides to writing stories      | 2026-11-07 (`ccb4c7f3-a1e1-4575-b60f-6422de8669fe`) | 0                 |
| A PR that changes a tool with visible output, such as the screenshot script, without an example of that output in its description                                                                                    | 2026-11-07 (`ccb4c7f3-a1e1-4575-b60f-6422de8669fe`) | 0                 |
| Existing `raise-pr` rule not followed: a screenshot left out of a PR as impossible to take, without suggesting an issue to make it possible                                                                          | 2026-11-07 (`ccb4c7f3-a1e1-4575-b60f-6422de8669fe`) | 0                 |

## Retro log

One row per retro, to see whether the changes each retro makes are trending
towards zero. Issues filed for ideas count as changes.

| Date       | Session                                                                           | Points raised                       | Changes made                                                                           |
| :--------- | --------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| 2026-11-01 | `27975623-bfa0-4649-bdb7-f8f38c162130`                                            | 9, plus 2 in the retro of the retro | 11 rule or script changes and 3 issues, before the stricter bar in step 3              |
| 2026-11-02 | `78153c9b-91d4-4efd-88e4-65a59adc3dd6`                                            | 2                                   | 1 rule change in `CLAUDE.md`                                                           |
| 2026-11-07 | `62ab084d-4021-43cb-9b4e-f29cf898ce55` and `88a05b01-be7c-4a65-ac1b-d9248524d962` | 2, plus 2 in the retro of the retro | 1 rule change in `CLAUDE.md`; none from the retro of the retro                         |
| 2026-11-07 | `ccb4c7f3-a1e1-4575-b60f-6422de8669fe`                                            | 3                                   | 1 CI check, 1 script and skill, 1 rule in `run-retro`; 1 issue (#403) filed on request |
