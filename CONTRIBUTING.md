# Contributing to POZI STUDIO

Thank you for your interest in contributing to POZI STUDIO! This document provides guidelines and instructions for contributing to the project.

---

## Development Setup

### Prerequisites

- Node.js 22+ and pnpm 10+
- MySQL 8+ or TiDB Cloud account
- Manus platform account
- Git and GitHub account

### Local Development

1. Fork the repository on GitHub
2. Clone your fork locally
3. Install dependencies: `pnpm install`
4. Set up environment variables (provided by Manus platform)
5. Initialize database: `pnpm db:push`
6. Start dev server: `pnpm dev`

---

## Development Workflow

### 1. Database Changes

When adding or modifying database tables:

```bash
# 1. Edit drizzle/schema.ts
# 2. Generate and apply migrations
pnpm db:push

# 3. Add query helpers in server/db.ts
# 4. Export types from schema.ts
```

### 2. Backend API

When creating new API endpoints:

```typescript
// 1. Create router file: server/routers/feature.ts
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const featureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // Implementation
  }),
  
  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
});

// 2. Register in server/routers.ts
import { featureRouter } from "./routers/feature";

export const appRouter = router({
  feature: featureRouter,
  // ...
});
```

### 3. Frontend Components

When building UI components:

```typescript
// 1. Create component in client/src/components/ or client/src/pages/
// 2. Use tRPC hooks for data fetching
import { trpc } from "@/lib/trpc";

function MyComponent() {
  const { data, isLoading } = trpc.feature.list.useQuery();
  const createMutation = trpc.feature.create.useMutation();
  
  // Implementation
}

// 3. Use shadcn/ui components for consistency
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

### 4. Testing

Write tests for backend procedures:

```typescript
// server/feature.test.ts
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("feature.list", () => {
  it("returns items for authenticated user", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.feature.list();
    expect(result).toHaveLength(0);
  });
});
```

Run tests:
```bash
pnpm test
```

---

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types - use proper typing
- Use Zod for runtime validation

### React

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused and small
- Use `useCallback` and `useMemo` appropriately

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `LearningPathsList`)
- **Functions**: camelCase (e.g., `createLearningPath`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TITLE_LENGTH`)
- **Database tables**: snake_case (e.g., `learning_paths`)

### Formatting

Run Prettier before committing:
```bash
pnpm format
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(creator): add drag-and-drop module reordering

Implement drag-and-drop functionality for reordering modules
within learning paths using @dnd-kit/sortable.

Closes #42
```

```
fix(auth): resolve session cookie expiration issue

Session cookies were expiring too quickly due to incorrect
maxAge calculation. Updated to use proper timestamp.
```

---

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Follow code style guidelines
   - Write tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   pnpm check      # TypeScript type checking
   pnpm test       # Run tests
   pnpm dev        # Manual testing
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear description of changes
   - Reference related issues
   - Add screenshots for UI changes
   - Request review from maintainers

---

## Code Review

### For Contributors

- Be responsive to feedback
- Make requested changes promptly
- Keep discussions focused and professional
- Ask questions if feedback is unclear

### For Reviewers

- Be constructive and respectful
- Explain reasoning behind suggestions
- Approve when changes meet standards
- Merge when all checks pass

---

## Documentation

### When to Update Docs

- Adding new API endpoints → Update `docs/API.md`
- Changing database schema → Update `docs/technical_architecture.md`
- Adding new features → Update `README.md` and `docs/implementation_plan.md`
- Fixing bugs → Update `CHANGELOG.md`

### Documentation Style

- Use clear, concise language
- Provide code examples
- Include screenshots for UI features
- Keep formatting consistent

---

## Project Structure Guidelines

### File Organization

```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── pages/              # Page-level components
│   ├── creator/        # Creator dashboard pages
│   └── ...
├── lib/                # Utilities and helpers
├── hooks/              # Custom React hooks
└── contexts/           # React contexts

server/
├── _core/              # Framework code (don't modify)
├── routers/            # tRPC routers by feature
├── db.ts               # Database query helpers
└── routers.ts          # Main router registry
```

### Component Guidelines

- One component per file
- Co-locate styles with components (use Tailwind)
- Export types alongside components
- Use barrel exports (index.ts) for folders

---

## Performance Best Practices

### Frontend

- Use React.memo() for expensive components
- Implement virtualization for long lists
- Lazy load routes and heavy components
- Optimize images (use WebP, proper sizing)

### Backend

- Add database indexes for frequent queries
- Use connection pooling
- Implement caching where appropriate
- Batch database operations

### Database

- Use proper indexes (see schema.ts)
- Avoid N+1 queries
- Use transactions for multi-step operations
- Monitor query performance

---

## Security Guidelines

- Never commit secrets or API keys
- Validate all user input with Zod
- Use parameterized queries (Drizzle handles this)
- Implement proper authorization checks
- Sanitize HTML output
- Use HTTPS in production

---

## Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers
- Follow WCAG 2.1 Level AA guidelines

---

## Getting Help

- **Documentation**: Check `docs/` folder first
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server (link TBD)

---

## License

By contributing to POZI STUDIO, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to POZI STUDIO! 🎉
