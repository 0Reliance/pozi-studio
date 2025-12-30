# POZI STUDIO API Documentation

This document provides a complete reference for the tRPC API endpoints available in POZI STUDIO.

---

## Authentication

All `protectedProcedure` endpoints require authentication via Manus OAuth. The current user is automatically injected into the procedure context as `ctx.user`.

**User Object Structure:**
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "guest" | "learner" | "creator" | "admin";
  avatarUrl: string | null;
  subscriptionTier: "free" | "pro";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

---

## Creator API

All creator endpoints are under the `trpc.creator.*` namespace and require authentication. Ownership validation is performed automatically.

### Learning Paths

#### `creator.paths.list()`

Get all learning paths created by the current user.

**Returns:**
```typescript
Array<{
  id: number;
  creatorId: number;
  title: string;
  slug: string;
  description: string | null;
  heroImageUrl: string | null;
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "mixed";
  estimatedHours: string | null;
  tags: string[];
  isPublished: boolean;
  isPublic: boolean;
  gatingStrategy: "none" | "signup_required" | "partial_free";
  freeLessonCount: number;
  viewCount: number;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

---

#### `creator.paths.get({ id })`

Get a specific learning path with its modules.

**Input:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{
  ...LearningPath,
  modules: Array<Module>
}
```

**Errors:**
- `NOT_FOUND` - Path doesn't exist
- `FORBIDDEN` - User doesn't own this path

---

#### `creator.paths.create(input)`

Create a new learning path.

**Input:**
```typescript
{
  title: string;           // 1-200 characters
  slug: string;            // 1-200 characters, unique
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedHours?: string; // Decimal string, e.g., "10.5"
  tags?: string[];
  thumbnailUrl?: string;   // Valid URL
}
```

**Returns:**
```typescript
{
  id: number;
}
```

---

#### `creator.paths.update(input)`

Update an existing learning path.

