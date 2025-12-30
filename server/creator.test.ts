import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCreatorContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "creator-test-user",
    email: "creator@example.com",
    name: "Test Creator",
    loginMethod: "manus",
    role: "creator",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Creator Dashboard - Learning Paths", () => {
  it("should create a new learning path", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.creator.paths.create({
      title: "Test Docker Course",
      slug: "test-docker-course",
      description: "A comprehensive Docker course",
      difficulty: "beginner",
    });

    expect(result).toHaveProperty("id");
    expect(result.title).toBe("Test Docker Course");
    expect(result.slug).toBe("test-docker-course");
    expect(result.difficultyLevel).toBe("beginner");
  });

  it("should list creator's learning paths", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create a path first
    await caller.creator.paths.create({
      title: "Test Path",
      slug: "test-path",
      description: "Test description",
      difficulty: "intermediate",
    });

    const paths = await caller.creator.paths.list();

    expect(Array.isArray(paths)).toBe(true);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0]).toHaveProperty("title");
    expect(paths[0]).toHaveProperty("slug");
  });

  it("should get a specific learning path with modules and lessons", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create a path
    const path = await caller.creator.paths.create({
      title: "Test Path with Modules",
      slug: "test-path-modules",
      description: "Test",
      difficulty: "advanced",
    });

    // Get the path
    const fetchedPath = await caller.creator.paths.get({ id: path.id });

    expect(fetchedPath).toBeDefined();
    expect(fetchedPath.id).toBe(path.id);
    expect(fetchedPath.title).toBe("Test Path with Modules");
  });

  it("should update learning path details", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create a path
    const path = await caller.creator.paths.create({
      title: "Original Title",
      slug: "original-slug",
      description: "Original description",
      difficulty: "beginner",
    });

    // Update the path
    await caller.creator.paths.update({
      id: path.id,
      title: "Updated Title",
      description: "Updated description",
      difficulty: "intermediate",
    });

    // Verify update
    const updated = await caller.creator.paths.get({ id: path.id });
    expect(updated.title).toBe("Updated Title");
    expect(updated.description).toBe("Updated description");
    expect(updated.difficultyLevel).toBe("intermediate");
  });

  it("should publish a learning path", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create a path
    const path = await caller.creator.paths.create({
      title: "Path to Publish",
      slug: "path-to-publish",
      description: "Test",
      difficulty: "beginner",
    });

    // Publish the path
    await caller.creator.paths.publish({
      id: path.id,
      isPublished: true,
      isPublic: true,
      gatingStrategy: "none",
    });

    // Verify publication
    const published = await caller.creator.paths.get({ id: path.id });
    expect(published.isPublished).toBe(true);
    expect(published.isPublic).toBe(true);
    expect(published.gatingStrategy).toBe("none");
  });

  it("should delete a learning path", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create a path
    const path = await caller.creator.paths.create({
      title: "Path to Delete",
      slug: "path-to-delete",
      description: "Test",
      difficulty: "beginner",
    });

    // Delete the path
    await caller.creator.paths.delete({ id: path.id });

    // Verify deletion - should throw error
    await expect(caller.creator.paths.get({ id: path.id })).rejects.toThrow();
  });
});

describe("Creator Dashboard - Modules", () => {
  it("should create a module within a learning path", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create a path first
    const path = await caller.creator.paths.create({
      title: "Path for Modules",
      slug: "path-for-modules",
      description: "Test",
      difficulty: "beginner",
    });

    // Create a module
    const module = await caller.creator.modules.create({
      pathId: path.id,
      title: "Introduction Module",
      slug: "introduction-module",
      description: "Getting started",
    });

    expect(module).toHaveProperty("id");
    expect(module.title).toBe("Introduction Module");
    expect(module.slug).toBe("introduction-module");
    expect(module.pathId).toBe(path.id);
  });

  it("should update module details", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create path and module
    const path = await caller.creator.paths.create({
      title: "Test Path",
      slug: "test-path",
      description: "Test",
      difficulty: "beginner",
    });

    const module = await caller.creator.modules.create({
      pathId: path.id,
      title: "Original Module",
      slug: "original-module",
      description: "Original",
    });

    // Update module
    await caller.creator.modules.update({
      id: module.id,
      title: "Updated Module",
      description: "Updated description",
    });

    // Verify update
    const updated = await caller.creator.modules.get({ id: module.id });
    expect(updated.title).toBe("Updated Module");
    expect(updated.description).toBe("Updated description");
  });

  it("should delete a module", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create path and module
    const path = await caller.creator.paths.create({
      title: "Test Path",
      slug: "test-path",
      description: "Test",
      difficulty: "beginner",
    });

    const module = await caller.creator.modules.create({
      pathId: path.id,
      title: "Module to Delete",
      slug: "module-to-delete",
      description: "Test",
    });

    // Delete module
    await caller.creator.modules.delete({ id: module.id });

    // Verify deletion
    await expect(caller.creator.modules.get({ id: module.id })).rejects.toThrow();
  });
});

