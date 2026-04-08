# React Native Mobile Roadmap - Pertamak Project

## 1. Project Goal & Audience
- **What:** A premium, "full feature parity" mobile version (Auth, Kegiatan, Media Library, Maps, User Management) of the Pertamak web platform.
- **Why:** To provide mobile-native field utility for tracking activities, uploading media, and real-time mapping for workers on-the-go.
- **Who:** A small team (under 20 users) of administrators and employees (karyawan).
- **Core Vibe:** Premium, modern, sky-blue, and glassmorphic (consistent with the Kitabisa-inspired web design).

## 2. Technical Architecture
| Component | Implementation |
| :--- | :--- |
| **Framework** | **Expo SDK 50+** (Managed Workflow with Config Plugins) |
| **Navigation** | **Expo Router v3** (Tab-based with Stack sub-navigation) |
| **Styling** | **NativeWind v5** (Unified Tailwind CSS v4 design tokens) |
| **Data Sync** | **React Query v5** (Offline-first, background syncing) |
| **State** | **Zustand** (Lightweight local UI state) |
| **Offline Storage** | **AsyncStorage** (Caching) & **SecureStore** (Credentials) |
| **Iconography** | **Lucide-native** |
| **Animations** | **React Native Reanimated v3** |

## 3. Core Feature Specifications
### Phase 1: Authentication & Navigation
- [x] Implement Root Auth Guard (Protect routes based on token presence). ✅
- [x] Native Login screen with error handling and glassmorphic inputs. ✅
- [x] Bottom Tab Navigation (Home, Media, Maps, Profile). ✅

### Phase 2: Kegiatan (Activity Tracking)
- [x] Activities List with **FlashList** for maximum performance. ✅
- [ ] Activity Details view with optimistic state updates.
- [x] Real-time activity status indicators. ✅

### Phase 3: Media Library (Organizer)
- [ ] **expo-camera** & **expo-media-library** integration.
- [ ] Drive-like folder navigation and file browsing.
- [ ] Background image upload service with progress tracking.

### Phase 4: Online Users & Maps
- [ ] **react-native-maps** integration for real-time user location.
- [ ] Custom map markers based on user roles and status.

### Phase 5: User Management & Profile
- [ ] Admin-only user creation and role management.
- [ ] Profile settings and password management.

## 4. Deployment & Distribution
- **Builds:** Managed via **EAS Build** (Internal Distribution profies for testing).
- **Release:** **EAS Submit** to iOS App Store (ASC) and Google Play Store.
- **Maintenance:** **EAS Update** for over-the-air (OTA) bug fixes.

## 5. Decision Log
- **Architecture Choice:** Option 1 (Fully Native Modular Architecture). Provides the most premium experience and best offline utility for under 20 users.
- **Data Handling:** React Query v5 chosen over Redux for its superior out-of-the-box offline caching and syncing capabilities.
- **Styling Choice:** NativeWind v5 for direct architectural parity with the Tailwind-based web frontend.
- **Distribution:** EAS Cloud Build for automated CI/CD instead of manual native builds.

---
*Created via Brainstorming session on 2026-04-02*
