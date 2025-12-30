# POZI STUDIO

**An AI-Powered Learning Management System and Course Creator**

POZI STUDIO is a modern, interactive platform designed for educators to create rich multimedia courses with AI assistance, and for learners to engage with content through personalized dashboards, progress tracking, and intelligent note-taking.

---

## 🎯 Project Vision

POZI STUDIO empowers a small community of educators (under 100) to:

- **Create fully interactive lesson plans** with rich multimedia content
- **Host and publish courses** with flexible gating strategies
- **Track student progress** through comprehensive analytics
- **Leverage AI assistance** for content generation and video intelligence
- **Export static HTML versions** of courses for distribution

The platform focuses on **content creation excellence** rather than advanced LMS features like gamification or complex user management.

---

## ✨ Key Features

### For Creators

- **Learning Path Management**: Organize courses into paths → modules → lessons
- **Rich Content Editor**: TipTap-based editor with support for:
  - Text formatting and markdown
  - Code blocks with syntax highlighting
  - YouTube video embeds
  - Image galleries
  - Lab recipes and resource cards
  - Placeholder widgets for quizzes and AI chat
- **AI Video Intelligence**: Analyze YouTube videos to extract:
  - Transcripts and chapters
  - CLI commands and key concepts
  - Structured learning content
- **Media Library**: Upload and manage images, videos, and other assets
- **Publishing Controls**: 
  - Public/private visibility
  - Gating strategies (free, signup required, partial free)
  - Preview before publishing
- **Export System**: Generate standalone HTML/CSS/JS bundles
- **Analytics Dashboard**: Track enrollments, completion rates, and engagement

### For Learners

- **Personalized Dashboard**: View enrolled paths and progress
- **Interactive Lesson Viewer**: Engage with multimedia content
- **Progress Tracking**: Automatic completion tracking per lesson
- **Smart Note-Taking**: Categorized notes (Insight/Todo/Question/Code)
- **Bookmarking System**: Save lessons and modules for later
- **Search & Discovery**: Find courses by topic, difficulty, and tags

---

## 🏗️ Technical Architecture

### Stack

- **Frontend**: React 19 + TypeScript + TailwindCSS 4 + Vite
- **Backend**: Express + tRPC 11 (end-to-end type safety)
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Manus OAuth
- **Storage**: S3-compatible object storage
- **AI Integration**: Multi-provider strategy
  - Gemini AI: YouTube video analysis (infrequent, high-value)
  - OpenRouter/Z.ai: Content generation (cost-efficient)
  - HuggingFace: Image generation (free/low-cost)

### Database Schema

**15 tables** covering:

- **Core Content**: `learning_paths`, `modules`, `lessons`
- **User Engagement**: `enrollments`, `progress`, `notes`, `bookmarks`
- **AI & Media**: `video_analyses`, `media_library`, `ai_usage_logs`
- **Export & Analytics**: `exports`, `platform_analytics`
- **Users**: Extended with roles (guest/learner/creator/admin)

