import re
import os

with open('/tmp/TherapistPanel.tsx.bak', 'r') as f:
    content = f.read()

# 1. Update TOTAL_WIZARD_STEPS
content = content.replace("const TOTAL_WIZARD_STEPS = 8;", "const TOTAL_WIZARD_STEPS = 6;")

# 2. Update stepNames array
stepnames_target = """  const stepNames = [
    t('step1Name'),
    t('step2Name'),
    t('step3Name'),
    t('step4Name'),
    t('step5Name'),
    t('step6Name'),
    t('step7Name'),
    t('step8Name'),
  ];"""
stepnames_replacement = """  const stepNames = [
    t('step1Name'),
    t('step2Name'),
    "3. Fragebogen (Erweiterte Anamnese)",
    "4. Befund",
    "5. Medikamenteneinnahme",
    "6. Übersicht & Analyse",
  ];"""
content = content.replace(stepnames_target, stepnames_replacement)

# 3. Remove "Erweiterte Homöopathische Anamnese (Fragebogen)" block from Step 1
block_start = '<div className="mt-8 p-6 bg-teal-50/50 border border-teal-200 rounded-xl space-y-4">'
block_end = '</div>\n                  </div>\n                )}\n\n                {/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}'

idx_start = content.find(block_start)
idx_end = content.find('{/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}')
if idx_start != -1 and idx_end != -1:
    extracted_block = content[idx_start:idx_end].strip()
    step1_end_str = """                  </div>
                )}"""
    content = content[:idx_start] + step1_end_str + "\n\n                {/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}" + content[idx_end + len('{/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}'):]

# 4. Replace Step 3, 4, 5, 6, 7, 8 components
steps_code_target_start = "{/* 3. SPONTANBERICHT */}"
steps_code_target_end = "{/* SEQUENTIAL NAVIGATION BUTTONS DIRECTLY UNDER EACH SECTION */}"

idx_s = content.find(steps_code_target_start)
idx_e = content.find(steps_code_target_end)

