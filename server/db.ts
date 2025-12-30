import { eq, desc, and, sql, or, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  learningPaths,
  modules,
  lessons,
  enrollments,
  progress,
  notes,
  bookmarks,
  videoAnalyses,
  mediaLibrary,
  exports,
  aiUsageLogs,
  platformAnalytics,
  InsertLearningPath,
  InsertModule,
  InsertLesson,
  InsertEnrollment,
  InsertProgress,
  InsertNote,
  InsertBookmark,
  InsertVideoAnalysis,
  InsertMedia,
  InsertExport,
  InsertAIUsageLog,
  InsertPlatformAnalytic,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.subscriptionTier !== undefined) {
      values.subscriptionTier = user.subscriptionTier;
      updateSet.subscriptionTier = user.subscriptionTier;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: "guest" | "learner" | "creator" | "admin") {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============================================================================
// LEARNING PATHS
// ============================================================================

export async function createLearningPath(path: InsertLearningPath) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(learningPaths).values(path);
  return Number(result.insertId);
}

export async function getLearningPathById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(learningPaths).where(eq(learningPaths.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLearningPathBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(learningPaths).where(eq(learningPaths.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPublishedPaths() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(learningPaths)
    .where(and(eq(learningPaths.isPublished, true), eq(learningPaths.isPublic, true)))
    .orderBy(desc(learningPaths.createdAt));
}

export async function getPathsByCreator(creatorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(learningPaths)
    .where(eq(learningPaths.creatorId, creatorId))
    .orderBy(desc(learningPaths.updatedAt));
}

export async function updateLearningPath(id: number, updates: Partial<InsertLearningPath>) {
  const db = await getDb();
  if (!db) return;

  await db.update(learningPaths).set(updates).where(eq(learningPaths.id, id));
}

export async function deleteLearningPath(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(learningPaths).where(eq(learningPaths.id, id));
}

export async function incrementPathViewCount(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(learningPaths)
    .set({ viewCount: sql`${learningPaths.viewCount} + 1` })
    .where(eq(learningPaths.id, id));
}

export async function incrementPathEnrollmentCount(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(learningPaths)
    .set({ enrollmentCount: sql`${learningPaths.enrollmentCount} + 1` })
    .where(eq(learningPaths.id, id));
}

// ============================================================================
// MODULES
// ============================================================================

export async function createModule(module: InsertModule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(modules).values(module);
  return Number(result.insertId);
}

export async function getModuleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getModulesByPath(pathId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(modules)
    .where(eq(modules.pathId, pathId))
    .orderBy(modules.orderIndex);
}

export async function updateModule(id: number, updates: Partial<InsertModule>) {
  const db = await getDb();
  if (!db) return;

  await db.update(modules).set(updates).where(eq(modules.id, id));
}

export async function deleteModule(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(modules).where(eq(modules.id, id));
}

// ============================================================================
// LESSONS
// ============================================================================

export async function createLesson(lesson: InsertLesson) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(lessons).values(lesson);
  return Number(result.insertId);
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLessonBySlug(moduleId: number, slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(lessons)
    .where(and(eq(lessons.moduleId, moduleId), eq(lessons.slug, slug)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLessonsByModule(moduleId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(lessons)
    .where(eq(lessons.moduleId, moduleId))
    .orderBy(lessons.orderIndex);
}

export async function updateLesson(id: number, updates: Partial<InsertLesson>) {
  const db = await getDb();
  if (!db) return;

  await db.update(lessons).set(updates).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(lessons).where(eq(lessons.id, id));
}

// ============================================================================
// ENROLLMENTS
// ============================================================================

export async function createEnrollment(enrollment: InsertEnrollment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(enrollments).values(enrollment);
  return Number(result.insertId);
}

export async function getEnrollment(userId: number, pathId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.pathId, pathId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserEnrollments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(enrollments)
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.lastAccessedAt));
}

export async function updateEnrollmentAccess(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(enrollments)
    .set({ lastAccessedAt: new Date() })
    .where(eq(enrollments.id, id));
}

export async function deleteEnrollment(userId: number, pathId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.pathId, pathId)));
}

// ============================================================================
// PROGRESS
// ============================================================================

export async function upsertProgress(progressData: InsertProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(progress)
    .where(and(
      eq(progress.userId, progressData.userId),
      eq(progress.lessonId, progressData.lessonId)
    ))
    .limit(1);

  if (existing.length > 0) {
    await db.update(progress)
      .set({ ...progressData, updatedAt: new Date() })
      .where(eq(progress.id, existing[0].id));
    return existing[0].id;
  } else {
    const result: any = await db.insert(progress).values(progressData);
    return Number(result.insertId);
  }
}

export async function getProgress(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(progress)
    .where(eq(progress.userId, userId))
    .orderBy(desc(progress.updatedAt));
}

// ============================================================================
// NOTES
// ============================================================================

export async function createNote(note: InsertNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(notes).values(note);
  return Number(result.insertId);
}

export async function getNoteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserNotes(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));
}

