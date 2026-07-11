<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pertamak Hub — Sistem Informasi Pertamanan &amp; Pemakaman Cianjur</title>
    <meta name="description" content="Platform digital UPTD Pertamanan dan Pemakaman Disperkim Cianjur: jurnal SKP, jadwal piket, media library, peta petugas. Terintegrasi SIMAN untuk layanan pemakaman publik.">
    <meta name="theme-color" content="#0EA5E9">
    <meta name="author" content="UPTD Pertamanan dan Pemakaman Kabupaten Cianjur">
    <link rel="canonical" href="{{ url('/') }}">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="id_ID">
    <meta property="og:site_name" content="Pertamak Hub">
    <meta property="og:title" content="Pertamak Hub — Pertamanan &amp; Pemakaman Cianjur">
    <meta property="og:description" content="Monitoring kegiatan lapangan, jurnal SKP, piket, media &amp; peta petugas. Terhubung ke SIMAN untuk data makam &amp; mobil jenazah.">
    <meta property="og:url" content="{{ url('/') }}">
    <meta property="og:image" content="{{ asset('images/hero-gentur.jpg') }}">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Pertamak Hub">
    <meta name="twitter:description" content="Sistem informasi operasional UPTD Pertamanan &amp; Pemakaman Cianjur.">

    <link rel="icon" href="{{ asset('logo.png') }}">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />
    <style>
        /*! tailwindcss v4.0.7 | MIT License | https://tailwindcss.com */
        @layer theme {
            :root {
                --font-sans: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                --color-primary: #0EA5E9;
                --color-primary-dark: #0284C7;
                --color-primary-light: #38BDF8;
                --color-secondary: #0F172A;
                --spacing: .25rem;
            }
        }

        @layer base {
            *, ::after, ::before {
                box-sizing: border-box;
                border: 0 solid #e5e7eb;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: var(--font-sans);
                background: #f8fafc;
                color: #1e293b;
                line-height: 1.6;
            }
            a { color: inherit; text-decoration: none; }
            img { max-width: 100%; height: auto; }
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

        /* Navbar */
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(226,232,240,0.6);
            padding: 0.75rem 0;
        }
        .navbar-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .navbar-logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 700;
            font-size: 1.25rem;
            color: var(--color-secondary);
        }
        .navbar-logo img {
            width: 40px;
            height: 40px;
            border-radius: 10px;
        }
        .navbar-logo span { color: var(--color-primary); }
        .navbar-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1.5rem;
            background: var(--color-primary);
            color: #fff;
            font-weight: 600;
            font-size: 0.875rem;
            border-radius: 9999px;
            transition: all 0.2s;
        }
        .navbar-cta:hover { background: var(--color-primary-dark); transform: translateY(-1px); }

        /* Hero — full-bleed photo (Tugu Gentur) */
        .hero {
            position: relative;
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            align-items: flex-end;
            padding: 0;
            overflow: hidden;
            background: #0F172A;
            color: #fff;
        }
        .hero-bg {
            position: absolute;
            inset: 0;
            z-index: 0;
        }
        .hero-bg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 40%;
            display: block;
            transform: scale(1.02);
        }
        .hero-overlay {
            position: absolute;
            inset: 0;
            background:
                linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.25) 35%, rgba(15,23,42,0.55) 70%, rgba(15,23,42,0.92) 100%),
                linear-gradient(90deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.35) 55%, rgba(15,23,42,0.2) 100%);
            pointer-events: none;
        }
        .hero-inner {
            position: relative;
            z-index: 1;
            width: 100%;
            padding: 7.5rem 0 4.5rem;
        }
        .hero-content {
            max-width: 640px;
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.45rem 1rem;
            background: rgba(14,165,233,0.18);
            color: #7dd3fc;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            border-radius: 9999px;
            margin-bottom: 1.35rem;
            border: 1px solid rgba(125,211,252,0.35);
            backdrop-filter: blur(8px);
        }
        .hero-content h1 {
            font-size: clamp(2.4rem, 5.5vw, 3.75rem);
            font-weight: 800;
            line-height: 1.08;
            color: #fff;
            margin-bottom: 1rem;
            letter-spacing: -0.03em;
            text-shadow: 0 2px 24px rgba(0,0,0,0.35);
        }
        .hero-content h1 span {
            color: #38BDF8;
        }
        .hero-sub {
            font-size: 1.08rem;
            color: rgba(226,232,240,0.9);
            line-height: 1.7;
            margin-bottom: 2rem;
            max-width: 520px;
            text-shadow: 0 1px 12px rgba(0,0,0,0.35);
        }
        .hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 1.75rem;
        }
        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.9rem 1.75rem;
            background: var(--color-primary);
            color: #fff;
            font-weight: 700;
            font-size: 0.95rem;
            border-radius: 12px;
            transition: all 0.2s;
            box-shadow: 0 4px 18px rgba(14,165,233,0.45);
        }
        .btn-primary:hover {
            background: var(--color-primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(14,165,233,0.5);
        }
        .btn-outline {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.9rem 1.75rem;
            background: rgba(255,255,255,0.08);
            color: #fff;
            font-weight: 600;
            font-size: 0.95rem;
            border-radius: 12px;
            border: 1.5px solid rgba(255,255,255,0.35);
            backdrop-filter: blur(8px);
            transition: all 0.2s;
        }
        .btn-outline:hover {
            background: rgba(255,255,255,0.16);
            border-color: #fff;
            color: #fff;
        }
        .hero-credit {
            font-size: 0.72rem;
            color: rgba(148,163,184,0.85);
            letter-spacing: 0.02em;
        }
        .hero-credit a {
            color: rgba(186,230,253,0.95);
            text-decoration: underline;
            text-underline-offset: 2px;
        }

        @media (max-width: 900px) {
            .hero {
                align-items: flex-end;
                min-height: 92vh;
            }
            .hero-inner { padding: 6.5rem 0 3rem; }
            .hero-content { max-width: 100%; }
            .hero-bg img { object-position: center center; }
            .hero-overlay {
                background:
                    linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.35) 40%, rgba(15,23,42,0.88) 100%);
            }
        }

        /* Features */
        .section {
            padding: 5rem 0;
        }
        .section-title {
            text-align: center;
            margin-bottom: 3.5rem;
        }
        .section-title h2 {
            font-size: clamp(1.5rem, 3vw, 2.25rem);
            font-weight: 800;
            color: var(--color-secondary);
            margin-bottom: 0.75rem;
        }
        .section-title p {
            color: #64748b;
            max-width: 550px;
            margin: 0 auto;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        .feature-card {
            background: #fff;
            border-radius: 1.25rem;
            padding: 2rem;
            border: 1px solid #f1f5f9;
            transition: all 0.25s;
        }
        .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.06);
            border-color: #e0f2fe;
        }
        .feature-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1.25rem;
        }
        .feature-card h3 {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--color-secondary);
        }
        .feature-card p {
            font-size: 0.9rem;
            color: #64748b;
            line-height: 1.7;
        }
        .coming-soon {
            position: relative;
            background: linear-gradient(135deg, #ffffff 0%, #fefeff 100%) !important;
            border: 2px solid transparent !important;
            background-clip: padding-box !important;
            box-shadow: 0 0 0 1px #e2e8f0, 0 4px 16px rgba(14,165,233,0.04) !important;
            overflow: hidden;
        }
        .coming-soon::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 1.25rem;
            padding: 2px;
            background: linear-gradient(135deg, #93c5fd, #a5b4fc, #c4b5fd);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }
        .coming-soon:hover {
            box-shadow: 0 0 0 1px #bfdbfe, 0 8px 24px rgba(14,165,233,0.08) !important;
            transform: translateY(-4px);
        }
        .coming-soon .cs-overlay {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
        }
        .cs-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.2rem 0.75rem;
            background: linear-gradient(135deg, #dbeafe, #ede9fe);
            color: #4f46e5;
            font-size: 0.6rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-radius: 9999px;
            border: 1px solid rgba(99,102,241,0.2);
        }
        .cs-badge::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #6366f1;
            animation: cs-pulse 1.5s ease-in-out infinite;
        }
        @keyframes cs-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.7); }
        }
        .link-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.3rem 0.85rem;
            background: linear-gradient(135deg, #dbeafe, #ede9fe);
            color: #4f46e5;
            font-size: 0.65rem;
            font-weight: 700;
            border-radius: 9999px;
            border: 1px solid rgba(99,102,241,0.2);
            transition: all 0.2s;
        }
        .link-badge:hover {
            background: linear-gradient(135deg, #c7d2fe, #ddd6fe);
            transform: scale(1.05);
        }
        .coming-soon h3 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            padding-right: 5rem;
        }

        /* Stats */
        .stats-bar {
            background: var(--color-secondary);
            padding: 3.5rem 0;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 2rem;
            text-align: center;
        }
        .stat-item h3 {
            font-size: 2rem;
            font-weight: 800;
            color: var(--color-primary-light);
        }
        .stat-item p {
            color: #94a3b8;
            font-size: 0.85rem;
            font-weight: 500;
            margin-top: 0.25rem;
        }

        /* Footer */
        .footer {
            background: #0f172a;
            color: #94a3b8;
            padding: 2.5rem 0;
            text-align: center;
            font-size: 0.85rem;
        }
        .footer strong { color: #e2e8f0; }

        /* Responsive */
        @media (max-width: 640px) {
            .navbar-logo span:not(.accent) { display: none; }
            .hero-inner { padding: 6rem 0 2.5rem; }
            .hero-actions { flex-direction: column; align-items: stretch; }
            .hero-actions .btn-primary,
            .hero-actions .btn-outline { justify-content: center; }
            .features-grid { grid-template-columns: 1fr; }
        }
    
        /* Nav links */
        .navbar-links {
            display: flex;
            align-items: center;
            gap: 1.25rem;
        }
        .navbar-links a.nav-link {
            font-size: 0.875rem;
            font-weight: 600;
            color: #64748b;
            transition: color .15s;
        }
        .navbar-links a.nav-link:hover { color: var(--color-primary); }
        @media (max-width: 768px) {
            .navbar-links .nav-link-hide-sm { display: none; }
        }

        /* Ecosystem */
        .eco-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        .eco-card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 1.25rem;
            padding: 1.75rem;
            transition: transform .2s, box-shadow .2s;
            display: block;
            position: relative;
        }
        .eco-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(14,165,233,.1);
        }
        .eco-card h3 { font-size: 1.15rem; font-weight: 800; color: var(--color-secondary); margin: .75rem 0 .5rem; }
        .eco-card p { font-size: .9rem; color: #64748b; line-height: 1.65; }
        .eco-badge {
            display: inline-flex;
            align-items: center;
            gap: .3rem;
            font-size: .65rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .06em;
            padding: .25rem .7rem;
            border-radius: 9999px;
        }
        .eco-badge.live { background: #dcfce7; color: #166534; }
        .eco-badge.soon { background: #e0f2fe; color: #0369a1; }
        .eco-card .eco-cta {
            display: inline-flex;
            margin-top: 1rem;
            font-size: .85rem;
            font-weight: 700;
            color: var(--color-primary);
        }

        /* Live stats numbers */
        .stats-bar .stat-item .stat-num {
            font-size: 2rem;
            font-weight: 800;
            color: var(--color-primary-light);
        }

        /* FAQ */
        .faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: .75rem; }
        .faq-item {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            overflow: hidden;
        }
        .faq-item summary {
            cursor: pointer;
            padding: 1.1rem 1.25rem;
            font-weight: 700;
            color: var(--color-secondary);
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after {
            content: '+';
            font-size: 1.25rem;
            color: var(--color-primary);
            font-weight: 400;
        }
        .faq-item[open] summary::after { content: '−'; }
        .faq-item .faq-body {
            padding: 0 1.25rem 1.15rem;
            color: #64748b;
            font-size: .925rem;
            line-height: 1.7;
        }

        /* How it works */
        .steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            counter-reset: step;
        }
        .step-card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 1.25rem;
            padding: 1.5rem;
            position: relative;
        }
        .step-card::before {
            counter-increment: step;
            content: counter(step);
            display: flex;
            width: 2rem;
            height: 2rem;
            border-radius: 9999px;
            background: #e0f2fe;
            color: #0369a1;
            font-weight: 800;
            align-items: center;
            justify-content: center;
            margin-bottom: .85rem;
            font-size: .9rem;
        }
        .step-card h3 { font-size: 1rem; font-weight: 800; margin-bottom: .4rem; color: var(--color-secondary); }
        .step-card p { font-size: .875rem; color: #64748b; line-height: 1.65; }

        /* Footer richer */
        .footer {
            background: #0f172a;
            color: #94a3b8;
            padding: 3.5rem 0 2rem;
            font-size: 0.875rem;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: 1.4fr 1fr 1fr;
            gap: 2rem;
            text-align: left;
            margin-bottom: 2rem;
        }
        @media (max-width: 768px) {
            .footer-grid { grid-template-columns: 1fr; text-align: center; }
        }
        .footer h4 { color: #e2e8f0; font-size: .95rem; font-weight: 700; margin-bottom: .75rem; }
        .footer a { color: #94a3b8; transition: color .15s; }
        .footer a:hover { color: #38bdf8; }
        .footer ul { list-style: none; }
        .footer li { margin-bottom: .4rem; }
        .footer-bottom {
            border-top: 1px solid rgba(148,163,184,.15);
            padding-top: 1.25rem;
            text-align: center;
            font-size: .8rem;
        }
        .footer strong { color: #e2e8f0; }
    </style>

<body>
    <!-- Navbar -->
    <nav class="navbar">
        <div class="container navbar-inner">
            <a href="{{ url('/') }}" class="navbar-logo">
                <img src="{{ asset('logo.png') }}" alt="Logo Pertamak" width="40" height="40">
                Pertamak <span>Hub</span>
            </a>
            <div class="navbar-links">
                <a href="#fitur" class="nav-link nav-link-hide-sm">Fitur</a>
                <a href="#ekosistem" class="nav-link nav-link-hide-sm">Ekosistem</a>
                <a href="#cara-kerja" class="nav-link nav-link-hide-sm">Cara Kerja</a>
                <a href="#faq" class="nav-link nav-link-hide-sm">FAQ</a>
                <a href="{{ $simanUrl }}" class="nav-link nav-link-hide-sm" target="_blank" rel="noopener">SIMAN</a>
                <a href="/dashboard" class="navbar-cta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    Masuk Dashboard
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero — Tugu Gentur full-bleed -->
    <section class="hero">
        <div class="hero-bg" aria-hidden="true">
            <img
                src="{{ asset('images/hero-gentur.jpg') }}"
                alt=""
                width="1920"
                height="1080"
                loading="eager"
                decoding="async"
                fetchpriority="high"
            >
            <div class="hero-overlay"></div>
        </div>
        <div class="container hero-inner">
            <div class="hero-content">
                <div class="hero-badge">
                    <span>✦</span> UPTD Pertamanan &amp; Pemakaman · Disperkim Cianjur
                </div>
                <h1>
                    <span>Pertamak Hub</span>
                </h1>
                <p class="hero-sub">
                    Platform digital untuk monitoring kegiatan lapangan, jurnal SKP,
                    jadwal piket, media library, dan peta petugas — terintegrasi dengan
                    SIMAN untuk layanan pemakaman publik.
                </p>
                <div class="hero-actions">
                    <a href="/dashboard" class="btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                        Masuk ke Dashboard
                    </a>
                    <a href="#fitur" class="btn-outline">Lihat Fitur</a>
                    <a href="{{ $simanUrl }}" class="btn-outline" target="_blank" rel="noopener">Buka SIMAN ↗</a>
                </div>
                <p class="hero-credit">
                    Foto: Tugu Gentur / Gentur Lamp Monument ·
                    <a href="https://commons.wikimedia.org/wiki/File:Gentur_Lamp_Monument_2022.jpg" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
                </p>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="section" id="fitur">
        <div class="container">
            <div class="section-title">
                <h2>Fitur Operasional</h2>
                <p>Semua tools harian petugas dan admin dalam satu dashboard.</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon" style="background:#eff6ff;color:#2563eb;">📋</div>
                    <h3>Jurnal Kegiatan SKP</h3>
                    <p>Catat dan pantau aktivitas harian pegawai terintegrasi target SKP, lengkap dengan lokasi &amp; dokumentasi.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#f0fdf4;color:#16a34a;">👥</div>
                    <h3>Manajemen Karyawan</h3>
                    <p>Kelola data pegawai, riwayat tugas, dan pembagian kerja secara terpusat.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#fff7ed;color:#ea580c;">📅</div>
                    <h3>Jadwal Piket</h3>
                    <p>Atur jadwal piket harian, shift, dan pantau kehadiran petugas lapangan.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#faf5ff;color:#9333ea;">🗂️</div>
                    <h3>Media Library</h3>
                    <p>Simpan foto kegiatan, laporan lapangan, dan arsip digital terorganisir folder.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#fef2f2;color:#dc2626;">📍</div>
                    <h3>Peta Online</h3>
                    <p>Pantau lokasi petugas dan sebaran aktivitas di lapangan secara visual.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#f0f9ff;color:#0284c7;">📊</div>
                    <h3>Laporan &amp; Ekspor</h3>
                    <p>Rekap jurnal dan ekspor dokumen SKP format DOCX siap cetak.</p>
                </div>
                <div class="feature-card coming-soon">
                    <div class="feature-icon" style="background:#fefce8;color:#ca8a04;">📢</div>
                    <div class="cs-overlay"><span class="cs-badge">Segera Hadir</span></div>
                    <h3>Publikasi</h3>
                    <p>Halaman publikasi resmi untuk pengumuman dan informasi kegiatan UPTD.</p>
                </div>
                <a href="{{ $simanUrl }}" class="feature-card" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;position:relative;">
                    <div class="feature-icon" style="background:#fce7f3;color:#db2777;">⚰️</div>
                    <div class="cs-overlay" style="position:absolute;top:0.75rem;right:0.75rem;">
                        <span class="link-badge">Live →</span>
                    </div>
                    <h3 style="padding-right:5rem;">SIMAN</h3>
                    <p>Sistem Informasi Pemakaman: TPU, makam, ahli waris, QR code, dan mobil jenazah.</p>
                </a>
                <a href="{{ $simanUrl }}/layanan/mobiljenazah" class="feature-card" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;position:relative;">
                    <div class="feature-icon" style="background:#e0f2fe;color:#0284c7;">🚐</div>
                    <div class="cs-overlay" style="position:absolute;top:0.75rem;right:0.75rem;">
                        <span class="link-badge">Via SIMAN →</span>
                    </div>
                    <h3 style="padding-right:7rem;">Mobil Jenazah</h3>
                    <p>Cek ketersediaan armada dan hubungi petugas — dikelola di SIMAN.</p>
                </a>
            </div>
        </div>
    </section>

    <!-- Live stats -->
    <section class="stats-bar">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-num">{{ number_format($stats['kegiatan'] ?? 0) }}</div>
                    <p>Jurnal Kegiatan</p>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ number_format($stats['karyawan'] ?? 0) }}</div>
                    <p>Data Pegawai</p>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ number_format($stats['users'] ?? 0) }}</div>
                    <p>Pengguna Sistem</p>
                </div>
                <div class="stat-item">
                    <div class="stat-num">{{ number_format($stats['piket_hari_ini'] ?? 0) }}</div>
                    <p>Piket Hari Ini</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Ecosystem -->
    <section class="section" id="ekosistem" style="background:#fff;">
        <div class="container">
            <div class="section-title">
                <h2>Ekosistem Digital UPTD</h2>
                <p>Pertamak untuk operasional internal. SIMAN untuk layanan pemakaman publik.</p>
            </div>
            <div class="eco-grid">
                <div class="eco-card">
                    <span class="eco-badge live">● Live</span>
                    <h3>Pertamak Hub</h3>
                    <p>Dashboard petugas &amp; admin: jurnal SKP, karyawan, piket, media, peta, dan laporan. Akses web + aplikasi mobile.</p>
                    <a href="/dashboard" class="eco-cta">Masuk dashboard →</a>
                </div>
                <a href="{{ $simanUrl }}" class="eco-card" target="_blank" rel="noopener noreferrer">
                    <span class="eco-badge live">● Live</span>
                    <h3>SIMAN</h3>
                    <p>Sistem Informasi Manajemen Pemakaman: data TPU, makam, ahli waris, QR di lapangan, dan status mobil jenazah.</p>
                    <span class="eco-cta">Buka SIMAN ↗</span>
                </a>
                <div class="eco-card">
                    <span class="eco-badge soon">Mobile</span>
                    <h3>Aplikasi Petugas</h3>
                    <p>Input kegiatan di lapangan dengan GPS, foto multi-dokumentasi, dan sinkron ke server Pertamak.</p>
                    <span class="eco-cta" style="color:#64748b;">Tersedia di internal UPTD</span>
                </div>
            </div>
        </div>
    </section>

    <!-- How it works -->
    <section class="section" id="cara-kerja" style="background:#f8fafc;">
        <div class="container">
            <div class="section-title">
                <h2>Cara Kerja</h2>
                <p>Alur sederhana untuk petugas lapangan dan admin.</p>
            </div>
            <div class="steps">
                <div class="step-card">
                    <h3>Login</h3>
                    <p>Masuk dengan akun pegawai melalui dashboard web atau aplikasi mobile.</p>
                </div>
                <div class="step-card">
                    <h3>Catat kegiatan</h3>
                    <p>Isi jurnal harian, lampirkan foto, dan tangkap lokasi GPS otomatis di lapangan.</p>
                </div>
                <div class="step-card">
                    <h3>Pantau &amp; rekap</h3>
                    <p>Admin memantau piket, peta sebaran, media, lalu ekspor laporan SKP.</p>
                </div>
                <div class="step-card">
                    <h3>Layanan publik</h3>
                    <p>Warga mencari makam / info mobil melalui SIMAN — data terpisah tapi satu ekosistem UPTD.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="section" id="faq" style="background:#fff;">
        <div class="container">
            <div class="section-title">
                <h2>FAQ</h2>
                <p>Pertanyaan yang sering diajukan.</p>
            </div>
            <div class="faq-list">
                <details class="faq-item" open>
                    <summary>Siapa yang bisa mengakses Pertamak?</summary>
                    <div class="faq-body">Pegawai dan admin UPTD Pertamanan dan Pemakaman yang memiliki akun. Warga umum tidak login ke Pertamak; layanan publik pemakaman ada di SIMAN.</div>
                </details>
                <details class="faq-item">
                    <summary>Apa bedanya Pertamak dan SIMAN?</summary>
                    <div class="faq-body">
                        <strong>Pertamak</strong> = operasional internal (jurnal SKP, piket, media, peta petugas).
                        <strong>SIMAN</strong> = data &amp; layanan pemakaman (TPU, makam, ahli waris, QR, mobil jenazah).
                    </div>
                </details>
                <details class="faq-item">
                    <summary>Apakah bisa dipakai di HP?</summary>
                    <div class="faq-body">Ya. Dashboard web responsif, dan tersedia aplikasi mobile untuk input kegiatan di lapangan.</div>
                </details>
                <details class="faq-item">
                    <summary>Bagaimana cara membuat laporan SKP?</summary>
                    <div class="faq-body">Dari menu kegiatan/jurnal, gunakan fitur ekspor DOCX untuk menghasilkan dokumen rekap siap cetak.</div>
                </details>
                <details class="faq-item">
                    <summary>Di mana warga mencari data makam?</summary>
                    <div class="faq-body">Di SIMAN — buka menu Cari Makam atau pindai QR di lokasi makam. Link: <a href="{{ $simanUrl }}" target="_blank" rel="noopener">{{ $simanUrl }}</a></div>
                </details>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="section" style="text-align:center; background:#f8fafc;">
        <div class="container">
            <div class="section-title">
                <h2>Siap Memulai?</h2>
                <p>Kelola kegiatan pertamanan &amp; pemakaman lebih efisien dan transparan.</p>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;">
                <a href="/dashboard" class="btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    Masuk ke Dashboard
                </a>
                <a href="{{ $simanUrl }}" class="btn-outline" target="_blank" rel="noopener">Buka SIMAN ↗</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div>
                    <h4>Pertamak Hub</h4>
                    <p style="margin-bottom:.75rem;line-height:1.65;">
                        <strong>UPTD Pertamanan dan Pemakaman</strong><br>
                        Dinas Perumahan dan Kawasan Permukiman<br>
                        Kabupaten Cianjur
                    </p>
                </div>
                <div>
                    <h4>Navigasi</h4>
                    <ul>
                        <li><a href="#fitur">Fitur</a></li>
                        <li><a href="#ekosistem">Ekosistem</a></li>
                        <li><a href="#cara-kerja">Cara Kerja</a></li>
                        <li><a href="#faq">FAQ</a></li>
                        <li><a href="/dashboard">Dashboard</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Layanan terkait</h4>
                    <ul>
                        <li><a href="{{ $simanUrl }}" target="_blank" rel="noopener">SIMAN — Pemakaman</a></li>
                        <li><a href="{{ $simanUrl }}/layanan/makam/cari" target="_blank" rel="noopener">Cari Makam</a></li>
                        <li><a href="{{ $simanUrl }}/layanan/mobiljenazah" target="_blank" rel="noopener">Mobil Jenazah</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; {{ date('Y') }} <strong>UPTD Pertamanan dan Pemakaman</strong> — Disperkim Kabupaten Cianjur.</p>
            </div>
        </div>
    </footer>
</body>
</html>