import React, { useState } from 'react';

interface StepInputProps {
  onNext: (topic: string) => void;
}

export const StepInput: React.FC<StepInputProps> = ({ onNext }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onNext(input.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center px-4 py-16">
      <div className="mb-8 flex justify-center">
        <div className="bg-indigo-100 p-4 rounded-2xl">
          <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Define tu Estrategia de Cursos
      </h1>
      <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto">
        Soy tu mentor virtual. Introduce un tema central y te ayudaré a desglosarlo en una estructura de cursos rentable y educativa usando datos actuales.
      </p>

      <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: Marketing Digital, Cocina Vegana, Python..."
          className="w-full pl-6 pr-32 py-4 text-lg bg-white border-2 border-slate-200 rounded-full focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium rounded-full transition-colors duration-200"
        >
          Comenzar
        </button>
      </form>
    </div>
  );
};
