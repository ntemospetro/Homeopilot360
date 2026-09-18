import re

with open('src/components/TherapistPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

step7_ui = """
                {currentStep === 7 && (
                  <div className="space-y-6 animate-in fade-in-50 duration-150">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-6 print:hidden">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{stepNames[6]}</h3>
                          <p className="text-sm text-slate-500 mt-1">Patient: {currentCase.patientName || 'Unbenannt'}</p>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          Drucken
                        </button>
                      </div>
                      
                      {isAnalyzing ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-500 print:hidden">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                          <p>KI-Analyse wird erstellt... Bitte warten.</p>
                          <p className="text-xs mt-2 text-slate-400">Dies kann bis zu einer Minute dauern.</p>
                        </div>
                      ) : (
                        <div className="prose prose-slate max-w-none print:prose-sm print:text-black">
                          {typeof analysisResults === 'string' ? (
                            <div className="markdown-body"><Markdown>{analysisResults}</Markdown></div>
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

content = re.sub(r'(</>\s*}\)\s*\{\/\* Repertorisation \/ Analysis Results Modal \*\/})', step7_ui + r'\1', content)

if "import { Printer" not in content:
    content = content.replace("import {", "import { Printer,", 1)

if "import Markdown from 'react-markdown';" not in content:
    content = content.replace("import React,", "import Markdown from 'react-markdown';\nimport React,")

with open('src/components/TherapistPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully.")
