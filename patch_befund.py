import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target1 = """                      {currentCase.befundGewuenscht && (
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
                      )}"""

replacement1 = """                      {currentCase.befundGewuenscht && (
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

target2 = """                        <p className="text-slate-600 line-clamp-2">
                          {currentCase.befundGewuenscht ? currentCase.befundText || 'Kein Text' : 'Nicht gewünscht'}
                        </p>"""

replacement2 = """                        <p className="text-slate-600 line-clamp-2">
                          {currentCase.befundGewuenscht ? (currentCase.befundDetails ? 'Befunddetails erfasst' : (currentCase.befundText || 'Kein Text')) : 'Nicht gewünscht'}
                        </p>"""

if target1 in content and target2 in content:
    content = content.replace(target1, replacement1)
    content = content.replace(target2, replacement2)
    with open('src/components/TherapistPanel.tsx', 'w') as f:
        f.write(content)
    print("Patched TherapistPanel.tsx successfully")
else:
    print("Could not find targets")
    if target1 not in content:
        print("target1 not found")
    if target2 not in content:
        print("target2 not found")
