import React from 'react';
import { PillarTopic, GroundingSource } from '../types';

interface StepPillarsProps {
  pillars: PillarTopic[];
  sources?: GroundingSource[];
  onSelect: (pillar: PillarTopic) => void;
  onBack: () => void;
}

export const StepPillars: React.FC<StepPillarsProps> = ({ pillars, sources, onSelect, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Volver
          </button>
          <h2 className="text-3xl font-bold text-slate-900">Selecciona un Pilar Temático</h2>
          <p className="text-slate-600 mt-2">Hemos analizado tendencias y generado estos 10 pilares fundamentales para tu tema.</p>
        </div>
        <div className="text-right hidden md:block">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
             <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
             Paso 1 de 3
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {pillars.map((pillar) => (
          <div 
            key={pillar.id}
            onClick={() => onSelect(pillar)}
            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </div>
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
              Pilar {pillar.id}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">{pillar.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{pillar.description}</p>
          </div>
        ))}
      </div>

      {sources && sources.length > 0 && (
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            Fuentes Utilizadas (Google Search Grounding)
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sources.map((source, idx) => (
              <li key={idx}>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start text-xs text-indigo-600 hover:text-indigo-800 hover:underline break-all"
                >
                  <span className="mr-2 text-slate-400">•</span>
                  {source.title || source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
