# Lobby

## Joining a game

![Join game flow: create a game, join with a code or from a link, then the subscription decides what the player receives](../diagrams/flows/join-game.light.svg)

## Lifecycle

![Lobby lifecycle: the lobby waits for 2 players, then for everyone to be ready, then the host starts the game; players joining, leaving or becoming not ready move it back a step, and the lobby is deleted when the last player leaves](../diagrams/flows/lobby.light.svg)

Until the game starts, players can change the lobby:

| Who          | Can                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| The host     | Change the [Yaniv settings](./yaniv.md#settings) (Shithead has none), make another player host, remove a player, start the game |
| Every player | Change their name, change their colour if no one else has it, mark themselves ready or not, leave                               |

When the host leaves, the player who has been in the lobby longest becomes host. When the
last player leaves, the lobby is deleted.
