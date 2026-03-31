# TODOS

## TODO 1: Add Realtime publication check to seed script
**Priority:** High (silent failure of headline feature)
**What:** Add a SQL check in `prisma/seed.ts` that verifies the `loans` table is in the `supabase_realtime` publication, and runs `ALTER PUBLICATION supabase_realtime ADD TABLE loans` if not.
**Why:** Without this, Supabase Realtime silently receives no events. The board loads and drag-and-drop works, but nothing updates across tabs. The wow factor is completely broken with no error message.
**How:** Use `prisma.$executeRawUnsafe` to query `pg_publication_tables` and conditionally add the table.
**Depends on:** Prisma schema + Supabase project must exist.

## TODO 2: Add E2E tests for the critical real-time path
**Priority:** Medium (testing depth for portfolio)
**What:** 4 Playwright tests: login flow, pipeline board load with correct columns, drag-and-drop stage change, and real-time cross-tab update.
**Why:** Unit tests verify Server Actions work, but only E2E can verify that dragging a card in one tab moves it in another. That's the demo moment.
**How:** Set up Playwright, create test Supabase project or use the dev instance with seed data.
**Depends on:** Working app with Supabase Realtime. Do after core features ship.

## TODO 3: Responsive/mobile layout for pipeline board
**Priority:** Low (polish)
**What:** Add responsive layout for the 6-column Kanban board on mobile. Either stack columns vertically or use horizontal scroll with a stage selector dropdown.
**Why:** Portfolio pieces get shared and checked on mobile. Currently desktop-only.
**How:** Use Tailwind responsive breakpoints. Consider a stage selector dropdown on mobile that shows one column at a time.
**Depends on:** Pipeline board component must be built first.
