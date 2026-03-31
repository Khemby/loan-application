# LoanFlow

A real-time loan pipeline dashboard for mortgage companies. Loan officers can track where each loan sits in the process, drag loans between stages, and see live updates when colleagues make changes.

## Tech Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** with strict mode
- **Supabase** (Postgres, Auth, Realtime)
- **Prisma** (ORM, migrations, type-safe queries)
- **Zod** (schema validation at every boundary)
- **shadcn/ui** + **Tailwind CSS** (dark mode UI)
- **@dnd-kit** (drag-and-drop)
- **Vitest** (unit testing)

## Features

- Kanban-style pipeline board with 6 stages (Lead, Application, Processing, Underwriting, Approved, Closed)
- Real-time updates via Supabase Realtime (no polling)
- Drag-and-drop to move loans between stages with optimistic updates
- Role-based access (Admin, Loan Officer) via Supabase Auth
- Color-coded urgency indicators (green/yellow/red) based on days in stage
- Loan detail view with activity timeline
- Production-grade error handling and validation

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project ([supabase.com](https://supabase.com))

### Setup

1. Clone the repo:
   ```bash
   git clone git@github.com:Khemby/loan-application.git
   cd loan-application
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   DATABASE_URL=your_pooled_connection_string
   DIRECT_URL=your_direct_connection_string
   ```

4. Run Prisma migrations and seed:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- **Loan Officer:** lo@demo.com / demo1234
- **Admin:** admin@demo.com / demo1234

## Project Structure

```
src/app/           - Next.js App Router pages and layouts
src/components/    - React components (pipeline board, loan card, etc.)
src/lib/           - Utilities, Supabase clients, Prisma client, Zod schemas
src/actions/       - Server Actions for data mutations
prisma/            - Prisma schema and seed script
__tests__/         - Vitest unit tests
```

## Scripts

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npx vitest         # Run unit tests
```
