# POZI STUDIO - Technical Architecture Document

## System Overview

A modern, AI-powered learning management system focused on empowering educators to create, manage, and export interactive multimedia courses with minimal friction. The platform prioritizes structural excellence, design quality, and creator autonomy.

## Core Principles

1. **Creator-First Design**: All features serve the content creator's workflow
2. **Export Freedom**: Every course can be exported as standalone static HTML
3. **Cost-Efficient AI**: Multi-provider strategy optimizing for cost and capability
4. **Tasteful Gating**: Free exploration with gentle conversion to signup
5. **Scalable Architecture**: Built to handle 100 creators and thousands of learners

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand (lightweight, performant)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Rich Text Editor**: TipTap (extensible, modern)
- **Code Highlighting**: Prism.js
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts (for analytics)
- **Graph Visualization**: React Flow (for path graph view)

### Backend
- **Runtime**: Node.js 22 + TypeScript
- **Framework**: Express.js
- **Database**: MySQL (provided in scaffold)
- **ORM**: Drizzle ORM (provided in scaffold)
- **Authentication**: OAuth (Manus-Oauth provided in scaffold)
- **File Storage**: S3-compatible storage
- **Background Jobs**: Bull + Redis for async processing
- **API Design**: RESTful with consistent patterns

### AI Provider Integration
- **Gemini AI**: YouTube video scraping, transcript extraction (infrequent)
- **OpenRouter/Z.ai**: Content generation, deep research, lesson outlines
- **OpenAI (via OpenRouter)**: Text generation, concept extraction
- **HuggingFace**: Image generation (cost-efficient)
- **OpenImage**: Alternative image generation
- **ElevenLabs/Coqui**: Voice synthesis (cost-efficient options)

### Infrastructure
- **Deployment**: Vercel (frontend) + Railway/Render (backend)
- **Database**: TiDB/MySQL (managed)
- **CDN**: Cloudflare for static assets
- **Object Storage**: S3/R2 for media files
- **Background Processing**: Redis + Bull for queues
- **Monitoring**: Sentry for errors, Plausible for analytics

## Database Schema

### Core Tables

```sql
-- Users & Authentication
users
├── id (uuid, pk)
├── email (unique, indexed)
├── name
├── avatar_url
├── role (enum: guest, learner, creator, admin)
├── subscription_tier (enum: free, pro)
├── created_at
└── updated_at

-- Content Hierarchy
learning_paths
├── id (uuid, pk)
├── creator_id (fk → users.id)
├── title (indexed)
├── slug (unique, indexed)
├── description (text)
├── hero_image_url
├── difficulty_level (enum: beginner, intermediate, advanced, mixed)
├── estimated_hours (decimal)
├── tags (json array)
├── is_published (boolean)
├── is_public (boolean) -- true = community, false = private
├── gating_strategy (enum: none, signup_required, partial_free)
├── free_lesson_count (int) -- for partial_free gating
├── view_count (int)
├── enrollment_count (int)
├── created_at
└── updated_at

modules
├── id (uuid, pk)
├── path_id (fk → learning_paths.id, cascade delete)
├── title
├── slug
├── description (text)
├── order_index (int, indexed)
├── created_at
└── updated_at

lessons
├── id (uuid, pk)
├── module_id (fk → modules.id, cascade delete)
├── title
├── slug
├── content_blocks (json) -- structured content
├── order_index (int, indexed)
├── estimated_minutes (int)
├── created_at
└── updated_at

-- Content Blocks Structure (JSON in lessons.content_blocks)
[
  {
    "id": "block_uuid",
    "type": "text|code|video|image|lab_recipe|resource_card|quiz_placeholder|ai_chat_placeholder",
    "content": {...}, -- type-specific content
    "order": 0
  }
]

-- Progress Tracking
enrollments
├── id (uuid, pk)
├── user_id (fk → users.id)
├── path_id (fk → learning_paths.id)
├── enrolled_at
└── last_accessed_at

progress
├── id (uuid, pk)
├── user_id (fk → users.id)
├── lesson_id (fk → lessons.id)
├── status (enum: not_started, in_progress, completed)
├── completion_percentage (int 0-100)
├── time_spent_seconds (int)
├── last_position (json) -- scroll position, video timestamp, etc.
├── created_at
└── updated_at

-- Learner Tools
notes
├── id (uuid, pk)
├── user_id (fk → users.id)
├── lesson_id (fk → lessons.id, nullable)
├── note_type (enum: insight, todo, question, code_snippet)
├── title
├── content (text)
├── tags (json array)
├── created_at
└── updated_at

bookmarks
├── id (uuid, pk)
├── user_id (fk → users.id)
├── bookmark_type (enum: lesson, module, path, creator)
├── target_id (uuid) -- polymorphic reference
├── created_at
└── updated_at

-- AI & Media
video_analyses
├── id (uuid, pk)
├── creator_id (fk → users.id)
├── youtube_url (unique)
├── youtube_video_id
├── video_title
├── video_duration_seconds
├── transcript (text)
├── chapters (json) -- [{title, start_time, end_time, summary}]
├── commands (json) -- [{command, description, timestamp}]
├── concepts (json) -- [{concept, description, relevance_score}]
├── difficulty_suggestion (enum)
├── tags_suggestion (json array)
├── analysis_status (enum: pending, processing, completed, failed)
├── ai_provider_used (string)
├── processing_cost (decimal)
├── created_at
└── updated_at

media_library
├── id (uuid, pk)
├── creator_id (fk → users.id)
├── file_name
├── file_type (enum: image, video, audio, document)
├── file_size_bytes
├── storage_url
├── thumbnail_url
├── mime_type
├── alt_text
├── tags (json array)
├── created_at
└── updated_at

-- Export System
exports
├── id (uuid, pk)
├── lesson_id (fk → lessons.id)
├── creator_id (fk → users.id)
├── export_type (enum: single_lesson, full_module, full_path)
├── export_url (s3 url to zip file)
├── export_status (enum: pending, building, completed, failed)
├── build_log (text)
├── created_at
└── updated_at

-- AI Provider Management
ai_usage_logs
├── id (uuid, pk)
├── user_id (fk → users.id)
├── provider (enum: gemini, openrouter, huggingface, openimage, elevenlabs)
├── operation_type (string) -- e.g., "video_analysis", "content_generation"
├── input_tokens (int)
├── output_tokens (int)
├── cost_usd (decimal)
├── response_time_ms (int)
├── created_at
└── updated_at

-- Admin & Analytics
platform_analytics
├── id (uuid, pk)
├── date (date, indexed)
├── total_users (int)
├── active_users (int)
├── new_enrollments (int)
├── lessons_completed (int)
├── ai_operations_count (int)
├── ai_cost_total (decimal)
└── created_at
```

