export type EventPayload = Record<string, any>;

type Listener = (payload: EventPayload) => void;

export class EventHub {
  private listeners: Map<string, Set<Listener>> = new Map();

  emit(event: string, payload: EventPayload = {}) {
    const set = this.listeners.get(event);
    if (!set) return;

    for (const handler of set) handler(payload);
  }

  on(event: string, handler: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  off(event: string, handler: Listener) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(handler);
  }
}

export const eventHub = new EventHub();
