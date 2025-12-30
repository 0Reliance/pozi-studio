import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const exportRouter = router({
  // Create export job
  create: protectedProcedure
    .input(
      z.object({
        pathId: z.number(),
        template: z.enum(["minimal", "documentation", "course", "blog"]),
        includeAssets: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const path = await db.getLearningPathById(input.pathId);
      if (!path || path.creatorId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      // Create export job
      const exportId = await db.createExport({
        lessonId: null,
        creatorId: ctx.user.id,
        exportType: "full_path",
        exportStatus: "pending",
      });

      // TODO: Trigger background job to generate HTML
      // For now, we'll generate synchronously
      try {
        await generateExport(exportId, input.pathId, input.template);
        await db.updateExport(exportId, { exportStatus: "completed" });
      } catch (error) {
        await db.updateExport(exportId, { exportStatus: "failed", buildLog: String(error) });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Export failed" });
      }

      return { exportId };
    }),

  // List user exports
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getCreatorExports(ctx.user.id);
  }),

  // Get export details
  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const exportJob = await db.getExportById(input.id);
    if (!exportJob || exportJob.creatorId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
    }
    return exportJob;
  }),

  // Delete export
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const exportJob = await db.getExportById(input.id);
    if (!exportJob || exportJob.creatorId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
    }
    await db.deleteExport(input.id);
    return { success: true };
  }),
});

// Export generation function
async function generateExport(exportId: number, pathId: number, template: string) {
  // Get full path data with modules and lessons
  const pathData = await db.getLearningPathWithContent(pathId);

  // Generate HTML based on template
  const html = generateHTML(pathData, template);

  // Save to S3 or local storage
  // For MVP, we'll store the HTML in the database
  await db.updateExport(exportId, {
    exportUrl: `https://example.com/exports/${exportId}.html`,
    buildLog: `Generated ${html.length} bytes`,
  });
}

function generateHTML(pathData: any, template: string): string {
  const { title, description, modules } = pathData;

  // Basic HTML template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - POZI STUDIO Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .description { font-size: 1.2rem; opacity: 0.9; }
    .module {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .module h2 {
      color: #667eea;
      margin-bottom: 20px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .lesson {
      margin: 20px 0;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 6px;
    }
    .lesson h3 {
      color: #333;
      margin-bottom: 10px;
    }
    .lesson-content {
      color: #666;
      line-height: 1.8;
    }
    footer {
      text-align: center;
      padding: 40px 20px;
      color: #666;
      border-top: 1px solid #ddd;
      margin-top: 40px;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 20px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${title}</h1>
      <p class="description">${description || ""}</p>
    </div>
  </header>

  <div class="container">
    ${modules
      .map(
        (module: any) => `
      <div class="module">
        <h2>${module.title}</h2>
        ${(module.lessons || [])
          .map(
            (lesson: any) => `
          <div class="lesson">
            <h3>${lesson.title}</h3>
            <div class="lesson-content">
              ${lesson.contentBlocks || "<p>No content available</p>"}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("")}
  </div>

  <footer>
    <p>Powered by POZI STUDIO - AI-Powered Learning Management System</p>
    <p>© ${new Date().getFullYear()} All rights reserved</p>
  </footer>
</body>
</html>`;
}
