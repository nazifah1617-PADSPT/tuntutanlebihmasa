
import React from 'react';
import { OTClaim } from '../types';
import { calculateHourlyRate, formatCurrency, numberToWordsMalay } from '../utils/calculations';

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
    <div className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-[10px] leading-tight font-serif">
      <div className="text-center font-bold text-sm mb-6 uppercase">
        PENYATA TUNTUTAN ELAUN LEBIH MASA BAGI BULAN {monthName} TAHUN {year}
      </div>

      <div className="grid grid-cols-3 gap-x-8 mb-4">
        <div className="space-y-1">
          <div className="flex"><span className="w-20">Nama</span>: <span className="font-bold border-b border-dotted flex-1 ml-1">{profile.name}</span></div>
          <div className="flex"><span className="w-20">No. K/P</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.ic}</span></div>
          <div className="flex"><span className="w-20">No. Gaji</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.salaryNo}</span></div>
          <div className="flex"><span className="w-20">No. Telefon</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.phone}</span></div>
          <div className="flex"><span className="w-20">eMail</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.email}</span></div>
        </div>
        <div className="space-y-1">
          <div className="flex"><span className="w-24">Jawatan/ Gred</span>: <span className="font-bold border-b border-dotted flex-1 ml-1">{profile.position}</span></div>
          <div className="flex"><span className="w-24">Bahagian/Unit</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.unit}</span></div>
          <div className="flex"><span className="w-24">No. P.Pembayaran</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.paymentCenter}</span></div>
          <div className="flex"><span className="w-24">Bank / No. Akaun</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.bankAccount}</span></div>
          <div className="flex"><span className="w-24">Jabatan/Negeri</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.department}</span></div>
        </div>
        <div className="space-y-1">
          <div className="flex"><span className="w-24">Gaji pokok</span>: <span className="border-b border-dotted flex-1 ml-1">RM {profile.basicSalary.toFixed(2)}</span></div>
          <div className="flex"><span className="w-24">Kadar Sejam</span>: <span className="font-bold border-b border-dotted flex-1 ml-1">RM {hourlyRate.toFixed(2)}</span></div>
          <div className="flex"><span className="w-24">1/3 Gaji</span>: <span className="border-b border-dotted flex-1 ml-1">RM {(profile.basicSalary/3).toFixed(2)}</span></div>
          <div className="flex"><span className="w-24">Hari Bekerja Biasa</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.workingDays}</span></div>
          <div className="flex"><span className="w-24">Hari Cuti Minggu</span>: <span className="border-b border-dotted flex-1 ml-1">{profile.weekendDays}</span></div>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr className="bg-gray-100 uppercase font-bold text-[8px] text-center">
            <th className="border border-black p-1 w-14" rowSpan={3}>Tarikh</th>
            <th className="border border-black p-1 w-20" rowSpan={3}>Hari Biasa/<br/>Hari Rehat/<br/>Am</th>
            <th className="border border-black p-1" colSpan={2}>Waktu Kerja Biasa</th>
            <th className="border border-black p-1" colSpan={2}>Waktu Bekerja Lebih Masa</th>
            <th className="border border-black p-1" colSpan={6}>Jumlah Jam Lebih Masa</th>
            <th className="border border-black p-1" rowSpan={3}>Butir-Butir Tugas</th>
          </tr>
          <tr className="bg-gray-50 text-[7px] text-center">
            <th className="border border-black p-0.5" rowSpan={2}>Dari</th>
            <th className="border border-black p-0.5" rowSpan={2}>Hingga</th>
            <th className="border border-black p-0.5" rowSpan={2}>Dari</th>
            <th className="border border-black p-0.5">Hingga</th>
            <th className="border border-black p-0.5" colSpan={2}>Hari Biasa</th>
            <th className="border border-black p-0.5" colSpan={2}>Hari Rehat</th>
            <th className="border border-black p-0.5" colSpan={2}>Kelepasan Am</th>
          </tr>
          <tr className="text-[7px] text-center">
            <th className="border border-black p-0.5 bg-gray-50">6am-10pm</th>
            <th className="border border-black p-0.5">1 1/8</th>
            <th className="border border-black p-0.5">1 1/4</th>
            <th className="border border-black p-0.5">1 1/4</th>
            <th className="border border-black p-0.5">1 1/2</th>
            <th className="border border-black p-0.5">1 3/4</th>
            <th className="border border-black p-0.5">2</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }).map((_, i) => {
            const line = lines[i];
            return (
              <tr key={i} className="h-6">
                <td className="border border-black p-0.5 text-center">{line ? new Date(line.date).toLocaleDateString('ms-MY') : ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.dayType || ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.normalFrom || ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.normalTo || ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.otFrom || ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.otTo || ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.hours_1_125 || ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.dayType === 'Biasa' ? line?.hours_1_250 || '' : ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.dayType === 'Rehat' ? line?.hours_1_250 || '' : ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.hours_1_500 || ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.hours_1_750 || ''}</td>
                <td className="border border-black p-0.5 text-center">{line?.hours_2_000 || ''}</td>
                <td className="border border-black p-0.5 text-[8px] leading-tight">{line?.tasks || ''}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="font-bold">
          <tr>
            <td colSpan={6} className="border border-black p-1 text-right">Jumlah Jam Lebih Masa</td>
            <td className="border border-black p-1 text-center">{totals['1.125'].toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{totals['1.25'].toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{totals['1.25_rehat'].toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{totals['1.5'].toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{totals['1.75'].toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{totals['2.0'].toFixed(2)}</td>
            <td className="border border-black p-1 text-center bg-gray-50"></td>
          </tr>
          <tr>
            <td colSpan={6} className="border border-black p-1 text-right">X Gandaan</td>
            <td className="border border-black p-1 text-center">1.125</td>
            <td className="border border-black p-1 text-center">1.25</td>
            <td className="border border-black p-1 text-center">1.25</td>
            <td className="border border-black p-1 text-center">1.50</td>
            <td className="border border-black p-1 text-center">1.75</td>
            <td className="border border-black p-1 text-center">2.00</td>
            <td className="border border-black p-1 text-center bg-gray-50">Jumlah Jam</td>
          </tr>
          <tr>
            <td colSpan={6} className="border border-black p-1 text-right">Jumlah Jam Lebih Masa Dituntut</td>
            <td className="border border-black p-1 text-center">{(totals['1.125'] * 1.125).toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{(totals['1.25'] * 1.25).toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{(totals['1.25_rehat'] * 1.25).toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{(totals['1.5'] * 1.5).toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{(totals['1.75'] * 1.75).toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{(totals['2.0'] * 2.0).toFixed(2)}</td>
            <td className="border border-black p-1 text-center">{totalWeighted.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="flex justify-between items-center border-b border-black pb-2 mb-8">
        <div className="font-bold">
          Jumlah Jam Lebih Masa Dituntut = Kadar Sejam RM <span className="underline ml-2">{hourlyRate.toFixed(2)}</span> X Jumlah Jam <span className="underline ml-2">{totalWeighted.toFixed(2)}</span> = RM <span className="underline ml-2 font-black">{totalAmount.toFixed(2)}</span>
        </div>
        <div className="italic text-[9px]">
          (Ringgit Malaysia: {numberToWordsMalay(totalAmount)})
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-12">
        <div className="space-y-12">
          <div>
            <div className="font-bold mb-8 uppercase underline">Perakuan :</div>
            <div className="text-[9px] mb-8">Dengan ini saya mengaku bahawa selain menjalankan tugas pada waktu kerja biasa saya juga diarah bertugas di luar waktu kerja biasa. Saya tidak diberi 'Book Off' dan juga 'Tidak Menanggung Kerja'. Diakui butir-butir di atas benar.</div>
            <div className="flex justify-between">
              <div>Tarikh : ________________</div>
              <div className="text-center">
                <div className="mb-4">________________________________</div>
                <div>( Tandatangan Pegawai Yang Menuntut )</div>
              </div>
            </div>
          </div>
          <div>
             <div className="font-bold mb-4 uppercase underline">Senarai Semak :</div>
             <div className="space-y-1 text-[8px]">
               <div className="flex gap-2"><span>[ / ]</span> i) Surat arahan bertulis sebelum menjalankan kerja lebih masa atau Jadual Tugas.</div>
               <div className="flex gap-2"><span>[ / ]</span> ii) Kadar Sejam = gaji pokok x 12 bulan / 2504</div>
               <div className="flex gap-2"><span>[ / ]</span> iii) Salinan slip gaji bulan semasa/ bulan yang terdekat.</div>
               <div className="flex gap-2"><span>[ / ]</span> iv) Kiraan gunakan sistem 24 jam.</div>
               <div className="flex gap-2"><span>[ / ]</span> v) Cop dan tandatangan : Pemohon /Ketua Unit / Ketua Jabatan / Melebihi 1/3 Gaji</div>
             </div>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <div className="font-bold mb-4 uppercase underline">Perakuan Ketua Unit / Ketua Jabatan :</div>
            <div className="text-[9px] mb-8">Diakui bahawa kerja-kerja di atas adalah mustahak dijalankan di luar waktu bekerja biasa dan tidak boleh ditangguhkan pada hari berikutnya atau diserahkan kepada anggota lain yang sedang bertugas. Disahkan juga bahawa pegawai ini tidak 'Menanggung Kerja'. Perlaksanaan kerja-kerja ini adalah mematuhi syarat-syarat dan peraturan mengikut perintah Am Bab 'G' 1974 dan P.P.Bil 9 Tahun 1991.</div>
            <div className="flex justify-between">
              <div className="text-center">
                <div className="mb-4">__________________________</div>
                <div>( Tandatangan Ketua Unit )</div>
              </div>
              <div className="text-center">
                <div className="mb-4">__________________________</div>
                <div>( Tandatangan Ketua Jabatan )</div>
              </div>
            </div>
          </div>
          <div>
            <div className="font-bold mb-4 uppercase underline text-red-700">Perakuan Ketua Jabatan (melebihi 1/3 gaji) :</div>
            <div className="text-[9px] mb-4">Adalah disahkan bahawa oleh sebab-sebab tertentu, anggota berkenaan telah dikehendaki bekerja lebihmasa yang mana jumlah tuntutan Elaun Lebih Masa melebihi 1/3 daripada gaji bulanannya dan mematuhi syarat-syarat yang terkandung di perenggan 2(C) Surat Pekeliling Perkhidmatan Bil. 21 Tahun 1977. Diluluskan oleh Pegawai Kanan Tertinggi 'G' dan ke atas.</div>
            <div className="flex justify-between">
              <div>Tarikh : ____________</div>
              <div className="text-center">
                <div className="mb-4">____________________________________</div>
                <div>( Tandatangan Pegawai T/Tertinggi Dalam Kumpulan A )</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFView;
