# Creator Dashboard - Architecture & User Flows

## System Architecture

### Component Hierarchy

```
CreatorDashboard (Layout)
├── Sidebar Navigation
│   ├── Dashboard Home
│   ├── My Learning Paths
│   ├── Media Library
│   ├── Video Intelligence
│   ├── Analytics
│   └── Settings
├── Header
│   ├── Breadcrumbs
│   ├── Quick Actions (New Path, Preview)
│   └── User Menu
└── Main Content Area
    ├── Dashboard Home View
    ├── Learning Paths List View
    ├── Path Editor View
    │   ├── Module List Panel
    │   ├── Lesson Editor Panel
    │   └── Settings Panel
    ├── Media Library View
    ├── Video Intelligence View
    └── Analytics View
```

### Database Operations (tRPC Procedures)

**Learning Paths:**
- `paths.list` - Get all paths for creator
- `paths.create` - Create new path
- `paths.get` - Get single path with modules
- `paths.update` - Update path metadata
- `paths.delete` - Delete path
- `paths.publish` - Toggle published status
- `paths.duplicate` - Clone existing path

**Modules:**
- `modules.list` - Get modules for path
- `modules.create` - Create new module
- `modules.get` - Get single module with lessons
- `modules.update` - Update module
- `modules.delete` - Delete module
- `modules.reorder` - Update order indices

**Lessons:**
- `lessons.list` - Get lessons for module
- `lessons.create` - Create new lesson
- `lessons.get` - Get single lesson with content
- `lessons.update` - Update lesson content
- `lessons.delete` - Delete lesson
- `lessons.reorder` - Update order indices
- `lessons.autosave` - Periodic content save

**Media:**
- `media.list` - Get creator's media
- `media.upload` - Upload file to S3
- `media.delete` - Delete media file
- `media.update` - Update metadata

## User Flows

### Flow 1: Create New Learning Path

**Steps:**
1. Click "New Learning Path" button
2. Modal opens with form:
   - Title (required)
   - Slug (auto-generated, editable)
   - Description
   - Difficulty level
   - Tags
   - Thumbnail image
3. Submit form → `paths.create`
4. Redirect to Path Editor
5. Empty state shows "Add your first module"

**UI Components:**
- Button (trigger)
- Modal/Dialog
- Form with validation
- Image upload
- Tag input
- Toast notification (success/error)

### Flow 2: Edit Path Structure

**Steps:**
1. Navigate to path from list
2. Path Editor loads with:
   - Left panel: Module list
   - Center: Selected module/lesson
   - Right: Settings
3. Add module: Click "+ Module" → Inline form
4. Edit module: Click module → Form in right panel
5. Reorder modules: Drag and drop
6. Add lesson to module: Click "+ Lesson" → Inline form
7. Edit lesson: Click lesson → Lesson editor loads
8. Reorder lessons: Drag and drop within module
9. Changes auto-save with indicator

**UI Components:**
- Split panel layout
- Drag-and-drop lists
- Inline forms
- Collapsible sections
- Auto-save indicator
- Breadcrumb navigation

### Flow 3: Create/Edit Lesson Content

**Steps:**
1. Click lesson in module list
2. Lesson editor loads:
   - Full-width TipTap editor
   - Floating toolbar
   - Content block palette (left)
   - Lesson settings (right, collapsible)
3. Add content:
   - Type text directly
   - Use toolbar for formatting
   - Type `/` for slash commands
   - Click block palette to insert
4. Configure blocks:
   - Click block → Settings appear
   - Upload images → S3
   - Paste YouTube URL → Auto-embed
5. Auto-save every 3 seconds
6. Preview button → See learner view
7. Back to path → Returns to path editor

**UI Components:**
- TipTap editor
- Floating toolbar
- Slash command menu
- Block palette sidebar
- Settings panel
- Image upload dialog
- Video embed dialog
- Auto-save indicator
- Preview mode

### Flow 4: Publish Learning Path

**Steps:**
1. In path editor, click "Publish Settings"
2. Panel opens with options:
   - Visibility: Public/Private
   - Gating: None/Signup/Partial Free
   - If Partial Free: Select free lessons
   - SEO: Meta title, description
   - Social: OG image
3. Click "Publish" button
4. Confirmation dialog:
   - Shows summary
   - "Are you sure?"
   - "Publish" / "Cancel"
5. On confirm → `paths.publish`
6. Toast: "Path published successfully"
7. Badge changes to "Published"
8. View Live button appears

**UI Components:**
- Settings panel
- Toggle switches
- Lesson selector (multi-select)
- Image upload (OG image)
- Confirmation dialog
- Toast notification
- Status badge

### Flow 5: Manage Media Library

**Steps:**
1. Navigate to Media Library
2. Grid view of uploaded media
3. Filters: Type (image/video/doc), Tags, Date
4. Search by filename
5. Upload new:
   - Click "Upload" button
   - File picker or drag-and-drop
   - Upload to S3 → `media.upload`
   - Progress indicator
   - Success → Adds to grid
6. Edit media:
   - Click media → Details panel
   - Edit: Title, Alt text, Tags
   - Save → `media.update`
7. Delete media:
   - Click delete icon
   - Confirmation dialog
   - Confirm → `media.delete`
8. Use in lesson:
   - Click "Insert" button
   - Copies URL to clipboard
   - Or: Opens in editor if called from editor

