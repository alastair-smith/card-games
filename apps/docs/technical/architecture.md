# Architecture

## High level

![High-level architecture: browser, tRPC routers, state, data, server events and Redis](../diagrams/architecture/high-level.svg)

## Auth

![Auth flow: the proxy issues or renews a JWT cookie on each request](../diagrams/flows/auth.svg)

## Data

## Events

![Event flow: a mutation stores state in Redis, emits an event and each subscription sends the update over SSE](../diagrams/architecture/events.svg)