See [docs/technical_architecture.md](docs/technical_architecture.md) for complete schema and API documentation.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL 8+ or TiDB Cloud
- Manus platform account (for OAuth and built-in services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pozi-studio.git
   cd pozi-studio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The following environment variables are automatically provided by the Manus platform:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `VITE_APP_ID` - OAuth application ID
   - `OAUTH_SERVER_URL` - OAuth backend URL
   - `VITE_OAUTH_PORTAL_URL` - OAuth frontend URL
   - `BUILT_IN_FORGE_API_URL` - Manus AI/Storage APIs
   - `BUILT_IN_FORGE_API_KEY` - API authentication

4. **Initialize database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:3000`
   - tRPC API: `http://localhost:3000/api/trpc`

### Development Workflow

1. **Update database schema**: Edit `drizzle/schema.ts`, then run `pnpm db:push`
2. **Add database helpers**: Create query functions in `server/db.ts`
3. **Create tRPC procedures**: Define API endpoints in `server/routers/*.ts`
4. **Build UI**: Create React components in `client/src/pages/` and `client/src/components/`
5. **Test**: Run `pnpm test` for backend tests

---

## 📁 Project Structure

```
pozi-studio/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   │   └── creator/   # Creator dashboard pages
│   │   ├── lib/           # Utilities and tRPC client
│   │   ├── App.tsx        # Routes and layout
│   │   └── index.css      # Global styles and theme
│   └── index.html
├── server/                # Backend Express + tRPC
│   ├── _core/            # Framework plumbing (OAuth, context, LLM)
│   ├── routers/          # tRPC procedure definitions
│   │   └── creator.ts    # Creator dashboard API
│   ├── db.ts             # Database query helpers
│   └── routers.ts        # Main router registry
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Table definitions
├── docs/                 # Documentation and planning
│   ├── technical_architecture.md
│   ├── implementation_plan.md
│   ├── creator_dashboard_plan.md
│   └── ...
├── todo.md               # Project task tracking
└── README.md             # This file
```

---

## 📚 Documentation

- **[Technical Architecture](docs/technical_architecture.md)**: Complete system design, database schema, API structure
- **[Implementation Plan](docs/implementation_plan.md)**: Phase 1 & 2 development roadmap
- **[Creator Dashboard Plan](docs/creator_dashboard_plan.md)**: Detailed UI/UX design for creator tools
- **[Research Notes](docs/pozi_research_notes.md)**: Analysis of original POZI platform
- **[Feature Synthesis](docs/pozi_feature_synthesis.md)**: Complete feature breakdown
- **[LMS Research](docs/lms_research_findings.md)**: Competitive analysis and best practices

---

## 🎨 Design System

### Theme

- **Primary Color**: Cyan (#06b6d4) - Actions and links
- **Accent Color**: Purple (#8b5cf6) - Secondary elements
- **Background**: Deep navy (#0a0e1a)
- **Cards**: Lighter navy (#131824)
- **Text**: High contrast white (#f0f4f8)

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: Bold, clear hierarchy
- **Body**: Optimized for readability

### Components

Built with **shadcn/ui** for consistency:
- Buttons, Cards, Dialogs
- Forms (Input, Textarea, Select)
- Navigation (Sidebar, Dropdowns)
- Data Display (Tables, Badges, Avatars)

---

## 🔧 API Documentation

### Creator API (`trpc.creator.*`)

**Learning Paths**
- `paths.list()` - Get all paths for current creator
- `paths.get({ id })` - Get path with modules
- `paths.create({ title, slug, ... })` - Create new path
- `paths.update({ id, ... })` - Update path details
- `paths.delete({ id })` - Delete path
- `paths.publish({ id, isPublished, isPublic, ... })` - Publish/unpublish
- `paths.duplicate({ id })` - Duplicate path

**Modules**
- `modules.list({ pathId })` - Get modules for path
- `modules.get({ id })` - Get module with lessons
- `modules.create({ pathId, title, slug, ... })` - Create module
- `modules.update({ id, ... })` - Update module
- `modules.delete({ id })` - Delete module
- `modules.reorder({ pathId, moduleOrders })` - Reorder modules

**Lessons**
- `lessons.list({ moduleId })` - Get lessons for module
- `lessons.get({ id })` - Get lesson with content
- `lessons.create({ moduleId, title, slug, contentBlocks, ... })` - Create lesson
- `lessons.update({ id, ... })` - Update lesson
- `lessons.autosave({ id, contentBlocks })` - Autosave content
- `lessons.delete({ id })` - Delete lesson
- `lessons.reorder({ moduleId, lessonOrders })` - Reorder lessons

See [docs/technical_architecture.md](docs/technical_architecture.md) for complete API reference.

---

## 🚧 Development Status

### ✅ Completed (Phase 1 - Foundation)

- [x] Database schema with 15 tables
- [x] Complete database query helpers (60+ functions)
- [x] tRPC API layer with 20+ procedures
- [x] Authentication system with role-based access
- [x] Design system and theming
- [x] Creator Dashboard layout
- [x] Learning Paths list with CRUD operations

### 🚧 In Progress (Phase 1 - Creator Tools)

- [ ] Path Editor (3-panel layout)
- [ ] Module management UI
- [ ] Lesson editor with TipTap integration
- [ ] Drag-and-drop reordering
- [ ] Publishing controls and preview
- [ ] Media library UI

### 📋 Planned (Phase 2 - AI & Advanced Features)

- [ ] AI Video Intelligence integration
- [ ] Multi-AI provider system
- [ ] Export system for static HTML
- [ ] Learner dashboard
- [ ] Progress tracking UI
- [ ] Note-taking system
- [ ] Analytics dashboard

See [todo.md](todo.md) for detailed task tracking.

---

## 🤝 Contributing

This is currently a private project under active development. Contribution guidelines will be added once the MVP is complete.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Original POZI platform design inspiration
- Manus platform for infrastructure and OAuth
- shadcn/ui for component library
- TipTap for rich text editing
- Drizzle ORM for type-safe database access

---

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for educators and learners**
