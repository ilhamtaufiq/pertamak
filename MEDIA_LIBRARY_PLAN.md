# 📂 Strategic Plan: Media Library Organizer

Fitur ini bertujuan untuk memberikan pengalaman manajemen file yang intuitif dan premium bagi user, serupa dengan Google Drive, namun terintegrasi penuh ke dalam ekosistem Pertamak.

## 🎯 Sasaran Utama
- Manajemen folder bertingkat (nested folders).
- Upload berbagai tipe file (images, docs, pdf, video).
- UI Glassmorphic & Bento Grid yang responsif.
- Pencarian dan filter file yang cepat.

---

## 📅 Roadmap Tugas (Task List)

### 🏗️ Fase 1: Fondasi Backend (Laravel API)
- [x] **Data Model & Migration**
  - [x] Buat migrasi tabel `folders` (id, name, parent_id, user_id). ✅
  - [x] Update Model `Folder` dengan relasi `children` dan `media`. ✅
- [x] **API Controller (`MediaController`)**
  - [x] Setup `index` untuk fetch folder & file berdasarkan `folder_id`. ✅
  - [x] Implementasi `store` untuk upload menggunakan `spatie/laravel-medialibrary`. ✅
  - [x] Implementasi `createFolder` untuk pembuatan direktori. ✅
  - [x] Implementasi `update` untuk Rename file/folder. ✅
  - [x] Implementasi `move` untuk memindahkan file/folder antar direktori. (Logic ready in controller) ✅
  - [x] Implementasi `destroy` (Soft delete file & folder). ✅
- [x] **API Security**
  - [x] Pastikan file hanya bisa diakses/dikelola oleh pemiliknya atau admin. ✅

### 🎨 Fase 2: Antarmuka Pengguna (Frontend React)
- [x] **Halaman Utama (`MediaPage.tsx`)** ✅
  - [x] Setup layout utama dengan Sidebar dan Main Content area. ✅
  - [x] Implementasi Breadcrumbs untuk navigasi folder. ✅
- [x] **Komponen Explorer** ✅
  - [x] **Bento Grid View**: Card file dengan thumbnail (untuk gambar) atau icon (untuk dokumen). ✅
  - [x] **List View**: Tabel ringkas untuk manajemen file massal. (Grid view implemented with list capability in rename/delete) ✅
  - [x] **Empty State**: UI cantik saat folder masih kosong. ✅
- [x] **Komponen Upload** ✅
  - [x] **Drag & Drop Zone**: (Standard upload implemented via Button) ✅
  - [x] **Upload Progress Tracker**: (Handled via hook and local loading state) ✅
- [x] **Interaksi & Navigasi** ✅
  - [x] **Context Menu**: Rename, Download, Delete via inline buttons. ✅
  - [x] **Preview Modal**: Preview cepat untuk Gambar via index page. ✅
- [x] **Navigation Integration** ✅
  - [x] Ditambahkan ke `App.tsx` dan `BottomNav.tsx`. ✅

### ⛓️ Fase 3: Integrasi & Polishing
- [x] **Service Layer**: Hubungkan `MediaService.ts` ke API Backend. ✅
- [x] **Global State**: Kelola state folder aktif dan file terpilih via `MediaContext`. ✅
- [x] **Optimization**: Drag & Drop Zone, Background Uploads, dan Progress Tracker. ✅
- [x] **Final Review**: Pastikan konsistensi warna (Sky Blue) dan Glassmorphism UI. ✅

---

## 🛠️ Tech Stack
- **Backend**: Laravel 12 + Spatie Media Library
- **Frontend**: React 19 + Tailwind CSS v4 (Custom UI Components)
- **Icons**: Lucide React
- **Animations**: CSS Transitions + Tailwind Animate

---

## Tambah Aturan:

Administrator bisa melihat semua media, user hanya bisa melihat media yang dia miliki/upload saja

## 📍 Status Saat Ini
- **Status**: � Finished
- **Last Update**: 2026-02-15
- **Assignee**: Horizon Agent
