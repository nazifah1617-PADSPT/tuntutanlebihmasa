
import React from 'react';
import { OTClaim } from '../types';
import { calculateHourlyRate, format12h, numberToWordsMalay } from '../utils/calculations';

interface Props {
  claim: OTClaim;
}

const PDFView: React.FC<Props> = ({ claim }) => {
  const { profile, lines, month, year } = claim;
  const monthNames = ['JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN', 'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'];
  const monthName = monthNames[parseInt(month) - 1];

  const hourlyRate = calculateHourlyRate(profile.basicSalary);
  
  const totals = lines.reduce((acc, l) => ({
    '1.125': acc['1.125'] + l.hours_1_125,
    '1.25': acc['1.25'] + (l.dayType === 'Biasa' ? l.hours_1_250 : 0),
    '1.25_rehat': acc['1.25_rehat'] + (l.dayType === 'Rehat' ? l.hours_1_250 : 0),
    '1.5': acc['1.5'] + l.hours_1_500,
    '1.75': acc['1.75'] + l.hours_1_750,
    '2.0': acc['2.0'] + l.hours_2_000,
  }), { '1.125': 0, '1.25': 0, '1.25_rehat': 0, '1.5': 0, '1.75': 0, '2.0': 0 });

  const totalWeighted = (totals['1.125'] * 1.125) + 
                        (totals['1.25'] * 1.25) + 
                        (totals['1.25_rehat'] * 1.25) + 
                        (totals['1.5'] * 1.5) + 
                        (totals['1.75'] * 1.75) + 
                        (totals['2.0'] * 2.0);

  const totalAmount = totalWeighted * hourlyRate;

  return (
    <div className="flex flex-col gap-10 bg-gray-100 print:bg-white print:gap-0">
      {/* PAGE 1: CLAIM TABLE */}
      <div className="bg-white p-6 w-[297mm] h-[210mm] mx-auto text-[10px] leading-tight font-sans text-black relative page-break shadow-lg print:shadow-none">
        {/* Title */}
        <div className="text-center font-bold text-base mb-6 uppercase tracking-wider">
          PENYATA TUNTUTAN ELAUN LEBIH MASA BAGI BULAN <span className="underline">{monthName}</span> TAHUN <span className="underline">{year}</span>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-3 gap-x-12 mb-4">
          <div className="space-y-1">
            <div className="flex"><span className="w-24">Nama</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.name}</span></div>
            <div className="flex"><span className="w-24">No. K/P</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.ic}</span></div>
            <div className="flex"><span className="w-24">No. Gaji</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.salaryNo}</span></div>
            <div className="flex"><span className="w-24">No. Telefon</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.phone}</span></div>
            <div className="flex"><span className="w-24">eMail</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.email}</span></div>
          </div>
          <div className="space-y-1">
            <div className="flex"><span className="w-32">Jawatan/ Gred</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.position}</span></div>
            <div className="flex"><span className="w-32">Bahagian/Unit</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.unit}</span></div>
            <div className="flex"><span className="w-32">No. Pusat Pembayaran</span>: <span className="border-b border-dotted flex-1 ml-1 uppercase">{profile.paymentCenter}</span></div>
            <div className="flex"><span className="w-32">Bank / No. Akaun</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.bankAccount}</span></div>
            <div className="flex"><span className="w-32">Jabatan/Negeri</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.department}</span></div>
          </div>
          <div className="space-y-1">
            <div className="flex"><span className="w-32">Gaji pokok</span>: <span className="font-bold ml-1 flex-1 text-right">RM {profile.basicSalary.toFixed(2)}</span></div>
            <div className="flex"><span className="w-32">Kadar Sejam</span>: <span className="font-bold ml-1 flex-1 text-right font-black">RM {hourlyRate.toFixed(2)}</span></div>
            <div className="flex"><span className="w-32">1/3 Gaji</span>: <span className="font-bold ml-1 flex-1 text-right font-black">RM {(profile.basicSalary/3).toFixed(2)}</span></div>
            <div className="flex"><span className="w-32">Hari Bekerja Biasa</span>: <span className="ml-1 flex-1 text-right">{profile.workingDays}</span></div>
            <div className="flex"><span className="w-32">Hari Cuti Minggu</span>: <span className="ml-1 flex-1 text-right">{profile.weekendDays}</span></div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-black mb-4 text-[9px]">
          <thead>
            <tr className="bg-gray-100 font-bold text-center">
              <th className="border border-black p-1 w-20" rowSpan={3}>Tarikh</th>
              <th className="border border-black p-1 w-24" rowSpan={3}>Hari Biasa/<br/>Hari Rehat/<br/>Kelepasan Am</th>
              <th className="border border-black p-1" colSpan={2}>Waktu Kerja Biasa</th>
              <th className="border border-black p-1" colSpan={2}>Waktu Bekerja Lebih Masa</th>
              <th className="border border-black p-1" colSpan={6}>JUMLAH JAM LEBIH MASA</th>
              <th className="border border-black p-1 w-64" rowSpan={3}>Butir-Butir Tugas<br/>(Sebab-Sebab Tugas Tidak Dapat Dihabiskan Dalam Waktu Pejabat)</th>
            </tr>
            <tr className="text-center">
              <th className="border border-black p-1" rowSpan={2}>Dari</th>
              <th className="border border-black p-1" rowSpan={2}>Hingga</th>
              <th className="border border-black p-1" rowSpan={2}>Dari</th>
              <th className="border border-black p-1 bg-gray-50 italic">Hingga</th>
              <th className="border border-black p-0.5" colSpan={2}>Hari Biasa</th>
              <th className="border border-black p-0.5" colSpan={2}>Hari Rehat</th>
              <th className="border border-black p-0.5" colSpan={2}>Kelepasan Am</th>
            </tr>
            <tr className="text-[7px] text-center">
              <th className="border border-black p-0.5 bg-gray-50 italic">Anggota Tetap 6am-10pm<br/>Anggota Sambilan 7.30am-pm</th>
              <th className="border border-black p-0.5 text-[8px]">1 1/8<br/>6am-10pm<br/>7.30am-pm</th>
              <th className="border border-black p-0.5 text-[8px]">1 1/4<br/>10pm-6am<br/>7.30pm-am</th>
              <th className="border border-black p-0.5 text-[8px]">1 1/4<br/>6am-10pm<br/>7.30am-pm</th>
              <th className="border border-black p-0.5 text-[8px]">1 1/2<br/>10pm-6am<br/>7.30pm-am</th>
              <th className="border border-black p-0.5 text-[8px]">1 3/4<br/>6am-10pm<br/>7.30am-pm</th>
              <th className="border border-black p-0.5 text-[8px]">2<br/>10pm-6am<br/>7.30pm-am</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }).map((_, i) => {
              const line = lines[i];
              return (
                <tr key={i} className="h-8">
                  <td className="border border-black p-1 text-center font-mono">{line ? new Date(line.date).toLocaleDateString('ms-MY') : ''}</td>
                  <td className="border border-black p-1 text-center">{line?.dayType || ''}</td>
                  <td className="border border-black p-1 text-center">{line ? format12h(line.normalFrom) : ''}</td>
                  <td className="border border-black p-1 text-center">{line ? format12h(line.normalTo) : ''}</td>
                  <td className="border border-black p-1 text-center">{line ? format12h(line.otFrom) : ''}</td>
                  <td className="border border-black p-1 text-center">{line ? format12h(line.otTo) : ''}</td>
                  <td className="border border-black p-1 text-center">{line?.hours_1_125 || ''}</td>
                  <td className="border border-black p-1 text-center">{line?.dayType === 'Biasa' ? line?.hours_1_250 || '' : ''}</td>
                  <td className="border border-black p-1 text-center">{line?.dayType === 'Rehat' ? line?.hours_1_250 || '' : ''}</td>
                  <td className="border border-black p-1 text-center">{line?.hours_1_500 || ''}</td>
                  <td className="border border-black p-1 text-center">{line?.hours_1_750 || ''}</td>
                  <td className="border border-black p-1 text-center">{line?.hours_2_000 || ''}</td>
                  <td className="border border-black p-1 text-[8px] uppercase">{line?.tasks || ''}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="font-bold text-[8px]">
            <tr>
              <td colSpan={6} className="border border-black p-1 text-right italic">Jumlah Jam Lebih Masa (sila genapkan setiap lajur ini - cth: 2 jam 47 min = 2 jam 45 min)</td>
              <td className="border border-black p-1 text-center">{totals['1.125'].toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{totals['1.25'].toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{totals['1.25_rehat'].toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{totals['1.5'].toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{totals['1.75'].toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{totals['2.0'].toFixed(2)}</td>
              <td className="border border-black bg-gray-50"></td>
            </tr>
            <tr>
              <td colSpan={6} className="border border-black p-1 text-right">X Gandaan</td>
              <td className="border border-black p-1 text-center">1.125</td>
              <td className="border border-black p-1 text-center">1.25</td>
              <td className="border border-black p-1 text-center">1.25</td>
              <td className="border border-black p-1 text-center">1.50</td>
              <td className="border border-black p-1 text-center">1.75</td>
              <td className="border border-black p-1 text-center">2.00</td>
              <td className="border border-black p-1 text-center underline italic">Jumlah Jam</td>
            </tr>
            <tr>
              <td colSpan={6} className="border border-black p-1 text-right italic">Jumlah Jam Lebih Masa Dituntut (genapkan ke 2 angka perpuluhan - jgn dibulatkan)</td>
              <td className="border border-black p-1 text-center">{(totals['1.125'] * 1.125).toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{(totals['1.25'] * 1.25).toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{(totals['1.25_rehat'] * 1.25).toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{(totals['1.5'] * 1.5).toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{(totals['1.75'] * 1.75).toFixed(2)}</td>
              <td className="border border-black p-1 text-center">{(totals['2.0'] * 2.0).toFixed(2)}</td>
              <td className="border border-black p-1 text-center font-bold text-sm">{totalWeighted.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Summary Line */}
        <div className="flex justify-between items-center text-[10px] mb-8 font-bold">
          <div className="flex items-center gap-1">
            <span>Jumlah Jam Lebih Masa Dituntut</span>
            <span className="mx-2">= Kadar Sejam RM</span>
            <span className="border-b border-black w-12 text-center underline">{hourlyRate.toFixed(2)}</span>
            <span className="mx-2">X Jumlah Jam</span>
            <span className="border-b border-black w-12 text-center underline">{totalWeighted.toFixed(2)}</span>
            <span className="mx-2">=</span>
            <span className="mx-2">RM</span>
            <span className="border-b-2 border-black px-4 font-black text-sm">{totalAmount.toFixed(2)}</span>
          </div>
          <div className="italic text-[9px] text-right max-w-md">
            (Ringgit Malaysia : {numberToWordsMalay(totalAmount)})
          </div>
        </div>
      </div>

      {/* PAGE 2: DECLARATIONS & CHECKLIST */}
      <div className="bg-white p-12 w-[297mm] h-[210mm] mx-auto text-[11px] leading-relaxed font-sans text-black relative shadow-lg print:shadow-none">
        <div className="space-y-12">
          {/* Perakuan 1 */}
          <div>
            <div className="font-bold mb-1 uppercase">PERAKUAN :</div>
            <p className="mb-8">Dengan ini saya mengaku bahawa selain menjalankan tugas pada waktu kerja biasa saya juga diarah bertugas di luar waktu kerja biasa. Saya tidak diberi 'Book Off' dan juga 'Tidak Menanggung Kerja'. Diakui butir-butir di atas benar.</p>
            <div className="flex justify-between items-end mt-4">
              <div className="flex gap-2">Tarikh : <span className="w-48 border-b border-dotted"></span></div>
              <div className="text-center">
                <div className="mb-1">____________________________________________________________________</div>
                <div className="font-bold">( Tandatangan Pegawai Yang Menuntut )</div>
              </div>
            </div>
          </div>

          {/* Perakuan 2 */}
          <div>
            <div className="font-bold mb-1 uppercase">PERAKUAN KETUA UNIT / KETUA JABATAN :</div>
            <p className="mb-8">Diakui bahawa kerja-kerja di atas adalah mustahak dijalankan di luar waktu bekerja biasa dan tidak boleh ditangguhkan pada hari berikutnya atau diserahkan kepada anggota lain yang sedang bertugas. Disahkan juga bahawa pegawai ini tidak 'Menanggung Kerja'. Perlaksanaan kerja-kerja ini adalah mematuhi syarat-syarat dan peraturan mengikut perintah Am Bab 'G' 1974 dan P.P.Bil 9 Tahun 1991.</p>
            <div className="flex justify-between items-end mt-4">
              <div className="flex gap-2">Tarikh : <span className="w-48 border-b border-dotted"></span></div>
              <div className="flex gap-16">
                <div className="text-center">
                  <div className="mb-1">____________________________________________</div>
                  <div className="font-bold">( Tandatangan Ketua Unit )</div>
                </div>
                <div className="text-center">
                  <div className="mb-1">____________________________________________</div>
                  <div className="font-bold">( Tandatangan Ketua Jabatan )</div>
                </div>
              </div>
            </div>
          </div>

          {/* Perakuan 3 */}
          <div>
            <div className="font-bold mb-1 uppercase">PERAKUAN KETUA JABATAN (melebihi 1/3 gaji) :</div>
            <p className="mb-8">Adalah disahkan bahawa oleh sebab-sebab tertentu, anggota berkenaan telah dikehendaki bekerja lebihmasa yang mana jumlah tuntutan Elaun Lebih Masa melebihi 1/3 daripada gaji bulanannya dan mematuhi syarat-syarat yang terkandung di perenggan 2(C) Surat Pekeliling Perkhidmatan Bil. 21 Tahun 1977. Diluluskan oleh Pegawai Kanan Tertinggi 'G' dan ke atas.</p>
            <div className="flex justify-between items-end mt-4">
              <div className="flex gap-2">Tarikh : <span className="w-48 border-b border-dotted"></span></div>
              <div className="text-center">
                <div className="mb-1">____________________________________________________________________</div>
                <div className="font-bold">( Tandatangan Pegawai T/Tertinggi Dalam Kumpulan A )</div>
              </div>
            </div>
          </div>

          {/* Senarai Semak */}
          <div className="mt-16">
            <div className="font-bold mb-4 underline italic text-sm">Senarai Semak :</div>
            <div className="space-y-4">
              {[
                "Surat arahan bertulis sebelum menjalankan kerja lebih masa atau Jadual Tugas.",
                "Kadar Sejam = gaji pokok x 12 bulan / 2504",
                "Salinan slip gaji bulan semasa/ bulan yang terdekat.",
                "Kiraan gunakan sistem 24 jam.",
                "Cop dan tandatangan : Pemohon /Ketua Unit / Ketua Jabatan / Melebihi 1/3 Gaji",
                "Lain-lain ...........................................................(cth : Surat Perakuan Bertugas Melebihi 8 Jam Terus Menerus)"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-6">
                  <div className="text-sm font-bold w-6">{['i)', 'ii)', 'iii)', 'iv)', 'v)', 'vi)'][idx]}</div>
                  <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-bold text-lg">
                    ✓
                  </div>
                  <div className="flex-1">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFView;
