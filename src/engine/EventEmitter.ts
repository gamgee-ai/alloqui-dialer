type Listener<T> = (data: T) => void;

export class EventEmitter<TEventMap extends { [K in keyof TEventMap]: TEventMap[K] }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<keyof TEventMap, Set<Listener<any>>>();

  on<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): void {
    this.listeners.get(event)?.delete(listener);
  }

  protected emit<K extends keyof TEventMap>(
    event: K,
    ...args: TEventMap[K] extends undefined ? [] : [TEventMap[K]]
  ): void {
    this.listeners.get(event)?.forEach((listener) => {
      try { listener(args[0]); } catch (err) { console.error('[Alloqui] listener error:', event, err); }
    });
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}