export async function getLessonNotes(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.lessonId, lessonId)))
    .orderBy(desc(notes.createdAt));
}

export async function updateNote(id: number, updates: Partial<InsertNote>) {
  const db = await getDb();
  if (!db) return;

  await db.update(notes).set(updates).where(eq(notes.id, id));
}

export async function deleteNote(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(notes).where(eq(notes.id, id));
}

// ============================================================================
// BOOKMARKS
// ============================================================================

export async function createBookmark(bookmark: InsertBookmark) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(bookmarks).values(bookmark);
  return Number(result.insertId);
}

export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));
}

export async function getBookmark(userId: number, bookmarkType: string, targetId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bookmarks)
    .where(and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.bookmarkType, bookmarkType as any),
      eq(bookmarks.targetId, targetId)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteBookmark(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(bookmarks).where(eq(bookmarks.id, id));
}

// ============================================================================
// VIDEO ANALYSES
// ============================================================================

export async function createVideoAnalysis(analysis: InsertVideoAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(videoAnalyses).values(analysis);
  return Number(result.insertId);
}

export async function getVideoAnalysisById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(videoAnalyses).where(eq(videoAnalyses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getVideoAnalysisByUrl(youtubeUrl: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(videoAnalyses)
    .where(eq(videoAnalyses.youtubeUrl, youtubeUrl))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCreatorVideoAnalyses(creatorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(videoAnalyses)
    .where(eq(videoAnalyses.creatorId, creatorId))
    .orderBy(desc(videoAnalyses.createdAt));
}

export async function updateVideoAnalysis(id: number, updates: Partial<InsertVideoAnalysis>) {
  const db = await getDb();
  if (!db) return;

  await db.update(videoAnalyses).set(updates).where(eq(videoAnalyses.id, id));
}

export async function deleteVideoAnalysis(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(videoAnalyses).where(eq(videoAnalyses.id, id));
}

// ============================================================================
// MEDIA LIBRARY
// ============================================================================

export async function createMedia(media: InsertMedia) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(mediaLibrary).values(media);
  return Number(result.insertId);
}

export async function getMediaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCreatorMedia(creatorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(mediaLibrary)
    .where(eq(mediaLibrary.creatorId, creatorId))
    .orderBy(desc(mediaLibrary.createdAt));
}

export async function updateMedia(id: number, updates: Partial<InsertMedia>) {
  const db = await getDb();
  if (!db) return;

  await db.update(mediaLibrary).set(updates).where(eq(mediaLibrary.id, id));
}

export async function deleteMedia(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
}

// ============================================================================
// EXPORTS
// ============================================================================

export async function createExport(exportData: InsertExport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(exports).values(exportData);
  return Number(result.insertId);
}

export async function getExportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(exports).where(eq(exports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCreatorExports(creatorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(exports)
    .where(eq(exports.creatorId, creatorId))
    .orderBy(desc(exports.createdAt));
}

export async function updateExport(id: number, updates: Partial<InsertExport>) {
  const db = await getDb();
  if (!db) return;

  await db.update(exports).set(updates).where(eq(exports.id, id));
}

export async function deleteExport(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(exports).where(eq(exports.id, id));
}

// ============================================================================
// AI USAGE LOGS
// ============================================================================

export async function logAIUsage(log: InsertAIUsageLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result: any = await db.insert(aiUsageLogs).values(log);
  return Number(result.insertId);
}

export async function getAIUsageLogs(userId?: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [];
  if (userId) conditions.push(eq(aiUsageLogs.userId, userId));
  if (startDate) conditions.push(sql`${aiUsageLogs.createdAt} >= ${startDate}`);
  if (endDate) conditions.push(sql`${aiUsageLogs.createdAt} <= ${endDate}`);

  const query = conditions.length > 0
    ? db.select().from(aiUsageLogs).where(and(...conditions))
    : db.select().from(aiUsageLogs);

  return await query.orderBy(desc(aiUsageLogs.createdAt));
}

export async function getAIUsageStats(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return { totalCost: 0, totalOperations: 0 };

  let conditions = [];
  if (startDate) conditions.push(sql`${aiUsageLogs.createdAt} >= ${startDate}`);
  if (endDate) conditions.push(sql`${aiUsageLogs.createdAt} <= ${endDate}`);

  const query = conditions.length > 0
    ? db.select({
        totalCost: sql<number>`SUM(${aiUsageLogs.costUsd})`,
        totalOperations: sql<number>`COUNT(*)`,
      }).from(aiUsageLogs).where(and(...conditions))
    : db.select({
        totalCost: sql<number>`SUM(${aiUsageLogs.costUsd})`,
        totalOperations: sql<number>`COUNT(*)`,
      }).from(aiUsageLogs);

  const result = await query;
  return result[0] || { totalCost: 0, totalOperations: 0 };
}

// ============================================================================
// PLATFORM ANALYTICS
// ============================================================================

export async function upsertPlatformAnalytics(analytics: InsertPlatformAnalytic) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(platformAnalytics)
    .where(eq(platformAnalytics.date, analytics.date))
    .limit(1);

  if (existing.length > 0) {
    await db.update(platformAnalytics)
      .set(analytics)
      .where(eq(platformAnalytics.id, existing[0].id));
    return existing[0].id;
  } else {
    const result: any = await db.insert(platformAnalytics).values(analytics);
    return Number(result.insertId);
  }
}

export async function getPlatformAnalytics(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [];
  if (startDate) conditions.push(sql`${platformAnalytics.date} >= ${startDate}`);
  if (endDate) conditions.push(sql`${platformAnalytics.date} <= ${endDate}`);

  const query = conditions.length > 0
    ? db.select().from(platformAnalytics).where(and(...conditions))
    : db.select().from(platformAnalytics);

  return await query.orderBy(desc(platformAnalytics.date));
}


// ============================================================================
// REORDERING HELPERS
// ============================================================================

export async function reorderModules(moduleOrders: Array<{ id: number; orderIndex: number }>) {
  const db = await getDb();
  if (!db) return;

  // Update each module's order index
  for (const { id, orderIndex } of moduleOrders) {
    await db.update(modules)
      .set({ orderIndex })
      .where(eq(modules.id, id));
  }
}

export async function reorderLessons(lessonOrders: Array<{ id: number; orderIndex: number }>) {
  const db = await getDb();
  if (!db) return;

  // Update each lesson's order index
  for (const { id, orderIndex } of lessonOrders) {
    await db.update(lessons)
      .set({ orderIndex })
      .where(eq(lessons.id, id));
  }
}


// ============================================================================
// LEARNER FUNCTIONS
// ============================================================================

// Progress
export async function getProgressByUserAndPath(userId: number, pathId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all lessons in the path with progress
  const result = await db
    .select({
      lesson: lessons,
      progress: progress,
      module: modules,
    })
    .from(lessons)
    .leftJoin(progress, and(eq(progress.lessonId, lessons.id), eq(progress.userId, userId)))
    .leftJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(modules.pathId, pathId));

  return result;
}

export async function markLessonComplete(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Upsert progress
  await db
    .insert(progress)
    .values({
      userId,
      lessonId,
      status: "completed",
      completionPercentage: 100,
    })
    .onDuplicateKeyUpdate({
      set: {
        status: "completed",
        completionPercentage: 100,
      },
    });
}

export async function markLessonIncomplete(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(progress)
    .set({ status: "not_started", completionPercentage: 0 })
    .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));
}

// Notes - Use existing functions: getUserNotes, getLessonNotes, createNote, updateNote, deleteNote

// Bookmarks
// Use existing bookmark functions: getUserBookmarks, createBookmark, deleteBookmark

// Public Learning Paths
export async function getPublishedLearningPaths() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.isPublished, true))
    .orderBy(desc(learningPaths.createdAt));
}

export async function getLearningPathWithContent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const path = await db.select().from(learningPaths).where(eq(learningPaths.id, id)).limit(1);

  if (path.length === 0) {
    throw new Error("Learning path not found");
  }

  const pathModules = await db
    .select()
    .from(modules)
    .where(eq(modules.pathId, id))
    .orderBy(modules.orderIndex);

  const modulesWithLessons = await Promise.all(
    pathModules.map(async (module) => {
      const moduleLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.moduleId, module.id))
        .orderBy(lessons.orderIndex);

      return {
        ...module,
        lessons: moduleLessons,
      };
    })
  );

  return {
    ...path[0],
    modules: modulesWithLessons,
  };
}

