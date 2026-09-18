import re
import sys

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

# 1. Add COMMON_MEDICATIONS and localTranslations after imports
if 'const COMMON_MEDICATIONS' not in content:
    imports_end = content.find('export const TherapistPanel')
    if imports_end == -1:
        print("Could not find TherapistPanel export")
        sys.exit(1)
    
    injections = """
const COMMON_MEDICATIONS = [
  "Aspirin", "Ibuprofen", "Paracetamol", "Pantoprazol", "L-Thyroxin",
  "Ramipril", "Metoprolol", "Amlodipin", "Simvastatin", "Atorvastatin",
  "Metformin", "Novalgin", "Diclofenac", "Citalopram", "Sertralin",
  "Mirtazapin", "Omeprazol", "Bisoprolol", "Valsartan", "Candesartan",
  "Hydrochlorothiazid (HCT)", "Torasemid", "Furosemid", "Spironolacton",
  "Salbutamol", "Formoterol", "Budesonid", "Fluticason", "Levothyroxin",
  "Marcumar (Phenprocoumon)", "Eliquis (Apixaban)", "Xarelto (Rivaroxaban)",
  "Lixiana (Edoxaban)", "Clopidogrel", "ASS 100", "Allopurinol",
  "Pregabalin", "Gabapentin", "Amitriptylin", "Duloxetin", "Venlafaxin",
  "Escitalopram", "Fluoxetin", "Quetiapin", "Risperidon",
  "Lorazepam", "Diazepam", "Zopiclon", "Zolpidem", "Tamsulosin",
  "Finasterid", "Loperamid", "Macrogol", "Lactulose", "Domperidon",
  "MCP (Metoclopramid)", "Ondansetron", "Dimenhydrinat (Vomex)",
  "Cetirizin", "Loratadin", "Desloratadin", "Fexofenadin", "Prednisolon",
  "Dexamethason", "Hydrocortison", "Amoxicillin", "Cefuroxim", "Ciprofloxacin",
  "Doxycyclin", "Azithromycin", "Clindamycin", "Cotrimoxazol"
].sort();

const localTrans: Record<string, Record<string, string>> = {
  de: {
    clinicalFindings: 'Klinischer Befund',
    clinicalFindingsDesc: 'Erfassen Sie hier die Vitalparameter und den körperlichen Untersuchungsbefund.',
    overallAssessment: 'Gesamtbeurteilung',
    vitalSigns: 'Vitalparameter',
    bloodPressure: 'Blutdruck (mmHg)',
    heartRate: 'Puls (bpm)',
    temperature: 'Temperatur (°C)',
    spo2: 'SpO₂ (%)',
    weight: 'Gewicht (kg)',
    examinationFindings: 'Untersuchungsbefund',
    generalCondition: 'Allgemeinzustand',
    heartLungs: 'Herz / Lunge',
    abdomen: 'Abdomen',
    skinMucosa: 'Haut / Schleimhäute',
    neurological: 'Neurologisch',
    otherFindings: 'Weitere Befunde',
    takeMedication: 'Nehmen Sie derzeit Medikamente?',
    yesDesired: 'Ja, gewünscht',
    notDesired: 'Nicht gewünscht',
    yes: 'Ja',
    no: 'Nein',
    medication: 'Medikament',
    dosage: 'Dosierung',
    intake: 'Einnahmeart',
    addMedication: 'Medikament hinzufügen',
    unknown: 'Unbekannt / Offen'
  },
  en: {
    clinicalFindings: 'Clinical Findings',
    clinicalFindingsDesc: 'Record vital signs and physical examination findings here.',
    overallAssessment: 'Overall Assessment',
    vitalSigns: 'Vital Signs',
    bloodPressure: 'Blood Pressure (mmHg)',
    heartRate: 'Heart Rate (bpm)',
    temperature: 'Temperature (°C)',
    spo2: 'SpO₂ (%)',
    weight: 'Weight (kg)',
    examinationFindings: 'Examination Findings',
    generalCondition: 'General Condition',
    heartLungs: 'Heart / Lungs',
    abdomen: 'Abdomen',
    skinMucosa: 'Skin / Mucosa',
    neurological: 'Neurological',
    otherFindings: 'Other Findings',
    takeMedication: 'Are you currently taking any medication?',
    yesDesired: 'Yes, desired',
    notDesired: 'Not desired',
    yes: 'Yes',
    no: 'No',
    medication: 'Medication',
    dosage: 'Dosage',
    intake: 'Intake method',
    addMedication: 'Add Medication',
    unknown: 'Unknown / Open'
  }
};
"""
    content = content[:imports_end] + injections + content[imports_end:]

