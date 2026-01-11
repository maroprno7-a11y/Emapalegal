
import React from 'react';
import { Download, Upload, Server } from 'lucide-react';
import { LegalCase } from '../types';

interface BackupManagerProps {
  data: LegalCase[];
  onRestore: (data: LegalCase[]) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ data, onRestore }) => {
  const handleDownload = () => {
    if (data.length === 0) return alert("No hay datos para respaldar");
    const backup = JSON.stringify(data, null, 2);
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iurisdata_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onRestore(json);
          alert('Base de datos restaurada correctamente');
        } else {
          alert('Error: Formato de archivo incompatible');
        }
      } catch (err) {
        alert('Error crítico al leer el respaldo');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button 
        onClick={handleDownload}
        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all border border-slate-200 text-xs font-bold uppercase tracking-tight"
        title="Descarga un archivo JSON con todos tus casos"
      >
        <Download size={16} />
        Exportar Backup
      </button>
      
      <label className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer text-xs font-bold uppercase tracking-tight">
        <Upload size={16} />
        Importar Backup
        <input type="file" className="hidden" accept=".json" onChange={handleUpload} />
      </label>

      <button 
        onClick={() => alert('Sincronización en la Nube:\nEsta función requiere un backend (Node.js/Python). Al activarla, los datos se enviarán automáticamente a su servidor seguro.')}
        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all border border-blue-200 text-xs font-bold uppercase tracking-tight"
      >
        <Server size={16} />
        Nube
      </button>
    </div>
  );
};

export default BackupManager;
