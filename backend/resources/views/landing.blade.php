<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pertamak - Sistem Informasi Pertamanan & Pemakaman Disperkim Cianjur</title>
    <meta name="description" content="Sistem informasi manajemen kegiatan pertamanan dan pemakaman UPTD Pertamanan dan Pemakaman Dinas Perkim Cianjur">

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

        /* Hero — Split layout with geometric accent */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 6rem 0 4rem;
            background: #ffffff;
            position: relative;
            overflow: hidden;
        }
        /* Diagonal split overlay */
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 55%;
            height: 100%;
            background: linear-gradient(160deg, #0F172A 0%, #1E293B 100%);
            clip-path: polygon(30% 0, 100% 0, 100% 100%, 0 100%);
            z-index: 0;
        }
        /* Subtle grid pattern on dark side */
        .hero::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 55%;
            height: 100%;
            background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
            background-size: 24px 24px;
            clip-path: polygon(30% 0, 100% 0, 100% 100%, 0 100%);
            z-index: 0;
        }
        .hero-inner {
            display: flex;
            align-items: center;
            gap: 4rem;
            position: relative;
            z-index: 1;
            width: 100%;
        }
        .hero-left {
            flex: 1;
            max-width: 580px;
        }
        .hero-right {
            flex: 1;
            max-width: 520px;
            position: relative;
            display: flex;
            justify-content: center;
            padding: 2rem 0;
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            background: rgba(14,165,233,0.08);
            color: var(--color-primary);
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            border-radius: 9999px;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(14,165,233,0.15);
        }
        .hero-left h1 {
            font-size: clamp(2.2rem, 4.5vw, 3.25rem);
            font-weight: 800;
            line-height: 1.1;
            color: var(--color-secondary);
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
        }
        .hero-left h1 span {
            color: var(--color-primary);
            position: relative;
        }
        .hero-left h1 span::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 0;
            right: 0;
            height: 8px;
            background: rgba(14,165,233,0.15);
            border-radius: 4px;
            z-index: -1;
        }
        .hero-sub {
            font-size: 1.05rem;
            color: #64748b;
            line-height: 1.7;
            margin-bottom: 2.25rem;
            max-width: 480px;
        }
        .hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
        }
        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.85rem 2rem;
            background: var(--color-primary);
            color: #fff;
            font-weight: 700;
            font-size: 0.95rem;
            border-radius: 12px;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(14,165,233,0.3);
        }
        .btn-primary:hover {
            background: var(--color-primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(14,165,233,0.4);
        }
        .btn-outline {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.85rem 2rem;
            background: transparent;
            color: var(--color-secondary);
            font-weight: 600;
            font-size: 0.95rem;
            border-radius: 12px;
            border: 2px solid #e2e8f0;
            transition: all 0.2s;
        }
        .btn-outline:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
        }
        /* Dashboard mockup card on right side */
        .hero-mockup {
            width: 100%;
            max-width: 460px;
            background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
            overflow: hidden;
            transform: perspective(1000px) rotateY(-3deg);
            transition: transform 0.4s ease;
        }
        .hero-mockup:hover {
            transform: perspective(1000px) rotateY(0deg);
        }
        .mockup-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.25rem;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mockup-dots {
            display: flex;
            gap: 6px;
        }
        .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-dot.r { background: #ef4444; }
        .mockup-dot.y { background: #eab308; }
        .mockup-dot.g { background: #22c55e; }
        .mockup-title {
            color: rgba(255,255,255,0.5);
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.05em;
        }
        .mockup-body { padding: 1.25rem; }
        .mockup-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.7rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .mockup-row:last-child { border-bottom: none; }
        .mockup-avatar {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 0.75rem;
            font-weight: 700;
        }
        .mockup-avatar.g { background: #10b981; }
        .mockup-avatar.p { background: #8b5cf6; }
        .mockup-avatar.o { background: #f59e0b; }
        .mockup-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .mockup-text .line {
            height: 8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.08);
        }
        .mockup-text .line.w60 { width: 60%; }
        .mockup-text .line.w40 { width: 40%; }
        .mockup-text .line.w80 { width: 80%; }
        .mockup-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }
        .mockup-stat .num {
            color: #fff;
            font-size: 1.5rem;
            font-weight: 800;
        }
        .mockup-stat .lbl {
            color: rgba(255,255,255,0.4);
            font-size: 0.6rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .mockup-stats {
            display: flex;
            justify-content: space-around;
            padding: 1rem 0 0.5rem;
            border-top: 1px solid rgba(255,255,255,0.06);
            margin-top: 0.75rem;
        }
        /* Floating glow */
        .hero-glow {
            position: absolute;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(14,165,233,0.25), transparent 70%);
            top: -60px;
            right: -60px;
            pointer-events: none;
        }

        /* Responsive */
        @media (max-width: 900px) {
            .hero { padding-top: 5rem; }
            .hero-inner { flex-direction: column; gap: 3rem; }
            .hero-left { max-width: 100%; text-align: center; }
            .hero-sub { margin-left: auto; margin-right: auto; }
            .hero-actions { justify-content: center; }
            .hero-right { max-width: 100%; }
            .hero-mockup { max-width: 380px; transform: none; }
            .hero::before { display: none; }
            .hero::after { display: none; }
            .hero-right {
                background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
                border-radius: 24px;
                padding: 2rem 1.5rem;
            }
            .hero-glow { display: none; }
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
            .hero { padding-top: 5rem; }
            .features-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar">
        <div class="container navbar-inner">
            <a href="/" class="navbar-logo">
                <img src="/logo.png" alt="Logo">
                Pertamak <span>Hub</span>
            </a>
            <a href="/dashboard" class="navbar-cta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Masuk ke Dashboard
            </a>
        </div>
    </nav>

    <!-- Hero — Split Layout -->
    <section class="hero">
        <div class="container hero-inner">
            <div class="hero-left">
                <div class="hero-badge">
                    <span>✦</span> UPTD Pertamanan & Pemakaman
                </div>
                <h1>
                    <span>Pertamak Hub</span>
                </h1>
                <p class="hero-sub">
                    Platform digital untuk monitoring kegiatan lapangan, manajemen jurnal SKP,
                    jadwal piket, dan dokumentasi pertamanan & pemakaman di lingkungan
                    Dinas Perkim Kabupaten Cianjur.
                </p>
                <div class="hero-actions">
                    <a href="/dashboard" class="btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                        Masuk ke Dashboard
                    </a>
                    <a href="#fitur" class="btn-outline">Pelajari Fitur</a>
                </div>
            </div>
            <div class="hero-right">
                <div class="hero-glow"></div>
                <div class="hero-mockup">
                    <div class="mockup-header">
                        <div class="mockup-dots">
                            <span class="mockup-dot r"></span>
                            <span class="mockup-dot y"></span>
                            <span class="mockup-dot g"></span>
                        </div>
                        <span class="mockup-title">pertamak.cianjur.space</span>
                    </div>
                    <div class="mockup-body">
                        <div class="mockup-row">
                            <div class="mockup-avatar">JT</div>
                            <div class="mockup-text">
                                <div class="line w60"></div>
                                <div class="line w40"></div>
                            </div>
                            <span style="color:#22c55e;font-size:0.65rem;font-weight:700;">ONLINE</span>
                        </div>
                        <div class="mockup-row">
                            <div class="mockup-avatar g">AS</div>
                            <div class="mockup-text">
                                <div class="line w80"></div>
                                <div class="line w40"></div>
                            </div>
                            <span style="color:#22c55e;font-size:0.65rem;font-weight:700;">ONLINE</span>
                        </div>
                        <div class="mockup-row">
                            <div class="mockup-avatar p">RF</div>
                            <div class="mockup-text">
                                <div class="line w60"></div>
                                <div class="line w40"></div>
                            </div>
                            <span style="color:#94a3b8;font-size:0.65rem;font-weight:700;">OFFLINE</span>
                        </div>
                        <div class="mockup-row">
                            <div class="mockup-avatar o">DK</div>
                            <div class="mockup-text">
                                <div class="line w80"></div>
                                <div class="line w40"></div>
                            </div>
                            <span style="color:#22c55e;font-size:0.65rem;font-weight:700;">ONLINE</span>
                        </div>
                        <div class="mockup-stats">
                            <div class="mockup-stat">
                                <span class="num">128</span>
                                <span class="lbl">Kegiatan</span>
                            </div>
                            <div class="mockup-stat">
                                <span class="num">24</span>
                                <span class="lbl">Pegawai</span>
                            </div>
                            <div class="mockup-stat">
                                <span class="num">12</span>
                                <span class="lbl">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="section" id="fitur">
        <div class="container">
            <div class="section-title">
                <h2>Fitur Unggulan</h2>
                <p>Kelola seluruh kegiatan operasional dengan mudah dan terstruktur.</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon" style="background:#eff6ff;color:#2563eb;">📋</div>
                    <h3>Jurnal Kegiatan SKP</h3>
                    <p>Catat dan pantau aktivitas harian setiap pegawai dengan sistem jurnal digital yang terintegrasi dengan target SKP.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#f0fdf4;color:#16a34a;">👥</div>
                    <h3>Manajemen Karyawan</h3>
                    <p>Kelola data pegawai, riwayat tugas, dan pembagian kerja secara terpusat dan mutakhir.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#fff7ed;color:#ea580c;">📅</div>
                    <h3>Jadwal Piket</h3>
                    <p>Atur dan lihat jadwal piket harian dengan tampilan yang jelas. Pantau kehadiran petugas lapangan.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#faf5ff;color:#9333ea;">🗂️</div>
                    <h3>Media Library</h3>
                    <p>Simpan dan kelola dokumentasi foto kegiatan, laporan lapangan, dan arsip digital dalam satu tempat.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#fef2f2;color:#dc2626;">📍</div>
                    <h3>Peta Online</h3>
                    <p>Pantau lokasi petugas secara real-time. Validasi kehadiran dan sebaran aktivitas di lapangan.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon" style="background:#f0f9ff;color:#0284c7;">📊</div>
                    <h3>Laporan & Ekspor</h3>
                    <p>Buat laporan kegiatan, rekap jurnal, dan ekspor dokumen SKP dalam format DOCX siap cetak.</p>
                </div>

                <!-- Coming Soon Cards -->
                <div class="feature-card coming-soon">
                    <div class="feature-icon" style="background:#fefce8;color:#ca8a04;">📢</div>
                    <div class="cs-overlay"><span class="cs-badge">Segera Hadir</span></div>
                    <h3>Publikasi</h3>
                    <p>Halaman publikasi resmi untuk pengumuman, berita, dan informasi seputar kegiatan UPTD Pertamanan dan Pemakaman.</p>
                </div>
                <div class="feature-card coming-soon">
                    <div class="feature-icon" style="background:#fce7f3;color:#db2777;">⚰️</div>
                    <div class="cs-overlay"><a href="https://siman.pertamak.cianjur.space" class="link-badge" target="_blank" rel="noopener">Akses SIMAN →</a></div>
                    <h3>SIMAN</h3>
                    <p>Sistem Informasi Pemakaman — data lokasi makam, riwayat pemakaman, dan informasi lahan tersedia secara digital.</p>
                </div>
                <div class="feature-card coming-soon">
                    <div class="feature-icon" style="background:#e0f2fe;color:#0284c7;">🚐</div>
                    <div class="cs-overlay"><span class="cs-badge">Segera Hadir</span></div>
                    <h3>Info Mobil Jenazah</h3>
                    <p>Informasi ketersediaan, peminjaman, dan jadwal mobil jenazah untuk warga yang membutuhkan layanan pemakaman.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats -->
    <section class="stats-bar">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>Real-Time</h3>
                    <p>Monitoring Langsung</p>
                </div>
                <div class="stat-item">
                    <h3>Terstruktur</h3>
                    <p>Manajemen Jurnal SKP</p>
                </div>
                <div class="stat-item">
                    <h3>Mobile</h3>
                    <p>Akses di Mana Saja</p>
                </div>
                <div class="stat-item">
                    <h3>Terintegrasi</h3>
                    <p>Laporan & Dokumentasi</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="section" style="text-align:center; background: #f8fafc;">
        <div class="container">
            <div class="section-title">
                <h2>Siap Memulai?</h2>
                <p>Kelola kegiatan pertamanan dan pemakaman dengan lebih efisien dan transparan.</p>
            </div>
            <a href="/dashboard" class="btn-primary" style="display:inline-flex;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Masuk ke Dashboard
            </a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 <strong>UPTD Pertamanan dan Pemakaman</strong> — Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur.</p>
        </div>
    </footer>

</body>
</html>