# Add tLocal to the component
if 'const tLocal = ' not in content:
    func_start = content.find('export const TherapistPanel')
    bracket = content.find('{', func_start)
    if bracket != -1:
        hook_injection = "\n  const { language } = useLanguage();\n  const tLocal = (key: string) => localTrans[language]?.[key] || localTrans['en']?.[key] || key;\n"
        content = content[:bracket+1] + hook_injection + content[bracket+1:]


target_step4_radios = """                      <div className="flex gap-4 mb-4">
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
                      </div>"""

repl_step4_radios = """                      <div className="flex gap-4 mb-4">
                        <button
                          type="button"
                          onClick={() => setCurrentCase({ ...currentCase, befundGewuenscht: true })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentCase.befundGewuenscht === true ? 'bg-teal-50 border-teal-500 text-teal-800' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${currentCase.befundGewuenscht === true ? 'bg-teal-600 border-teal-600' : 'border-slate-300'}`}>
                            {currentCase.befundGewuenscht === true && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {tLocal('yesDesired')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentCase({ ...currentCase, befundGewuenscht: false, befundText: '' })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentCase.befundGewuenscht === false ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${currentCase.befundGewuenscht === false ? 'bg-rose-600 border-rose-600' : 'border-slate-300'}`}>
                            {currentCase.befundGewuenscht === false && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {tLocal('notDesired')}
                        </button>
                      </div>"""

content = content.replace(target_step4_radios, repl_step4_radios)

target_step5_radios = """                      <div className="flex gap-4 mb-4">
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
                      </div>"""

repl_step5_radios = """                      <div className="flex gap-4 mb-4">
                        <button
                          type="button"
                          onClick={() => setCurrentCase({ ...currentCase, nimmtMedikamente: true })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentCase.nimmtMedikamente === true ? 'bg-teal-50 border-teal-500 text-teal-800' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${currentCase.nimmtMedikamente === true ? 'bg-teal-600 border-teal-600' : 'border-slate-300'}`}>
                            {currentCase.nimmtMedikamente === true && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {tLocal('yes')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentCase({ ...currentCase, nimmtMedikamente: false, medikamenteList: [] })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentCase.nimmtMedikamente === false ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${currentCase.nimmtMedikamente === false ? 'bg-rose-600 border-rose-600' : 'border-slate-300'}`}>
                            {currentCase.nimmtMedikamente === false && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {tLocal('no')}
                        </button>
                      </div>"""

content = content.replace(target_step5_radios, repl_step5_radios)


