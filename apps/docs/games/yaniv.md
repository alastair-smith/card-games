# Yaniv

## Game flow

![Yaniv game flow: deal, each turn's steps, calling Yaniv, scoring the round and ending the game](../diagrams/flows/yaniv-game.light.svg)

## Dealer

The first player in the lobby deals the first round, and the second player
goes first. After that, the host's dealer setting decides who deals:

- **Rotates** (the default): the deal passes to the next player in the
  lobby's order, wrapping round, and the player after the dealer goes first
- **Hand winner**: the first player to call Yaniv with the lowest hand deals
  and goes first

## Winner Chooses

With the Winner Chooses hand size, someone chooses the hand size before each
deal. The first player chooses for the first round. After that, the first
player to call Yaniv with the lowest hand chooses, and the dealer deals the
size they chose. When the hand winner deals, the chooser is always the dealer,
so they deal straight away.

![Winner Chooses flow: the first player chooses the first hand size and deals; after each round the winner chooses, and deals straight away if they're also the dealer, otherwise the next dealer in turn deals the chosen size](../diagrams/flows/yaniv-winner-chooses.light.svg)
