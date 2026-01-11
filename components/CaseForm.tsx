
import React, { useState } from 'react';
import { LegalCase, HearingMedium } from '../types';
import { X, Save, Sparkles } from 'lucide-react';
import { analyzeCase } from '../services/geminiService';

interface CaseFormProps {
  onSave: (caseData: Omit<LegalCase, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  initialData?: LegalCase;
}

const CaseForm: React.FC<CaseFormProps> = ({ onSave, onClose, initialData }) => {
  const [formData, setFormData] = useState<Omit<LegalCase, 'id' | 'createdAt'>>({
    dateTime: initialData?.dateTime || '',
    nurej: initialData?.nurej || '',
    caseNumber: initialData?.caseNumber || '',
    city: initialData?.city || '',
    characteristics: initialData?.characteristics || '',
    parties: initialData?.parties || '',
    crime: initialData?.crime || '',
    hearingType: initialData?.hearingType || '',
    courtRoom: initialData?.courtRoom || '',
    lawyer: initialData?.lawyer || '',
    medium: initialData?.medium || 'Presencial',
    observations: initialData?.observations || '',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAIAnalysis = async () => {
    if (!formData.characteristics) return;
    setIsAnalyzing(true);
    const summary = await analyzeCase(formData.characteristics, formData.crime);
    setFormData(prev => ({ ...prev, observations: prev.observations ? `${prev.observations}\n\nResumen IA: ${summary}` : `Resumen IA: ${summary}` }));
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          {initialData ? 'Editar Caso Legal' : 'Registrar Nuevo Caso'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Fecha y Hora</label>
            <input required type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">NUREJ</label>
            <input required type="text" name="nurej" placeholder="Ej: 12345678" value={formData.nurej} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Número de Caso</label>
            <input required type="text" name="caseNumber" placeholder="Ej: FIS-123/2023" value={formData.caseNumber} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Ciudad</label>
            <input required type="text" name="city" placeholder="Ej: La Paz" value={formData.city} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Delito</label>
            <input required type="text" name="crime" placeholder="Ej: Estafa" value={formData.crime} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Tipo de Audiencia</label>
            <input required type="text" name="hearingType" placeholder="Ej: Medidas Cautelares" value={formData.hearingType} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Juzgado/Sala</label>
            <input required type="text" name="courtRoom" placeholder="Ej: Juzgado 1ro de Instrucción" value={formData.courtRoom} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Abogado</label>
            <input required type="text" name="lawyer" placeholder="Ej: Dr. Juan Pérez" value={formData.lawyer} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Medio</label>
            <select name="medium" value={formData.medium} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>

          <div className="col-span-full flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Partes Involucradas</label>
            <input required type="text" name="parties" placeholder="Demandante vs Demandado" value={formData.parties} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="col-span-full flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-gray-600">Características del Caso</label>
              <button 
                type="button" 
                onClick={handleAIAnalysis}
                disabled={isAnalyzing || !formData.characteristics}
                className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                <Sparkles size={14} />
                {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
              </button>
            </div>
            <textarea name="characteristics" rows={3} value={formData.characteristics} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>

          <div className="col-span-full flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">Observaciones</label>
            <textarea name="observations" rows={2} value={formData.observations} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>

          <div className="col-span-full pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md">
              <Save size={18} />
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseForm;
