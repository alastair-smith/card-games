type ListenerCountProvider = () => Record<string, number>;

/**
 * Next compiles `instrumentation.ts` as a separate entry from the app and route
 * layers, so a module imported by both is instantiated once per layer and the
 * copies share no state. Listeners only ever accumulate on the app layer's
 * emitter, so the telemetry layer reaches it through the global symbol
 * registry — the one place both layers genuinely share.
 */
const PROVIDER_KEY = Symbol.for('card-games.listener-count-provider');

const globalRegistry = globalThis as typeof globalThis & {
  [key: symbol]: ListenerCountProvider | undefined;
};

export function setListenerCountProvider(provider: ListenerCountProvider) {
  globalRegistry[PROVIDER_KEY] = provider;
}

export function clearListenerCountProvider() {
  globalRegistry[PROVIDER_KEY] = undefined;
}

/** Empty until the app layer has loaded the emitter, which is a valid state. */
export function readListenerCounts(): Record<string, number> {
  return globalRegistry[PROVIDER_KEY]?.() ?? {};
}
