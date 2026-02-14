import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Kegiatan } from '../types/kegiatan';

interface KegiatanGroupedPrintViewProps {
    data: Kegiatan[];
    month?: string;
    year?: string;
}

export function KegiatanGroupedPrintView({ data, month, year }: KegiatanGroupedPrintViewProps) {
    const monthText = month ? `BULAN ${format(new Date(2024, parseInt(month) - 1), 'MMMM', { locale: id }).toUpperCase()}` : 'SEMUA BULAN';
    const displayYear = year || new Date().getFullYear().toString();
    const today = format(new Date(), 'dd MMMM yyyy', { locale: id });

    // Sort by date (ascending) then by user name
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.tanggal).getTime();
        const dateB = new Date(b.tanggal).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return (a.user?.name || '').localeCompare(b.user?.name || '');
    });

    return (
        <div className="bg-white text-black font-serif" id="print-area">
            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white; }
                    .print-section { padding: 0 !important; margin: 0 !important; }
                }
                .print-section { padding: 40px; background: white; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
                th, td { border: 1px solid black; padding: 12px 8px; vertical-align: top; font-size: 11px; word-wrap: break-word; }
                th { background-color: #f3f4f6; font-weight: bold; text-align: center; text-transform: uppercase; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { font-size: 18px; font-weight: bold; margin: 0; padding: 0; text-transform: uppercase; line-height: 1.5; }
                .no-col { width: 35px; text-align: center; }
                .date-col { width: 100px; text-align: center; }
                .petugas-col { width: 120px; }
                .location-col { width: 130px; }
                .content-col { width: auto; }
                .image-col { width: 180px; }
                .doc-image { width: 100%; max-height: 120px; object-fit: cover; margin-bottom: 5px; border: 1px solid #ddd; }
                `}
            </style>

            <div className="print-section">
                <div className="header">
                    <h1>JURNAL KEGIATAN SKP {monthText} {displayYear}</h1>
                    <h1>UPTD PERTAMANAN DAN PEMAKAMAN</h1>
                </div>

                {sortedData.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic">
                        Tidak ada data kegiatan yang dapat ditampilkan.
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th className="no-col">NO</th>
                                <th className="date-col">HARI/TANGGAL</th>
                                <th className="petugas-col">PETUGAS</th>
                                <th className="location-col">LOKASI</th>
                                <th className="content-col">URAIAN KEGIATAN</th>
                                <th className="image-col">DOKUMENTASI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((k, index) => (
                                <tr key={k.id}>
                                    <td className="no-col">{index + 1}</td>
                                    <td className="date-col text-center">
                                        {k.hari},<br />
                                        {format(new Date(k.tanggal), 'dd MMMM yyyy', { locale: id })}
                                    </td>
                                    <td className="petugas-col font-medium">
                                        {k.user?.karyawan?.nama || k.user?.name || 'Unknown'}
                                    </td>
                                    <td className="location-col">
                                        {k.lokasi}
                                    </td>
                                    <td className="content-col whitespace-pre-wrap text-left">
                                        {k.uraian_kegiatan.split('\n').map((line, i) => (
                                            <div key={i} className="flex gap-2">
                                                <span>•</span>
                                                <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="image-col">
                                        <div className="space-y-2">
                                            {k.dokumentasi.map((img) => (
                                                <img
                                                    key={img.id}
                                                    src={img.url}
                                                    alt="Dokumentasi"
                                                    className="doc-image"
                                                />
                                            ))}
                                            {k.dokumentasi.length === 0 && (
                                                <p className="text-[10px] text-center italic text-gray-400">Tidak ada foto</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="mt-12 flex justify-end">
                    <div className="text-center w-[350px]">
                        <p>Cianjur, {today}</p>
                        <p className="mt-1 font-semibold">Kepala UPTD Pertamanan dan Pemakaman</p>
                        <div className="h-[80px]" />
                        <p className="font-bold underline">RIZAL RAMDHANI, S.H.</p>
                        <p>NIP. 0000000 00 000</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
