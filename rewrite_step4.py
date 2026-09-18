with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

# Add translations
trans_de = "addMedication: 'Medikament hinzufügen',"
trans_de_new = "addMedication: 'Medikament hinzufügen',\n    addCustomField: 'Weiteres Feld hinzufügen',\n    customFieldName: 'Feldname (z.B. BZ)',\n    customFieldValue: 'Wert (z.B. 120 mg/dl)',"

trans_en = "addMedication: 'Add Medication',"
trans_en_new = "addMedication: 'Add Medication',\n    addCustomField: 'Add Custom Field',\n    customFieldName: 'Field Name (e.g., Blood Sugar)',\n    customFieldValue: 'Value (e.g., 120 mg/dl)',"

content = content.replace(trans_de, trans_de_new).replace(trans_en, trans_en_new)

# Now, we need to extract Step 4 section.
start_idx = content.find('{currentCase.befundGewuenscht && (')
if start_idx == -1:
    print("Could not find step 4 block")
    exit(1)
    
end_idx = content.find('</div>\n                      )}', start_idx) + 33

step4_old = content[start_idx:end_idx]

step4_new = """{currentCase.befundGewuenscht && (
                        <div className="animate-in fade-in duration-200 space-y-6 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                          <div className="mb-4">
                            <h4 className="text-base font-bold text-slate-800">{tLocal('clinicalFindings')}</h4>
                            <p className="text-sm text-slate-600">{tLocal('clinicalFindingsDesc')}</p>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              {tLocal('overallAssessment')}
                            </label>
                            <div className="relative flex items-center">
                              <select
                                value={currentCase.befundDetails?.gesamtbeurteilung || ''}
                                onChange={(e) => setCurrentCase({ 
                                  ...currentCase, 
                                  befundDetails: { ...(currentCase.befundDetails || {}), gesamtbeurteilung: e.target.value } 
                                })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none"
                              >
                                <option value="">{tLocal('unknown')}</option>
                                <option value="Unauffällig">Unauffällig</option>
                                <option value="Leicht reduziert">Leicht reduziert</option>
                                <option value="Reduziert">Reduziert</option>
                                <option value="Kritisch">Kritisch</option>
                              </select>
                              <div className="absolute right-3 pointer-events-none text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-2">
                            {/* Left Column: Vitalparameter & More */}
                            <div className="space-y-6">
                              <div>
                                <h5 className="text-sm font-bold font-serif text-slate-900 border-b border-slate-200 pb-2 mb-4">{tLocal('vitalSigns')}</h5>
                                
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    {[
                                      { key: 'blutdruck', label: 'bloodPressure', ph: '120/80' },
                                      { key: 'puls', label: 'heartRate', ph: '72' }
                                    ].map(f => (
                                      <div key={f.key}>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">{tLocal(f.label)}</label>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            placeholder={f.ph}
                                            value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                            onChange={(e) => setCurrentCase({ 
                                              ...currentCase, 
                                              befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: e.target.value } 
                                            })}
                                            className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow"
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

                                  <div className="grid grid-cols-2 gap-4">
                                    {[
                                      { key: 'temperatur', label: 'temperature', ph: '36.8' },
                                      { key: 'spo2', label: 'spo2', ph: '98' }
                                    ].map(f => (
                                      <div key={f.key}>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">{tLocal(f.label)}</label>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            placeholder={f.ph}
                                            value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                            onChange={(e) => setCurrentCase({ 
                                              ...currentCase, 
                                              befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: e.target.value } 
                                            })}
                                            className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow"
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

                                  <div className="grid grid-cols-2 gap-4">
                                    {[
                                      { key: 'gewicht', label: 'weight', ph: '75' }
                                    ].map(f => (
                                      <div key={f.key}>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">{tLocal(f.label)}</label>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            placeholder={f.ph}
                                            value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                            onChange={(e) => setCurrentCase({ 
                                              ...currentCase, 
                                              befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: e.target.value } 
                                            })}
                                            className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow"
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
                              </div>
                              
                              <div className="space-y-4 pt-2">
                                {[
                                  { key: 'abdomen', label: 'abdomen', ph: 'Weich, eindrückbar...' },
                                  { key: 'hautSchleimhaeute', label: 'skinMucosa', ph: 'Rosig, feucht...' }
                                ].map(f => (
                                  <div key={f.key}>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">{tLocal(f.label)}</label>
                                    <div className="relative">
                                      <textarea
                                        rows={2}
                                        placeholder={f.ph}
                                        value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                        onChange={(e) => setCurrentCase({ 
                                          ...currentCase, 
                                          befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: e.target.value } 
                                        })}
                                        className="w-full px-3 py-2 pb-8 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow resize-y"
                                      />
                                      <div className="absolute bottom-2 right-2">
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

                            {/* Right Column: Untersuchungsbefund */}
                            <div>
                              <h5 className="text-sm font-bold font-serif text-slate-900 border-b border-slate-200 pb-2 mb-4">{tLocal('examinationFindings')}</h5>
                              <div className="space-y-4">
                                {[
                                  { key: 'allgemeinzustand', label: 'generalCondition', ph: 'AZ / EZ, Bewusstsein...' },
                                  { key: 'herzLunge', label: 'heartLungs', ph: 'Auskultationsbefund...' },
                                  { key: 'neurologisch', label: 'neurological', ph: 'Hirnnerven, Motorik, Sensibilität...' },
                                  { key: 'weitereBefunde', label: 'otherFindings', ph: 'Orthopädisch, HNO, Labor...' }
                                ].map(f => (
                                  <div key={f.key}>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">{tLocal(f.label)}</label>
                                    <div className="relative">
                                      <textarea
                                        rows={3}
                                        placeholder={f.ph}
                                        value={(currentCase.befundDetails as any)?.[f.key] || ''}
                                        onChange={(e) => setCurrentCase({ 
                                          ...currentCase, 
                                          befundDetails: { ...(currentCase.befundDetails || {}), [f.key]: e.target.value } 
                                        })}
                                        className="w-full px-3 py-2 pb-8 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow resize-y"
                                      />
                                      <div className="absolute bottom-2 right-2">
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
                                
                                {/* Custom Fields */}
                                {currentCase.befundDetails?.customFelder?.map((field, idx) => (
                                  <div key={field.id} className="relative p-3 rounded-lg border border-slate-200 bg-slate-50 mt-4 group">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newFields = [...(currentCase.befundDetails?.customFelder || [])];
                                        newFields.splice(idx, 1);
                                        setCurrentCase({
                                          ...currentCase,
                                          befundDetails: { ...(currentCase.befundDetails || {}), customFelder: newFields }
                                        });
                                      }}
                                      className="absolute -top-2 -right-2 p-1.5 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-full transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                    <div className="space-y-3">
                                      <input
                                        type="text"
                                        placeholder={tLocal('customFieldName')}
                                        value={field.name}
                                        onChange={(e) => {
                                          const newFields = [...(currentCase.befundDetails?.customFelder || [])];
                                          newFields[idx].name = e.target.value;
                                          setCurrentCase({
                                            ...currentCase,
                                            befundDetails: { ...(currentCase.befundDetails || {}), customFelder: newFields }
                                          });
                                        }}
                                        className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                      />
                                      <div className="relative">
                                        <textarea
                                          rows={2}
                                          placeholder={tLocal('customFieldValue')}
                                          value={field.value}
                                          onChange={(e) => {
                                            const newFields = [...(currentCase.befundDetails?.customFelder || [])];
                                            newFields[idx].value = e.target.value;
                                            setCurrentCase({
                                              ...currentCase,
                                              befundDetails: { ...(currentCase.befundDetails || {}), customFelder: newFields }
                                            });
                                          }}
                                          className="w-full px-3 py-2 pb-8 rounded-md border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-y"
                                        />
                                        <div className="absolute bottom-2 right-2">
                                          <VoiceInputButton
                                            id={`voice-custom-${field.id}`}
                                            value={field.value}
                                            onChange={(val) => {
                                              const newFields = [...(currentCase.befundDetails?.customFelder || [])];
                                              newFields[idx].value = val;
                                              setCurrentCase({
                                                ...currentCase,
                                                befundDetails: { ...(currentCase.befundDetails || {}), customFelder: newFields }
                                              });
                                            }}
                                            mode="append"
                                            size="xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFields = [...(currentCase.befundDetails?.customFelder || [])];
                                    newFields.push({ id: Math.random().toString(36).substr(2, 9), name: '', value: '' });
                                    setCurrentCase({
                                      ...currentCase,
                                      befundDetails: { ...(currentCase.befundDetails || {}), customFelder: newFields }
                                    });
                                  }}
                                  className="w-full py-2 px-3 mt-4 border border-dashed border-slate-300 hover:border-teal-400 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{tLocal('addCustomField')}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}"""

content = content.replace(step4_old, step4_new)

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

print("Rewrote Step 4 layout.")
