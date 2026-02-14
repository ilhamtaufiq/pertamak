import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Kegiatan } from '../types/kegiatan';

interface KegiatanPrintViewProps {
    data: Kegiatan[];
    month?: string;
    year?: string;
    userInfo?: {
        nama: string;
        nip: string | null;
        jabatan: string;
    };
}

export function KegiatanPrintView({ data, month, year, userInfo }: KegiatanPrintViewProps) {
    const monthText = month ? `BULAN ${format(new Date(2024, parseInt(month) - 1), 'MMMM', { locale: id }).toUpperCase()}` : 'SEMUA BULAN';
    const displayYear = year || new Date().getFullYear().toString();
    const today = format(new Date(), 'dd MMMM yyyy', { locale: id });

    return (
        <div className="bg-white p-8 text-black font-serif" id="print-area">
            <style>
                {`
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    body { background: white; }
                    #print-area { padding: 0; }
                }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
                th, td { border: 1px solid black; padding: 12px 8px; vertical-align: top; font-size: 12px; word-wrap: break-word; }
                th { background-color: #f3f4f6; font-weight: bold; text-align: center; text-transform: uppercase; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { font-size: 18px; font-weight: bold; margin: 0; padding: 0; text-transform: uppercase; line-height: 1.5; }
                .no-col { width: 40px; text-align: center; }
                .date-col { width: 120px; text-align: center; }
                .location-col { width: 150px; }
                .content-col { width: auto; }
                .image-col { width: 220px; }
                .doc-image { width: 100%; max-height: 150px; object-fit: cover; margin-bottom: 5px; border: 1px solid #ddd; }
                `}
            </style>

            <div className="header">
                <h1>JURNAL KEGIATAN SKP {monthText} {displayYear}</h1>
                <h1>UPTD PERTAMANAN DAN PEMAKAMAN</h1>
                {userInfo && (
                    <h1 className="mt-2 text-base">{userInfo.nama.toUpperCase()}</h1>
                )}
            </div>

            <table>
                <thead>
                    <tr>
                        <th className="no-col">NO</th>
                        <th className="date-col">HARI/TANGGAL</th>
                        <th className="location-col">LOKASI</th>
                        <th className="content-col">URAIAN KEGIATAN</th>
                        <th className="image-col">DOKUMENTASI</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((k, index) => (
                        <tr key={k.id}>
                            <td className="no-col">{index + 1}</td>
                            <td className="date-col text-center">
                                {k.hari},<br />
                                {format(new Date(k.tanggal), 'dd MMMM yyyy', { locale: id })}
                            </td>
                            <td className="location-col">
                                <ul className="list-disc ml-4">
                                    <li>{k.lokasi}</li>
                                </ul>
                            </td>
                            <td className="content-col whitespace-pre-wrap">
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
                                        <p className="text-[10px] text-center italic">Tidak ada foto</p>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Signature Section */}
            {userInfo && (
                <div className="mt-12 flex justify-end">
                    <div className="text-center w-[300px]">
                        <p>Cianjur, {today}</p>
                        <p className="mt-1">Petugas,</p>
                        <div className="h-[100px]" />
                        <p className="font-bold underline">{userInfo.nama}</p>
                        <p>NIP. {userInfo.nip || '-'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
