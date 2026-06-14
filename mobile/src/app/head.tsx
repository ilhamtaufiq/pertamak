import React from 'react';

export default function Head() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="description" content="Aplikasi pelaporan dan monitoring kegiatan lapangan untuk Kabupaten Cianjur" />
      <meta name="keywords" content="pertamak, kegiatan, cianjur, laporan lapangan, mobile" />
      <meta name="author" content="Pertamak" />
      <meta name="language" content="id" />
      <meta name="application-name" content="Pertamak" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Open Graph */}
      <meta property="og:title" content="Pertamak - Aplikasi Kegiatan Lapangan" />
      <meta property="og:description" content="Aplikasi pelaporan dan monitoring kegiatan lapangan untuk Kabupaten Cianjur" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Pertamak - Aplikasi Kegiatan Lapangan" />
      <meta name="twitter:description" content="Aplikasi pelaporan dan monitoring kegiatan lapangan untuk Kabupaten Cianjur" />

      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#0EA5E9" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <title>Pertamak - Aplikasi Kegiatan Lapangan</title>
    </>
  );
}
