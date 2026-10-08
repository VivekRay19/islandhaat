type Handler<T> = (payload: T) => void;

/** Small typed event emitter used to decouple state, rendering and UI. */
export class Emitter<Events extends object> {
  private map = new Map<keyof Events, Set<Handler<never>>>();

  on<K extends keyof Events>(key: K, handler: Handler<Events[K]>): () => void {
    let set = this.map.get(key);
    if (!set) {
      set = new Set();
      this.map.set(key, set);
    }
    set.add(handler as Handler<never>);
    return () => set!.delete(handler as Handler<never>);
  }

  emit<K extends keyof Events>(key: K, payload: Events[K]): void {
    const set = this.map.get(key);
    if (!set) return;
    for (const h of set) (h as Handler<Events[K]>)(payload);
  }
}
