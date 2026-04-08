# Pertamak Mobile - Design System & Screen Specifications

This document defines the visual language and component specifications for the Pertamak Mobile application, optimized for **NativeWind v5 (Tailwind CSS v4)** and **Google Stitch AI** prompting.

---

## 🎨 Visual Identity

### Core Palette
- **Primary (Sky):** `#0EA5E9` (Sky 500) to `#0284C7` (Sky 700)
- **Background:** `#F8FAFC` (Slate 50) for light, `#020617` (Slate 950) for dark/auth.
- **Surface:** Glassmorphic translucent whites/blacks with `BlurView`.
- **Accents:** 
  - Emerald 500 (`#10B981`) - Success/Active
  - Rose 500 (`#F43F5E`) - Alerts/Notifications
  - Amber 500 (`#F59E0B`) - Points/Warnings

### Typography
- **Headings:** Font-black, Tracking-tight (e.g., `text-4xl font-black tracking-tight`)
- **Body:** Font-medium, Slate 600-900.
- **Captions:** Font-bold, Tracking-[2px], Uppercase (e.g., `text-[10px] tracking-[4px] uppercase`)

### Aesthetics (The "WOW" Factor)
- **Glassmorphism:** Use `BlurView` (intensity 20-40) with subtle 1px white/slate borders.
- **Gradients:** Deep Sky Blue to Deep Blue linear gradients.
- **Rounding:** Ultra-rounded corners (`rounded-[40px]` or `rounded-full`).
- **Animations:** Subtle `FadeInDown` and `FadeInUp` for all page entrances.

---

## 📱 Screen Specifications (Stitch Prompts)

### 1. Premium Login Screen
**Context:** Authentication entry for Enterprise users.

**Stitch Prompt:**
```text
Mobile app login screen with a premium glassmorphic design. 
- Background: Deep dark navy gradient (#020617 to #0EA5E9).
- Logo Section: Centered animated login icon in a rounded box with "Pertamak" text in bold white.
- Card: Translucent glassmorphic card with high blur, rounded corners (40px), and subtle white border.
- Inputs: Dark themed inputs with Mail and Lock icons, slate-400 placeholder text.
- Button: High-contrast Sky Blue gradient button with "Get Started" text and an arrow icon.
- Layout: Vertically centered, keyboard avoiding, minimalist professional footer.
```

### 2. Home Dashboard Hub
**Context:** Central command center for employees and admins.

**Stitch Prompt:**
```text
Mobile dashboard for an enterprise activity hub.
- Header: Large Sky Blue gradient header (rounded bottom) with "Selamat Datang" greeting and user name in oversized bold white text.
- Feature Card: A prominent "Status" card showing "Sistem Sinkron" with a pulsing emerald indicator.
- List Section: "Kegiatan Hari Ini" section featuring a clean list of activity cards.
- Activity Card: White background, subtle shadows, rounded-3xl, showing Title, Category, and Time with a ChevronRight.
- Navigation: Floating glassmorphic bottom navigation bar with icons for Home, Activity, and Profile.
```

### 3. User Profile & Settings
**Context:** Personal details and app configuration.

**Stitch Prompt:**
```text
Mobile profile screen with a premium energetic feel.
- Header: Large Sky Blue gradient card covering top 30% of screen, featuring a large avatar circle with a "Verified" badge.
- Stats Row: A glassmorphic horizontal card with 3 segments: Post, Kegiatan, and Poin. Use bold typography.
- Settings List: Grouped sections with rounded backgrounds. Each row has a colored icon box, bold label, and a custom Switch or ChevronRight.
- Action: A prominent "Keluar Sesi" button in red at the bottom with a LogOut icon.
```

---

## 🛠 Component Architecture (NativeWind v5)

All components must use the wrappers from `@/tw` to ensure CSS-first styling availability:

| Wrapper | Target Component | NativeWind Support |
| :--- | :--- | :--- |
| `View` | `RNView` | Full |
| `Text` | `RNText` | Full |
| `LinearGradient` | `ExpoLinearGradient` | via Styles mapping |
| `BlurView` | `ExpoBlurView` | via Styles mapping |
| `Animated.View` | `Reanimated.View` | Full |

---

## 📝 Usage Guidelines
1. **Consistency:** Always use `rounded-[40px]` for cards/major containers.
2. **Spacing:** Use standard Tailwind scales (e.g., `p-6`, `mb-10`, `mt-12`).
3. **Contrast:** Ensure all text on gradients uses `text-white` or `text-white/80`.
4. **Depth:** Apply `shadow-xl shadow-slate-200` to light surfaces and `shadow-sky-500/40` to primary buttons.
