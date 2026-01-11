
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, FileText, FileSpreadsheet, FileBox, Trash2, Edit2, Scale, Database, Zap, Check, X as CloseIcon } from 'lucide-react';
import { LegalCase, ExportType } from './types';
import CaseForm from './components/CaseForm';
import BackupManager from './components/BackupManager';
import { exportToXLSX, exportToPDF, exportToDOCX } from './services/exportService';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
};

const App: React.FC = () => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. CARGA INICIAL Y SANEAMIENTO
  useEffect(() => {
    const saved = localStorage.getItem('iurisdata_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map(c => ({
            ...c,
            id: c.id || generateId()
          }));
          setCases(sanitized);
        }
      } catch (e) {
        console.error("Error cargando base de datos:", e);
      }
    }
  }, []);

  // 2. PERSISTENCIA AUTOMÁTICA
  useEffect(() => {
    localStorage.setItem('iurisdata_cases', JSON.stringify(cases));
  }, [cases]);

  const stats = useMemo(() => ({
    total: cases.length,
    virtual: cases.filter(c => c.medium === 'Virtual').length,
    presencial: cases.filter(c => c.medium === 'Presencial').length,
  }), [cases]);

  const filteredCases = useMemo(() => {
    return cases.filter(c => 
      (c.nurej || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.caseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.crime || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.lawyer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.parties || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [cases, searchTerm]);

  const handleSave = (caseData: Omit<LegalCase, 'id' | 'createdAt'>) => {
    if (editingCase) {
      setCases(prev => prev.map(c => c.id === editingCase.id ? { ...c, ...caseData } : c));
    } else {
      const newCase: LegalCase = {
        ...caseData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      setCases(prev => [newCase, ...prev]);
    }
    setIsFormOpen(false);
    setEditingCase(undefined);
  };

  const loadSampleData = () => {
    const sample: LegalCase = {
      id: generateId(),
      dateTime: new Date().toISOString().slice(0, 16),
      nurej: "2024" + Math.floor(Math.random() * 10000),
      caseNumber: "FIS-LPZ-" + Math.floor(Math.random() * 100) + "/2024",
      city: "La Paz",
      characteristics: "Caso de prueba generado automáticamente para verificar funciones.",
      parties: "Parte A vs. Parte B",
      crime: "Delito de Prueba",
      hearingType: "Cautelares",
      courtRoom: "Juzgado 1ro",
      lawyer: "Dr. Demo",
      medium: Math.random() > 0.5 ? 'Virtual' : 'Presencial',
      observations: "Registro generado por sistema.",
      createdAt: new Date().toISOString()
    };
    setCases(prev => [sample, ...prev]);
  };

  // FUNCIÓN DE ELIMINACIÓN DEFINITIVA
  const confirmDelete = (id: string) => {
    setCases(currentCases => currentCases.filter(c => c.id !== id));
    setDeletingId(null);
  };

  const handleExport = async (type: ExportType) => {
    if (cases.length === 0) return alert("No hay datos para exportar");
    try {
      switch(type) {
        case 'xlsx': exportToXLSX(cases); break;
        case 'pdf': exportToPDF(cases); break;
        case 'docx': await exportToDOCX(cases); break;
      }
    } catch (err) {
      console.error("Error en exportación:", err);
      alert("Error al generar el archivo.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white p-5 shadow-xl sticky top-0 z-40">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-blue-600 p-2.5 rounded-xl"><Scale size={28} /></div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">IurisData</h1>
              <p className="text-blue-300 text-[10px] uppercase font-bold tracking-widest">Legal Hub</p>
            </div>
          </div>
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por NUREJ, Delito, Partes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 focus:bg-white/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadSampleData} className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
              <Zap size={16} className="text-yellow-400" /> Demo
            </button>
            <button onClick={() => { setEditingCase(undefined); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg">
              <Plus size={20} /> Registrar Caso
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Base de Datos</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.total} <span className="text-sm font-normal text-slate-400">registros</span></h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Virtuales</p>
            <h3 className="text-3xl font-black text-teal-600">{stats.virtual}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Presenciales</p>
            <h3 className="text-3xl font-black text-orange-600">{stats.presencial}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => handleExport('xlsx')} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all">
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button onClick={() => handleExport('docx')} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
              <FileText size={18} /> Word
            </button>
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl border border-rose-100 font-bold text-sm hover:bg-rose-600 hover:text-white transition-all">
              <FileBox size={18} /> PDF
            </button>
          </div>
          <BackupManager data={cases} onRestore={setCases} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Fecha/Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">NUREJ / Caso</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Delito / Sede</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Partes</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Abogado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Modalidad</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCases.length > 0 ? filteredCases.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold">{new Date(c.dateTime).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{new Date(c.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-black text-blue-600">{c.nurej}</div>
                      <div className="text-[10px] font-bold text-slate-400">{c.caseNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold">{c.crime}</div>
                      <div className="text-[10px] text-slate-400">{c.city}</div>
                    </td>
                    <td className="px-6 py-4 text-xs max-w-[200px] truncate" title={c.parties}>{c.parties}</td>
                    <td className="px-6 py-4 text-xs font-bold">{c.lawyer}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${c.medium === 'Virtual' ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                        {c.medium}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-[140px]">
                      <div className="flex justify-center items-center gap-2">
                        {deletingId === c.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
                            <button 
                              onClick={() => confirmDelete(c.id)}
                              className="bg-rose-600 text-white text-[9px] font-black px-2 py-1 rounded-md hover:bg-rose-700 flex items-center gap-1 shadow-sm"
                            >
                              <Check size={12} /> CONFIRMAR
                            </button>
                            <button 
                              onClick={() => setDeletingId(null)}
                              className="bg-slate-200 text-slate-600 text-[9px] font-black px-2 py-1 rounded-md hover:bg-slate-300 flex items-center gap-1"
                            >
                              <CloseIcon size={12} /> CANCELAR
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingCase(c); setIsFormOpen(true); }} 
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                              title="Editar registro"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => setDeletingId(c.id)} 
                              className="p-2 text-slate-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all shadow-sm group"
                              title="Eliminar de la base de datos"
                            >
                              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                      No hay registros disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-6 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} IurisData - Sistema de Gestión de Causas</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Database size={12} /> Persistencia Local Habilitada</span>
          </div>
        </div>
      </footer>

      {isFormOpen && (
        <CaseForm 
          onSave={handleSave} 
          onClose={() => { setIsFormOpen(false); setEditingCase(undefined); }}
          initialData={editingCase}
        />
      )}
    </div>
  );
};

export default App;