describe("Creator Dashboard - Lessons", () => {
  it("should create a lesson within a module", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create path and module
    const path = await caller.creator.paths.create({
      title: "Test Path",
      slug: "test-path",
      description: "Test",
      difficulty: "beginner",
    });

    const module = await caller.creator.modules.create({
      pathId: path.id,
      title: "Test Module",
      slug: "test-module",
      description: "Test",
    });

    // Create lesson
    const lesson = await caller.creator.lessons.create({
      moduleId: module.id,
      title: "Introduction Lesson",
      slug: "introduction-lesson",
    });

    expect(lesson).toHaveProperty("id");
    expect(lesson.title).toBe("Introduction Lesson");
    expect(lesson.slug).toBe("introduction-lesson");
    expect(lesson.moduleId).toBe(module.id);
  });

  it("should update lesson content", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create path, module, and lesson
    const path = await caller.creator.paths.create({
      title: "Test Path",
      slug: "test-path",
      description: "Test",
      difficulty: "beginner",
    });

    const module = await caller.creator.modules.create({
      pathId: path.id,
      title: "Test Module",
      slug: "test-module",
      description: "Test",
    });

    const lesson = await caller.creator.lessons.create({
      moduleId: module.id,
      title: "Test Lesson",
      slug: "test-lesson",
    });

    // Update lesson with content
    const contentBlocks = [
      {
        id: "block-1",
        type: "text" as const,
        order: 0,
        content: {
          html: "<h1>Welcome to Docker</h1><p>This is an introduction to Docker.</p>",
        },
      },
    ];

    await caller.creator.lessons.update({
      id: lesson.id,
      title: "Updated Lesson",
      estimatedMinutes: 15,
      contentBlocks,
    });

    // Verify update
    const updated = await caller.creator.lessons.get({ id: lesson.id });
    expect(updated.title).toBe("Updated Lesson");
    expect(updated.estimatedMinutes).toBe(15);
    expect(updated.contentBlocks).toBeDefined();
  });

  it("should autosave lesson content", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create path, module, and lesson
    const path = await caller.creator.paths.create({
      title: "Test Path",
      slug: "test-path",
      description: "Test",
      difficulty: "beginner",
    });

    const module = await caller.creator.modules.create({
      pathId: path.id,
      title: "Test Module",
      slug: "test-module",
      description: "Test",
    });

    const lesson = await caller.creator.lessons.create({
      moduleId: module.id,
      title: "Test Lesson",
      slug: "test-lesson",
    });

    // Autosave content
    const contentBlocks = [
      {
        id: "block-1",
        type: "text" as const,
        order: 0,
        content: {
          html: "<p>Autosaved content</p>",
        },
      },
    ];

    await caller.creator.lessons.autosave({
      id: lesson.id,
      contentBlocks,
    });

    // Verify autosave
    const updated = await caller.creator.lessons.get({ id: lesson.id });
    expect(updated.contentBlocks).toBeDefined();
  });

  it("should delete a lesson", async () => {
    const { ctx } = createCreatorContext();
    const caller = appRouter.createCaller(ctx);

    // Create path, module, and lesson
    const path = await caller.creator.paths.create({
      title: "Test Path",
      slug: "test-path",
      description: "Test",
      difficulty: "beginner",
    });

    const module = await caller.creator.modules.create({
      pathId: path.id,
      title: "Test Module",
      slug: "test-module",
      description: "Test",
    });

    const lesson = await caller.creator.lessons.create({
      moduleId: module.id,
      title: "Lesson to Delete",
      slug: "lesson-to-delete",
    });

    // Delete lesson
    await caller.creator.lessons.delete({ id: lesson.id });

    // Verify deletion
    await expect(caller.creator.lessons.get({ id: lesson.id })).rejects.toThrow();
  });
});
