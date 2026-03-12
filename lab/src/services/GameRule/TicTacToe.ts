import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

import { type Result, err, ok } from "~shared/utils/Result";

import type { CreateGameContext, GameRule, MoveError } from "./GameRule";

export type TicTacToeState = {
  board: ("X" | "O" | null)[][];
  currentPlayer: "X" | "O";
  currentPlayerId: string;
  playerXId: string | null;
  playerOId: string | null;
  winner?: "X" | "O" | "Draw" | null;
};

const moveSchema = Type.Object({
  row: Type.Number({ minimum: 0, maximum: 2 }),
  col: Type.Number({ minimum: 0, maximum: 2 }),
});

export class TicTacToe implements GameRule<TicTacToeState> {
  setup(ctx: CreateGameContext): Promise<TicTacToeState> {
    const initialState: TicTacToeState = {
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      currentPlayer: "X",
      currentPlayerId: ctx.createdBy,
      playerXId: ctx.createdBy,
      playerOId: null,
    };
    return Promise.resolve(initialState);
  }
  async move(
    state: TicTacToeState,
    playerId: string,
    ctx: Record<string, unknown>
  ): Promise<Result<TicTacToeState, MoveError>> {
    if (state.currentPlayerId !== playerId) {
      return err("Not your turn");
    }
    if (!Value.Check(moveSchema, ctx)) {
      return err("Invalid move format");
    }
    const { row, col } = ctx;
    if (state.board[row][col] !== null) {
      return err("Cell already occupied");
    }

    state.board[row][col] = state.currentPlayer;

    //檢查勝利條件
    const checkWin = (player: "X" | "O"): boolean => {
      // 檢查行和列
      for (let i = 0; i < 3; i++) {
        if (
          (state.board[i][0] === player &&
            state.board[i][1] === player &&
            state.board[i][2] === player) ||
          (state.board[0][i] === player &&
            state.board[1][i] === player &&
            state.board[2][i] === player)
        ) {
          return true;
        }
      }
      // 檢查對角線
      if (
        (state.board[0][0] === player &&
          state.board[1][1] === player &&
          state.board[2][2] === player) ||
        (state.board[0][2] === player &&
          state.board[1][1] === player &&
          state.board[2][0] === player)
      ) {
        return true;
      }
      return false;
    };
    if (checkWin(state.currentPlayer)) {
      state.winner = state.currentPlayer;
    }
    // 檢查平局
    else if (state.board.every((row) => row.every((cell) => cell !== null))) {
      state.winner = "Draw";
    } else {
      // 切換玩家
      state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
      state.currentPlayerId =
        state.currentPlayer === "X" ? state.playerXId! : state.playerOId!;
    }

    return ok(state);
  }
}
