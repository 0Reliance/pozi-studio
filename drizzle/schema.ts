import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["guest", "learner", "creator", "admin"]).default("learner").notNull(),
  avatarUrl: text("avatarUrl"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Learning Paths - Top-level content container
 */
export const learningPaths = mysqlTable("learning_paths", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  heroImageUrl: text("heroImageUrl"),
  difficultyLevel: mysqlEnum("difficultyLevel", ["beginner", "intermediate", "advanced", "mixed"]).default("beginner"),
  estimatedHours: decimal("estimatedHours", { precision: 5, scale: 2 }),
  tags: json("tags").$type<string[]>().default([]),
  isPublished: boolean("isPublished").default(false).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  gatingStrategy: mysqlEnum("gatingStrategy", ["none", "signup_required", "partial_free"]).default("none").notNull(),
  freeLessonCount: int("freeLessonCount").default(0),
  viewCount: int("viewCount").default(0).notNull(),
  enrollmentCount: int("enrollmentCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  titleIdx: index("title_idx").on(table.title),
  slugIdx: index("slug_idx").on(table.slug),
  creatorIdx: index("creator_idx").on(table.creatorId),
  publishedIdx: index("published_idx").on(table.isPublished),
}));

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;

/**
 * Modules - Groups of lessons within a path
 */
export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  pathId: int("pathId").notNull().references(() => learningPaths.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: int("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  pathOrderIdx: index("path_order_idx").on(table.pathId, table.orderIndex),
}));

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

/**
 * Content Block Types for Lessons
 */
export type ContentBlock = 
  | { id: string; type: "text"; order: number; content: { html: string } }
  | { id: string; type: "code"; order: number; content: { code: string; language: string } }
  | { id: string; type: "video"; order: number; content: { youtubeUrl: string; title?: string } }
  | { id: string; type: "image"; order: number; content: { url: string; alt?: string; caption?: string } }
  | { id: string; type: "lab_recipe"; order: number; content: { title: string; steps: string[]; notes?: string } }
  | { id: string; type: "resource_card"; order: number; content: { title: string; description: string; url: string; icon?: string } }
  | { id: string; type: "quiz_placeholder"; order: number; content: { title: string } }
  | { id: string; type: "ai_chat_placeholder"; order: number; content: { title: string } };

/**
 * Lessons - Individual learning units
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull().references(() => modules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  contentBlocks: json("contentBlocks").$type<ContentBlock[]>().default([]),
  orderIndex: int("orderIndex").notNull().default(0),
  estimatedMinutes: int("estimatedMinutes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  moduleOrderIdx: index("module_order_idx").on(table.moduleId, table.orderIndex),
}));

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Enrollments - User enrollment in learning paths
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  pathId: int("pathId").notNull().references(() => learningPaths.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
}, (table) => ({
  userPathIdx: index("user_path_idx").on(table.userId, table.pathId),
}));

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Progress - Lesson completion tracking
 */
export const progress = mysqlTable("progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: int("lessonId").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  completionPercentage: int("completionPercentage").default(0).notNull(),
  timeSpentSeconds: int("timeSpentSeconds").default(0).notNull(),
  lastPosition: json("lastPosition").$type<{ scrollPosition?: number; videoTimestamp?: number }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userLessonIdx: index("user_lesson_idx").on(table.userId, table.lessonId),
}));

export type Progress = typeof progress.$inferSelect;
export type InsertProgress = typeof progress.$inferInsert;

/**
 * Notes - User notes on lessons
 */
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: int("lessonId").references(() => lessons.id, { onDelete: "cascade" }),
  noteType: mysqlEnum("noteType", ["insight", "todo", "question", "code_snippet"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  lessonIdx: index("lesson_idx").on(table.lessonId),
}));

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

/**
 * Bookmarks - User bookmarks for content
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookmarkType: mysqlEnum("bookmarkType", ["lesson", "module", "path", "creator"]).notNull(),
  targetId: int("targetId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userTypeIdx: index("user_type_idx").on(table.userId, table.bookmarkType),
}));

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;

/**
 * Video Analyses - AI-powered video intelligence
 */
