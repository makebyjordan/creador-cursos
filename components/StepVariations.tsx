import React from 'react';
import { LessonVariation, PillarTopic } from '../types';

interface StepVariationsProps {
  pillar: PillarTopic;
  variations: LessonVariation[];
  onSelect: (variation: LessonVariation) => void;
  onBack: () => void;
}

export const StepVariations: React.FC<StepVariationsProps> = ({ pillar, variations, onSelect, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Volver a Pilares
          </button>
          <h2 className="text-3xl font-bold text-slate-900">Variaciones de Lección</h2>
          <p className="text-slate-600 mt-2">
            Opciones generadas para el pilar: <span className="font-semibold text-indigo-700">"{pillar.title}"</span>.
          </p>
        </div>
         <div className="text-right hidden md:block">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
             <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
             Paso 2 de 3
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variations.map((variation) => (
          <div 
            key={variation.id}
            onClick={() => onSelect(variation)}
            className="group flex flex-col bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-lg cursor-pointer transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                variation.difficulty === 'Principiante' ? 'bg-green-100 text-green-800' :
                variation.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {variation.difficulty}
              </span>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
              {variation.title}
            </h3>
            <p className="text-slate-600 text-sm flex-grow">
              <span className="font-semibold text-slate-700">Objetivo:</span> {variation.objective}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
