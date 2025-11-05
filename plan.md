# Plan: Create High-Resolution Card Game Images

The goal is to generate high-quality, non-pixelated images for both square (250x250) and Open Graph (1200x630) formats, and to create a more flexible `PlayingCard` component.

## 1. Enhance `PlayingCard` Component

File to modify: `apps/web/src/components/ui/playing-card/playing-card.tsx`

### Task 1.1: Decouple Design from Size

-   **Introduce `design` Prop:** Add a new optional `design` prop to `PlayingCard` and `PlayingCardFace`. It will accept two values: `'default'` (the default) and `'simple'`.
-   **Update Content Logic:** In `PlayingCardFace`, the logic that hides the central card content (pips and pictures) will be changed from being based on `size` to being based on `design`. Content will be hidden if `design === 'simple'`.

### Task 1.2: Introduce a new `'lg'` size variant.

This variant will be proportional to the default card size, scaled up by a factor of 2.5 to provide the necessary resolution for the large OG image. This will involve:

-   **Defining New Constants:** Add new constants for the large dimensions.
    -   `LG_CARD_WIDTH`: `w-[21.25rem]`
    -   `LG_CARD_HEIGHT`: `h-[30rem]`
    -   `LG_FONT_SIZE`: `text-[5.625rem]`
    -   `LG_RANK_FACE_SYMBOL_SIZE`: `'3.4375rem'`
    -   `LG_SUIT_SYMBOL_HEIGHT`: `h-20`

-   **Applying New Sizes and Logic:** The component will be updated to use these new constants when `size === 'lg'`.

## 2. Update Image Generation Story

File to modify: `apps/web/src/images/games.stories.tsx`

### Task: Use the new card sizes and designs to generate final images.

-   **Refactor for Image Variants:** The story will be updated to generate two images for each game scene.
    -   **Square Image (250x250):** This will use `<PlayingCard size="sm" design="default" />`. The small cards will show their full detail (pips/pictures).
    -   **OG Image (1200x630):** This will use the new `<PlayingCard size="lg" design="default" />`.

## 3. Refactor Existing Codebase

### Task: Preserve existing UI for small cards.

-   **Search:** I will search the entire codebase for all instances of `<PlayingCard size="sm" />`.
-   **Update:** Each instance found will be updated to `<PlayingCard size="sm" design="simple" />` to ensure the UI remains unchanged in other parts of the application.

This plan will deliver the required high-resolution images and result in a more robust and flexible `PlayingCard` component.