export const videoAnalyses = mysqlTable("video_analyses", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  youtubeUrl: varchar("youtubeUrl", { length: 500 }).notNull().unique(),
  youtubeVideoId: varchar("youtubeVideoId", { length: 50 }).notNull(),
  videoTitle: varchar("videoTitle", { length: 500 }),
  videoDurationSeconds: int("videoDurationSeconds"),
  transcript: text("transcript"),
  chapters: json("chapters").$type<Array<{ title: string; startTime: number; endTime: number; summary: string }>>(),
  commands: json("commands").$type<Array<{ command: string; description: string; timestamp?: number }>>(),
  concepts: json("concepts").$type<Array<{ concept: string; description: string; relevanceScore: number }>>(),
  difficultySuggestion: mysqlEnum("difficultySuggestion", ["beginner", "intermediate", "advanced", "mixed"]),
  tagsSuggestion: json("tagsSuggestion").$type<string[]>(),
  analysisStatus: mysqlEnum("analysisStatus", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  aiProviderUsed: varchar("aiProviderUsed", { length: 50 }),
  processingCost: decimal("processingCost", { precision: 10, scale: 4 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  creatorIdx: index("creator_idx").on(table.creatorId),
  statusIdx: index("status_idx").on(table.analysisStatus),
}));

export type VideoAnalysis = typeof videoAnalyses.$inferSelect;
export type InsertVideoAnalysis = typeof videoAnalyses.$inferInsert;

/**
 * Media Library - Uploaded assets
 */
export const mediaLibrary = mysqlTable("media_library", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["image", "video", "audio", "document"]).notNull(),
  fileSizeBytes: int("fileSizeBytes").notNull(),
  storageUrl: text("storageUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  altText: text("altText"),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  creatorIdx: index("creator_idx").on(table.creatorId),
  typeIdx: index("type_idx").on(table.fileType),
}));

export type Media = typeof mediaLibrary.$inferSelect;
export type InsertMedia = typeof mediaLibrary.$inferInsert;

/**
 * Exports - HTML export jobs
 */
export const exports = mysqlTable("exports", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").references(() => lessons.id, { onDelete: "cascade" }),
  creatorId: int("creatorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  exportType: mysqlEnum("exportType", ["single_lesson", "full_module", "full_path"]).notNull(),
  exportUrl: text("exportUrl"),
  exportStatus: mysqlEnum("exportStatus", ["pending", "building", "completed", "failed"]).default("pending").notNull(),
  buildLog: text("buildLog"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  creatorIdx: index("creator_idx").on(table.creatorId),
  statusIdx: index("status_idx").on(table.exportStatus),
}));

export type Export = typeof exports.$inferSelect;
export type InsertExport = typeof exports.$inferInsert;

/**
 * AI Usage Logs - Track AI operations and costs
 */
export const aiUsageLogs = mysqlTable("ai_usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  provider: mysqlEnum("provider", ["gemini", "openrouter", "huggingface", "openimage", "elevenlabs"]).notNull(),
  operationType: varchar("operationType", { length: 100 }).notNull(),
  inputTokens: int("inputTokens"),
  outputTokens: int("outputTokens"),
  costUsd: decimal("costUsd", { precision: 10, scale: 6 }),
  responseTimeMs: int("responseTimeMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  providerIdx: index("provider_idx").on(table.provider),
  createdIdx: index("created_idx").on(table.createdAt),
}));

export type AIUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAIUsageLog = typeof aiUsageLogs.$inferInsert;

/**
 * Platform Analytics - Daily aggregated stats
 */
export const platformAnalytics = mysqlTable("platform_analytics", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  totalUsers: int("totalUsers").default(0).notNull(),
  activeUsers: int("activeUsers").default(0).notNull(),
  newEnrollments: int("newEnrollments").default(0).notNull(),
  lessonsCompleted: int("lessonsCompleted").default(0).notNull(),
  aiOperationsCount: int("aiOperationsCount").default(0).notNull(),
  aiCostTotal: decimal("aiCostTotal", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("date_idx").on(table.date),
}));

export type PlatformAnalytic = typeof platformAnalytics.$inferSelect;
export type InsertPlatformAnalytic = typeof platformAnalytics.$inferInsert;

/**
 * Relations for Drizzle ORM
 */
export const usersRelations = relations(users, ({ many }) => ({
  learningPaths: many(learningPaths),
  enrollments: many(enrollments),
  progress: many(progress),
  notes: many(notes),
  bookmarks: many(bookmarks),
  videoAnalyses: many(videoAnalyses),
  mediaLibrary: many(mediaLibrary),
  exports: many(exports),
}));

export const learningPathsRelations = relations(learningPaths, ({ one, many }) => ({
  creator: one(users, {
    fields: [learningPaths.creatorId],
    references: [users.id],
  }),
  modules: many(modules),
  enrollments: many(enrollments),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  path: one(learningPaths, {
    fields: [modules.pathId],
    references: [learningPaths.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progress: many(progress),
  notes: many(notes),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  path: one(learningPaths, {
    fields: [enrollments.pathId],
    references: [learningPaths.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [notes.lessonId],
    references: [lessons.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

export const videoAnalysesRelations = relations(videoAnalyses, ({ one }) => ({
  creator: one(users, {
    fields: [videoAnalyses.creatorId],
    references: [users.id],
  }),
}));

export const mediaLibraryRelations = relations(mediaLibrary, ({ one }) => ({
  creator: one(users, {
    fields: [mediaLibrary.creatorId],
    references: [users.id],
  }),
}));

export const exportsRelations = relations(exports, ({ one }) => ({
  creator: one(users, {
    fields: [exports.creatorId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [exports.lessonId],
    references: [lessons.id],
  }),
}));
