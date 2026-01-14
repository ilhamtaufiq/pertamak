# CONTINUITY LEDGER

## Goal
Building a mobile-first UI for UPTD Pertamak (Kitabisa-inspired) with a robust Kegiatan (Activity) management system.

## Constraints/Assumptions
- **Tech Stack:** React, TypeScript, Tailwind CSS, TanStack Query.
- **Environment:** Windows, Laravel backend (laragon).

## Key Decisions
- **Design Tokens:** Use semantic theme tokens (`bg-card`, `text-card-foreground`, `border-border`, etc.) instead of hardcoded colors or generic Tailwind classes like `bg-white` or `default-*`.
- **Filtering:** Date filtering is handled on the client side for now using `useMemo`.

## State
- **Done:**
  - Custom UI components (Card, Button, Select, etc.) implemented.
  - Kegiatan Page with CRUD, Detail Modal, and PDF Export.
  - Jadwal Piket with Date parameter and Filters (Day, Month, Year).
  - Fix for Home Navigation.
- **Now:** All features verified and completed.
- **Next:** Waiting for user feedback.

## Critical Rules (DO NOT FORGET)
- **NO HARDCODED COLORS:** Never use `bg-white`, `text-black`, or hardcoded hex codes in components. Always use semantic variables defined in `index.css`.
- **THEME CONSISTENCY:** Ensure all UI elements (dropdowns, modals, buttons) look correct in both Light and Dark mode patterns.
- **MOBILE-FIRST:** Design for mobile screens first, then scale up.

## Working Set
- `frontend/src/pages/KegiatanPage.tsx`
- `frontend/src/components/ui/Select.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/index.css`
