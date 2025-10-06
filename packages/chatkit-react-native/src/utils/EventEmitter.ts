export type Listener<T extends any[] = any[]> = (...args: T) => void;

export class EventEmitter {
  private listeners = new Map<string, Set<Listener>>();

  on<T extends any[]>(event: string, listener: Listener<T>) {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener as Listener);
    this.listeners.set(event, set);
    return this;
  }

  off<T extends any[]>(event: string, listener: Listener<T>) {
    const set = this.listeners.get(event);
    if (!set) return this;
    set.delete(listener as Listener);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
    return this;
  }

  once<T extends any[]>(event: string, listener: Listener<T>) {
    const wrapper: Listener<T> = ((...args: T) => {
      this.off(event, wrapper);
      listener(...args);
    }) as Listener<T>;
    return this.on(event, wrapper);
  }

  emit<T extends any[]>(event: string, ...args: T) {
    const set = this.listeners.get(event);
    if (!set) return false;
    for (const listener of Array.from(set)) {
      listener(...args);
    }
    return true;
  }

  removeAllListeners(event?: string) {
    if (typeof event === 'string') {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
