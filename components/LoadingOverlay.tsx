import React from 'react';

interface LoadingOverlayProps {
  message: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
      <h3 className="text-xl font-semibold text-slate-800 text-center animate-pulse">{message}</h3>
      <p className="text-slate-500 mt-2 text-center">Esto puede tomar unos segundos...</p>
    </div>
  );
};
