import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = r"\{/\* 1\. Stammdaten \*/\}.*?\{/\* 5\. Medikamenteneinnahme \*/\}"

replacement = """{/* 1. Stammdaten */}
                      <div className="p-5 bg-white border border-slate-200 rounded-lg md:col-span-2 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold text-slate-800 flex items-center gap-2 text-base">
                            <User className="w-4 h-4 text-teal-600" />
                            {t('profilePersonalDataTitle' as any) || 'Persönliche Daten'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 text-xs transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                          <div>
                            <span className="block text-slate-500 mb-1">{t('patientBirthDate' as any) || 'Geburtsdatum'}</span>
                            <span className="text-slate-900 font-medium">{currentCase.patientBirthDate || '-'}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 mb-1">{t('patientHeight' as any) || 'Größe (cm)'}</span>
                            <span className="text-slate-900 font-medium">{currentCase.patientHeightCm || '-'}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 mb-1">{t('patientWeight' as any) || 'Gewicht (kg)'}</span>
                            <span className="text-slate-900 font-medium">{currentCase.patientWeightKg || '-'}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 mb-1">{t('patientGender' as any) || 'Geschlecht'}</span>
                            <span className="text-slate-900 font-medium">
                              {currentCase.patientGender === 'weiblich' ? t('genderFemale' as any) : 
                               (currentCase.patientGender === 'männlich' ? t('genderMale' as any) : 
                               (currentCase.patientGender === 'divers' ? t('genderOther' as any) : '-'))}
                            </span>
                          </div>
                          <div>
                            <span className="block text-slate-500 mb-1">{t('patientMaritalStatus' as any) || 'Familienstand'}</span>
                            <span className="text-slate-900 font-medium">
                              {currentCase.patientMaritalStatus === 'ledig' ? t('maritalSingle' as any) : 
                               (currentCase.patientMaritalStatus === 'verheiratet' ? t('maritalMarried' as any) : 
                               (currentCase.patientMaritalStatus === 'geschieden' ? t('maritalDivorced' as any) : 
                               (currentCase.patientMaritalStatus === 'verwitwet' ? t('maritalWidowed' as any) : 
                               (currentCase.patientMaritalStatus === 'sonstiges' ? t('maritalOther' as any) : '-'))))}
                            </span>
                          </div>
                          <div>
                            <span className="block text-slate-500 mb-1">{t('hasChildren' as any) || 'Haben Sie Kinder?'}</span>
                            <span className="text-slate-900 font-medium">{currentCase.hasChildren ? t('yes') : t('no')}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Hauptbeschwerde */}
                      <div className="p-5 bg-white border border-slate-200 rounded-lg md:col-span-2 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold text-slate-800 flex items-center gap-2 text-base">
                            <MessageSquare className="w-4 h-4 text-teal-600" />
                            {stepNames[1]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 text-xs transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        <p className="text-slate-900 font-medium mb-4 whitespace-pre-wrap">
                          {currentCase.hauptbeschwerde || '-'}
                        </p>
                        
                        {currentCase.anamnesisQuestions && currentCase.anamnesisQuestions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                            {currentCase.anamnesisQuestions.map((q, idx) => (
                              <div key={q.id} className="text-sm">
                                <span className="block text-slate-500 mb-1">{idx + 1}. {q.questionText}</span>
                                <span className="text-slate-900 font-medium">
                                  {q.type === 'scale' ? `${q.answerScaleCurrent || '-'} (Aktuell) / ${q.answerScaleWorst || '-'} (Schlimmste)` : 
                                   (q.type === 'choice' ? q.answerChoice : 
                                   (q.type === 'multi_choice' ? q.answerMultiChoice?.join(', ') : q.answerText)) || '-'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Fragebogen */}
                      <div className="p-5 bg-white border border-slate-200 rounded-lg md:col-span-2 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold text-slate-800 flex items-center gap-2 text-base">
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            {stepNames[2]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 text-xs transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        {currentCase.extendedAnamnesis && Object.keys(currentCase.extendedAnamnesis).length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(currentCase.extendedAnamnesis).map(([key, val]) => {
                              if (!val || (Array.isArray(val) && val.length === 0)) return null;
                              return (
                                <div key={key} className="text-sm">
                                  <span className="block text-slate-500 mb-1 truncate">{key}</span>
                                  <span className="text-slate-900 font-medium break-words">
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-600">{t('noData')}</p>
                        )}
                      </div>

                      {/* 4. Befund */}
                      <div className="p-5 bg-white border border-slate-200 rounded-lg md:col-span-2 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold text-slate-800 flex items-center gap-2 text-base">
                            <FileText className="w-4 h-4 text-teal-600" />
                            {stepNames[3]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 text-xs transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {t('stepEditSection')}
                          </button>
                        </div>
                        {currentCase.befundGewuenscht ? (
                          <div className="space-y-4">
                            {currentCase.befundDetails && Object.keys(currentCase.befundDetails).length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                {Object.entries(currentCase.befundDetails).map(([key, val]) => {
                                  if (!val) return null;
                                  return (
                                    <div key={key}>
                                      <span className="block text-slate-500 mb-1 capitalize">{key}</span>
                                      <span className="text-slate-900 font-medium">{String(val)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {currentCase.befundText && (
                              <div className="text-sm">
                                <span className="block text-slate-500 mb-1">Text</span>
                                <span className="text-slate-900 font-medium whitespace-pre-wrap">{currentCase.befundText}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-600">{t('notDesired')}</p>
                        )}
                      </div>

                      {/* 5. Medikamenteneinnahme */}"""

content = re.sub(target, replacement, content, flags=re.DOTALL)

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)
