# Testing Strategy

This document describes the five-tier testing strategy for the card games platform. Each tier has a distinct scope, tooling, and trigger — together they give fast feedback on PRs without sacrificing confidence in the deployed system.

## Overview

| Tier | Name | Tooling | What it tests | When it runs |
|------|------|---------|---------------|--------------|
| 1 | Unit tests | Vitest + jsdom | Individual functions and components in isolation | PR CI |
| 2 | UI flow tests | Playwright + MSW | Client-side game flows with a mocked backend | PR CI |
| 3 | Backend integration tests | Vitest + Redis | Server-side game logic against a real Redis instance | PR CI |
| 4 | Smoke tests | Playwright | Core happy path against the deployed environment | Post-deployment |
| 5 | Full game simulation | Playwright | Complete Yaniv game played to completion | Daily cron |

---

## Tier 1 — Unit Tests

**Purpose:** Verify individual units of logic and UI in complete isolation. These are the fastest tests and run on every PR.

**Tooling:** Vitest, jsdom, @testing-library/react, @testing-library/jest-dom

**Scope:**
- Game state functions (`play-cards`, `pickup-card`, `call-yaniv`, etc.)
- UI components (hand, controls, scorecard, round summary, etc.)
- Utility functions (card validation, scoring, sorting)

**What they don't cover:** Interactions between components, real Redis state, network calls, or multi-step flows.

**Run locally:**
```bash
pnpm --filter @repo/web test -- run src/path/to/file.test.tsx
pnpm test  # full suite
```

**CI job:** `test` — runs on every PR.

---

## Tier 2 — UI Flow Tests

**Purpose:** Verify client-side game flows end to end from the user's perspective, without needing a real backend or Redis. These tests assert that the right UI states appear in response to realistic game scenarios.

**Tooling:** Playwright, MSW (v2)

**How it works:** MSW runs as a service worker in the browser and intercepts all tRPC HTTP requests (mutations and SSE subscriptions). Each test sets up a specific scenario — e.g. "it's your turn and you have a valid set in hand" — and asserts the UI responds correctly.

**Example scenarios:**
- Joining a lobby: entering a name and game code → seeing the lobby waiting screen
- Launching a game: host starts the game → game board appears with dealt cards
- Playing a card: selecting a card and confirming → discard pile updates, turn passes
- Picking up from discard: selecting a card from the discard pile → it appears in hand
- Calling Yaniv: clicking the Yaniv button → round summary screen appears
- Viewing round summary: scores displayed correctly before next round begins
- Game over: final scores shown after a player is eliminated

**What they don't cover:** Real backend correctness, Redis state, or actual card shuffling/distribution.

**Run locally:**
```bash
# Next.js dev server must be running with MSW enabled
pnpm dev
pnpm --filter @repo/web playwright test
```

**CI job:** `ui-flow-tests` — runs on every PR.

---

## Tier 3 — Backend Integration Tests

**Purpose:** Verify server-side game logic against a real Redis instance. These tests rig up specific state in Redis and assert that the state functions produce the correct output and side effects.

**Tooling:** Vitest, ioredis, real Redis

**How it works:** Each test uses a unique game code to isolate state, calls the data layer functions directly against a real Redis instance, and asserts the resulting Redis state and return value.

**Example scenarios:**
- `createDiscard` clears any pre-existing pile for the game code
- `pushDiscard` / `popDiscard` maintains LIFO ordering
- `drainDiscard` returns all cards top-first and clears the key
- `createDeck` / `drawCard` maintains FIFO ordering
- `deckExists` / `discardExists` reflect accurate presence after mutations

**What they don't cover:** UI, network layer, tRPC procedure logic, or higher-level game state functions.

**Run locally:**
```bash
# Requires Redis running (same as dev)
pnpm --filter @repo/web test:integration
```

**CI job:** `test-integration` — runs on every PR with a Redis instance provided by the CI environment.

---

## Tier 4 — Smoke Tests

**Purpose:** Confirm the deployed application is functional after a release. These are intentionally minimal — just enough to catch a broken deployment.

**Tooling:** Playwright

**Scope:** Single happy-path walkthrough:
1. Navigate to home page
2. Create a new game
3. Join as a second player (second browser context)
4. Start the game
5. Play one card
6. Assert the discard pile updates

The test exits immediately after confirming the card play succeeded. No further game logic is exercised.

**Run locally:**
```bash
TARGET_URL=https://staging.example.com pnpm --filter @repo/web playwright test:smoke
```

**Trigger:** Post-deployment workflow — not PR CI. Runs against the staging URL after a successful deploy.

---

## Tier 5 — Full Game Simulation

**Purpose:** Validate the complete Yaniv game flow from start to finish, including multi-round scoring, edge cases (assaf, 50-point halving), and the game-over screen. This tier catches regressions that shorter tests miss.

**Tooling:** Playwright (multiple browser contexts to simulate multiple players)

**Scope:**
- Two or more browser contexts join the same game
- Each context takes turns playing cards, picking up, or calling Yaniv
- The simulation continues until one player accumulates enough points to be eliminated
- Assertions cover: round summaries between rounds, score accumulation, game-over screen with final standings

**Why not in PR CI:** Game length is non-deterministic and multi-player orchestration adds meaningful overhead. Running daily on a schedule is more appropriate — it provides a daily regression signal without slowing down PR feedback.

**Run locally:**
```bash
TARGET_URL=https://staging.example.com pnpm --filter @repo/web playwright test:e2e
```

**Trigger:** GitHub Actions scheduled workflow — runs daily against the staging environment, not triggered by PRs.
