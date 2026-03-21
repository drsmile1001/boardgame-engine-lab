import type { Result } from "~shared/utils/Result";

export type GameState = Record<string, unknown>;
export type MoveError = string;
export type CreateGameContext = {
  createdBy: string;
};

export interface GameRule<TGameState extends GameState = GameState> {
  setup(ctx: CreateGameContext): Promise<TGameState>;
  move(
    state: TGameState,
    playerId: string,
    ctx: Record<string, unknown>
  ): Promise<Result<GameState, MoveError>>;
}