step4_old = """                      {currentCase.befundGewuenscht && (
                        <div className="animate-in fade-in duration-200 space-y-5">
                          <div className="mb-2">
                            <h4 className="text-sm font-bold text-slate-800">Klinischer Befund</h4>
                            <p className="text-xs text-slate-600">Erfassen Sie hier die Vitalparameter und den körperlichen Untersuchungsbefund.</p>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                              Gesamtbeurteilung
                            </label>
                            <input
                              type="text"
                              placeholder="Unbekannt / Offen"
                              value={currentCase.befundDetails?.gesamtbeurteilung || ''}
                              onChange={(e) => setCurrentCase({ 
                                ...currentCase, 
                                befundDetails: { ...(currentCase.befundDetails || {}), gesamtbeurteilung: e.target.value } 
                              })}
                              className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                            />
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <h5 className="text-xs font-bold text-slate-800 uppercase mb-3">Vitalparameter</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Blutdruck (mmHg)</label>
                                <input
                                  type="text"
                                  placeholder="120/80"
                                  value={currentCase.befundDetails?.blutdruck || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), blutdruck: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Puls (bpm)</label>
                                <input
                                  type="text"
                                  placeholder="72"
                                  value={currentCase.befundDetails?.puls || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), puls: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Temperatur (°C)</label>
                                <input
                                  type="text"
                                  placeholder="36.8"
                                  value={currentCase.befundDetails?.temperatur || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), temperatur: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">SpO₂ (%)</label>
                                <input
                                  type="text"
                                  placeholder="98"
                                  value={currentCase.befundDetails?.spo2 || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), spo2: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Gewicht (kg)</label>
                                <input
                                  type="text"
                                  placeholder="75"
                                  value={currentCase.befundDetails?.gewicht || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), gewicht: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <h5 className="text-xs font-bold text-slate-800 uppercase mb-3">Untersuchungsbefund</h5>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Allgemeinzustand</label>
                                <textarea
                                  rows={2}
                                  placeholder="AZ / EZ, Bewusstsein..."
                                  value={currentCase.befundDetails?.allgemeinzustand || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), allgemeinzustand: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Herz / Lunge</label>
                                <textarea
                                  rows={2}
                                  placeholder="Auskultationsbefund..."
                                  value={currentCase.befundDetails?.herzLunge || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), herzLunge: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Abdomen</label>
                                <textarea
                                  rows={2}
                                  placeholder="Weich, eindrückbar, kein Druckschmerz..."
                                  value={currentCase.befundDetails?.abdomen || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), abdomen: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Haut / Schleimhäute</label>
                                <textarea
                                  rows={2}
                                  placeholder="Rosig, feucht..."
                                  value={currentCase.befundDetails?.hautSchleimhaeute || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), hautSchleimhaeute: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Neurologisch</label>
                                <textarea
                                  rows={2}
                                  placeholder="Hirnnerven, Motorik, Sensibilität..."
                                  value={currentCase.befundDetails?.neurologisch || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), neurologisch: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Weitere Befunde</label>
                                <textarea
                                  rows={2}
                                  placeholder="Orthopädisch, HNO, Labor..."
                                  value={currentCase.befundDetails?.weitereBefunde || ''}
                                  onChange={(e) => setCurrentCase({ 
                                    ...currentCase, 
                                    befundDetails: { ...(currentCase.befundDetails || {}), weitereBefunde: e.target.value } 
                                  })}
                                  className="w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}"""

