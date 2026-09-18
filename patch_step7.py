import re
import sys

with open('src/components/TherapistPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add step7Name to translations
content = content.replace("step6Name: '6. Übersicht & Analyse',", "step6Name: '6. Übersicht',\n    step7Name: '7. Analyse & Auswertung',")
content = content.replace("step6Name: '6. Overview & Analysis',", "step6Name: '6. Overview',\n    step7Name: '7. Analysis & Evaluation',")

# 2. Change TOTAL_WIZARD_STEPS to 7
content = content.replace("const TOTAL_WIZARD_STEPS = 6;", "const TOTAL_WIZARD_STEPS = 7;")

# 3. Add to stepNames
content = content.replace("    t('step6Name'),\n  ];", "    t('step6Name'),\n    t('step7Name'),\n  ];")

# 4. Modify handleRunAnalysis
handle_run_analysis_old = """  const handleRunAnalysis = () => {
    if (isLocked) {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!currentCase.hauptbeschwerde && !currentCase.spontanbericht && !currentCase.gemuetPsyche) {
      alert(t('mainComplaintTitle'));
      setCurrentStep(2);
      return;
    }

    // Attempt to decrement quota
    const res = incrementAnalysesUsed(therapist.id);
    if (!res.success) {
      setIsUpgradeModalOpen(true);
      return;
    }

    // Run modular homeopathy repertorisation engine
    const results = runHomeopathyAnalysis(currentCase);
    setAnalysisResults(results);
    alert(t('analysisComplete') || 'Analyse erfolgreich erstellt!');
  };"""

handle_run_analysis_new = """  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const handleRunAnalysis = async () => {
    if (isLocked) {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!currentCase.hauptbeschwerde && !currentCase.spontanbericht && !currentCase.gemuetPsyche) {
      alert(t('mainComplaintTitle'));
      setCurrentStep(2);
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(7);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: currentCase })
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      
      setAnalysisResults(data.analysis);
      
      // Attempt to decrement quota
      incrementAnalysesUsed(therapist.id);
    } catch (e) {
      console.error(e);
      alert('Fehler bei der Analyse-Erstellung.');
    } finally {
      setIsAnalyzing(false);
    }
  };"""

content = content.replace(handle_run_analysis_old, handle_run_analysis_new)

# 5. Add Step 7 to the switch or if blocks in the rendering section
# Need to find where step 6 is rendered.
step6_match = re.search(r'\{currentStep === 6 && \((.*?)\)\}\s*\{/\* Footer', content, re.DOTALL)
if step6_match:
    # We will append step 7 render logic right before the footer
    step7_ui = """
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-6 printable-header">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{stepNames[6]}</h3>
                          <p className="text-sm text-slate-500 mt-1">Patient: {currentCase.patientName || 'Unbenannt'}</p>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="print:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          Drucken
                        </button>
                      </div>
                      
                      {isAnalyzing ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                          <p>KI-Analyse wird erstellt... Bitte warten.</p>
                          <p className="text-xs mt-2 text-slate-400">Dies kann einige Sekunden dauern.</p>
                        </div>
                      ) : (
                        <div className="prose prose-slate max-w-none print:prose-sm print:text-black printable-content">
                          {typeof analysisResults === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: analysisResults.replace(/\\n/g, '<br/>').replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>') }} />
                          ) : analysisResults ? (
                             <pre className="whitespace-pre-wrap font-sans text-sm">{JSON.stringify(analysisResults, null, 2)}</pre>
                          ) : (
                            <div className="text-center py-10 text-slate-500">
                              <p>Noch keine Analyse erstellt.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
"""
    content = content.replace("{/* Footer", step7_ui + "\n                {/* Footer")

# 6. Make sure to import Printer icon and useState if needed
if "Printer" not in content:
    content = content.replace("import {", "import { Printer,", 1)

with open('src/components/TherapistPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully.")