## Multi-AI Provider System Architecture

### AI Service Layer (Backend)

```typescript
// services/ai/AIProviderFactory.ts
interface AIProvider {
  name: string;
  capabilities: string[];
  costPerToken: number;
  rateLimit: number;
}

interface AIRequest {
  operation: 'video_analysis' | 'content_generation' | 'image_generation' | 'voice_synthesis';
  input: any;
  preferences?: {
    maxCost?: number;
    preferredProvider?: string;
    quality?: 'fast' | 'balanced' | 'best';
  };
}

class AIProviderFactory {
  // Route requests to optimal provider based on operation type and cost
  async execute(request: AIRequest): Promise<AIResponse> {
    const provider = this.selectProvider(request);
    return await provider.execute(request);
  }
  
  private selectProvider(request: AIRequest): AIProvider {
    // Intelligent routing logic
    switch (request.operation) {
      case 'video_analysis':
        return new GeminiProvider(); // Best for YouTube scraping
      case 'content_generation':
        return new OpenRouterProvider('gpt-4-mini'); // Cost-efficient text
      case 'image_generation':
        return new HuggingFaceProvider(); // Free/cheap image gen
      case 'voice_synthesis':
        return new CoquiProvider(); // Open-source TTS
    }
  }
}

// Specific Provider Implementations
class GeminiProvider implements AIProvider {
  async analyzeVideo(youtubeUrl: string): Promise<VideoAnalysis> {
    // 1. Extract video ID
    // 2. Get transcript via YouTube API + Gemini
    // 3. Analyze transcript for chapters, commands, concepts
    // 4. Return structured data
  }
}

class OpenRouterProvider implements AIProvider {
  async generateContent(prompt: string, model: string): Promise<string> {
    // Route through OpenRouter for cost-efficient access to multiple models
  }
}

class HuggingFaceProvider implements AIProvider {
  async generateImage(prompt: string): Promise<string> {
    // Use Stable Diffusion or other open models
  }
}
```

### AI Configuration (Environment Variables)

```env
# Gemini AI
GEMINI_API_KEY=xxx

# OpenRouter (access to multiple models)
OPENROUTER_API_KEY=xxx

# HuggingFace
HUGGINGFACE_API_KEY=xxx

# OpenImage
OPENIMAGE_API_KEY=xxx

# Voice Synthesis
ELEVENLABS_API_KEY=xxx
COQUI_API_URL=xxx

# Cost Limits
AI_DAILY_COST_LIMIT=10.00
AI_PER_USER_MONTHLY_LIMIT=5.00
```

