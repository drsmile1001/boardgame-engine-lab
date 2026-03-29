import Elysia, { t } from "elysia";
import { ulid } from "ulid";

import {
  SESSION_COOKIE_NAME,
  SESSION_LIFETIME_SECONDS,
} from "@backend/Constants";
import type { AppServices } from "@backend/app/AppServices";
import { buildPlayerProvider } from "@backend/middlewares/buildPlayerProvider";
import { type Player, playerSchema } from "@backend/schemas/Player";
import { type Session } from "@backend/schemas/Session";

export type Deps = Pick<
  AppServices,
  "Logger" | "PlayerRepo" | "PlayerResolver" | "SessionStore"
>;

export function buildPlayerApi(deps: Deps) {
  const { PlayerRepo, SessionStore } = deps;
  return new Elysia({
    name: "PlayerApi",
  })
    .use(buildPlayerProvider(deps))
    .get(
      "/api/self",
      async ({ requester, status }) => {
        if (!requester) {
          return status(401, "UNAUTHORIZED");
        }
        return requester;
      },
      {
        detail: { summary: "取得目前請求者的玩家資訊" },
        response: {
          200: playerSchema,
          401: t.String(),
        },
      }
    )
    .post(
      "/api/register/anonymous",
      async ({ cookie }) => {
        const sessionCookie = cookie[SESSION_COOKIE_NAME];
        const previousSessionId = sessionCookie.value;
        if (previousSessionId && typeof previousSessionId === "string") {
          await SessionStore.remove(previousSessionId);
        }

        const players = await PlayerRepo.list();
        const newPlayer: Player = {
          id: ulid(),
          name: `player#${players.length + 1}`,
          email: null,
        };
        await PlayerRepo.set(newPlayer);

        const now = Date.now();
        const session: Session = {
          id: crypto.randomUUID(),
          playerId: newPlayer.id,
          createdAt: now,
          expiresAt: now + SESSION_LIFETIME_SECONDS * 1000,
        };
        await SessionStore.set(session);

        sessionCookie.httpOnly = true;
        sessionCookie.value = session.id;
        sessionCookie.maxAge = SESSION_LIFETIME_SECONDS;
        sessionCookie.expires = new Date(session.expiresAt);

        return newPlayer;
      },
      {
        detail: { summary: "註冊成匿名玩家" },
        response: {
          200: playerSchema,
        },
      }
    )
    .post(
      "/api/logout",
      async ({ cookie }) => {
        const sessionCookie = cookie[SESSION_COOKIE_NAME];
        const sessionId = sessionCookie.value;
        if (sessionId && typeof sessionId === "string") {
          await SessionStore.remove(sessionId);
        }

        sessionCookie.value = "";
        sessionCookie.maxAge = 0;
        sessionCookie.expires = new Date(0);

        return {
          success: true,
        };
      },
      {
        detail: { summary: "登出目前玩家" },
        response: {
          200: t.Object({
            success: t.Literal(true),
          }),
        },
      }
    );
}

export type PlayerApi = ReturnType<typeof buildPlayerApi>;
