
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

  // Fixed number of rows to fill page 1
  const TOTAL_ROWS = 15;

  return (
    <div className="flex flex-col bg-gray-200 print:bg-white print:gap-0 font-sans text-black">
      
      {/* PAGE 1: CLAIM TABLE (STAYING AS IS) */}
      <div className="bg-white p-[1cm] w-[297mm] h-[210mm] mx-auto text-[9px] leading-tight relative page-break shadow-2xl print:shadow-none">
        {/* Title */}
        <div className="text-center font-bold text-sm mb-4 uppercase tracking-widest">
          PENYATA TUNTUTAN ELAUN LEBIH MASA BAGI BULAN <span className="underline">{monthName}</span> TAHUN <span className="underline">{year}</span>
        </div>

        {/* Header Grid */}
        <div className="grid grid-cols-12 gap-x-2 mb-3 text-[8.5px]">
          <div className="col-span-4 space-y-0.5">
            <div className="flex"><span className="w-20">Nama</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.name}</span></div>
            <div className="flex"><span className="w-20">No. K/P</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.ic}</span></div>
            <div className="flex"><span className="w-20">No. Gaji</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.salaryNo}</span></div>
            <div className="flex"><span className="w-20">No. Telefon</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.phone}</span></div>
            <div className="flex"><span className="w-20">eMail</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.email}</span></div>
          </div>
          <div className="col-span-5 space-y-0.5 pl-4">
            <div className="flex"><span className="w-32">Jawatan/ Gred</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.position}</span></div>
            <div className="flex"><span className="w-32">Bahagian/Unit</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.unit}</span></div>
            <div className="flex"><span className="w-32">No. Pusat Pembayaran</span>: <span className="border-b border-dotted flex-1 ml-1 uppercase">{profile.paymentCenter}</span></div>
            <div className="flex"><span className="w-32">Bank / No. Akaun</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.bankAccount}</span></div>
            <div className="flex"><span className="w-32">Jabatan/Negeri</span>: <span className="font-bold border-b border-dotted flex-1 ml-1 uppercase">{profile.department}</span></div>
          </div>
          <div className="col-span-3 space-y-0.5 pl-4">
            <div className="flex"><span className="w-28">Gaji pokok</span>: <span className="font-bold ml-1 flex-1 text-right">RM {profile.basicSalary.toFixed(2)}</span></div>
            <div className="flex"><span className="w-28">Kadar Sejam</span>: <span className="font-bold ml-1 flex-1 text-right">RM <span className="bg-gray-100 px-1">{hourlyRate.toFixed(2)}</span></span></div>
            <div className="flex"><span className="w-28">1/3 Gaji</span>: <span className="font-bold ml-1 flex-1 text-right font-black">RM { (profile.basicSalary/3).toFixed(2) }</span></div>
            <div className="flex"><span className="w-28 text-[7.5px]">Hari Bekerja Biasa</span>: <span className="ml-1 flex-1 text-right">{profile.workingDays}</span></div>
            <div className="flex"><span className="w-28 text-[7.5px]">Hari Cuti Minggu</span>: <span className="ml-1 flex-1 text-right">{profile.weekendDays}</span></div>
          </div>
        </div>

        {/* Main Table */}
        <table className="w-full border-collapse border border-black mb-2 text-[8px]">
          <thead>
            <tr className="bg-gray-100 font-bold text-center">
              <th className="border border-black p-1 w-16" rowSpan={3}>Tarikh</th>
              <th className="border border-black p-1 w-20" rowSpan={3}>Hari Biasa/<br/>Hari Rehat/<br/>Kelepasan Am</th>
              <th className="border border-black p-1" colSpan={2}>Waktu Kerja Biasa</th>
              <th className="border border-black p-1" colSpan={2}>Waktu Bekerja Lebih Masa</th>
              <th className="border border-black p-0.5" colSpan={6}>JUMLAH JAM LEBIH MASA</th>
              <th className="border border-black p-1 w-72" rowSpan={3}>Butir-Butir Tugas<br/>(Sebab-Sebab Tugas Tidak Dapat Dihabiskan Dalam Waktu Pejabat)</th>
            </tr>
            <tr className="text-center font-bold">
              <th className="border border-black p-0.5" rowSpan={2}>Dari</th>
              <th className="border border-black p-0.5" rowSpan={2}>Hingga</th>
              <th className="border border-black p-0.5" rowSpan={2}>Dari</th>
              <th className="border border-black p-0.5">Hingga</th>
              <th className="border border-black p-0.5" colSpan={2}>Hari Biasa</th>
              <th className="border border-black p-0.5" colSpan={2}>Hari Rehat</th>
              <th className="border border-black p-0.5" colSpan={2}>Kelepasan Am</th>
            </tr>
            <tr className="text-[6.5px] text-center font-bold">
              <th className="border border-black p-0.5 italic leading-tight">Anggota Tetap 6am-10pm<br/>Anggota Sambilan 7.30am-pm</th>
              <th className="border border-black p-0.5 leading-tight">1 1/8<br/>6am-10pm<br/>7.30am-pm</th>
              <th className="border border-black p-0.5 leading-tight">1 1/4<br/>10pm-6am<br/>7.30pm-am</th>
              <th className="border border-black p-0.5 leading-tight">1 1/4<br/>6am-10pm<br/>7.30am-pm</th>
              <th className="border border-black p-0.5 leading-tight">1 1/2<br/>10pm-6am<br/>7.30pm-am</th>
              <th className="border border-black p-0.5 leading-tight">1 3/4<br/>6am-10pm<br/>7.30am-pm</th>
              <th className="border border-black p-0.5 leading-tight">2<br/>10pm-6am<br/>7.30pm-am</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: TOTAL_ROWS }).map((_, i) => {
              const line = lines[i];
              const isFilled = !!line;
              return (
                <tr key={i} className={isFilled ? "min-h-[24px]" : "h-[14px]"}>
                  <td className="border border-black px-1 py-0.5 text-center font-mono">{line ? new Date(line.date).toLocaleDateString('ms-MY') : ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line?.dayType || ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line ? format12h(line.normalFrom) : ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line ? format12h(line.normalTo) : ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line ? format12h(line.otFrom) : ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line ? format12h(line.otTo) : ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line?.hours_1_125 || ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line?.dayType === 'Biasa' ? line?.hours_1_250 || '' : ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line?.dayType === 'Rehat' ? line?.hours_1_250 || '' : ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line?.hours_1_500 || ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line?.hours_1_750 || ''}</td>
                  <td className="border border-black px-1 py-0.5 text-center">{line?.hours_2_000 || ''}</td>
                  <td className="border border-black px-1 py-0.5 text-[7px] uppercase leading-tight">{line?.tasks || ''}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="font-bold text-[7px]">
            <tr className="bg-gray-50">
              <td colSpan={6} className="border border-black px-2 py-1 text-right italic">Jumlah Jam Lebih Masa (sila genapkan setiap lajur ini - cth: 2 jam 47 min = 2 jam 45 min)</td>
              <td className="border border-black text-center">{totals['1.125'].toFixed(2)}</td>
              <td className="border border-black text-center">{totals['1.25'].toFixed(2)}</td>
              <td className="border border-black text-center">{totals['1.25_rehat'].toFixed(2)}</td>
              <td className="border border-black text-center">{totals['1.5'].toFixed(2)}</td>
              <td className="border border-black text-center">{totals['1.75'].toFixed(2)}</td>
              <td className="border border-black text-center">{totals['2.0'].toFixed(2)}</td>
              <td className="border border-black bg-white"></td>
            </tr>
            <tr>
              <td colSpan={6} className="border border-black px-2 py-1 text-right">X Gandaan</td>
              <td className="border border-black text-center">1.125</td>
              <td className="border border-black text-center">1.25</td>
              <td className="border border-black text-center">1.25</td>
              <td className="border border-black text-center">1.50</td>
              <td className="border border-black text-center">1.75</td>
              <td className="border border-black text-center">2.00</td>
              <td className="border border-black text-center underline italic">Jumlah Jam</td>
            </tr>
            <tr className="bg-gray-50">
              <td colSpan={6} className="border border-black px-2 py-1 text-right italic">Jumlah Jam Lebih Masa Dituntut (genapkan ke 2 angka perpuluhan - jgn dibulatkan)</td>
              <td className="border border-black text-center">{(totals['1.125'] * 1.125).toFixed(2)}</td>
              <td className="border border-black text-center">{(totals['1.25'] * 1.25).toFixed(2)}</td>
              <td className="border border-black text-center">{(totals['1.25_rehat'] * 1.25).toFixed(2)}</td>
              <td className="border border-black text-center">{(totals['1.5'] * 1.5).toFixed(2)}</td>
              <td className="border border-black text-center">{(totals['1.75'] * 1.75).toFixed(2)}</td>
              <td className="border border-black text-center">{(totals['2.0'] * 2.0).toFixed(2)}</td>
              <td className="border border-black text-center font-bold text-[10px]">{totalWeighted.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Total Summary Row matching screenshot layout */}
        <div className="flex justify-between items-start text-[10px] mt-2 font-bold leading-relaxed">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <span>Jumlah Jam Lebih Masa Dituntut</span>
              <span className="ml-8">= Kadar Sejam RM</span>
              <span className="w-16 border-b border-black text-center underline underline-offset-2">{hourlyRate.toFixed(2)}</span>
              <span className="mx-2">X Jumlah Jam</span>
              <span className="w-16 border-b border-black text-center underline underline-offset-2">{totalWeighted.toFixed(2)}</span>
              <span className="mx-2">=</span>
              <span className="mx-2">RM</span>
              <span className="px-2 border-b-2 border-black font-black text-[12px]">{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex flex-col text-[7px] text-gray-600 mt-1 font-normal italic">
              <div className="flex items-end">
                <span>Kiraan Kadar Sejam =</span>
                <div className="flex flex-col items-center mx-1">
                  <span className="border-b border-black px-2">12 x Gaji Bulanan</span>
                  <span>313 x 8 = 2504</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="italic text-[8px] font-bold max-w-sm">
              (Ringgit Malaysia : {numberToWordsMalay(totalAmount)})
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2: DECLARATIONS & CHECKLIST strictly matching screenshot 2 layout */}
      <div className="bg-white p-[1.5cm] w-[297mm] h-[210mm] mx-auto text-[11px] leading-snug font-sans text-black relative shadow-2xl print:shadow-none flex flex-col overflow-hidden">
        <div className="space-y-12 mt-4">
          
          {/* Section 1: Perakuan Pegawai */}
          <div className="relative">
            <div className="font-bold mb-1 uppercase">PERAKUAN :</div>
            <p className="text-justify leading-relaxed">Dengan ini saya mengaku bahawa selain menjalankan tugas pada waktu kerja biasa saya juga diarah bertugas di luar waktu kerja biasa. Saya tidak diberi 'Book Off' dan juga 'Tidak Menanggung Kerja'. Diakui butir-butir di atas benar.</p>
            <div className="flex justify-between items-end mt-8">
              <div className="flex gap-1 font-bold">Tarikh : <span className="w-64 border-b border-transparent"></span></div>
              <div className="text-center w-full max-w-[500px]">
                <div className="mb-0.5 font-normal tracking-[-1px]">------------------------------------------------------------------------------------------------------------------------------------------------------</div>
                <div className="font-bold text-[10.5px] tracking-wide uppercase">( Tandatangan Pegawai Yang Menuntut )</div>
              </div>
            </div>
          </div>

          {/* Section 2: Perakuan Ketua Unit / Ketua Jabatan */}
          <div>
            <div className="font-bold mb-1 uppercase">PERAKUAN KETUA UNIT / KETUA JABATAN :</div>
            <p className="text-justify leading-relaxed">Diakui bahawa kerja-kerja di atas adalah mustahak dijalankan di luar waktu bekerja biasa dan tidak boleh ditangguhkan pada hari berikutnya atau diserahkan kepada anggota lain yang sedang bertugas. Disahkan juga bahawa pegawai ini tidak 'Menanggung Kerja'. Perlaksanaan kerja-kerja ini adalah mematuhi syarat-syarat dan peraturan mengikut perintah Am Bab 'G' 1974 dan P.P.Bil 9 Tahun 1991.</p>
            <div className="flex justify-between items-end mt-12">
              <div className="flex gap-1 font-bold">Tarikh : <span className="w-48 border-b border-transparent"></span></div>
              <div className="flex gap-16 flex-1 justify-end">
                <div className="text-center w-[350px]">
                  <div className="mb-0.5 font-normal tracking-[-1px]">-----------------------------------------------------------------------------------------------------</div>
                  <div className="font-bold text-[10.5px] tracking-wide uppercase">( Tandatangan Ketua Unit )</div>
                </div>
                <div className="text-center w-[350px]">
                  <div className="mb-0.5 font-normal tracking-[-1px]">-----------------------------------------------------------------------------------------------------</div>
                  <div className="font-bold text-[10.5px] tracking-wide uppercase">( Tandatangan Ketua Jabatan )</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Perakuan 1/3 Gaji */}
          <div>
            <div className="font-bold mb-1 uppercase">PERAKUAN KETUA JABATAN <span className="italic font-normal normal-case">(melebihi 1/3 gaji)</span> :</div>
            <p className="text-justify leading-relaxed">Adalah disahkan bahawa oleh sebab-sebab tertentu, anggota berkenaan telah dikehendaki bekerja lebihmasa yang mana jumlah tuntutan Elaun Lebih Masa melebihi 1/3 daripada gaji bulanannya dan mematuhi syarat-syarat yang terkandung di perenggan 2(C) Surat Pekeliling Perkhidmatan Bil. 21 Tahun 1977. Diluluskan oleh Pegawai Kanan Tertinggi 'G' dan ke atas.</p>
            <div className="flex justify-between items-end mt-12">
              <div className="flex gap-1 font-bold">Tarikh : <span className="w-64 border-b border-transparent"></span></div>
              <div className="text-center w-full max-w-[500px]">
                <div className="mb-0.5 font-normal tracking-[-1px]">------------------------------------------------------------------------------------------------------------------------------------------------------</div>
                <div className="font-bold text-[10.5px] tracking-wide uppercase">( Tandatangan Pegawai T/Tertinggi Dalam Kumpulan A )</div>
              </div>
            </div>
          </div>

          {/* Senarai Semak with Checkboxes */}
          <div className="mt-20">
            <div className="font-bold mb-6 underline italic text-[14px]">Senarai Semak :</div>
            <div className="space-y-3.5 ml-2">
              {[
                { label: "i)", text: "Surat arahan bertulis sebelum menjalankan kerja lebih masa atau Jadual Tugas." },
                { label: "ii)", text: "Kadar Sejam = <span class='inline-flex flex-col items-center mx-1 align-middle'><span class='border-b border-black px-2'>gaji pokok x 12 bulan</span><span>2504</span></span>" },
                { label: "iii)", text: "Salinan slip gaji bulan semasa/ bulan yang terdekat." },
                { label: "iv)", text: "Kiraan gunakan sistem 24 jam." },
                { label: "v)", text: "Cop dan tandatangan : Pemohon /Ketua Unit / Ketua Jabatan / Melebihi 1/3 Gaji" },
                { label: "vi)", text: "Lain-lain ...........................................................<span class='text-[10px] italic'>(cth : Surat Perakuan Bertugas Melebihi 8 Jam Terus Menerus)</span>" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-6">
                  <div className="text-[11px] font-bold w-5">{item.label}</div>
                  <div className="w-8 h-7 border-2 border-black flex items-center justify-center font-bold text-lg leading-none shrink-0">
                    <span className="mt-0.5 font-bold">√</span>
                  </div>
                  <div className="flex-1 text-[11px]" dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Page counter at bottom hidden on print but good for preview */}
        <div className="absolute bottom-6 right-10 text-right text-[8px] text-gray-300 italic no-print">Muka Surat 2/2</div>
      </div>
    </div>
  );
};

export default PDFView;
