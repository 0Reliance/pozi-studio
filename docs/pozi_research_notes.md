# POZI STUDIO Research & Analysis

## Initial Observations from Live Site

### Platform Name & Branding
- **Brand**: ORELIANCE LAB (with POZI Studio as the underlying platform)
- **Tagline**: "Digital Independence"
- **Powered by**: POZI

### Main Navigation Structure
1. **Home** - Dashboard/landing
2. **Browse Curriculum** - Course catalog
3. **Help** - Support resources
4. **Login/Sign up** - Authentication system

### Learning Paths Page Features

#### Core Functionality
- **Learning Paths**: "Structured learning journeys to guide your homelab education"
- Search functionality for paths
- Filter system with dropdowns:
  - All Audiences (Beginner, Intermediate, Mixed, etc.)
  - All Status (Not Started, In Progress, Completed)
  - All Tags (topic-based filtering)

#### Path Card Information Display
Each learning path card shows:
- **Title** (e.g., "Docker Mastery: Complete Journey")
- **Difficulty Level** (Beginner, Intermediate, Mixed)
- **Description** (comprehensive overview of what's covered)
- **Module Count** (e.g., "9 modules")
- **Estimated Time** (e.g., "43h")
- **Progress Indicator** (0/X format)
- **Completion Status** (percentage)
- **Tags** (technology/topic tags like "docker", "kubernetes", "containers")
- **Hero Image** (visual representation of the topic)

#### Sample Learning Paths Identified
1. **Homelab Fundamentals: Complete Beginner Path** (8 modules, 32h, Beginner)
2. **Docker Mastery: Complete Journey** (9 modules, 43h, Intermediate)
3. **Local AI Stack: Complete Infrastructure** (12 modules, 59h, Intermediate)
4. **Storage & Data: Complete Infrastructure** (15 modules, 68h, Intermediate)
5. **Complete Homelab Stack** (16 modules, 64h, Mixed)
6. **Networking: Complete Professional Stack** (17 modules, 72h, Intermediate)
7. **Self-Hosted Apps Starter Pack** (13 modules, 45h, Intermediate)
8. **Monitoring & Observability: Complete Stack** (15 modules, 52h, Intermediate)
9. **Homelab Foundations: Hardware to First Services** (11 modules, 45h, Beginner)
10. **Media Server Mastery** (10 modules, 42h, Beginner)
11. **Privacy & Security Essentials** (13 modules, 46h, Beginner)

#### User Experience Features
- Guest browsing with prompt to sign up for progress tracking
- Visual card-based layout with hero images
- Tag-based organization
- Progress tracking system
- Time estimates for completion

---

## Next Steps
- Explore individual lesson/module pages
- Check dashboard functionality
- Analyze content creation interface
- Review video intelligence features
- Examine creator library

## Learning Path Detailed View (Path Visualizer)

### Two View Modes
1. **Graph View** - Visual node-based representation of modules with connections
2. **List View** - Traditional list layout of modules

### Path Header Information
- Title and description
- Difficulty level badge
- Module count and total time estimate
- Progress tracking (X/Y Modules, % Complete)
- Tags for categorization
- "Continue Learning" CTA button
- Visual legend (Not Started, In Progress, Completed)

### Module Structure
Each module displays:
- Module number (#1, #2, etc.)
- Module title
- Brief description
- Status indicator (Not Started/In Progress/Completed)
- Clickable to access full lesson content

---

## Lesson Viewer (Module Content Page)

### Content Organization
Lessons are organized into numbered sections with different content types:

#### Section Types Identified
1. **Lab Recipe** - Hands-on practical content with code examples
2. **Resource Cards** - Curated external resources and links

### Content Features

#### Rich Text & Formatting
- Headers and subheaders for organization
- Paragraphs with inline code formatting
- Bold text for emphasis
- Bulleted and numbered lists

#### Code Blocks
- Syntax-highlighted code blocks
- Multiple languages supported (YAML, Bash, etc.)
- Copy-to-clipboard functionality (implied)
- Comments within code for explanation

#### Interactive Elements
- "Sign up to track your progress through this lesson" CTAs between sections
- Previous Module / Next Module navigation buttons
- Breadcrumb navigation (Path > Module)

#### Content Types Within Lessons
1. **Explanatory text** - Concepts and theory
2. **Installation instructions** - Step-by-step setup
3. **Configuration examples** - YAML, config files
4. **Command references** - CLI commands with explanations
5. **Best practices** - Security, performance tips
6. **Troubleshooting guides** - Common issues and solutions
7. **Resource links** - External documentation and tools
8. **Next steps** - Progression suggestions

#### Visual Design
- Dark theme with teal/cyan accent colors
- Card-based section layout
- Clear visual hierarchy
- Numbered sections for easy reference
- Tags and badges for categorization

---

## Key Observations from Lesson Content

### Content Structure Pattern
Each lesson follows a progressive structure:
1. **Fundamentals** - Basic concepts and installation
2. **Practical Examples** - Real-world implementations
3. **Best Practices** - Production-ready patterns
4. **Advanced Features** - Complex scenarios
5. **Resources & Next Steps** - External links and progression

### Educational Approach
- Hands-on, practical focus ("Lab Recipe")
- Code-first examples
- Progressive complexity
- Real-world scenarios (WordPress stack, media servers)
- Security and production considerations included
- Clear troubleshooting guidance
- External resource curation


## Learner Dashboard Features

### Dashboard Overview Stats
The dashboard provides at-a-glance metrics:
- **Total Modules** - Overall content available
- **Completed** - Number of finished modules
- **In Progress** - Currently active modules
- **Completion Percentage** - Overall progress indicator with visual progress bar

### Continue Learning Section
- Shows the last module/lesson the student was working on
- Displays lesson title, description, and progress percentage
- Quick "Continue" button for immediate resumption

### Recommended Next (AI-Powered)
- AI-powered suggestions based on learning progress
- Personalized recommendations for next steps
- Empty state messaging when no data available yet

### My Learning Paths
- Visual grid of all enrolled learning paths
- Each path shows:
  - Hero image
  - Title
  - Progress indicator (X/Y modules completed)
  - Clickable to access the path

### Recent Notes Feature
A sophisticated note-taking system with different note types:
1. **Insight** - Key learnings and discoveries
2. **Todo** - Action items and tasks
3. **Question** - Questions for later research
4. **Code Snippet** - Reusable code examples

Each note displays:
- Note type badge
- Content preview (truncated)
- Tags for organization
- Timestamp (relative, e.g., "30 days ago")

### Bookmarks System
- Save content for quick access
- Categories: Page, ContentItem, Creator
- Count indicators for each bookmark type

### Key UX Patterns
- Card-based layout throughout
- Dark theme with teal/cyan accents
- Progress bars and percentage indicators
- Tag-based organization
- Relative timestamps for human-friendly dates
- Visual hierarchy with icons and badges

---

## Navigation Structure (Sidebar)

### Learning Section
- My Dashboard
- Browse Paths

### Research & Discovery
- Discover Creators
- Video Intelligence
- Enrich Profiles

### Content Hubs
- Creator Library
- Video Library
- Coverage Report

### Content Creation
- Generation (with "Creator" badge)

This reveals a **dual-purpose platform**: both for learners AND for content creators.


## Video Intelligence (AI-Powered Content Analysis)

This is a **key differentiator** - the platform uses AI to analyze YouTube videos and extract structured learning content.

### Analytics Dashboard
Displays aggregate metrics across all analyzed videos:
- **Videos Analyzed** - Total count (13 in example)
- **Transcript Words** - Total words transcribed (2,410)
- **Commands Extracted** - CLI commands identified (63)
- **Concepts Identified** - Key concepts detected (62)

### Search Functionality
- Search across video transcripts, chapters, commands, and concepts
- Scope filtering (All, specific categories)
- Full-text search across analyzed content

### Bulk Analysis Feature
- "Analyze Videos" button for batch processing
- Automated video analysis workflow

### Analyzed Video Cards
Each analyzed video shows:
- **Thumbnail** - Video preview image
- **Title** - Video name
- **Status Badge** - "Analyzed" indicator
- **Difficulty Level** - Beginner/Intermediate/Advanced
- **Chapters** - Number of chapters identified (e.g., "5 chapters")
- **Commands** - Number of CLI commands extracted (e.g., "4 commands")
- **Analysis Date** - When the video was processed

### Example Videos Analyzed
- Nextcloud - Self-Hosted Cloud Storage
- WireGuard VPN on Docker - Secure Remote Access
- Grafana & Prometheus - Homelab Monitoring Stack
- Stable Diffusion WebUI - Self-Hosted AI Art
- Home Assistant on Docker - Complete Setup

### AI Capabilities Implied
1. **Transcript extraction** from YouTube videos
2. **Chapter detection** - Automatic segmentation
3. **Command extraction** - Identifies CLI commands from transcripts
4. **Concept identification** - Extracts key learning concepts
5. **Metadata generation** - Difficulty level, topics, tags

This feature enables educators to **rapidly convert video content into structured lessons** without manual transcription and organization.


## Export Gallery (Content Publishing System)

This feature allows creators to export their curriculum pages as **production-ready HTML/CSS/JS bundles** for deployment.

### Export Status Types
1. **Exported** - Successfully exported and available (green badge)
2. **Ready** - Ready to be exported (gray badge)
3. **Building...** - Currently being processed

### Page Types
- **Creator** - Creator profile pages
- **Topic** - Individual lesson/topic pages

### Filter System
- Search by page name
- Filter by module
- Filter by type (Creator/Topic)
- Filter by status (Exported/Ready/Building)
- "Select All" bulk selection

### Export Card Information
Each exportable page shows:
- **Thumbnail** - Visual preview
- **Title** - Page name
- **Type Badge** - Creator/Topic
- **Status Badge** - Exported/Ready/Building
- **Module** - Parent module name
- **Last Exported** - Timestamp
- **Deployed** - Deployment timestamp (if applicable)
- **Export Button** - Individual export action
- **Copy Icon** - Likely for copying export code/URL

### Deployment Tracking
- Shows when content was last exported
- Shows when content was deployed
- Tracks export history

### Massive Content Library
The platform has **100+ individual topic pages** covering:
- Docker ecosystem (basics, compose, networking, volumes, security, swarm, troubleshooting)
- Kubernetes cluster setup
- Local AI stack (Ollama, Stable Diffusion, ComfyUI, LM Studio, Whisper, RAG systems)
- Storage solutions (TrueNAS, ZFS, MinIO, backup automation)
- Networking (pfSense, Tailscale, Traefik, Nginx, Cloudflare, WireGuard)
- Monitoring (Grafana, Prometheus, Loki, Netdata, Uptime Kuma)
- Media servers (Plex, Jellyfin, Sonarr, Radarr, Bazarr)
- Self-hosted apps (Nextcloud, Vaultwarden, Paperless-ngx, Pi-hole, Home Assistant)
- Security (Authentik, Fail2ban, CrowdSec, LUKS encryption, Wazuh)

This demonstrates the platform's capability to manage and export **large-scale curriculum libraries**.