**UI Components:**
- Grid layout with cards
- Filter dropdowns
- Search input
- Upload button
- Drag-and-drop zone
- Progress bar
- Details panel
- Tag input
- Confirmation dialog

## Page Layouts

### Dashboard Home
```
┌─────────────────────────────────────────────┐
│ Welcome back, [Name]!                       │
├─────────────────────────────────────────────┤
│ Quick Stats                                 │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │ 12   │ │ 45   │ │ 234  │ │ 89%  │       │
│ │Paths │ │Module│ │Enroll│ │Compl │       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
├─────────────────────────────────────────────┤
│ Recent Activity                             │
│ • Student completed "Docker Basics"         │
│ • New enrollment in "Python 101"           │
│ • Draft saved: "Advanced React"            │
├─────────────────────────────────────────────┤
│ Quick Actions                               │
│ [New Learning Path] [Upload Media]          │
│ [Analyze Video] [View Analytics]            │
└─────────────────────────────────────────────┘
```

### Learning Paths List
```
┌─────────────────────────────────────────────┐
│ My Learning Paths        [+ New Path]       │
├─────────────────────────────────────────────┤
│ [Search...] [Filter: All ▼] [Sort: Recent ▼]│
├─────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐   │
│ │ [Thumbnail]     │ │ [Thumbnail]     │   │
│ │ Docker Mastery  │ │ Python 101      │   │
│ │ Published • 12  │ │ Draft • 8 mods  │   │
│ │ modules         │ │                 │   │
│ │ 234 enrolled    │ │ 0 enrolled      │   │
│ │ [Edit] [•••]    │ │ [Edit] [•••]    │   │
│ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────┘
```

### Path Editor
```
┌──────────┬────────────────────────┬──────────┐
│ Modules  │ Lesson Editor          │ Settings │
├──────────┼────────────────────────┼──────────┤
│ ▼ Intro  │ # Getting Started      │ Lesson   │
│  • Lesson│                        │ Title:   │
│    1     │ Welcome to this course │ [input]  │
│  • Lesson│ ...                    │          │
│    2     │                        │ Slug:    │
│          │ [TipTap Editor]        │ [input]  │
│ ▼ Basics │                        │          │
│  • Lesson│                        │ Duration:│
│    3     │                        │ [15 min] │
│  • Lesson│                        │          │
│    4     │                        │ [Save]   │
│          │                        │          │
│ [+ Module│                        │          │
└──────────┴────────────────────────┴──────────┘
```

## State Management Strategy

### Local State (useState)
- Form inputs
- UI toggles (sidebar open/closed)
- Modal visibility
- Drag state

### Server State (tRPC + React Query)
- Learning paths list
- Path/module/lesson data
- Media library
- Analytics data

### Optimistic Updates
- Reordering modules/lessons
- Toggling published status
- Inline edits (titles, descriptions)
- Bookmarking

### Autosave Strategy
```typescript
// Debounced autosave
const debouncedSave = useMemo(
  () => debounce((content) => {
    saveMutation.mutate({ lessonId, content })
  }, 3000),
  [lessonId]
)

// On editor change
editor.on('update', ({ editor }) => {
  debouncedSave(editor.getJSON())
})
```

## Navigation Structure

```
/creator
  /dashboard              → Dashboard Home
  /paths                  → Learning Paths List
  /paths/new              → Create New Path Modal
  /paths/:pathId          → Path Editor
  /paths/:pathId/settings → Path Settings
  /media                  → Media Library
  /video-intelligence     → Video Analysis
  /analytics              → Analytics Dashboard
  /settings               → Creator Settings
```

## Error Handling

### Network Errors
- Toast notification with retry button
- Offline indicator in header
- Queue failed mutations for retry

### Validation Errors
- Inline form validation
- Required field indicators
- Clear error messages
- Focus on first error field

### Permission Errors
- Redirect to login if session expired
- Show "Access Denied" for unauthorized actions
- Graceful degradation for missing features

## Performance Optimizations

### Code Splitting
- Lazy load TipTap editor
- Lazy load media library
- Lazy load analytics charts

### Data Fetching
- Prefetch on hover (path cards)
- Infinite scroll for large lists
- Pagination for media library

### Caching
- Cache path list (5 minutes)
- Cache media library (10 minutes)
- Invalidate on mutations

### Rendering
- Virtualize long module/lesson lists
- Debounce search inputs
- Memoize expensive computations

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Escape to close modals/dialogs
- Arrow keys for drag-and-drop alternative
- Slash command menu keyboard navigable

### Screen Readers
- Proper heading hierarchy
- ARIA labels for icon buttons
- Live regions for notifications
- Form field labels and descriptions

### Visual
- High contrast mode support
- Focus indicators
- Error states clearly marked
- Loading states announced

## Next Implementation Steps

1. **Setup tRPC procedures** for all CRUD operations
2. **Create layout components** (DashboardLayout, Sidebar, Header)
3. **Build Learning Paths List** with cards and filters
4. **Implement Path Editor** with split panel layout
5. **Integrate TipTap** with basic extensions
6. **Add drag-and-drop** with @dnd-kit/core
7. **Build publishing flow** with settings panel
8. **Add media library** with upload functionality
9. **Test workflows** end-to-end
10. **Polish UI** and add loading/error states
