---
name: link-stories
description: Give the user links to Storybook stories, optionally with args set, e.g. a long player name, and find which stories render a component. Use whenever linking the user to a story to check a change.
---

# Link to stories

Both scripts ask Storybook's MCP server over HTTP, so Storybook must be
running (see the `dev-servers` skill), but the session's `storybook` MCP
connection doesn't need to be. They print links to the story in Storybook's
UI (`?path=/story/…`). When a change looks different at smaller and larger
screen sizes, tell the user to switch size with the viewport button in
Storybook's toolbar.

## Find the stories for a component

```bash
./.claude/skills/link-stories/scripts/find-stories.ts --component apps/web/src/components/ui/dialog/index.tsx
```

`--component` repeats. For each component it lists the stories that render
it, with a link to each. The number before each story is how many imports
separate it from the component: 1 imports it directly, 2 or more reach it
through other components. A component no story renders says so; don't guess
an ID for it.

## Link to one story

```bash
./.claude/skills/link-stories/scripts/story-url.ts --story lobby-players--min-players-not-met
```

It checks the story exists, then prints its title and link. Prefer a story
that already shows the case. When none does, pass `--props` and pipe the args
to set as JSON, in a quoted heredoc:

```bash
./.claude/skills/link-stories/scripts/story-url.ts --story lobby-players--min-players-not-met --props <<'EOF'
{"user": {"isReady": true, "name": "A very long player name", "nameError": ""}}
EOF
```

Storybook only reads arg values made of letters, numbers, spaces, underscores
and dashes from a link, and drops anything else. For other values, or args
such as JSX, give the user written steps instead.
