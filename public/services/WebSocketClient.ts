import { eventHub } from "./EventHub";

export class WebSocketClient {
  private ws: WebSocket | null = null;

  connect() {
    this.ws = new WebSocket(`ws://${window.location.host}/ws`, "protocol-one");
    this.ws.onopen = () => eventHub.emit("ws:open");
    this.ws.onclose = () => eventHub.emit("ws:close");

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      eventHub.emit("ws:message", data);
    };
  }

  send(action: string, payload: any = {}) {
    this.ws?.send(JSON.stringify({ action, ...payload }));
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}

export const wsClient = new WebSocketClient();