**Input:**
```typescript
{
  id: number;
  title?: string;
  slug?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedHours?: string;
  tags?: string[];
  thumbnailUrl?: string;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `FORBIDDEN` - User doesn't own this path

---

#### `creator.paths.delete({ id })`

Delete a learning path and all its modules/lessons.

**Input:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `FORBIDDEN` - User doesn't own this path

---

#### `creator.paths.publish(input)`

Update publishing settings for a learning path.

**Input:**
```typescript
{
  id: number;
  isPublished: boolean;
  isPublic?: boolean;
  gatingStrategy?: "none" | "signupRequired" | "partialFree";
  freeLessonCount?: number;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `FORBIDDEN` - User doesn't own this path

---

#### `creator.paths.duplicate({ id })`

Duplicate a learning path (currently duplicates path only, not modules/lessons).

**Input:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{
  id: number; // ID of the new duplicated path
}
```

**Errors:**
- `FORBIDDEN` - User doesn't own this path

---

### Modules

#### `creator.modules.list({ pathId })`

Get all modules for a learning path.

**Input:**
```typescript
{
  pathId: number;
}
```

**Returns:**
```typescript
Array<{
  id: number;
  pathId: number;
  title: string;
  slug: string;
  description: string | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Errors:**
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.modules.get({ id })`

Get a specific module with its lessons.

**Input:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{
  ...Module,
  lessons: Array<Lesson>
}
```

**Errors:**
- `NOT_FOUND` - Module doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.modules.create(input)`

Create a new module within a learning path.

**Input:**
```typescript
{
  pathId: number;
  title: string;       // 1-200 characters
  slug: string;        // 1-200 characters
  description?: string;
  orderIndex: number;  // Non-negative integer
}
```

**Returns:**
```typescript
{
  id: number;
}
```

**Errors:**
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.modules.update(input)`

Update an existing module.

**Input:**
```typescript
{
  id: number;
  title?: string;
  slug?: string;
  description?: string;
  orderIndex?: number;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `NOT_FOUND` - Module doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.modules.delete({ id })`

Delete a module and all its lessons.

**Input:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `NOT_FOUND` - Module doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.modules.reorder(input)`

Reorder modules within a learning path.

**Input:**
```typescript
{
  pathId: number;
  moduleOrders: Array<{
    id: number;
    orderIndex: number;
  }>;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `FORBIDDEN` - User doesn't own the parent path

---

### Lessons

#### `creator.lessons.list({ moduleId })`

Get all lessons for a module.

**Input:**
```typescript
{
  moduleId: number;
}
```

**Returns:**
```typescript
Array<{
  id: number;
  moduleId: number;
  title: string;
  slug: string;
  contentBlocks: ContentBlock[];
  orderIndex: number;
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Errors:**
- `NOT_FOUND` - Module doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.lessons.get({ id })`

Get a specific lesson with its content.

**Input:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{
  id: number;
  moduleId: number;
  title: string;
  slug: string;
  contentBlocks: ContentBlock[];
  orderIndex: number;
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Content Block Types:**
```typescript
type ContentBlock = 
  | { id: string; type: "text"; order: number; content: { html: string } }
  | { id: string; type: "code"; order: number; content: { code: string; language: string } }
  | { id: string; type: "video"; order: number; content: { youtubeUrl: string; title?: string } }
  | { id: string; type: "image"; order: number; content: { url: string; alt?: string; caption?: string } }
  | { id: string; type: "lab_recipe"; order: number; content: { title: string; steps: string[]; notes?: string } }
  | { id: string; type: "resource_card"; order: number; content: { title: string; description: string; url: string; icon?: string } }
  | { id: string; type: "quiz_placeholder"; order: number; content: { title: string } }
  | { id: string; type: "ai_chat_placeholder"; order: number; content: { title: string } };
```

**Errors:**
- `NOT_FOUND` - Lesson doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.lessons.create(input)`

Create a new lesson within a module.

**Input:**
```typescript
{
  moduleId: number;
  title: string;              // 1-200 characters
  slug: string;               // 1-200 characters
  contentBlocks: ContentBlock[];
  orderIndex: number;         // Non-negative integer
  estimatedMinutes?: number;  // Positive integer
}
```

**Returns:**
```typescript
{
  id: number;
}
```

**Errors:**
- `NOT_FOUND` - Module doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.lessons.update(input)`

Update an existing lesson.

**Input:**
```typescript
{
  id: number;
  title?: string;
  slug?: string;
  contentBlocks?: ContentBlock[];
  estimatedMinutes?: number;
  orderIndex?: number;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `NOT_FOUND` - Lesson doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.lessons.autosave(input)`

Autosave lesson content (lightweight update for editor).

**Input:**
```typescript
{
  id: number;
  contentBlocks: ContentBlock[];
}
```

**Returns:**
```typescript
{
  success: true;
  timestamp: number; // Unix timestamp in milliseconds
}
```

**Errors:**
- `NOT_FOUND` - Lesson doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.lessons.delete({ id })`

Delete a lesson.

**Input:**
```typescript
{
  id: number;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `NOT_FOUND` - Lesson doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

#### `creator.lessons.reorder(input)`

Reorder lessons within a module.

**Input:**
```typescript
{
  moduleId: number;
  lessonOrders: Array<{
    id: number;
    orderIndex: number;
  }>;
}
```

**Returns:**
```typescript
{
  success: true;
}
```

**Errors:**
- `NOT_FOUND` - Module doesn't exist
- `FORBIDDEN` - User doesn't own the parent path

---

## Auth API

### `auth.me()`

Get the current authenticated user.

**Returns:**
```typescript
User | null
```

---

### `auth.logout()`

Logout the current user by clearing the session cookie.

**Returns:**
```typescript
{
  success: true;
}
```

---

## Error Codes

tRPC uses standard error codes:

- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Authenticated but not authorized
- `NOT_FOUND` - Resource doesn't exist
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Server error

---

## Usage Examples

### React Component with tRPC

```typescript
import { trpc } from "@/lib/trpc";

function LearningPathsList() {
  const { data: paths, isLoading, error } = trpc.creator.paths.list.useQuery();
  const createMutation = trpc.creator.paths.create.useMutation({
    onSuccess: (data) => {
      console.log("Created path with ID:", data.id);
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      title: "New Path",
      slug: "new-path",
      difficulty: "beginner",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create Path</button>
      {paths?.map(path => (
        <div key={path.id}>{path.title}</div>
      ))}
    </div>
  );
}
```

### Optimistic Updates

```typescript
const utils = trpc.useUtils();
const deleteMutation = trpc.creator.paths.delete.useMutation({
  onMutate: async ({ id }) => {
    // Cancel outgoing refetches
    await utils.creator.paths.list.cancel();
    
    // Snapshot previous value
    const previous = utils.creator.paths.list.getData();
    
    // Optimistically update
    utils.creator.paths.list.setData(undefined, (old) =>
      old?.filter(path => path.id !== id)
    );
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    utils.creator.paths.list.setData(undefined, context?.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    utils.creator.paths.list.invalidate();
  },
});
```

---

## Rate Limiting

Currently no rate limiting is implemented. This will be added in a future version.

---

## Versioning

API version: **v1** (no version prefix in URLs currently)

Breaking changes will be communicated via release notes.
