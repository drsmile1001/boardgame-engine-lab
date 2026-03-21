import { t } from "elysia";

const gameTopicPayloadsSchema = t.Union([
  t.Object({
    type: t.Literal("GAME_START"),
  }),
  t.Object({
    type: t.Literal("GAME_END"),
  }),
]);

export type GameTopicPayloads = typeof gameTopicPayloadsSchema.static;

const topicMapSchema = t.Record(
  t.TemplateLiteral("game/${string}"),
  gameTopicPayloadsSchema
);

export type TopicMap = typeof topicMapSchema.static;
