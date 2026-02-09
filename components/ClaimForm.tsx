
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Download, Calculator, User } from 'lucide-react';
import { OTLine, UserProfile, DayType } from '../types';
import { calculateHourlyRate, calculateMaxOTLimit, calculateOTHours, formatCurrency } from '../utils/calculations';
import { saveClaim } from '../firebase';

const INITIAL_PROFILE: UserProfile = {
  name: 'AHMAD HAFIZAN BIN HJ ABD. HALIM',
  ic: '830316075029',
  salaryNo: '830316075029',
  phone: '010-4664237',
  email: 'ahmadhafizan@penang.gov.my',
  position: 'PEMBANTU HAL EHWAL ISLAM (S19)',
  unit: 'PENYELIA QARYAH',
  paymentCenter: '-',
  bankAccount: 'MAYBANK / 164276559224',
  department: 'PEJABAT AGAMA DAERAH SEBERANG PERAI TENGAH',
  basicSalary: 2928.62,
  workingDays: 'Isnin-Jumaat',
  weekendDays: 'Sabtu-Ahad'
};

const ClaimForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [month, setMonth] = useState('01');
  const [year, setYear] = useState('2026');
  const [lines, setLines] = useState<OTLine[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  const addLine = () => {
    const newLine: OTLine = {
      id: crypto.randomUUID(),
      date: `${year}-${month}-01`,
      dayType: 'Biasa',
      normalFrom: '08:00',
      normalTo: '17:00',
      otFrom: '',
      otTo: '',
      tasks: '',
      hours_1_125: 0,
      hours_1_250: 0,
      hours_1_500: 0,
      hours_1_750: 0,
      hours_2_000: 0,
    };
    setLines([...lines, newLine]);
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, updates: Partial<OTLine>) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        const updated = { ...l, ...updates };
        const calculated = calculateOTHours(updated.dayType, updated.otFrom, updated.otTo);
        return {
          ...updated,
          hours_1_125: calculated['1.125'],
          hours_1_250: calculated['1.25'],
          hours_1_500: calculated['1.5'],
          hours_1_750: calculated['1.75'],
          hours_2_000: calculated['2.0'],
        };
      }
      return l;
    }));
  };

  const hourlyRate = calculateHourlyRate(profile.basicSalary);
  const maxLimit = calculateMaxOTLimit(profile.basicSalary);

  const totals = lines.reduce((acc, l) => ({
    '1.125': acc['1.125'] + l.hours_1_125,
    '1.25': acc['1.25'] + (l.dayType === 'Biasa' ? l.hours_1_250 : 0),
    '1.25_rehat': acc['1.25_rehat'] + (l.dayType === 'Rehat' ? l.hours_1_250 : 0),
    '1.5': acc['1.5'] + l.hours_1_500,
    '1.75': acc['1.75'] + l.hours_1_750,
    '2.0': acc['2.0'] + l.hours_2_000,
  }), { '1.125': 0, '1.25': 0, '1.25_rehat': 0, '1.5': 0, '1.75': 0, '2.0': 0 });

  const totalWeightedHours = 
    (totals['1.125'] * 1.125) + 
    (totals['1.25'] * 1.25) + 
    (totals['1.25_rehat'] * 1.25) + 
    (totals['1.5'] * 1.5) + 
    (totals['1.75'] * 1.75) + 
    (totals['2.0'] * 2.0);

  const totalAmount = totalWeightedHours * hourlyRate;

  const handleSave = async () => {
    setIsSaving(true);
    await saveClaim({
      month,
      year,
      profile,
      lines,
      createdAt: Date.now()
    });
    setIsSaving(false);
    onComplete();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Profile Section */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
          <User className="text-blue-600" />
          <h2 className="text-xl font-bold">Maklumat Peribadi</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Penuh</label>
            <input 
              className="w-full p-2 border rounded bg-gray-50 focus:bg-white" 
              value={profile.name} 
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">No. K/P</label>
            <input 
              className="w-full p-2 border rounded bg-gray-50 focus:bg-white" 
              value={profile.ic} 
              onChange={e => setProfile({...profile, ic: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Gaji Pokok (RM)</label>
            <input 
              type="number"
              className="w-full p-2 border rounded bg-gray-50 focus:bg-white font-mono" 
              value={profile.basicSalary} 
              onChange={e => setProfile({...profile, basicSalary: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Jawatan/Gred</label>
            <input 
              className="w-full p-2 border rounded bg-gray-50 focus:bg-white" 
              value={profile.position} 
              onChange={e => setProfile({...profile, position: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bank / No Akaun</label>
            <input 
              className="w-full p-2 border rounded bg-gray-50 focus:bg-white" 
              value={profile.bankAccount} 
              onChange={e => setProfile({...profile, bankAccount: e.target.value})}
            />
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">Kiraan Automatik</div>
            <div className="flex justify-between text-sm">
              <span>Kadar Sejam:</span>
              <span className="font-bold">{formatCurrency(hourlyRate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>1/3 Gaji (Had):</span>
              <span className="font-bold">{formatCurrency(maxLimit)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Period Section */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="text-indigo-600" />
          <h2 className="text-xl font-bold">Butiran Tuntutan</h2>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bulan</label>
            <select 
              className="w-full p-2 border rounded"
              value={month}
              onChange={e => setMonth(e.target.value)}
            >
              {['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'].map((m, i) => (
                <option key={m} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tahun</label>
            <input 
              type="number"
              className="w-full p-2 border rounded" 
              value={year} 
              onChange={e => setYear(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left w-24">Tarikh</th>
                <th className="border p-2 text-left w-32">Jenis Hari</th>
                <th className="border p-2 text-center" colSpan={2}>Waktu OT</th>
                <th className="border p-2 text-left">Tugas</th>
                <th className="border p-2 text-center w-16">1 1/8</th>
                <th className="border p-2 text-center w-16">1 1/4</th>
                <th className="border p-2 text-center w-16">1 1/2</th>
                <th className="border p-2 text-center w-16">1 3/4</th>
                <th className="border p-2 text-center w-16">2.0</th>
                <th className="border p-2 w-10"></th>
              </tr>
              <tr className="bg-gray-50 text-[10px]">
                <th className="border"></th>
                <th className="border"></th>
                <th className="border p-1">Dari</th>
                <th className="border p-1">Hingga</th>
                <th className="border"></th>
                <th colSpan={5} className="border p-1 text-center">Jam Dikira</th>
                <th className="border"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="border p-1">
                    <input 
                      type="date" 
                      className="w-full p-1 text-xs border-0 bg-transparent" 
                      value={line.date}
                      onChange={e => updateLine(line.id, { date: e.target.value })}
                    />
                  </td>
                  <td className="border p-1">
                    <select 
                      className="w-full p-1 text-xs border-0 bg-transparent"
                      value={line.dayType}
                      onChange={e => updateLine(line.id, { dayType: e.target.value as DayType })}
                    >
                      <option value="Biasa">Biasa</option>
                      <option value="Rehat">Rehat</option>
                      <option value="Kelepasan Am">Kelepasan Am</option>
                    </select>
                  </td>
                  <td className="border p-1">
                    <input 
                      type="time" 
                      className="w-full p-1 text-xs border-0 bg-transparent" 
                      value={line.otFrom}
                      onChange={e => updateLine(line.id, { otFrom: e.target.value })}
                    />
                  </td>
                  <td className="border p-1">
                    <input 
                      type="time" 
                      className="w-full p-1 text-xs border-0 bg-transparent" 
                      value={line.otTo}
                      onChange={e => updateLine(line.id, { otTo: e.target.value })}
                    />
                  </td>
                  <td className="border p-1">
                    <textarea 
                      className="w-full p-1 text-xs border-0 bg-transparent resize-none" 
                      rows={1}
                      value={line.tasks}
                      onChange={e => updateLine(line.id, { tasks: e.target.value })}
                      placeholder="Butir tugas..."
                    />
                  </td>
                  <td className="border p-1 text-center font-mono text-xs">{line.hours_1_125 || '-'}</td>
                  <td className="border p-1 text-center font-mono text-xs">{line.hours_1_250 || '-'}</td>
                  <td className="border p-1 text-center font-mono text-xs">{line.hours_1_500 || '-'}</td>
                  <td className="border p-1 text-center font-mono text-xs">{line.hours_1_750 || '-'}</td>
                  <td className="border p-1 text-center font-mono text-xs">{line.hours_2_000 || '-'}</td>
                  <td className="border p-1 text-center">
                    <button onClick={() => removeLine(line.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td colSpan={5} className="border p-2 text-right">JUMLAH JAM</td>
                <td className="border p-2 text-center">{totals['1.125'].toFixed(2)}</td>
                <td className="border p-2 text-center">{(totals['1.25'] + totals['1.25_rehat']).toFixed(2)}</td>
                <td className="border p-2 text-center">{totals['1.5'].toFixed(2)}</td>
                <td className="border p-2 text-center">{totals['1.75'].toFixed(2)}</td>
                <td className="border p-2 text-center">{totals['2.0'].toFixed(2)}</td>
                <td className="border"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button 
          onClick={addLine}
          className="mt-4 flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
        >
          <Plus size={18} />
          Tambah Baris
        </button>
      </section>

      {/* Summary Footer */}
      <section className="sticky bottom-6 bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-500 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Ringkasan Tuntutan</div>
          <div className="text-4xl font-black text-blue-600">{formatCurrency(totalAmount)}</div>
          {totalAmount > maxLimit && (
            <div className="text-xs text-red-500 font-semibold mt-1">
              ⚠️ Melebihi 1/3 gaji! (Sila dapatkan kelulusan khas)
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            disabled={lines.length === 0 || isSaving}
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isSaving ? 'Menyimpan...' : (
              <>
                <Save size={20} />
                Simpan Tuntutan
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ClaimForm;
