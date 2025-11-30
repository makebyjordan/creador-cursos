
// @ts-ignore
import JSZip from 'jszip';
import { Course } from '../types';
import { THEME_COLORS, THEME_BG_SOFT, THEME_BORDER, THEME_TEXT } from '../constants';

export const downloadCourseAsZip = async (course: Course) => {
  const zip = new JSZip();

  // 1. CSS Content
  const cssContent = `
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9; 
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1; 
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8; 
    }
    
    .markdown-content h1 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #1e293b; }
    .markdown-content h2 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #334155; }
    .markdown-content p { margin-bottom: 1rem; line-height: 1.75; color: #475569; }
    .markdown-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #475569; }
    .markdown-content li { margin-bottom: 0.5rem; }
    .markdown-content strong { font-weight: 700; color: #0f172a; }

    .quiz-option.correct { background-color: #f0fdf4; border-color: #22c55e; color: #15803d; }
    .quiz-option.incorrect { background-color: #fef2f2; border-color: #ef4444; color: #b91c1c; }
    .quiz-option.selected { border-color: #6366f1; background-color: #f8fafc; }
  `;

  // 2. JS Content (Logic for the standalone page)
  const jsContent = `
    const course = ${JSON.stringify(course)};
    
    // Theme Colors Helper
    const themeColors = {
      blue: { text: 'text-blue-800', bgSoft: 'bg-blue-50', border: 'border-blue-200', main: 'bg-blue-600' },
      indigo: { text: 'text-indigo-800', bgSoft: 'bg-indigo-50', border: 'border-indigo-200', main: 'bg-indigo-600' },
      emerald: { text: 'text-emerald-800', bgSoft: 'bg-emerald-50', border: 'border-emerald-200', main: 'bg-emerald-600' },
      rose: { text: 'text-rose-800', bgSoft: 'bg-rose-50', border: 'border-rose-200', main: 'bg-rose-600' },
      amber: { text: 'text-amber-800', bgSoft: 'bg-amber-50', border: 'border-amber-200', main: 'bg-amber-600' },
      violet: { text: 'text-violet-800', bgSoft: 'bg-violet-50', border: 'border-violet-200', main: 'bg-violet-600' },
    };
    
    const colors = themeColors[course.themeColor] || themeColors.blue;
    let currentModuleIndex = 0;
    let chartInstance = null;

    document.addEventListener('DOMContentLoaded', () => {
      renderHeader();
      renderSidebar();
      renderModule(0);
      
      // Setup Navigation
      document.getElementById('prev-btn').addEventListener('click', () => {
        if(currentModuleIndex > 0) renderModule(currentModuleIndex - 1);
      });
      document.getElementById('next-btn').addEventListener('click', () => {
        if(currentModuleIndex < course.modules.length - 1) renderModule(currentModuleIndex + 1);
      });
    });

    function renderHeader() {
      document.getElementById('course-title').textContent = course.title;
      const badge = document.getElementById('course-badge');
      badge.className = \`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide \${colors.bgSoft} \${colors.text}\`;
    }

    function renderSidebar() {
      const list = document.getElementById('module-list');
      list.innerHTML = '';
      course.modules.forEach((mod, idx) => {
        const btn = document.createElement('button');
        btn.className = \`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 \${idx === currentModuleIndex ? \`\${colors.bgSoft} \${colors.text} shadow-sm ring-1 ring-inset \${colors.border}\` : 'text-slate-600 hover:bg-slate-50'}\`;
        btn.innerHTML = \`<span class="mr-2 opacity-60">\${idx + 1}.</span>\${mod.title}\`;
        btn.onclick = () => renderModule(idx);
        btn.id = \`sidebar-btn-\${idx}\`;
        list.appendChild(btn);
      });
    }

    function renderModule(index) {
      currentModuleIndex = index;
      const module = course.modules[index];
      
      // Update Sidebar Active State
      document.querySelectorAll('#module-list button').forEach((btn, idx) => {
         btn.className = \`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 \${idx === index ? \`\${colors.bgSoft} \${colors.text} shadow-sm ring-1 ring-inset \${colors.border}\` : 'text-slate-600 hover:bg-slate-50'}\`;
      });

      // 1. Hero Image
      const heroImg = document.getElementById('hero-img');
      heroImg.src = \`https://picsum.photos/seed/\${module.imageKeyword + index}/1200/600\`;
      document.getElementById('hero-title').textContent = module.title;
      document.getElementById('hero-subtitle').textContent = \`Módulo \${index + 1}\`;

      // 2. Content
      document.getElementById('content-area').innerHTML = marked.parse(module.contentMarkdown);

      // 3. Chart
      const chartContainer = document.getElementById('chart-container');
      if (module.chartData && module.chartData.data.length > 0) {
        chartContainer.classList.remove('hidden');
        document.getElementById('chart-title').innerHTML = module.chartData.title;
        renderChart(module.chartData);
      } else {
        chartContainer.classList.add('hidden');
      }

      // 4. Quiz
      renderQuiz(module.quiz);

      // 5. Navigation Buttons
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === course.modules.length - 1;
      
      nextBtn.className = \`px-6 py-3 rounded-xl font-medium text-white shadow-md disabled:opacity-50 disabled:shadow-none transition-all \${index === course.modules.length - 1 ? 'bg-slate-300' : 'bg-slate-900 hover:bg-slate-800'}\`;

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderChart(data) {
      const ctx = document.getElementById('chart-canvas').getContext('2d');
      if (chartInstance) chartInstance.destroy();
      
      const chartColor = course.themeColor === 'indigo' ? '#4f46e5' : course.themeColor === 'emerald' ? '#059669' : '#3b82f6';
      
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.data.map(d => d.label),
          datasets: [{
            label: data.title,
            data: data.data.map(d => d.value),
            backgroundColor: chartColor,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    function renderQuiz(quiz) {
      const container = document.getElementById('quiz-questions');
      container.innerHTML = '';
      
      const quizBox = document.getElementById('quiz-box');
      // Set Theme Styles for Quiz Box
      quizBox.className = \`rounded-2xl p-6 md:p-8 border \${colors.bgSoft} \${colors.border}\`;
      document.getElementById('quiz-title').className = \`text-xl font-bold mb-6 flex items-center \${colors.text}\`;

      quiz.forEach((q, qIdx) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6';
        
        let html = \`<p class="font-semibold text-slate-900 mb-4">\${qIdx + 1}. \${q.question}</p><div class="space-y-3">\`;
        
        q.options.forEach((opt, optIdx) => {
          html += \`
            <button class="quiz-btn w-full text-left p-3 rounded-lg border border-slate-200 transition-all hover:bg-slate-50" data-q="\${qIdx}" data-opt="\${optIdx}">
              <div class="flex items-center">
                <div class="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center mr-3 flex-shrink-0 indicator"></div>
                \${opt}
              </div>
            </button>
          \`;
        });
        
        html += \`</div><div class="feedback mt-4 hidden p-4 rounded-lg text-sm"></div>\`;
        qDiv.innerHTML = html;
        container.appendChild(qDiv);
      });

      // Add Quiz Listeners
      document.querySelectorAll('.quiz-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const qIdx = parseInt(btn.dataset.q);
          const optIdx = parseInt(btn.dataset.opt);
          const question = quiz[qIdx];
          const parent = btn.closest('.bg-white');
          
          // Disable all buttons in this question
          parent.querySelectorAll('button').forEach(b => b.disabled = true);
          
          const isCorrect = optIdx === question.correctIndex;
          
          // Style Selected
          if (isCorrect) {
            btn.className = 'w-full text-left p-3 rounded-lg border bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500 transition-all';
            btn.querySelector('.indicator').className = 'w-5 h-5 rounded-full border border-green-500 bg-green-500 text-white flex items-center justify-center mr-3 flex-shrink-0';
            btn.querySelector('.indicator').innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>';
          } else {
            btn.className = 'w-full text-left p-3 rounded-lg border bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500 transition-all';
            btn.querySelector('.indicator').className = 'w-5 h-5 rounded-full border border-red-500 bg-red-500 text-white flex items-center justify-center mr-3 flex-shrink-0';
            btn.querySelector('.indicator').innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>';
            
            // Highlight Correct one
            const correctBtn = parent.querySelectorAll('button')[question.correctIndex];
            correctBtn.className = 'w-full text-left p-3 rounded-lg border bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500 transition-all';
             correctBtn.querySelector('.indicator').className = 'w-5 h-5 rounded-full border border-green-500 bg-green-500 text-white flex items-center justify-center mr-3 flex-shrink-0';
             correctBtn.querySelector('.indicator').innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>';
          }

          // Show Feedback
          const fb = parent.querySelector('.feedback');
          fb.classList.remove('hidden');
          fb.className = \`feedback mt-4 p-4 rounded-lg text-sm \${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}\`;
          fb.innerHTML = \`<strong class="block mb-1">\${isCorrect ? '¡Correcto!' : 'Incorrecto'}</strong>\${question.explanation}\`;
        });
      });
    }
  `;

  // 3. HTML Content
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="styles.css">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased">
    
    <!-- Sticky Header -->
    <header class="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div class="flex items-center gap-4">
              <h1 id="course-title" class="text-xl font-bold text-slate-900 truncate max-w-md">Cargando...</h1>
           </div>
           <div id="course-badge" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
             Curso Completo
           </div>
        </div>
    </header>

    <div class="flex flex-col md:flex-row max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)]">
        <!-- Sidebar -->
        <nav class="w-full md:w-72 bg-white border-r border-slate-200 flex-shrink-0 md:h-[calc(100vh-64px)] overflow-y-auto">
          <div class="p-6">
            <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Contenido del Curso</h2>
            <div id="module-list" class="space-y-1">
                <!-- Javascript will populate this -->
            </div>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-10 overflow-y-auto h-[calc(100vh-64px)]">
            <div class="max-w-3xl mx-auto">
                
                <!-- Hero Image -->
                <div class="relative h-64 w-full rounded-2xl overflow-hidden mb-8 shadow-md">
                    <img id="hero-img" src="" alt="Module Image" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div class="p-8">
                            <span id="hero-subtitle" class="text-white/80 text-sm font-medium uppercase tracking-wider mb-2 block"></span>
                            <h2 id="hero-title" class="text-3xl md:text-4xl font-bold text-white leading-tight"></h2>
                        </div>
                    </div>
                </div>

                <!-- Markdown Text -->
                <div id="content-area" class="markdown-content mb-12"></div>

                <!-- Chart -->
                <div id="chart-container" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-12 hidden">
                    <h3 id="chart-title" class="text-lg font-bold text-slate-900 mb-6 flex items-center"></h3>
                    <div class="h-64 w-full">
                        <canvas id="chart-canvas"></canvas>
                    </div>
                </div>

                <!-- Quiz -->
                <div id="quiz-box" class="rounded-2xl p-6 md:p-8 border bg-slate-50 border-slate-200">
                    <h3 id="quiz-title" class="text-xl font-bold mb-6 flex items-center text-slate-800">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Pon a prueba tu conocimiento
                    </h3>
                    <div id="quiz-questions" class="space-y-8"></div>
                </div>

                <!-- Footer Nav -->
                <div class="flex justify-between mt-12 pt-6 border-t border-slate-200 pb-10">
                    <button id="prev-btn" class="px-6 py-3 rounded-xl font-medium text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-colors">← Anterior</button>
                    <button id="next-btn" class="px-6 py-3 rounded-xl font-medium text-white bg-slate-900 shadow-md hover:bg-slate-800 disabled:opacity-50 disabled:shadow-none transition-all">Siguiente Lección →</button>
                </div>

            </div>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>`;

  zip.file("index.html", htmlContent);
  zip.file("styles.css", cssContent);
  zip.file("script.js", jsContent);

  // Generate ZIP
  const content = await zip.generateAsync({ type: "blob" });
  
  // Download trigger
  const url = window.URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `curso-${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