## Export System Architecture

### Static HTML Generation Pipeline

```typescript
// services/export/ExportService.ts
class ExportService {
  async exportLesson(lessonId: string): Promise<string> {
    // 1. Fetch lesson with all content blocks
    const lesson = await this.fetchLessonWithAssets(lessonId);
    
    // 2. Generate standalone HTML
    const html = await this.generateHTML(lesson);
    
    // 3. Inline CSS (TailwindCSS compiled)
    const styledHTML = await this.inlineStyles(html);
    
    // 4. Bundle JavaScript (minimal, for interactive elements)
    const bundledHTML = await this.bundleScripts(styledHTML);
    
    // 5. Download and embed media assets (base64 or local files)
    const completeHTML = await this.embedAssets(bundledHTML);
    
    // 6. Create zip file with index.html + assets/
    const zipUrl = await this.createZipPackage(completeHTML);
    
    // 7. Upload to S3 and return download URL
    return zipUrl;
  }
  
  private async generateHTML(lesson: Lesson): Promise<string> {
    // Use React Server Components or template engine
    // Generate semantic HTML with proper structure
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lesson.title}</title>
        <style>${this.getCompiledCSS()}</style>
      </head>
      <body>
        ${this.renderContentBlocks(lesson.content_blocks)}
        <script>${this.getMinimalJS()}</script>
      </body>
      </html>
    `;
  }
}
```

### Export File Structure

```
exported-lesson-slug.zip
├── index.html (standalone, all styles inlined)
├── assets/
│   ├── images/
│   │   ├── hero.jpg
│   │   └── diagram.png
│   ├── videos/ (optional, or keep as embeds)
│   └── fonts/ (if custom fonts used)
└── README.md (instructions for hosting)
```

## Publishing & Gating System

### Gating Strategies

```typescript
enum GatingStrategy {
  NONE = 'none',                    // Fully public, no restrictions
  SIGNUP_REQUIRED = 'signup_required', // Must create account to access
  PARTIAL_FREE = 'partial_free'     // First N lessons free, rest require signup
}

interface PublishingSettings {
  isPublished: boolean;      // Draft vs. Published
  isPublic: boolean;         // Private vs. Community
  gatingStrategy: GatingStrategy;
  freeLessonCount?: number;  // For PARTIAL_FREE strategy
}
```

### Access Control Logic

```typescript
// middleware/accessControl.ts
async function canAccessLesson(userId: string | null, lessonId: string): Promise<boolean> {
  const lesson = await db.getLessonWithPath(lessonId);
  const path = lesson.module.learning_path;
  
  // Not published = only creator can access
  if (!path.is_published) {
    return userId === path.creator_id;
  }
  
  // Private path = only creator can access
  if (!path.is_public) {
    return userId === path.creator_id;
  }
  
  // Public path with no gating = everyone can access
  if (path.gating_strategy === GatingStrategy.NONE) {
    return true;
  }
  
  // Signup required = must be authenticated
  if (path.gating_strategy === GatingStrategy.SIGNUP_REQUIRED) {
    return userId !== null;
  }
  
  // Partial free = check lesson index
  if (path.gating_strategy === GatingStrategy.PARTIAL_FREE) {
    const lessonIndex = await db.getLessonIndexInPath(lessonId);
    if (lessonIndex < path.free_lesson_count) {
      return true; // Free lesson
    }
    return userId !== null; // Gated lesson requires signup
  }
  
  return false;
}
```

## API Structure

### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
```

### Learning Path Endpoints
```
GET    /api/paths                    # List all public paths (with filters)
GET    /api/paths/:id                # Get single path details
POST   /api/paths                    # Create new path (creator only)
PUT    /api/paths/:id                # Update path (creator only)
DELETE /api/paths/:id                # Delete path (creator only)
PUT    /api/paths/:id/publish        # Publish/unpublish path
GET    /api/paths/:id/analytics      # Get path analytics (creator only)
```

### Module Endpoints
```
GET    /api/paths/:pathId/modules
POST   /api/paths/:pathId/modules
PUT    /api/modules/:id
DELETE /api/modules/:id
PUT    /api/modules/:id/reorder      # Change order_index
```

### Lesson Endpoints
```
GET    /api/modules/:moduleId/lessons
GET    /api/lessons/:id
POST   /api/modules/:moduleId/lessons
PUT    /api/lessons/:id
DELETE /api/lessons/:id
PUT    /api/lessons/:id/reorder
PUT    /api/lessons/:id/content      # Update content blocks
```

