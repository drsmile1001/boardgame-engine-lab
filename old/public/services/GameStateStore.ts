import { eventHub } from "./EventHub";

export interface GameState {
  counter: number;
}

export class GameStateStore {
  private state: GameState = { counter: 0 };

  getState() {
    return this.state;
  }

  update(partial: Partial<GameState>) {
    this.state = { ...this.state, ...partial };
    eventHub.emit("state:update", this.state);
  }
}

export const gameStateStore = new GameStateStore();
