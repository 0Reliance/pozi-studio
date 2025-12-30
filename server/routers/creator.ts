import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

// Input validation schemas
const createPathSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  estimatedHours: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().optional(),
});

const updatePathSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  estimatedHours: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().optional(),
});

const publishPathSchema = z.object({
  id: z.number(),
  isPublished: z.boolean(),
  isPublic: z.boolean().optional(),
  gatingStrategy: z.string().optional(),
  freeLessonCount: z.number().optional(),
});

const createModuleSchema = z.object({
  pathId: z.number(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().optional(),
  orderIndex: z.number().int().nonnegative(),
});

const updateModuleSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
});

const reorderModulesSchema = z.object({
  pathId: z.number(),
  moduleOrders: z.array(z.object({
    id: z.number(),
    orderIndex: z.number().int().nonnegative(),
  })),
});

const createLessonSchema = z.object({
  moduleId: z.number(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  contentBlocks: z.any(), // JSON content from TipTap
  orderIndex: z.number().int().nonnegative(),
  estimatedMinutes: z.number().positive().optional(),
});

const updateLessonSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  contentBlocks: z.any().optional(),
  estimatedMinutes: z.number().positive().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
});

const autosaveLessonSchema = z.object({
  id: z.number(),
  contentBlocks: z.any(),
});

const reorderLessonsSchema = z.object({
  moduleId: z.number(),
  lessonOrders: z.array(z.object({
    id: z.number(),
    orderIndex: z.number().int().nonnegative(),
  })),
});

export const creatorRouter = router({
  // Learning Paths
  paths: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        // Only show paths created by this user
        const paths = await db.getPathsByCreator(ctx.user.id);
        return paths;
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const path = await db.getLearningPathById(input.id);
        
        if (!path) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Learning path not found" });
        }
        
        // Check ownership
        if (path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to access this path" });
        }
        
        // Get modules with lessons
        const modules = await db.getModulesByPath(input.id);
        
        return { ...path, modules };
      }),

    create: protectedProcedure
      .input(createPathSchema)
      .mutation(async ({ ctx, input }) => {
        const pathId = await db.createLearningPath({
          ...input,
          creatorId: ctx.user.id,
          isPublished: false,
          isPublic: false,
        });
        
        return { id: pathId };
      }),

    update: protectedProcedure
      .input(updatePathSchema)
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // Verify ownership
        const path = await db.getLearningPathById(id);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.updateLearningPath(id, updates);
        
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const path = await db.getLearningPathById(input.id);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.deleteLearningPath(input.id);
        
        return { success: true };
      }),

    publish: protectedProcedure
      .input(publishPathSchema)
      .mutation(async ({ ctx, input }) => {
        const { id, gatingStrategy, ...settings } = input;
        
        // Verify ownership
        const path = await db.getLearningPathById(id);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // Map string to enum type
        const updates: any = { ...settings };
        if (gatingStrategy) {
          if (gatingStrategy === "none" || gatingStrategy === "signupRequired" || gatingStrategy === "partialFree") {
            updates.gatingStrategy = gatingStrategy === "signupRequired" ? "signup_required" : gatingStrategy === "partialFree" ? "partial_free" : "none";
          }
        }
        
        await db.updateLearningPath(id, updates);
        
        return { success: true };
      }),

    duplicate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const path = await db.getLearningPathById(input.id);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // TODO: Implement full duplication with modules and lessons
        const newPathId = await db.createLearningPath({
          ...path,
          title: `${path.title} (Copy)`,
          slug: `${path.slug}-copy-${Date.now()}`,
          creatorId: ctx.user.id,
          isPublished: false,
        });
        
        return { id: newPathId };
      }),
  }),

  // Modules
  modules: router({
    list: protectedProcedure
      .input(z.object({ pathId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify path ownership
        const path = await db.getLearningPathById(input.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const modules = await db.getModulesByPath(input.pathId);
        return modules;
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const module = await db.getModuleById(input.id);
        
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        // Verify path ownership
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const lessons = await db.getLessonsByModule(input.id);
        
        return { ...module, lessons };
      }),

    create: protectedProcedure
      .input(createModuleSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify path ownership
        const path = await db.getLearningPathById(input.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const moduleId = await db.createModule(input);
        
        return { id: moduleId };
      }),

    update: protectedProcedure
      .input(updateModuleSchema)
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // Verify ownership through path
        const module = await db.getModuleById(id);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.updateModule(id, updates);
        
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const module = await db.getModuleById(input.id);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.deleteModule(input.id);
        
        return { success: true };
      }),

    reorder: protectedProcedure
      .input(reorderModulesSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify path ownership
        const path = await db.getLearningPathById(input.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.reorderModules(input.moduleOrders);
        
        return { success: true };
      }),
  }),

  // Lessons
  lessons: router({
    list: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify ownership through module -> path
        const module = await db.getModuleById(input.moduleId);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const lessons = await db.getLessonsByModule(input.moduleId);
        return lessons;
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const lesson = await db.getLessonById(input.id);
        
        if (!lesson) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        // Verify ownership through module -> path
        const module = await db.getModuleById(lesson.moduleId);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return lesson;
      }),

    create: protectedProcedure
      .input(createLessonSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const module = await db.getModuleById(input.moduleId);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const lessonId = await db.createLesson(input);
        
        return { id: lessonId };
      }),

    update: protectedProcedure
      .input(updateLessonSchema)
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // Verify ownership
        const lesson = await db.getLessonById(id);
        if (!lesson) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const module = await db.getModuleById(lesson.moduleId);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.updateLesson(id, updates);
        
        return { success: true };
      }),

    autosave: protectedProcedure
      .input(autosaveLessonSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const lesson = await db.getLessonById(input.id);
        if (!lesson) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const module = await db.getModuleById(lesson.moduleId);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.updateLesson(input.id, { contentBlocks: input.contentBlocks });
        
        return { success: true, timestamp: Date.now() };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const lesson = await db.getLessonById(input.id);
        if (!lesson) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const module = await db.getModuleById(lesson.moduleId);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.deleteLesson(input.id);
        
        return { success: true };
      }),

    reorder: protectedProcedure
      .input(reorderLessonsSchema)
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const module = await db.getModuleById(input.moduleId);
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const path = await db.getLearningPathById(module.pathId);
        if (!path || path.creatorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.reorderLessons(input.lessonOrders);
        
        return { success: true };
      }),
  }),
});