### Progress Endpoints
```
GET    /api/progress/me              # User's overall progress
GET    /api/progress/paths/:id       # Progress for specific path
POST   /api/progress/lessons/:id     # Update lesson progress
POST   /api/enrollments              # Enroll in path
```

### Notes & Bookmarks
```
GET    /api/notes                    # List user's notes
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
GET    /api/bookmarks
POST   /api/bookmarks
DELETE /api/bookmarks/:id
```

### Video Intelligence
```
POST   /api/ai/video/analyze         # Submit YouTube URL for analysis
GET    /api/ai/video/analyses        # List user's analyzed videos
GET    /api/ai/video/analyses/:id    # Get analysis details
POST   /api/ai/video/import          # Import analysis into lesson
GET    /api/ai/video/search          # Search across transcripts
```

### AI Content Generation
```
POST   /api/ai/generate/outline      # Generate lesson outline from topic
POST   /api/ai/generate/content      # Generate lesson content from outline
POST   /api/ai/generate/image        # Generate image from prompt
POST   /api/ai/enhance/text          # Enhance/improve existing text
```

### Media Library
```
GET    /api/media                    # List user's media
POST   /api/media/upload             # Upload file
DELETE /api/media/:id
PUT    /api/media/:id                # Update metadata
```

### Export System
```
POST   /api/export/lessons/:id       # Export single lesson
POST   /api/export/modules/:id       # Export full module
POST   /api/export/paths/:id         # Export full path
GET    /api/export/jobs/:id          # Check export status
GET    /api/export/gallery           # List all exports
```

### Admin Endpoints
```
GET    /api/admin/users              # List all users
PUT    /api/admin/users/:id/role     # Change user role
GET    /api/admin/analytics          # Platform analytics
GET    /api/admin/ai-usage           # AI usage and costs
DELETE /api/admin/paths/:id          # Delete any path
```

## Frontend Architecture

### Page Structure

```
/                           # Landing page (guest view)
/browse                     # Browse all public paths
/paths/:slug                # Path details (modules list)
/paths/:pathSlug/modules/:moduleSlug/lessons/:lessonSlug  # Lesson viewer

/dashboard                  # Learner dashboard (authenticated)
/dashboard/notes            # User's notes
/dashboard/bookmarks        # User's bookmarks

/create                     # Creator dashboard
/create/paths               # Manage paths
/create/paths/new           # Create new path
/create/paths/:id/edit      # Edit path
/create/modules/:id/edit    # Edit module
/create/lessons/:id/edit    # Lesson editor (main creator tool)
/create/media               # Media library
/create/ai/video            # Video intelligence
/create/ai/generate         # AI content generation
/create/export              # Export gallery
/create/analytics           # Creator analytics

/admin                      # Admin dashboard
/admin/users                # User management
/admin/analytics            # Platform analytics
/admin/ai-usage             # AI cost monitoring
```

### Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── DashboardLayout.tsx
│   ├── content/
│   │   ├── PathCard.tsx
│   │   ├── ModuleCard.tsx
│   │   ├── LessonViewer.tsx
│   │   └── ContentBlock.tsx (renders different block types)
│   ├── editor/
│   │   ├── LessonEditor.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── CodeBlockEditor.tsx
│   │   ├── VideoEmbedEditor.tsx
│   │   └── BlockPalette.tsx
│   ├── progress/
│   │   ├── ProgressBar.tsx
│   │   ├── ProgressCard.tsx
│   │   └── CompletionBadge.tsx
│   ├── ai/
│   │   ├── VideoAnalyzer.tsx
│   │   ├── ContentGenerator.tsx
│   │   ├── ImageGenerator.tsx
│   │   └── AIProviderSelector.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Dropdown.tsx
│       └── Card.tsx
├── pages/
│   ├── Landing.tsx
│   ├── Browse.tsx
│   ├── PathDetail.tsx
│   ├── LessonView.tsx
│   ├── Dashboard.tsx
│   ├── CreatorDashboard.tsx
│   └── Admin.tsx
├── stores/
│   ├── authStore.ts (Zustand)
│   ├── contentStore.ts
│   └── progressStore.ts
├── services/
│   ├── api.ts (axios wrapper)
│   ├── auth.ts
│   └── storage.ts
└── utils/
    ├── contentBlockRenderer.tsx
    ├── exportHelpers.ts
    └── validators.ts
```

## Design System Improvements

### Issues Identified in POZI Design
1. **Inconsistent spacing** between cards and sections
2. **Low contrast text** in some areas (dark gray on darker gray)
3. **Overwhelming sidebar** on some pages
4. **Unclear visual hierarchy** in lesson content
5. **Too many badge colors** without clear meaning

### Proposed Improvements

#### 1. Consistent Spacing Scale
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
```

