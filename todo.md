# POZI STUDIO - Project TODO

## Phase 1: Database Schema & Foundation

### Database Schema
- [x] Create learning paths table with publishing and gating fields
- [x] Create modules table with ordering
- [x] Create lessons table with JSON content blocks
- [x] Create enrollments table for user-path relationships
- [x] Create progress table for lesson completion tracking
- [x] Create notes table with type categorization
- [x] Create bookmarks table with polymorphic references
- [x] Create video analyses table for AI-powered video intelligence
- [x] Create media library table for uploaded assets
- [x] Create exports table for HTML generation tracking
- [x] Create AI usage logs table for cost monitoring
- [x] Run database migrations

## Phase 2: Design System & Core UI

### Design System
- [x] Configure TailwindCSS custom theme with improved color palette
- [x] Set up typography scale and spacing system
- [ ] Create Button component with variants
- [ ] Create Input and Textarea components
- [ ] Create Card component with consistent styling
- [ ] Create Badge component for difficulty, status, visibility
- [ ] Create Modal/Dialog component
- [ ] Create Dropdown/Select component
- [ ] Create Tabs component
- [ ] Create Tooltip component

### Layout Components
- [ ] Create Header with navigation
- [ ] Create Footer
- [ ] Create Sidebar for creator dashboard
- [ ] Create DashboardLayout wrapper
- [ ] Create ContentLayout for lesson viewing

## Phase 3: Authentication & User Management

- [ ] Integrate Manus OAuth authentication
- [ ] Create user profile page
- [ ] Implement role-based access control (Guest, Learner, Creator, Admin)
- [ ] Create protected route middleware
- [ ] Add user role management for admins

## Phase 4: Content Management System (Creator Tools)

### Landing & Browse
- [ ] Build landing page with hero and features
- [ ] Create browse page with path grid
- [ ] Implement search functionality
- [ ] Add filter sidebar (difficulty, tags)
- [ ] Implement pagination or infinite scroll

### Path Management
- [ ] Create path detail page with graph view
- [ ] Create path detail page with list view
- [ ] Build creator dashboard overview
- [ ] Implement create new path form
- [ ] Implement edit path form
- [ ] Add delete path with confirmation
- [ ] Add publish/unpublish toggle
- [ ] Implement publishing settings (public/private, gating)

### Module Management
- [ ] Create add module to path
- [ ] Implement edit module details
- [ ] Add drag-and-drop module reordering
- [ ] Add delete module with confirmation

### Lesson Editor (Core Feature)
- [ ] Integrate TipTap rich text editor
- [ ] Implement text block with formatting
- [ ] Implement code block with syntax highlighting
- [ ] Implement video embed block (YouTube)
- [ ] Implement image block (upload/URL)
- [ ] Implement lab recipe block (structured template)
- [ ] Implement resource card block
- [ ] Add quiz placeholder block (design only)
- [ ] Add AI chat placeholder block (design only)
- [ ] Implement block palette for adding blocks
- [ ] Add drag-and-drop block reordering
- [ ] Add duplicate block functionality
- [ ] Add delete block functionality
- [ ] Implement auto-save with debouncing
- [ ] Add preview mode for lessons

### Lesson Management
- [ ] Create add lesson to module
- [ ] Implement edit lesson details
- [ ] Add drag-and-drop lesson reordering
- [ ] Add delete lesson with confirmation
- [ ] Build lesson list tree view (path > modules > lessons)

## Phase 5: Learner Experience

### Lesson Viewer
- [ ] Build clean lesson reading interface
- [ ] Render text blocks with typography
- [ ] Render code blocks with Prism.js syntax highlighting
- [ ] Render YouTube embeds (responsive)
- [ ] Render images (optimized, lazy loaded)
- [ ] Render lab recipe sections
- [ ] Render resource cards
- [ ] Add breadcrumb navigation
- [ ] Add previous/next lesson buttons
- [ ] Add sidebar with module/lesson list
- [ ] Implement progress indicator
- [ ] Add "Mark as Complete" button

### Learner Dashboard
- [ ] Build progress overview card
- [ ] Create "Continue Learning" section
- [ ] Display "My Learning Paths" grid
- [ ] Add AI recommendations placeholder

### Enrollment & Progress
- [ ] Implement enroll button on path detail
- [ ] Add unenroll option with confirmation
- [ ] Create progress tracking API endpoints
- [ ] Implement real-time progress updates
- [ ] Calculate completion percentages (path, module, lesson)

### Gating System
- [ ] Implement access control middleware
- [ ] Create "Sign up to continue" modal
- [ ] Add gating UI with conversion prompts
- [ ] Show free vs gated lesson indicators

### Notes & Bookmarks
- [ ] Build note creation interface with type selector
- [ ] Create notes list with filtering
- [ ] Implement note search and tags
- [ ] Add "Add Note" button in lesson viewer
- [ ] Implement bookmark functionality for lessons/modules/paths
- [ ] Build bookmarks interface with tabs
- [ ] Add quick access to bookmarked content

## Phase 6: Media Library & Export System

### Media Library
- [ ] Build file upload component (drag and drop)
- [ ] Integrate S3 storage for uploads
- [ ] Generate thumbnails for images
- [ ] Create media library grid view
- [ ] Implement search and filter by type
- [ ] Add tag management for media
- [ ] Add delete media with confirmation
- [ ] Add copy URL to clipboard