step4_new = """                      {currentCase.befundGewuenscht && (
                        <div className="animate-in fade-in duration-200 space-y-5">
                          <div className="mb-2">
                            <h4 className="text-sm font-bold text-slate-800">{tLocal('clinicalFindings')}</h4>
                            <p className="text-xs text-slate-600">{tLocal('clinicalFindingsDesc')}</p>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                              {tLocal('overallAssessment')}
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                placeholder={tLocal('unknown')}
                                value={currentCase.befundDetails?.gesamtbeurteilung || ''}
                                onChange={(e) => setCurrentCase({ 
                                  ...currentCase, 
                                  befundDetails: { ...(currentCase.befundDetails || {}), gesamtbeurteilung: e.target.value } 
                                })}
                                className="pr-8 w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                              />
                              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                <VoiceInputButton
                                  id="voice-gesamt"
                                  value={currentCase.befundDetails?.gesamtbeurteilung || ''}
                                  onChange={(val) => setCurrentCase({ ...currentCase, befundDetails: { ...(currentCase.befundDetails || {}), gesamtbeurteilung: val } })}
                                  mode="append"
                                  size="xs"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <h5 className="text-xs font-bold text-slate-800 uppercase mb-3">{tLocal('vitalSigns')}</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              {/* Vital fields wrapper helper */}
                              {[
                                { key: 'blutdruck', label: 'bloodPressure', ph: '120/80' },
                                { key: 'puls', label: 'heartRate', ph: '72' },
                                { key: 'temperatur', label: 'temperature', ph: '36.8' },
                                { key: 'spo2', label: 'spo2', ph: '98' },
                                { key: 'gewicht', label: 'weight', ph: '75' }
                              ].map(f => (
                                <div key={f.key}>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">{tLocal(f.label)}</label>
                                  <div className="relative flex items-center">
                                    <input
                                      type="text"
                                      placeholder={f.ph}
                                      value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                      onChange={(e) => setCurrentCase({ 
                                        ...currentCase, 
                                        befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: e.target.value } 
                                      })}
                                      className="pr-8 w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                    />
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                      <VoiceInputButton
                                        id={`voice-${f.key}`}
                                        value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                        onChange={(val) => setCurrentCase({ ...currentCase, befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: val } })}
                                        mode="append"
                                        size="xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <h5 className="text-xs font-bold text-slate-800 uppercase mb-3">{tLocal('examinationFindings')}</h5>
                            <div className="space-y-3">
                              {[
                                { key: 'allgemeinzustand', label: 'generalCondition', ph: 'AZ / EZ, Bewusstsein...' },
                                { key: 'herzLunge', label: 'heartLungs', ph: 'Auskultationsbefund...' },
                                { key: 'abdomen', label: 'abdomen', ph: 'Weich, eindrückbar, kein Druckschmerz...' },
                                { key: 'hautSchleimhaeute', label: 'skinMucosa', ph: 'Rosig, feucht...' },
                                { key: 'neurologisch', label: 'neurological', ph: 'Hirnnerven, Motorik, Sensibilität...' },
                                { key: 'weitereBefunde', label: 'otherFindings', ph: 'Orthopädisch, HNO, Labor...' }
                              ].map(f => (
                                <div key={f.key}>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">{tLocal(f.label)}</label>
                                  <div className="relative">
                                    <textarea
                                      rows={2}
                                      placeholder={f.ph}
                                      value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                      onChange={(e) => setCurrentCase({ 
                                        ...currentCase, 
                                        befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: e.target.value } 
                                      })}
                                      className="pb-8 w-full px-2.5 py-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                    />
                                    <div className="absolute bottom-1 right-1">
                                      <VoiceInputButton
                                        id={`voice-${f.key}`}
                                        value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                        onChange={(val) => setCurrentCase({ ...currentCase, befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: val } })}
                                        mode="append"
                                        size="xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}"""

content = content.replace(step4_old, step4_new)

# Step 5 - Medications
step5_old = """                          {currentCase.medikamenteList.map((med, index) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                              <button
                                type="button"
                                onClick={() => {
                                  const newList = currentCase.medikamenteList?.filter((_, i) => i !== index);
                                  setCurrentCase({ ...currentCase, medikamenteList: newList });
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pr-8">
                                <div className="sm:col-span-5">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Medikament</label>
                                  <input
                                    type="text"
                                    placeholder="z.B. Ramipril"
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
                      )}"""