#### 2. Improved Color Palette
```css
/* Dark theme with better contrast */
--bg-primary: #0a0e1a;        /* Main background */
--bg-secondary: #131824;      /* Card background */
--bg-tertiary: #1a2234;       /* Hover states */

--text-primary: #f0f4f8;      /* Main text (higher contrast) */
--text-secondary: #b8c5d6;    /* Secondary text */
--text-tertiary: #7a8ba3;     /* Muted text */

--accent-primary: #06b6d4;    /* Cyan - primary actions */
--accent-secondary: #8b5cf6;  /* Purple - secondary actions */
--accent-success: #10b981;    /* Green - success states */
--accent-warning: #f59e0b;    /* Amber - warnings */
--accent-error: #ef4444;      /* Red - errors */
```

#### 3. Typography Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

#### 4. Clear Badge System
- **Difficulty**: Blue (Beginner), Purple (Intermediate), Orange (Advanced)
- **Status**: Green (Completed), Yellow (In Progress), Gray (Not Started)
- **Visibility**: Cyan (Published), Gray (Draft)
- **Access**: Green (Public), Orange (Gated), Red (Private)

#### 5. Improved Card Design
- Subtle border instead of heavy shadow
- Hover state with border color change
- Clear visual hierarchy within cards
- Consistent padding and spacing

## Performance Optimizations

### Frontend
1. **Code Splitting**: Lazy load routes and heavy components
2. **Image Optimization**: WebP with fallbacks, lazy loading, blur placeholders
3. **Virtual Scrolling**: For long lists (lesson content, path browser)
4. **Debounced Search**: Reduce API calls during typing
5. **Optimistic Updates**: Instant UI feedback before API confirmation
6. **Service Worker**: Cache static assets for offline viewing

### Backend
1. **Database Indexing**: All foreign keys, slug fields, frequently queried columns
2. **Query Optimization**: Use joins wisely, avoid N+1 queries
3. **Caching**: Redis for session data, frequently accessed content
4. **CDN**: Static assets served from edge locations
5. **Connection Pooling**: Reuse database connections
6. **Rate Limiting**: Prevent abuse, especially on AI endpoints

### AI Operations
1. **Queue System**: Background processing for video analysis
2. **Result Caching**: Cache AI responses for identical inputs
3. **Batch Processing**: Combine multiple small requests
4. **Cost Monitoring**: Track and alert on AI spending
5. **Fallback Providers**: Switch to cheaper provider if primary fails

## Security Considerations

1. **Authentication**: Secure JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control on all endpoints
3. **Input Validation**: Zod schemas for all user inputs
4. **SQL Injection**: Parameterized queries via ORM
5. **XSS Protection**: Sanitize user-generated content
6. **CSRF Protection**: CSRF tokens for state-changing operations
7. **Rate Limiting**: Prevent brute force and DoS attacks
8. **File Upload Security**: Validate file types, scan for malware
9. **API Key Security**: Environment variables, never expose in frontend
10. **HTTPS Only**: Enforce secure connections

## Monitoring & Logging

1. **Error Tracking**: Sentry for frontend and backend errors
2. **Performance Monitoring**: Track API response times, page load times
3. **AI Usage Tracking**: Log all AI operations with costs
4. **User Analytics**: Plausible or similar privacy-focused analytics
5. **Audit Logs**: Track admin actions and content changes
6. **Health Checks**: Endpoint for monitoring service status

## Deployment Strategy

### Development Environment
- Local MySQL database
- Local Redis instance
- Environment variables in `.env.local`
- Hot reload for frontend and backend

### Staging Environment
- Deployed to staging URLs
- Separate database instance
- Test AI providers with limited budgets
- Used for QA and client demos

### Production Environment
- Vercel for frontend (automatic deployments)
- Railway/Render for backend
- Managed MySQL (PlanetScale or similar)
- Managed Redis (Upstash)
- S3/R2 for file storage
- Environment variables via platform secrets
- Automated backups
- CI/CD pipeline with tests

## Success Metrics

### Technical Metrics
- Page load time < 2 seconds
- API response time < 200ms (p95)
- 99.9% uptime
- Zero critical security vulnerabilities

### User Metrics
- Creator onboarding completion rate > 80%
- Average time to first published path < 30 minutes
- Learner engagement rate > 60%
- Export success rate > 95%

### Business Metrics
- AI cost per user < $0.50/month
- Infrastructure cost < $500/month at 100 creators
- User satisfaction score > 4.5/5

This architecture provides a solid foundation for building a scalable, performant, and cost-efficient learning platform.
