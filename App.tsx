
import React, { useState, useEffect } from 'react';
import { LogIn, FileText, LayoutDashboard, LogOut, ChevronRight, Printer, Trash2, Loader2 } from 'lucide-react';
import ClaimForm from './components/ClaimForm';
import PDFView from './components/PDFView';
import { getClaims, deleteClaim, auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { OTClaim } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'form' | 'print'>('dashboard');
  const [selectedClaim, setSelectedClaim] = useState<OTClaim | null>(null);
  const [claims, setClaims] = useState<OTClaim[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const refreshClaims = async () => {
    if (auth.currentUser) {
      const data = await getClaims();
      setClaims(data as OTClaim[]);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        refreshClaims();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      } else {
        await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      }
    } catch (err: any) {
      let message = 'Ralat log masuk. Sila cuba lagi.';
      if (err.message.includes('auth/user-not-found')) message = 'Emel tidak dijumpai.';
      if (err.message.includes('auth/wrong-password')) message = 'Kata laluan salah.';
      if (err.message.includes('auth/email-already-in-use')) message = 'Emel ini sudah berdaftar.';
      setError(message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('dashboard');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Padam tuntutan ini?')) {
      await deleteClaim(id);
      refreshClaims();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <LogIn className="text-blue-600 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-800">Sistem E-Tuntutan OT</h1>
            <p className="text-gray-500 text-sm">{isRegistering ? 'Daftar akaun baru' : 'Log masuk untuk mulakan tuntutan'}</p>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Alamat Email</label>
              <input 
                type="email" 
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none" 
                placeholder="nama@jabatan.gov.my"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Kata Laluan</label>
              <input 
                type="password" 
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none" 
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
              />
            </div>
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
              {isRegistering ? 'Daftar Sekarang' : 'Log Masuk'}
            </button>
          </form>

          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full mt-4 text-sm text-blue-600 font-semibold hover:underline"
          >
            {isRegistering ? 'Sudah ada akaun? Log masuk' : 'Belum ada akaun? Daftar di sini'}
          </button>

          <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
            Penyata Tuntutan Elaun Lebih Masa Automatik
          </div>
        </div>
      </div>
    );
  }

  if (view === 'print' && selectedClaim) {
    return (
      <div className="min-h-screen bg-gray-200 py-10">
        <div className="max-w-4xl mx-auto flex justify-between mb-4 no-print px-4">
          <button onClick={() => setView('dashboard')} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold">Kembali</button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">
            <Printer size={18} /> Cetak Sekarang
          </button>
        </div>
        <div className="shadow-2xl mx-auto print:shadow-none bg-white">
          <PDFView claim={selectedClaim} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <FileText className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tighter">E-OT</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hidden md:inline text-sm text-gray-500 font-medium">Pengguna: <b className="text-gray-900">{user.email}</b></span>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {view === 'dashboard' ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Senarai Tuntutan</h1>
                <p className="text-gray-500">Uruskan tuntutan bulanan anda di sini.</p>
              </div>
              <button 
                onClick={() => setView('form')}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
              >
                Tuntutan Baru <ChevronRight size={18} />
              </button>
            </div>

            {claims.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="text-gray-400 w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Tiada tuntutan dijumpai</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Klik butang 'Tuntutan Baru' untuk menjana borang ELM bulan pertama anda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {claims.map((claim) => (
                  <div key={claim.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGOS', 'SEP', 'OKT', 'NOV', 'DIS'][parseInt(claim.month)-1]} {claim.year}
                      </div>
                      <button 
                        onClick={() => handleDelete(claim.id!)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mb-6">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Jumlah Tuntutan</div>
                      <div className="text-2xl font-black text-gray-900">
                        {new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(
                          claim.lines.reduce((acc, l) => {
                             const rate = (12 * claim.profile.basicSalary) / 2504;
                             const weighted = (l.hours_1_125 * 1.125) + 
                                              (l.hours_1_250 * 1.25) + 
                                              (l.hours_1_500 * 1.5) + 
                                              (l.hours_1_750 * 1.75) + 
                                              (l.hours_2_000 * 2.0);
                             return acc + (weighted * rate);
                          }, 0)
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedClaim(claim);
                        setView('print');
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                      <Printer size={18} /> Lihat & Cetak PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 min-h-[calc(100-4rem)]">
            <div className="max-w-7xl mx-auto px-4 py-6">
               <button 
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-4"
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <ClaimForm onComplete={() => { setView('dashboard'); refreshClaims(); }} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
