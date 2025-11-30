import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Course, CourseModule } from '../types';
import { THEME_COLORS, THEME_BG_SOFT, THEME_BORDER, THEME_TEXT } from '../constants';
import { downloadCourseAsZip } from '../services/downloadService';

interface CourseViewProps {
  course: Course;
  onBack: () => void;
}

export const CourseView: React.FC<CourseViewProps> = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number | null}>({});
  const [showExplanation, setShowExplanation] = useState<{[key: string]: boolean}>({});
  const [isDownloading, setIsDownloading] = useState(false);

  const themeClass = THEME_COLORS[course.themeColor] || THEME_COLORS.blue;
  const bgSoftClass = THEME_BG_SOFT[course.themeColor] || THEME_BG_SOFT.blue;
  const borderClass = THEME_BORDER[course.themeColor] || THEME_BORDER.blue;
  const textClass = THEME_TEXT[course.themeColor] || THEME_TEXT.blue;

  const activeModule = course.modules[activeTab];

  const handleQuizSelect = (questionIdx: number, optionIdx: number) => {
    setQuizAnswers(prev => ({...prev, [`${activeTab}-${questionIdx}`]: optionIdx}));
  };

  const handleCheckAnswer = (questionIdx: number) => {
    setShowExplanation(prev => ({...prev, [`${activeTab}-${questionIdx}`]: true}));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCourseAsZip(course);
    } catch (e) {
      console.error("Download failed", e);
      alert("Hubo un error al preparar la descarga.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                title="Generar otro curso"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 truncate max-w-md hidden sm:block">{course.title}</h1>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
             <button
               onClick={handleDownload}
               disabled={isDownloading}
               className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                 isDownloading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
               }`}
             >
               {isDownloading ? (
                 <>
                   <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin mr-2"></div>
                   Preparando...
                 </>
               ) : (
                 <>
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   Descargar (ZIP)
                 </>
               )}
             </button>
             <div className={`hidden md:block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${bgSoftClass} ${textClass}`}>
               Curso Completo
             </div>
           </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-72 bg-white border-r border-slate-200 flex-shrink-0 md:h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Contenido del Curso</h2>
            <div className="space-y-1">
              {course.modules.map((module, idx) => (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveTab(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === idx 
                      ? `${bgSoftClass} ${textClass} shadow-sm ring-1 ring-inset ${borderClass}` 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="mr-2 opacity-60">{idx + 1}.</span>
                  {module.title}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            
            {/* Module Header Image */}
            <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 shadow-md">
              <img 
                src={`https://picsum.photos/seed/${activeModule.imageKeyword + activeTab}/1200/600`}
                alt={activeModule.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-8">
                  <span className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2 block">Módulo {activeTab + 1}</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{activeModule.title}</h2>
                </div>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-lg prose-slate max-w-none mb-12">
              <ReactMarkdown 
                 components={{
                   h1: ({node, ...props}) => <h3 className={`text-2xl font-bold mt-8 mb-4 ${textClass}`} {...props} />,
                   h2: ({node, ...props}) => <h4 className="text-xl font-semibold mt-6 mb-3 text-slate-800" {...props} />,
                   strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                   ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 my-4 text-slate-600" {...props} />,
                   li: ({node, ...props}) => <li className="pl-1" {...props} />,
                 }}
              >
                {activeModule.contentMarkdown}
              </ReactMarkdown>
            </div>

            {/* Optional Chart */}
            {activeModule.chartData && activeModule.chartData.data.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-12">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <svg className={`w-5 h-5 mr-2 ${textClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                  {activeModule.chartData.title}
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeModule.chartData.data}>
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: 'transparent'}}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                         {activeModule.chartData.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={course.themeColor === 'indigo' ? '#4f46e5' : course.themeColor === 'emerald' ? '#059669' : '#3b82f6'} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Quiz Section */}
            <div className={`rounded-2xl p-6 md:p-8 ${bgSoftClass} border ${borderClass}`}>
              <h3 className={`text-xl font-bold mb-6 flex items-center ${textClass}`}>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pon a prueba tu conocimiento
              </h3>
              
              <div className="space-y-8">
                {activeModule.quiz.map((q, qIdx) => {
                  const selected = quizAnswers[`${activeTab}-${qIdx}`];
                  const isChecked = showExplanation[`${activeTab}-${qIdx}`];
                  const isCorrect = selected === q.correctIndex;

                  return (
                    <div key={qIdx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                      <p className="font-semibold text-slate-900 mb-4">{qIdx + 1}. {q.question}</p>
                      <div className="space-y-3">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            disabled={isChecked}
                            onClick={() => handleQuizSelect(qIdx, optIdx)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              isChecked 
                                ? optIdx === q.correctIndex 
                                  ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
                                  : selected === optIdx 
                                    ? 'bg-red-50 border-red-300 text-red-700'
                                    : 'border-slate-200 opacity-60'
                                : selected === optIdx 
                                  ? `bg-slate-50 border-indigo-500 ring-1 ring-indigo-500 text-slate-900` 
                                  : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 ${
                                isChecked && optIdx === q.correctIndex ? 'border-green-500 bg-green-500 text-white' :
                                isChecked && selected === optIdx && !isCorrect ? 'border-red-500 bg-red-500 text-white' :
                                selected === optIdx ? 'border-indigo-500' : 'border-slate-300'
                              }`}>
                                {isChecked && optIdx === q.correctIndex && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                {isChecked && selected === optIdx && !isCorrect && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                                {!isChecked && selected === optIdx && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>}
                              </div>
                              {opt}
                            </div>
                          </button>
                        ))}
                      </div>

                      {selected !== undefined && selected !== null && !isChecked && (
                        <button
                          onClick={() => handleCheckAnswer(qIdx)}
                          className={`mt-4 px-4 py-2 ${themeClass} rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
                        >
                          Comprobar Respuesta
                        </button>
                      )}

                      {isChecked && (
                        <div className={`mt-4 p-4 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                          <strong className="block mb-1">{isCorrect ? '¡Correcto!' : 'Incorrecto'}</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-6 border-t border-slate-200">
               <button
                 disabled={activeTab === 0}
                 onClick={() => {
                   setActiveTab(prev => prev - 1);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 }}
                 className="px-6 py-3 rounded-xl font-medium text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-colors"
               >
                 ← Anterior
               </button>
               <button
                 disabled={activeTab === course.modules.length - 1}
                 onClick={() => {
                   setActiveTab(prev => prev + 1);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 }}
                 className={`px-6 py-3 rounded-xl font-medium text-white shadow-md disabled:opacity-50 disabled:shadow-none transition-all ${activeTab === course.modules.length - 1 ? 'bg-slate-300' : 'bg-slate-900 hover:bg-slate-800'}`}
               >
                 Siguiente Lección →
               </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};