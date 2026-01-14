# Pertamak Frontend - Custom UI Component Migration

## Goal
Replace unstable HeroUI v3 components with custom-built Tailwind CSS components (Button, Modal, Card, Spinner, Chip, Avatar, Input, TextArea, Select) across the application.

## Constraints/Assumptions
- Project uses React 19+ and Tailwind CSS v4 ✅
- Design vibe: Mobile-first, premium, sky blue color scheme (Kitabisa-inspired)
- Transitioning away from HeroUI due to stability issues in v3 beta.

## Key Decisions
- Build core UI components manually in `src/components/ui/`
- Refactor all pages (`KegiatanPage`, `App`, etc.) to use custom components
- Ensure type safety and consistent design tokens

## State
- Done:
  - Created core UI components: `Button`, `Modal`, `Card`, `Spinner`, `Chip`, `Avatar`, `Input`, `Select`, `ImageUploader`
  - Refactored `KegiatanPage` and `JadwalPiketSection` to use custom components
  - Fixed TypeScript errors in `Modal`, `Button`, `Input`, and `ImageUploader`
  - Installed and configured `spatie/laravel-permission`
  - Created `RoleSeeder` and defined `admin` & `karyawan` roles
  - Seeded sample users: `admin@pertamak.com` and `karyawan@pertamak.com`
- Now:
  - Monitoring for further type issues or UI improvements
- Next:
  - Refactor `LoginPage.tsx` (if needed) to use custom components
  - Enhance `KaryawanSection`
  - Implement role-based access control in the frontend

## Open Questions
- None

## Working Set
- `frontend/src/components/ui/` - Directory for custom components
- `frontend/src/pages/KegiatanPage.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/components/KegiatanCard.tsx`