### Export System
- [ ] Build export service for single lessons
- [ ] Generate standalone HTML with inlined styles
- [ ] Embed media assets in exports
- [ ] Create zip file with assets folder
- [ ] Upload exports to S3
- [ ] Build export UI with progress indicator
- [ ] Create export gallery page
- [ ] Add export history tracking
- [ ] Implement module export (future)
- [ ] Implement path export (future)

## Phase 7: AI Integration (Scaffolding)

### AI Provider Infrastructure
- [ ] Create AI provider factory with routing logic
- [ ] Implement Gemini provider for video analysis
- [ ] Implement OpenRouter provider for text generation
- [ ] Implement HuggingFace provider for image generation
- [ ] Set up environment variables for AI providers
- [ ] Implement cost tracking and logging
- [ ] Create AI usage dashboard for admins

### Video Intelligence
- [ ] Build video analysis submission form
- [ ] Implement Gemini video analysis backend
- [ ] Create background job system with Bull/Redis
- [ ] Build analysis results view (transcript, chapters, commands, concepts)
- [ ] Create video analyses list page
- [ ] Implement import analysis to lesson workflow
- [ ] Add transcript search functionality

### AI Content Generation (Placeholders)
- [ ] Design lesson outline generator UI
- [ ] Design content enhancement tools UI
- [ ] Design image generation UI
- [ ] Design AI suggestions panel in editor

## Phase 8: Polish & Optimization

### UI/UX Improvements
- [ ] Add smooth transitions with Framer Motion
- [ ] Implement loading states (skeleton screens)
- [ ] Create empty states with helpful messages
- [ ] Improve error states with clear messages
- [ ] Add keyboard navigation support
- [ ] Implement ARIA labels for accessibility
- [ ] Optimize for mobile and tablet
- [ ] Test responsive design across devices

### Performance
- [ ] Implement code splitting
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add caching strategies
- [ ] Optimize database queries with indexes
- [ ] Implement virtual scrolling for long lists

### Documentation
- [ ] Create user guide for creators
- [ ] Create user guide for learners
- [ ] Write API documentation
- [ ] Document deployment process

## Phase 9: Interactive Research Report

- [ ] Create standalone web report with research findings
- [ ] Include platform analysis and feature breakdown
- [ ] Add interactive visualizations
- [ ] Include technical architecture diagrams
- [ ] Make report shareable and exportable

## Future Enhancements (Post-MVP)

### Advanced AI Features
- [ ] Functional quiz system with scoring
- [ ] AI chat assistant in lesson viewer
- [ ] Advanced content generation tools
- [ ] Automated lesson quality suggestions

### Analytics & Recommendations
- [ ] Creator analytics dashboard
- [ ] Learner recommendation system
- [ ] Platform analytics for admins
- [ ] Advanced search across all content

### Export Enhancements
- [ ] Multiple export templates
- [ ] One-click deployment to Netlify/Vercel
- [ ] Custom branding for exports
- [ ] Export analytics tracking

### Community Features
- [ ] Discussion forums on lessons
- [ ] Comments and ratings
- [ ] Creator profiles and following
- [ ] Content marketplace


## Phase 4: Creator Dashboard Implementation

### Research & Planning
- [x] Research creator dashboard best practices
- [x] Research content management UI patterns
- [x] Research TipTap editor integration patterns
- [x] Plan dashboard architecture and user flows
- [x] Design wireframes for key screens

### Dashboard Layout
- [ ] Create DashboardLayout component for creators
- [ ] Build sidebar navigation with sections
- [ ] Implement responsive header with user menu
- [ ] Add breadcrumb navigation
- [ ] Create dashboard home/overview page

### Learning Path Management
- [ ] Build learning paths list view with cards
- [ ] Create new path creation modal/form
- [ ] Implement path editing interface
- [ ] Add path settings (visibility, gating, tags)
- [ ] Build path analytics overview
- [ ] Add path deletion with confirmation

### Module Management
- [ ] Build module list view within path editor
- [ ] Create module creation form
- [ ] Implement module editing interface
- [ ] Add drag-and-drop module reordering
- [ ] Build module settings panel

### Lesson Management
- [ ] Build lesson list view within module editor
- [ ] Create lesson creation form
- [ ] Implement lesson editing interface
- [ ] Add drag-and-drop lesson reordering
- [ ] Build lesson settings panel

### TipTap Rich Text Editor
- [ ] Install and configure TipTap dependencies
- [ ] Create custom editor component
- [ ] Implement text formatting toolbar
- [ ] Add heading, paragraph, list support
- [ ] Implement code block with syntax highlighting
- [ ] Add image upload and embed
- [ ] Add YouTube video embed
- [ ] Create custom content block extensions
- [ ] Add lab recipe block
- [ ] Add resource card block
- [ ] Implement autosave functionality

### Publishing & Preview
- [ ] Build publishing controls (draft/published toggle)
- [ ] Implement visibility settings UI
- [ ] Create gating strategy selector
- [ ] Build lesson preview mode
- [ ] Add path preview mode
- [ ] Implement publish confirmation dialog

### Testing & Polish
- [ ] Test all CRUD operations
- [ ] Test drag-and-drop functionality
- [ ] Test editor content persistence
- [ ] Test publishing workflow
- [ ] Add loading states and error handling
- [ ] Implement optimistic updates
- [ ] Add success/error toast notifications
