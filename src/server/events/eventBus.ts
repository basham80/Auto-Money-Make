import { SystemEventPayload } from '../../types/omega.ts';
import { db } from '../db.ts';

type EventHandler = (event: SystemEventPayload) => void | Promise<void>;

export class SystemEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private maxHistory = 200;

  public subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);

    return () => {
      const list = this.handlers.get(eventType) || [];
      this.handlers.set(eventType, list.filter(h => h !== handler));
    };
  }

  public subscribeAll(handler: EventHandler): () => void {
    return this.subscribe('*', handler);
  }

  public emit(event: Omit<SystemEventPayload, 'eventId' | 'timestamp'> & { eventId?: string; timestamp?: number }): SystemEventPayload {
    const fullEvent: SystemEventPayload = {
      eventId: event.eventId || `EVT-BUS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: event.timestamp || Date.now(),
      type: event.type,
      source: event.source,
      truthClass: event.truthClass,
      summary: event.summary,
      metadata: event.metadata || {}
    };

    // Store in canonical db audit
    db.logAudit('INFO', fullEvent.source, `[${fullEvent.type}] ${fullEvent.summary}`, fullEvent.metadata);

    // Trigger specific type listeners
    const specific = this.handlers.get(fullEvent.type) || [];
    specific.forEach(h => {
      try {
        h(fullEvent);
      } catch (err) {
        console.error(`[EventBus] Error in handler for ${fullEvent.type}:`, err);
      }
    });

    // Trigger wildcard listeners
    const wildcard = this.handlers.get('*') || [];
    wildcard.forEach(h => {
      try {
        h(fullEvent);
      } catch (err) {
        console.error(`[EventBus] Error in wildcard handler:`, err);
      }
    });

    return fullEvent;
  }
}

export const eventBus = new SystemEventBus();
