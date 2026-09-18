import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = r"\{/\* 5\. Medikamenteneinnahme \*/\}.*?</div>\n                  </div>\n                \)\}"

replacement = """{/* 5. Medikamenteneinnahme */}
                      <div className="p-5 bg-white border border-slate-200 rounded-lg md:col-span-2 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold text-slate-800 flex items-center gap-2 text-base">
                            <Pill className="w-4 h-4 text-teal-600" />
                            {stepNames[4]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 text-xs transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        {currentCase.nimmtMedikamente ? (
                          <div className="space-y-3">
                            <span className="inline-block px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-md border border-rose-200 mb-2">
                              {t('yes')}
                            </span>
                            {currentCase.medikamenteList && currentCase.medikamenteList.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-2">
                                {currentCase.medikamenteList.map((m, idx) => (
                                  <div key={m.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <span className="block font-bold text-slate-800 mb-1">{m.name}</span>
                                    {m.dosierung && <span className="block text-slate-600 mb-0.5">Dosierung: {m.dosierung}</span>}
                                    {m.grund && <span className="block text-slate-600">Grund: {m.grund}</span>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-600">{t('none')}</p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-md border border-teal-200">
                            {t('no')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}"""

content = re.sub(target, replacement, content, flags=re.DOTALL)

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)
