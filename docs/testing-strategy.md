# Testing Strategy

This document describes the five-tier testing strategy for the card games platform. Each tier has a distinct scope, tooling, and trigger — together they give fast feedback on PRs without sacrificing confidence in the deployed system.

## Overview

| Tier | Name | Tooling | What it tests | When it runs |
|------|------|---------|---------------|--------------|
| 1 | Unit tests | Vitest + jsdom | Individual functions and components in isolation | PR CI |
| 3 | Backend integration tests | Vitest + Redis | Server-side game logic against a real Redis instance | PR CI |
| 4 | Smoke tests | Playwright | Core happy path against the deployed environment | Post-deployment |
| 5 | Full game simulation | Playwright | Complete Yaniv game played to completion | PR CI |

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
- Three browser contexts join the same Yaniv lobby
- Each context takes turns playing cards, picking up from the deck, or calling Yaniv
- A greedy strategy is used: call Yaniv whenever eligible (hand ≤ 7), otherwise play one card and draw from the deck
- The simulation continues until one player reaches the elimination threshold
- Assertions cover: lobby with all players visible, game start, round summaries between rounds, game-over screen with final standings

**Run locally:**
```bash
# Requires Redis running locally
pnpm --filter @repo/web test:e2e

# Open Playwright UI panel for interactive debugging
pnpm --filter @repo/web test:e2e:ui

# Run with full traces saved (view with: pnpm exec playwright show-report)
pnpm --filter @repo/web test:e2e:trace
```

**CI job:** `ui-tests` — runs on every PR with a Redis instance provided by the CI environment.
