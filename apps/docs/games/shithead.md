# Shithead

Get rid of all your cards. The game ends when only one player still has cards.

## Game flow

![Shithead game flow: deal, swap cards, then each turn plays from hand, face-up or face-down cards or picks up the discard pile, draws back up, goes again after a burn, and the game ends when only one player still has cards](../diagrams/flows/shithead-game.light.svg)

## Setup

Shithead is for 2 to 5 players and uses one 52-card deck with no jokers. Each
player is dealt:

- 3 cards face down
- 3 cards face up, on top of the face-down cards
- 3 cards in their hand

One card goes on the discard pile as part of the deal, and the rest form the
deck. That card counts as played.

## Swapping

Before the first turn, all players swap at the same time. A player can switch
any of their hand cards with any of their face-up cards, and can swap back and
forth as often as they like. Everyone can see each other's face-up cards, which
update live as players swap. There's no summary of the swaps that took place.

Each player confirms when they're done, whether or not they swapped anything.
Once confirmed, they're locked in. The game starts when everyone has confirmed.

## Turns

The host goes first. Turns then go clockwise, which is through the player list
in order, looping back to the host.

On their turn a player plays one or more cards of the same rank onto the discard
pile. If they have a valid play they must make it.

A card is valid if it matches or beats the rank to beat, unless a magic card
says otherwise. With a 6 of hearts on the discard pile and a 3 of clubs, a 6 of
diamonds and a King of spades in hand, the player can play the 6 or the King, but
not the 3.

If the discard pile is empty, any card can be played.

### Rank order

From lowest to highest: 2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, King, Ace.

The hand sorts by this order. Magic cards stay in their usual positions, with a
symbol or colour to mark them out.

### Drawing

After playing, a player draws from the deck until they have 3 cards in hand, so
playing more cards means drawing more. Once the deck is empty, nobody draws and
hands can drop below 3 cards.

When the deck empties, 🫥 emoji rain down automatically.

### Picking up

A player who can't play picks up the entire discard pile into their hand. The
next player then plays onto an empty pile, so they can play any card.

## Magic cards

| Rank | Can be played               | Effect                                                                      |
| :--- | :-------------------------- | :-------------------------------------------------------------------------- |
| 2    | On any card                 | Resets the rank to 2, so the next player can play any card                  |
| 5    | On any card                 | Invisible: the next player looks at the card underneath to see what to beat |
| 7    | Where a 7 is normally valid | The next card must be a 7 or lower                                          |
| 10   | On any card                 | Burns the discard pile                                                      |

The 5's invisibility stacks, so with several 5s in a row the next player looks
at the first card below them. A 5 on an empty pile leaves the pile with nothing
to beat, so any card can be played.

A 5 also carries a 7's effect through to the next player. The 7's effect
otherwise lasts for one card: with a 4 of clubs on the discard pile, player 1
plays a 7 of hearts, player 2 plays a 3 of diamonds, and player 3 can then play
an 8 of spades.

### On the deal

If the card dealt onto the discard pile is a magic card, its magic applies:

- **2 or 5:** the first player can play any card
- **7:** the first player must play a 7 or lower
- **10:** the discard pile burns, leaving it empty, so the first player can play
  any card

## Burning

A burn takes every card in the discard pile out of the game. It's triggered by:

- Playing a 10
- Four cards of the same rank in a row, across any number of plays and players

5s don't break a run of four. If player 1 plays a Queen of hearts, player 2
plays a 5 of diamonds and player 3 plays the other three Queens, the pile burns.
Four 2s, four 5s and four 7s all burn too. The card dealt onto the discard pile
counts towards a run.

The player who burnt the pile draws back up to 3 cards if the deck has any left,
then plays again and can play any card, drawing again afterwards. If that player
is now out of the game, the next player can play any card instead.

## Playing out your cards

A player plays from one source at a time, in this order, and can't mix sources
in a single play:

1. **Hand**: while they have any cards in hand
2. **Face up**: once their hand is empty
3. **Face down**: once their hand and face-up cards are all gone

Picking up puts cards back in the player's hand, so they have to play those
before going back to their face-up or face-down cards.

### Face-up cards

Several face-up cards of the same rank can be played together.

If none of them can be played, the player still chooses one, or several of the
same rank, and those cards go into their hand along with the discard pile.

### Face-down cards

The player chooses one face-down card and turns it over without knowing what it
is. Only one can be turned over per play. If it can't be played, it goes into
their hand along with the discard pile.

## Finishing

A player is out when they have no cards left in their hand, face up or face
down. Their hand in the play area is replaced with their finishing position:
1st 🥇, 2nd 🥈, 3rd 🥉 or 4th.

When only one player still has cards, the game ends and the play area is
replaced by an end screen. It shows the finishing order, including 5th for the
last player in a 5-player game, and congratulates the winner. It has a button to
share the results and a button to play another game, which links to the home
page for now.

## Settings

Shithead has no settings. These rules may become settings later:

- Letting a player pick up the discard pile when they could play
- Turning off having to play a face-up card that can't be played
