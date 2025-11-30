import React, { useState } from 'react';
import { AppStep, PillarTopic, LessonVariation, Course, GroundingSource, TokenUsage } from './types';
import { generatePillars, generateVariations, generateCourse } from './services/geminiService';
import { StepInput } from './components/StepInput';
import { StepPillars } from './components/StepPillars';
import { StepVariations } from './components/StepVariations';
import { CourseView } from './components/CourseView';
import { LoadingOverlay } from './components/LoadingOverlay';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT_TOPIC);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Data State
  const [pillars, setPillars] = useState<PillarTopic[]>([]);
  const [pillarSources, setPillarSources] = useState<GroundingSource[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<PillarTopic | null>(null);
  
  const [variations, setVariations] = useState<LessonVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<LessonVariation | null>(null);
  
  const [course, setCourse] = useState<Course | null>(null);

  // Token Usage State
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({ promptTokens: 0, responseTokens: 0, totalTokens: 0 });

  const handleUsageUpdate = (usage: TokenUsage) => {
    setTokenUsage(prev => ({
      promptTokens: prev.promptTokens + usage.promptTokens,
      responseTokens: prev.responseTokens + usage.responseTokens,
      totalTokens: prev.totalTokens + usage.totalTokens
    }));
  };

  const handleTopicSubmit = async (topic: string) => {
    setIsLoading(true);
    setLoadingMessage(`Analizando tendencias sobre "${topic}"...`);
    try {
      const { data, sources } = await generatePillars(topic, handleUsageUpdate);
      setPillars(data);
      setPillarSources(sources || []);
      setStep(AppStep.SELECT_PILLAR);
    } catch (error) {
      alert("Error generando temas. Por favor intenta de nuevo.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePillarSelect = async (pillar: PillarTopic) => {
    setSelectedPillar(pillar);
    setIsLoading(true);
    setLoadingMessage(`Diseñando variaciones para "${pillar.title}"...`);
    try {
      const data = await generateVariations(pillar, handleUsageUpdate);
      setVariations(data);
      setStep(AppStep.SELECT_VARIATION);
    } catch (error) {
      alert("Error generando lecciones. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariationSelect = async (variation: LessonVariation) => {
    setSelectedVariation(variation);
    setIsLoading(true);
    setLoadingMessage(`Creando contenido completo del curso "${variation.title}"... Esto puede tomar un minuto.`);
    try {
      const courseData = await generateCourse(variation, handleUsageUpdate);
      setCourse(courseData);
      setStep(AppStep.VIEW_COURSE);
    } catch (error) {
      alert("Error creando el curso. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPillars = () => {
    setStep(AppStep.SELECT_PILLAR);
    setVariations([]);
    setSelectedPillar(null);
  };

  const handleBackToVariations = () => {
    // IMPORTANT requirement: Button to return to the 10 variations to generate another course.
    setStep(AppStep.SELECT_VARIATION);
    setCourse(null);
    // We keep 'variations' and 'selectedPillar' in state so user sees same list
  };

  const handleRestart = () => {
     setStep(AppStep.INPUT_TOPIC);
     setPillars([]);
     setPillarSources([]);
     setVariations([]);
     setCourse(null);
     // Optional: Reset tokens on restart? No, better to keep tracking session usage.
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Token Counter UI */}
      <div className="fixed top-0 w-full z-50 pointer-events-none p-2 flex justify-center">
        <div className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-3 pointer-events-auto transition-opacity hover:opacity-100 opacity-70 border border-slate-700">
           <span className="flex items-center gap-1.5">
             <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             Total: {tokenUsage.totalTokens.toLocaleString()}
           </span>
           <span className="text-slate-500">|</span>
           <span className="text-slate-300">In: {tokenUsage.promptTokens.toLocaleString()}</span>
           <span className="text-slate-300">Out: {tokenUsage.responseTokens.toLocaleString()}</span>
        </div>
      </div>

      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {step === AppStep.INPUT_TOPIC && (
        <StepInput onNext={handleTopicSubmit} />
      )}

      {step === AppStep.SELECT_PILLAR && (
        <StepPillars 
          pillars={pillars} 
          sources={pillarSources}
          onSelect={handlePillarSelect} 
          onBack={handleRestart}
        />
      )}

      {step === AppStep.SELECT_VARIATION && selectedPillar && (
        <StepVariations 
          pillar={selectedPillar} 
          variations={variations} 
          onSelect={handleVariationSelect} 
          onBack={handleBackToPillars}
        />
      )}

      {step === AppStep.VIEW_COURSE && course && (
        <CourseView 
          course={course} 
          onBack={handleBackToVariations} 
        />
      )}
    </div>
  );
};

export default App;