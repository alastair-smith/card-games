import EventEmitter from 'node:events';
import type { z } from 'zod';
import type { gameStateSchema } from '~/server/data/high-card';
import type { lobbySchema } from '~/server/data/lobby';
import type { UserId } from '~/types/entities';
import type { ReactionEmoji } from '~/types/game';
import { logger } from '~/utils/logger';

type Events = {
  [key: `lobby:${string}`]: [z.infer<typeof lobbySchema>];
  [key: `high-card:${string}`]: [z.infer<typeof gameStateSchema>];
  [key: `emoji:${string}`]: [
    { emoji: ReactionEmoji; targetPlayerId: UserId; id: number },
  ];
};

class MonitoredEventEmitter<
  // biome-ignore lint/suspicious/noExplicitAny: specifics set by generic TEvents
  TEvents extends Record<string, any[]>,
> extends EventEmitter {
  public on<TEvent extends keyof TEvents & string>(
    event: TEvent,
    listener: (...args: TEvents[TEvent]) => void,
  ): this {
    // biome-ignore lint/suspicious/noExplicitAny: specifics set by generic TEvents
    super.on(event, listener as (...args: any[]) => void);
    logger.info(
      `Listener added for event: ${event}. Total listeners for this event: ${this.listenerCount(
        event,
      )}`,
    );
    return this;
  }

  public off<TEvent extends keyof TEvents & string>(
    event: TEvent,
    listener: (...args: TEvents[TEvent]) => void,
  ): this {
    // biome-ignore lint/suspicious/noExplicitAny: specifics set by generic TEvents
    super.off(event, listener as (...args: any[]) => void);
    logger.info(
      `Listener removed for event: ${event}. Total listeners for this event: ${this.listenerCount(
        event,
      )}`,
    );
    return this;
  }

  public emit<TEvent extends keyof TEvents & string>(
    event: TEvent,
    ...args: TEvents[TEvent]
  ) {
    return super.emit(event, ...args);
  }

  public getListenerCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of this.eventNames()) {
      counts[event as string] = this.listenerCount(event as string);
    }
    return counts;
  }

  public totalListenerCount(): number {
    return Object.values(this.getListenerCounts()).reduce(
      (acc, count) => acc + count,
      0,
    );
  }
}

const monitoredEmitter = new MonitoredEventEmitter<Events>();

export default monitoredEmitter;
