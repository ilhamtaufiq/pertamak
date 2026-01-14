import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { id } from 'date-fns/locale';
import type { JadwalPiket, Hari } from '../types/jadwal_piket';

interface JadwalPiketPrintViewProps {
    data: JadwalPiket[];
    month: string;
    year: string;
}

const HARI_LIST: Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const HARI_MAP_INDEX: Record<number, Hari> = {
    0: 'Minggu',
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
};

export function JadwalPiketPrintView({ data, month, year }: JadwalPiketPrintViewProps) {
    const selectedMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
    const endDate = endOfMonth(startDate);

    const monthName = format(startDate, 'MMMM yyyy', { locale: id }).toUpperCase();

    // Get all dates in the month grouped by day of week
    const datesInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const dayDates: Record<Hari, Date[]> = {} as any;
    HARI_LIST.forEach(h => dayDates[h] = []);

    datesInMonth.forEach(date => {
        const dayName = HARI_MAP_INDEX[getDay(date)];
        dayDates[dayName].push(date);
    });

    // Find max dates for any day to determine column count
    const maxDateCols = Math.max(...Object.values(dayDates).map(dates => dates.length));

    return (
        <div className="bg-white p-8 text-black font-sans" id="print-area">
            <style>
                {`
                @media print {
                    @page { size: portrait; margin: 1cm; }
                    body { background: white; }
                    #print-area { padding: 0; }
                }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
                th, td { border: 1px solid black; padding: 6px 4px; vertical-align: middle; font-size: 11px; }
                th { background-color: white; font-weight: bold; text-align: center; }
                .bg-yellow { background-color: #ffff00 !important; -webkit-print-color-adjust: exact; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase; }
                .no-col { width: 30px; text-align: center; }
                .hari-col { width: 80px; text-align: center; font-weight: bold; }
                .nama-col { width: 180px; }
                .paraf-col { width: 80px; text-align: center; }
                `}
            </style>

            <div className="header">
                <h1>UPTD PERTAMANAN DAN PEMAKAMAN</h1>
                <h1>ABSENSI PIKET MALAM</h1>
                <div className="mt-2 font-bold">{monthName}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowSpan={2} className="no-col">NO</th>
                        <th rowSpan={2} className="hari-col">HARI</th>
                        <th rowSpan={2} className="nama-col">NAMA</th>
                        <th colSpan={maxDateCols} className="text-center">PARAF</th>
                    </tr>
                    <tr>
                        {Array.from({ length: maxDateCols }).map((_, i) => (
                            <th key={i} className="paraf-col"></th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {HARI_LIST.map((hari, hariIndex) => {
                        const personnel = data.filter(j => j.hari === hari && j.shift === 'Malam');
                        const dates = dayDates[hari];

                        if (personnel.length === 0 && dates.length === 0) return null;

                        return (
                            <>
                                {/* Header Row for Dates */}
                                <tr className="bg-yellow">
                                    <td className="no-col"></td>
                                    <td className="hari-col"></td>
                                    <td className="nama-col"></td>
                                    {Array.from({ length: maxDateCols }).map((_, i) => (
                                        <td key={i} className="paraf-col font-bold">
                                            {dates[i] ? format(dates[i], 'dd/MM/yyyy') : ''}
                                        </td>
                                    ))}
                                </tr>

                                {personnel.length > 0 ? personnel.map((p, pIndex) => (
                                    <tr key={`${hari}-${p.id}`}>
                                        {pIndex === 0 && (
                                            <>
                                                <td rowSpan={personnel.length} className="no-col">{hariIndex + 1}</td>
                                                <td rowSpan={personnel.length} className="hari-col text-center uppercase">{hari}</td>
                                            </>
                                        )}
                                        <td className="nama-col uppercase">{p.karyawan.nama}</td>
                                        {Array.from({ length: maxDateCols }).map((_, i) => (
                                            <td key={i} className="paraf-col"></td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="no-col">{hariIndex + 1}</td>
                                        <td className="hari-col text-center uppercase">{hari}</td>
                                        <td className="nama-col text-center text-gray-400 italic">- Tidak Ada Personel -</td>
                                        {Array.from({ length: maxDateCols }).map((_, i) => (
                                            <td key={i} className="paraf-col"></td>
                                        ))}
                                    </tr>
                                )}
                            </>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
