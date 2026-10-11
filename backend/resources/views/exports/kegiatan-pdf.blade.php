<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Kegiatan</title>
    <style>
        @page { margin: 28px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #000; }
        h1 { text-align: center; font-size: 16px; margin: 0 0 6px; }
        .meta { text-align: center; font-weight: bold; margin: 0 0 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; }
        th, td { border: 1px solid #000; padding: 5px; vertical-align: top; }
        th { background: #eeeeee; text-align: center; }
        tr { page-break-inside: avoid; }
        .center { text-align: center; }
        .uraian { white-space: pre-line; }
        .foto-cell { text-align: center; }
        .foto { width: 120px; height: 120px; margin: 3px; }
        .empty { text-align: center; color: #555; padding: 16px; }
    </style>
</head>
<body>
    <h1>LAPORAN KEGIATAN</h1>
    @if ($periode)
        <p class="meta">Periode: {{ $periode }}</p>
    @endif
    @if ($nama)
        <p class="meta">Nama: {{ $nama }}</p>
    @endif

    <table>
        <thead>
            <tr>
                <th style="width: 5%">No</th>
                <th style="width: 17%">Hari/Tanggal</th>
                <th style="width: 17%">Lokasi</th>
                <th style="width: 35%">Uraian Kegiatan</th>
                <th style="width: 26%">Dokumentasi</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $index => $row)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $row['tanggal'] }}</td>
                    <td>{{ $row['lokasi'] }}</td>
                    <td class="uraian">{{ $row['uraian'] }}</td>
                    <td class="foto-cell">
                        @foreach ($row['images'] as $image)
                            <img class="foto" src="{{ $image }}" alt="Dokumentasi">
                        @endforeach
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="empty">Tidak ada kegiatan pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
