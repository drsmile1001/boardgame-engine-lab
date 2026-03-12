import type { ServerWebSocket } from "elysia/ws/bun";

import type { TopicMap } from "@backend/schemas/TopicMap";

export interface WebsocketRouter {
  publish<T extends keyof TopicMap>(topic: T, data: TopicMap[T]): void;
  subscribe<T extends keyof TopicMap>(
    topic: T,
    handler: (data: TopicMap[T]) => void
  ): {
    unsubscribe: () => void;
  };

  unsubscribeByTopic<T extends keyof TopicMap>(topic: T): void;
  unsubscribeAll(): void;
  unsubscribeByHandler(handler: (data: TopicMap[keyof TopicMap]) => void): void;

  connectWebSocket(sessionId: string, ws: ServerWebSocket): void;
  disconnectWebSocket(sessionId: string): void;
  connectTopic<T extends keyof TopicMap>(sessionId: string, topic: T): void;
  disconnectTopic<T extends keyof TopicMap>(sessionId: string, topic: T): void;
}
