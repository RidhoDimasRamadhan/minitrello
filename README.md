# MiniTrello

A full-featured project management application inspired by Trello, built with modern web technologies. Organize your tasks with workspaces, boards, lists, and cards with drag-and-drop functionality.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)

## Features

### Core
- **Workspaces** - Create and manage multiple workspaces with team members
- **Boards** - Kanban-style boards with customizable background colors
- **Lists** - Organize cards into columns with drag-and-drop reordering
- **Cards** - Rich task cards with multiple features (see below)
- **Drag & Drop** - Smooth drag-and-drop for cards and lists using dnd-kit

### Card Features
- **Description** - Add detailed descriptions to cards
- **Labels** - Color-coded labels for categorization
- **Due Dates** - Set deadlines with overdue/today indicators
- **Checklists** - Track subtasks with progress bar
- **Comments** - Collaborate with team through comments
- **Assignees** - Assign members to cards
- **Cover Colors** - Visual card covers
- **Activity Log** - Track all changes and actions

### User Management
- **Authentication** - Register/Login with credentials or Google OAuth
- **Role-Based Access** - Workspace roles (Owner/Admin/Member) and Board roles (Admin/Member/Viewer)
- **Member Invitation** - Invite members via email

### Additional
- **Search** - Full-text search across all cards
- **Board Templates** - Quick-start with pre-built templates (Kanban, Project Management, Bug Tracking, Sprint)
- **Star/Favorite** - Bookmark important boards
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth.js v5 (Credentials + Google OAuth) |
| UI Components | shadcn/ui (base-ui) + Tailwind CSS v4 |
| Drag & Drop | dnd-kit |
| State Management | Zustand + TanStack Query |
| Validation | Zod |
| Notifications | Sonner |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RidhoDimasRamadhan/minitrello.git
   cd minitrello
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/minitrello?schema=public"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed demo data (optional)**
   ```bash
   npm run db:seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Account

After seeding, you can login with:
- **Email:** `demo@minitrello.com`
- **Password:** `demo123`

## Project Structure

```
src/
├── actions/          # Server Actions (CRUD operations)
├── app/
│   ├── (auth)/       # Login & Register pages
│   ├── (platform)/   # Authenticated pages
│   │   ├── board/    # Kanban board view
│   │   ├── dashboard/# Home dashboard
│   │   ├── search/   # Search page
│   │   ├── templates/# Board templates
│   │   └── workspace/# Workspace management
│   └── api/          # API routes (NextAuth)
├── components/
│   ├── board/        # Board, List, Card components
│   ├── card/         # Card detail modal components
│   ├── dashboard/    # Sidebar, Navbar
│   ├── providers/    # Context providers
│   ├── search/       # Search components
│   ├── ui/           # shadcn/ui components
│   └── workspace/    # Workspace components
├── hooks/            # Custom React hooks
├── lib/              # Utilities, auth config, validators
└── types/            # TypeScript type definitions
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio (GUI) |
| `npm run db:migrate` | Run database migrations |

## Database Schema

The application uses 19 database tables including:

- **User, Account, Session** - Authentication & user management
- **Workspace, WorkspaceMember** - Team workspaces with roles
- **Board, BoardMember, BoardStar** - Kanban boards with permissions
- **List** - Board columns with position ordering
- **Card, CardAssignee, CardLabel** - Task cards with assignments
- **Label** - Color-coded labels per board
- **Checklist, ChecklistItem** - Subtask tracking
- **Comment** - Card discussions
- **Attachment** - File attachments
- **Activity** - Audit log for all actions

## License

This project is for portfolio/educational purposes.
