import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const learnerRouter = router({
  // Enrollment Management
  enrollments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserEnrollments(ctx.user.id);
    }),

    enroll: protectedProcedure
      .input(z.object({ pathId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.createEnrollment({
          userId: ctx.user.id,
          pathId: input.pathId,
        });
      }),

    unenroll: protectedProcedure
      .input(z.object({ pathId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteEnrollment(ctx.user.id, input.pathId);
      }),
  }),

  // Progress Tracking
  progress: router({
    get: protectedProcedure
      .input(z.object({ pathId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProgressByUserAndPath(ctx.user.id, input.pathId);
      }),

    markComplete: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.markLessonComplete(ctx.user.id, input.lessonId);
      }),

    markIncomplete: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.markLessonIncomplete(ctx.user.id, input.lessonId);
      }),
  }),

  // Notes
  notes: router({
    list: protectedProcedure
      .input(
        z.object({
          lessonId: z.number().optional(),
          type: z.enum(["insight", "todo", "question", "code_snippet"]).optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (input.lessonId) {
          return db.getLessonNotes(ctx.user.id, input.lessonId);
        }
        return db.getUserNotes(ctx.user.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          lessonId: z.number(),
          type: z.enum(["insight", "todo", "question", "code_snippet"]),
          title: z.string(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createNote({
          userId: ctx.user.id,
          lessonId: input.lessonId,
          noteType: input.type,
          title: input.title,
          content: input.content,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.updateNote(input.id, { content: input.content });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteNote(input.id);
      }),
  }),

  // Bookmarks
  bookmarks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBookmarks(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          resourceType: z.enum(["path", "module", "lesson"]),
          resourceId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.createBookmark({
          userId: ctx.user.id,
          bookmarkType: input.resourceType,
          targetId: input.resourceId,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteBookmark(input.id);
      }),
  }),

  // Public Learning Paths
  paths: router({
    listPublic: protectedProcedure.query(async () => {
      return db.getPublishedLearningPaths();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLearningPathWithContent(input.id);
      }),
  }),

  // Lessons
  lessons: router({
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLessonById(input.id);
      }),
  }),
});