step5_new = """                          {currentCase.medikamenteList.map((med, index) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                              <button
                                type="button"
                                onClick={() => {
                                  const newList = currentCase.medikamenteList?.filter((_, i) => i !== index);
                                  setCurrentCase({ ...currentCase, medikamenteList: newList });
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors z-10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pr-8">
                                <div className="sm:col-span-5">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">{tLocal('medication')}</label>
                                  <div className="relative flex items-center">
                                    <input
                                      type="text"
                                      list="medications-list"
                                      placeholder="z.B. Ramipril"
                                      value={med.name || ''}
                                      onChange={(e) => {
                                        const newList = [...(currentCase.medikamenteList || [])];
                                        newList[index] = { ...newList[index], name: e.target.value };
                                        setCurrentCase({ ...currentCase, medikamenteList: newList });
                                      }}
                                      className="pr-8 w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                    />
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                      <VoiceInputButton
                                        id={`voice-med-name-${index}`}
                                        value={med.name || ''}
                                        onChange={(val) => {
                                          const newList = [...(currentCase.medikamenteList || [])];
                                          newList[index] = { ...newList[index], name: val };
                                          setCurrentCase({ ...currentCase, medikamenteList: newList });
                                        }}
                                        mode="append"
                                        size="xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">{tLocal('dosage')}</label>
                                  <div className="relative flex items-center">
                                    <input
                                      type="text"
                                      placeholder="z.B. 400mg"
                                      value={med.dosierung || ''}
                                      onChange={(e) => {
                                        const newList = [...(currentCase.medikamenteList || [])];
                                        newList[index] = { ...newList[index], dosierung: e.target.value };
                                        setCurrentCase({ ...currentCase, medikamenteList: newList });
                                      }}
                                      className="pr-8 w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                    />
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                      <VoiceInputButton
                                        id={`voice-med-dos-${index}`}
                                        value={med.dosierung || ''}
                                        onChange={(val) => {
                                          const newList = [...(currentCase.medikamenteList || [])];
                                          newList[index] = { ...newList[index], dosierung: val };
                                          setCurrentCase({ ...currentCase, medikamenteList: newList });
                                        }}
                                        mode="append"
                                        size="xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="sm:col-span-4">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">{tLocal('intake')}</label>
                                  <div className="relative flex items-center">
                                    <input
                                      type="text"
                                      placeholder="z.B. 1x täglich"
                                      value={med.einnahmeart || ''}
                                      onChange={(e) => {
                                        const newList = [...(currentCase.medikamenteList || [])];
                                        newList[index] = { ...newList[index], einnahmeart: e.target.value };
                                        setCurrentCase({ ...currentCase, medikamenteList: newList });
                                      }}
                                      className="pr-8 w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                    />
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                      <VoiceInputButton
                                        id={`voice-med-ein-${index}`}
                                        value={med.einnahmeart || ''}
                                        onChange={(val) => {
                                          const newList = [...(currentCase.medikamenteList || [])];
                                          newList[index] = { ...newList[index], einnahmeart: val };
                                          setCurrentCase({ ...currentCase, medikamenteList: newList });
                                        }}
                                        mode="append"
                                        size="xs"
                                      />
                                    </div>
                                  </div>
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
                            <span>{tLocal('addMedication')}</span>
                          </button>

                          <datalist id="medications-list">
                            {COMMON_MEDICATIONS.map(med => (
                              <option key={med} value={med} />
                            ))}
                          </datalist>
                        </div>
                      )}"""

content = content.replace(step5_old, step5_new)


# Translate the labels for Step 4 Radio question
target_step4_q = """                        <label className="block text-xs font-bold text-slate-800 uppercase">
                          Befund erfassen?
                        </label>"""
repl_step4_q = """                        <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
                          {tLocal('clinicalFindings')}?
                        </label>"""
if "Befund erfassen?" in content:
    content = content.replace(target_step4_q, repl_step4_q)
else:
    pass

# Translate the labels for Step 5 Radio question
target_step5_q = """                        <label className="block text-xs font-bold text-slate-800 uppercase">
                          Nehmen Sie derzeit Medikamente?
                        </label>"""
repl_step5_q = """                        <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
                          {tLocal('takeMedication')}
                        </label>"""
if "Nehmen Sie derzeit Medikamente?" in content:
    content = content.replace(target_step5_q, repl_step5_q)


with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

print("Patch applied successfully")

