# Pertamak & SIMAN – Coolify Deployment

## Overview
- **Pertamak**: Laravel backend + React (Vite) frontend. Deployed as a single Coolify project.
- **SIMAN**: Stand‑alone Laravel + Filament project (repo cloned under `siman/`). Also deployed as its own Coolify project.

## Why two projects?
- **Isolation** – each service has its own database, environment variables, and scaling.
- **Coolify** automatically builds Docker images from the `Dockerfile` present in each repo, so no shared `docker‑compose.yaml` or Nginx config is needed in the repository.
- **Domain mapping** – configure two domains in Coolify:
    - `pertamak.cianjur.space` → Pertamak project.
    - `siman.cianjur.space` → SIMAN project.

## Repository layout
```
.
├─ backend/          # Laravel API for Pertamak
├─ frontend/         # Vite + React SPA (served under /dashboard)
├─ siman/            # SIMAN Laravel + Filament (ignored by Git with .gitignore)
├─ Dockerfile        # Builds Pertamak image (used by Coolify)
├─ .gitignore        # Includes /siman/ to keep it separate
└─ README.md         # This file
```

## Coolify setup steps
1. **Create two applications** in Coolify – one for Pertamak, one for SIMAN.
2. **Connect each repo** (same Git repo, but set the build context to the appropriate folder):
   - Pertamak: build context `.` (root). Dockerfile will build the full stack.
   - SIMAN: build context `./siman`. Use the Dockerfile inside `siman/`.
3. **Add environment variables** per the `.env` files generated for each project.
4. **Configure databases** – either a shared MySQL service with separate databases (`pertamak` & `siman`) or two distinct services.
5. **Set domain names** in Coolify (or your DNS) to point to the respective containers.
6. Deploy – Coolify will build the images, run migrations (you can add a post‑deploy command `php artisan migrate --force`), and expose the services.

## Landing page link
The Pertamak landing page includes a **SIMAN** feature card that points to:
```
https://siman.cianjur.space
```
Clicking it opens SIMAN in a new tab.

## SIMAN deploy
See [`siman/SIMAN_DEPLOY.md`](siman/SIMAN_DEPLOY.md) for Coolify env vars, SSL, volumes, and production checklist.
SIMAN image uses **nginx + php-fpm + supervisor** (port **80**).

---
*Docker Compose for local/shared stacks may still exist for Pertamak; SIMAN deploys as its own Coolify application.*