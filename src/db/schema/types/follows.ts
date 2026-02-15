import { follows } from "../follows";

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
