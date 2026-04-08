# Pertamak Frontend - Custom UI Component Migration

## Goal
Replace unstable HeroUI v3 components with custom-built Tailwind CSS components across the application, and build a full-featured premium React Native mobile version for the team.

## Constraints/Assumptions
- Project uses React 19+ and Tailwind CSS v4 ✅ (Web & Mobile)
- Design vibe: Mobile-first, premium, sky blue color scheme (Kitabisa-inspired)
- SDK 49+ Geocoding issues: Switched to Manual + GPS Auto-detection. ✅

## Key Decisions
- Build core UI components manually in `src/components/ui/`
- Navigation: Focused 3-tab system (Home, Kegiatan, Profile). ✅
- State Management: zustand + React Query. ✅
- Design System: Documented in `mobile/design-system-screen.md` for consistency. ✅
- Resilient Storage: AsyncStorage fallback for credentials. ✅

## State
- Done:
  - Created core UI components: `Button`, `Modal`, `Card`, `Spinner`, `Chip`, `Avatar`, `Input`, `Select`, `ImageUploader`
  - Mobile Phase 1: Completed Auth & Navigation. ✅
  - **Mobile Phase 2-3: Core Operations Redesign** ✅
    - New Nav Architecture: Home, Kegiatan, Profile (Glassmorphic Island). ✅
    - Home Tab: Integrated Service Grid (4 Primary Tools) & Latest 5 Reports feed. ✅
    - Kegiatan Tab: Dedicated report catalog with search and filters. ✅
    - Create Report Screen: Redesigned with resilient GPS location & multi-image documentation. ✅
    - Added `expo-image-picker` for field-ready reporting. ✅
  - **Fixed Android CSS Bundling Error:** ✅
    - Simplified `global.css` imports by removing `layer()` specifiers that were failing in `lightningcss`.
    - Unwrapped `@theme` block for better parser compatibility.
- Now:
  - Testing real API connectivity for batch image uploads on mobile.
  - Finalizing "Organisator" (Media Gallery) UI for Phase 3.
- Next:
  - Phase 3: Implement real Folder-based navigation in Media Tab.
  - Phase 4: Implement Map-centric user tracking in Maps Tab.
  - Add remaining TW component wrappers for common UI needs.

## Open Questions
- None

## Working Set
- `mobile/src/app/(tabs)/_layout.tsx`
- `mobile/src/app/(tabs)/index.tsx`
- `mobile/src/app/(tabs)/kegiatan.tsx`
- `mobile/src/app/kegiatan/create.tsx`
- `mobile/src/hooks/useKegiatan.ts`
- `mobile/src/components/features/KegiatanCard.tsx`
- `CONTINUITY.md`
