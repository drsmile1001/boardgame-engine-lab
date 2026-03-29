import { t } from "elysia";

export const sessionSchema = t.Object(
  {
    id: t.String(),
    playerId: t.String(),
    createdAt: t.Number(),
    expiresAt: t.Number(),
  },
  {
    title: "登入 Session",
  }
);

export type Session = typeof sessionSchema.static;