if idx_s != -1 and idx_e != -1:
    new_steps = """{/* 3. FRAGEBOGEN */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-150">
                    <div className="p-6 bg-teal-50/50 border border-teal-200 rounded-xl space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-teal-100 rounded-lg shrink-0">
                          <Stethoscope className="w-5 h-5 text-teal-700" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">Erweiterte Homöopathische Anamnese (Fragebogen)</h4>
                          <p className="text-xs text-slate-600 mb-4 max-w-xl">
                            Erfassen Sie strukturiert alle relevanten homöopathischen Daten wie Gesundheitszustand, Modalitäten, Verlangen, Schlaf und Gemüt in einem geführten Schritt-für-Schritt-Fragebogen.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsExtendedAnamnesisWizardOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Fragebogen starten
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. BEFUND */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-150">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800 uppercase" htmlFor="input-befund-gewuenscht">
                          Befund erfassen?
                        </label>
                      </div>
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="befundGewuenscht" 
                            checked={currentCase.befundGewuenscht === true} 
                            onChange={() => setCurrentCase({ ...currentCase, befundGewuenscht: true })} 
                            className="text-teal-600 focus:ring-teal-600"
                          />
                          Ja, gewünscht
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="befundGewuenscht" 
                            checked={currentCase.befundGewuenscht === false} 
                            onChange={() => setCurrentCase({ ...currentCase, befundGewuenscht: false, befundText: '' })} 
                            className="text-teal-600 focus:ring-teal-600"
                          />
                          Nicht gewünscht
                        </label>
                      </div>
                      
                      {currentCase.befundGewuenscht && (
                        <div className="animate-in fade-in duration-200">
                          <label className="block text-xs font-bold text-slate-800 uppercase mb-1" htmlFor="input-befund">
                            Befund Details
                          </label>
                          <textarea
                            id="input-befund"
                            rows={5}
                            placeholder="Klinischer Befund, Laborwerte, Arztbriefe..."
                            value={currentCase.befundText || ''}
                            onChange={(e) => setCurrentCase({ ...currentCase, befundText: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-md border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 leading-relaxed"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. MEDIKAMENTENEINNAHME */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-150">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800 uppercase">
                          Nehmen Sie derzeit Medikamente?
                        </label>
                      </div>
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="nimmtMedikamente" 
                            checked={currentCase.nimmtMedikamente === true} 
                            onChange={() => setCurrentCase({ ...currentCase, nimmtMedikamente: true })} 
                            className="text-teal-600 focus:ring-teal-600"
                          />
                          Ja
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="nimmtMedikamente" 
                            checked={currentCase.nimmtMedikamente === false} 
                            onChange={() => setCurrentCase({ ...currentCase, nimmtMedikamente: false, medikamenteList: [] })} 
                            className="text-teal-600 focus:ring-teal-600"
                          />
                          Nein
                        </label>
                      </div>
                      
                      {currentCase.nimmtMedikamente && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          {(currentCase.medikamenteList || []).map((med, index) => (
                            <div key={index} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2 relative group">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                                    {index + 1}
                                  </span>
                                  <span>Medikament</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newList = [...(currentCase.medikamenteList || [])];
                                    newList.splice(index, 1);
                                    setCurrentCase({ ...currentCase, medikamenteList: newList });
                                  }}
                                  className="text-slate-400 hover:text-rose-600 text-xs font-semibold p-1 rounded hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="sm:col-span-5">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Medikament</label>
                                  <input
                                    type="text"
                                    placeholder="z.B. Ibuprofen"
                                    value={med.name || ''}
                                    onChange={(e) => {
                                      const newList = [...(currentCase.medikamenteList || [])];
                                      newList[index] = { ...newList[index], name: e.target.value };
                                      setCurrentCase({ ...currentCase, medikamenteList: newList });
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Dosierung</label>
                                  <input
                                    type="text"
                                    placeholder="z.B. 400mg"
                                    value={med.dosierung || ''}
                                    onChange={(e) => {
                                      const newList = [...(currentCase.medikamenteList || [])];
                                      newList[index] = { ...newList[index], dosierung: e.target.value };
                                      setCurrentCase({ ...currentCase, medikamenteList: newList });
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                  />
                                </div>
                                <div className="sm:col-span-4">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Einnahmeart</label>
                                  <input
                                    type="text"
                                    placeholder="z.B. 1x täglich"
                                    value={med.einnahmeart || ''}
                                    onChange={(e) => {
                                      const newList = [...(currentCase.medikamenteList || [])];
                                      newList[index] = { ...newList[index], einnahmeart: e.target.value };
                                      setCurrentCase({ ...currentCase, medikamenteList: newList });
                                    }}
                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={() => {
                              const newList = [...(currentCase.medikamenteList || []), { name: '', dosierung: '', einnahmeart: '' }];
                              setCurrentCase({ ...currentCase, medikamenteList: newList });
                            }}
                            className="w-full py-2 px-3 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-100/50 text-teal-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Medikament hinzufügen</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. ÜBERSICHT & ANALYSE */}
                {currentStep === 6 && (
                  <div className="space-y-6 animate-in fade-in-50 duration-150">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{t('stepSummaryTitle')}</h4>
                      <p className="text-sm text-slate-600">{t('stepSummaryDesc')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* 1. Stammdaten */}
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-teal-600" />
                            {stepNames[0]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        <p className="text-slate-600">
                          {currentCase.patientName || '-'} ({currentCase.patientAge || '-'} {t('yearsLabel')})
                        </p>
                      </div>

                      {/* 2. Hauptbeschwerde */}
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                            {stepNames[1]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        <p className="text-slate-600 line-clamp-2">
                          {currentCase.hauptbeschwerde || '-'}
                        </p>
                        {currentCase.anamnesisQuestions && currentCase.anamnesisQuestions.length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                            <span className="text-[10px] text-teal-700 font-bold block">
                              + {currentCase.anamnesisQuestions.filter(
                                (q) =>
                                  q.answerScaleCurrent !== undefined ||
                                  q.answerScaleWorst !== undefined ||
                                  q.answerChoice ||
                                  (q.answerMultiChoice && q.answerMultiChoice.length > 0) ||
                                  q.answerText
                              ).length} dynamische Antworten erfasst
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 3. Fragebogen */}
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                            {stepNames[2]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        <p className="text-slate-600 line-clamp-2">
                          {currentCase.extendedAnamnesis ? Object.keys(currentCase.extendedAnamnesis).length + ' Felder erfasst' : 'Nicht erfasst'}
                        </p>
                      </div>

                      {/* 4. Befund */}
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            {stepNames[3]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        <p className="text-slate-600 line-clamp-2">
                          {currentCase.befundGewuenscht ? currentCase.befundText || 'Kein Text' : 'Nicht gewünscht'}
                        </p>
                      </div>

                      {/* 5. Medikamenteneinnahme */}
                      <div className="p-3 bg-white border border-slate-200 rounded-lg md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-teal-600" />
                            {stepNames[4]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        <p className="text-slate-600">
                          {currentCase.nimmtMedikamente 
                            ? (currentCase.medikamenteList && currentCase.medikamenteList.length > 0 
                                ? currentCase.medikamenteList.map(m => m.name).join(', ') 
                                : 'Keine Medikamente eingetragen')
                            : 'Nein'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              """ + steps_code_target_end
    
    content = content[:idx_s] + new_steps + content[idx_e + len(steps_code_target_end):]

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

