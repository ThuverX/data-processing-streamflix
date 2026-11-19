import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

export const userRole = pgEnum("user_roles", ["CONTENT_MANAGER", "USER"]);

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar().notNull().unique(),
  password: varchar().notNull(),
  role: userRole().notNull().default("USER"),
  is_verified: boolean().notNull().default(false),
});

export const esrbRating = pgEnum("esrb_ratings", [
  "EARLY_CHILDHOOD",
  "EVERYONE",
  "EVERYONE_10_PLUS",
  "TEEN",
  "MATURE",
  "ADULTS_ONLY",
  "RATING_PENDING",
]);

export const profiles = pgTable("profiles", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar().notNull(),
  avatar_url: varchar(),
  age_category: esrbRating().notNull().default("EVERYONE"),
  prefers_films: boolean().notNull().default(false),
  minimum_age_rating: esrbRating().notNull().default("EVERYONE"),
  maximum_age_rating: esrbRating().notNull().default("ADULTS_ONLY"),
  user_id: uuid()
    .notNull()
    .references(() => users.id),
});

export const genre = pgTable("genres", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar().notNull(),
});

export const contentType = pgEnum("content_types", ["FILM", "SERIES"]);

export const quality = pgEnum("quality", ["SD", "HD", "UHD"]);

export const content = pgTable("content", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar().notNull(),
  description: varchar(),
  content_type: contentType().notNull(),
  esrb_rating: esrbRating().notNull().default("EVERYONE"),
  created_at: timestamp().notNull().defaultNow(),
  deleted_at: timestamp(),
});

export const contentQuality = pgTable("content_quality", {
  content_id: uuid()
    .notNull()
    .references(() => content.id),
  quality: quality().notNull(),
  url: varchar().notNull(),
});

export const episodes = pgTable("episodes", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar().notNull(),
  description: varchar(),
  content_id: uuid()
    .notNull()
    .references(() => content.id),
  episode_number: integer().notNull().default(1),
  season_number: varchar().notNull().default("1"),
});

export const relations = defineRelations(
  { users, profiles, genre, content, episodes, contentQuality },
  (r) => ({
    profiles: {
      users: r.one.users({
        from: r.profiles.user_id,
        to: r.users.id,
      }),
    },
    content: {
      genres: r.many.genre({
        from: r.content.id,
        to: r.genre.id,
      }),
    },
    episodes: {
      content: r.one.content({
        from: r.episodes.content_id,
        to: r.content.id,
      }),
    },
    contentQuality: {
      content: r.one.content({
        from: r.contentQuality.content_id,
        to: r.content.id,
      }),
    },
  }),
);
