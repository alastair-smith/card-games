# Retro watch list

Patterns a retro saw once and chose to watch rather than write a rule for.
Each retro checks for them; see step 1 of `SKILL.md`.

| Pattern | Seen in sessions | Retros without it |
|:-|-|-|
| Drafting a fix that uses a tool (e.g. an MCP server) from its docs, without first trying the repo's existing tools against the running app or Storybook | 2026-10-24 (`33e329b7-8ea0-43d8-9b15-591f3a825fd7`) | 2 |
| Building a fix around an assumed cause or limitation (why something is slow, what an API can't do) without first testing it with a small experiment under the same conditions, e.g. a frame load queue for slowness that was really Vite's dev server | 2026-10-25 (`fa43661c-b9c7-42ea-b39f-bdad52e9aa35`) | 1 |
| Adding a story for an edge case another story already covers, e.g. a game story for stickers on every tag when the player strip's story already shows it | 2026-10-30 (`4d3d8f54-0392-416a-9118-7e8c83d1dfde`) | 0 |
| Committing without checking that staging worked, so a commit goes out half done, e.g. `git add` failing on a path already removed with `git rm` while the commit went ahead | 2026-10-30 (`4d3d8f54-0392-416a-9118-7e8c83d1dfde`) | 0 |
| Going a long stretch on a build without a one-line progress update | 2026-10-30 (`4d3d8f54-0392-416a-9118-7e8c83d1dfde`) | 0 |
