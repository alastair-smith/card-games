# Yaniv

## Game flow

![Yaniv game flow: deal, each turn's steps, calling Yaniv, scoring the round and ending the game](../diagrams/flows/yaniv-game.light.svg)

## Settings

The host picks the settings in the lobby, before the game starts. Other
players see them but can't change them.

| Setting   | Options                            | Default |
| :-------- | :--------------------------------- | :------ |
| Hand size | 5 cards, 7 cards or Winner Chooses | 5 cards |
| Dealer    | Rotates or Hand winner             | Rotates |

### Hand size

How many cards each player is dealt at the start of a round:

- **5 cards** or **7 cards**: every round is dealt that many
- **Winner Chooses**: someone chooses 1 to 10 cards before each deal. The
  first player chooses for the first round. After that, the first player to
  call Yaniv with the lowest hand chooses, and the dealer deals the size they
  chose. When the hand winner deals, the chooser is always the dealer, so
  they deal straight away

![Winner Chooses flow: the first player chooses the first hand size and deals; after each round the winner chooses, and deals straight away if they're also the dealer, otherwise the next dealer in turn deals the chosen size](../diagrams/flows/yaniv-winner-chooses.light.svg)

### Dealer

Who deals each round after the first. The first player in the lobby always
deals the first round, and the second player goes first.

- **Rotates**: players take turns to deal, in the lobby's order, wrapping
  round. The player after the dealer goes first
- **Hand winner**: the first player to call Yaniv with the lowest hand deals
  and goes first
