# Pertamak Design System v1.0

## Philosophy
**"Modern, Professional, and Trustworthy"**
Inspired by modern Indonesian platforms like Kitabisa and Gojek. The design focuses on a mobile-first experience using high-contrast typography, generous rounded corners, and subtle glassmorphism effects to create a premium feel.

---

## 🎨 Color Palette

### Primary & Brand
- **Primary (Sky Blue):** `#1bbaf5` (Vibrant, trustworthy sky blue)
- **Primary Foreground:** `#ffffff`
- **Success:** `#22c55e` (Emerald green for active states)
- **Destructive:** `#ef4444` (Soft red for danger actions)
- **Warning:** `#f59e0b` (Amber for alerts)

### Background & Surface
- **Background:** `#f8fafc` (Off-white for a clean look)
- **Foreground:** `#0f172a` (Deep slate for text)
- **Card:** `#ffffff` (Pure white for surface depth)
- **Muted:** `#f1f5f9` (Light gray for disabled or background elements)
- **Muted Foreground:** `#64748b` (Slate gray for secondary labels)

### Border & Accents
- **Border:** `#e2e8f0` (Subtle boundary between elements)
- **Sky Blue Accents:** `rgba(27, 186, 245, 0.05)` to `rgba(27, 186, 245, 0.2)` (Used for badges and bento grid backgrounds)

---

## 📐 Spacing & Radii

### Radii
- **SM:** `0.375rem` (6px)
- **MD:** `0.5rem` (8px)
- **LG:** `0.75rem` (12px)
- **XL:** `1rem` (16px)
- **2XL:** `1.25rem` (20px)
- **3XL:** `1.5rem` (24px) - *Used for main dashboard containers and bento grids.*

### Shadows
- **Card Shadow:** `0 2px 8px rgba(152, 152, 152, 0.15)`
- **Nav/Floating Shadow:** `0 20px 50px rgba(0, 0, 0, 0.15)`
- **Bento Shadow:** Soft `shadow-sm` with `shadow-black/5`.

---

## 🧩 Component Patterns

### 1. Floating Island (Glassmorphism)
The app uses "Floating Islands" for its main navigation anchors (Header and BottomNav).
- **Styling:** `bg-white/70`, `backdrop-blur-2xl`, `border border-white/40`.
- **Usage:** Sticky Header (Top) and Floating Nav (Bottom).
- **Z-Index Hierarchy:** 
  - Header: `z-40`
  - BottomNav: `z-50`
  - Modals: `z-[60]`
  - Notification/Detail Overlays: `z-[70]`

### 2. Bento Grid Dashboard
Diverging from linear layouts, the dashboard uses a Bento Grid to prioritize information weight.
- **Grids:** 6-column grid system.
- **Weights:** 
  - Main Metric: `col-span-4`
  - Filter/Quick Settings: `col-span-2`
  - Action/Links: `col-span-3`

### 3. Interactive Cards
Cards used for activities (`KegiatanCard`) focus on visual documentation.
- **Aspect Ratio:** `aspect-video` for hero images.
- **Typography:** Tabular numbers for indices, `truncate` for long city/location names.
- **Actions:** Ghost buttons for secondary actions (Edit/Delete).

---

## 🖋️ Typography
- **Primary Font:** `Inter` (Sans-serif)
- **Principles:**
  - **Captions:** Use `text-[10px]` with `font-bold` and `uppercase` for category labels (e.g., "LAPORAN", "PROFIL PEGAWAI").
  - **Headlines:** Use `font-black` or `font-bold` for numeric stats to create high visual hierarchy.
  - **Readability:** `line-clamp-2` for descriptions and `truncate` for headers.

---

## ✨ Micro-interactions
- **Scale Effect:** `active:scale-[0.98]` or `active:scale-95` on every interactive button/card.
- **Animation:** `animate-in fade-in slide-in-from-bottom-2` for entry points.
- **Hover:** Subtle scale increase (`group-hover:scale-110`) for icons.

---

## 🛠️ Implementation Guidance
### 🚨 Theme Safety (Anti-Hardcoding)
- **NEVER use hardcoded color classes** like `bg-white`, `bg-slate-50`, or `text-black`.
- **ALWAYS use semantic theme variables**:
  - Use `bg-background` for the main page surface.
  - Use `bg-card` for cards, modals, and container surfaces.
  - Use `text-foreground` for primary text.
  - Use `text-muted-foreground` for secondary/label text.
  - Use `border-border` for lines and boundaries.
- This ensures the UI remains readable when switching between **Dark Mode** and **Light Mode**.

### 📱 Layout & Mobile
- Always use `safe-top` and `safe-bottom` utilities for mobile edge padding.
- For Glassmorphism, ensure a backdrop blur of at least `backdrop-blur-md`.
- Keep the header "Sticky" but maintain the "Floating Island" look by adding side margins (`px-4`).
