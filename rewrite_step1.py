import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

target = r"\{/\* Name \*/\}.*?\{/\* Schwangerschaft \(Nur wenn weiblich\) \*/\}"
replacement = """{/* Name */}
                      <div className="sm:col-span-12">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="input-patient-name">
                          {t('patientName')}
                        </label>
                        <div className="relative flex items-center">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            id="input-patient-name"
                            type="text"
                            placeholder="Vorname Nachname"
                            value={currentCase.patientName || ''}
                            onChange={(e) => setCurrentCase({ ...currentCase, patientName: e.target.value })}
                            className="w-full pl-8 pr-9 py-2 border border-slate-300 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                          />
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                            <VoiceInputButton
                              value={currentCase.patientName || ''}
                              onChange={(val) => setCurrentCase({ ...currentCase, patientName: val })}
                              size="xs"
                              mode="append"
                              id="btn-voice-patient-name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Geburtsdatum */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="input-patient-birthdate">
                          {t('patientBirthDate' as TranslationKey) || 'Geburtsdatum'}
                        </label>
                        <input
                          id="input-patient-birthdate"
                          type="date"
                          value={currentCase.patientBirthDate || ''}
                          onChange={(e) => setCurrentCase({ ...currentCase, patientBirthDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                        />
                      </div>

                      {/* Alter */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="input-patient-age">
                          {t('patientAge')}
                        </label>
                        <input
                          id="input-patient-age"
                          type="number"
                          min="0"
                          max="125"
                          placeholder="z.B. 42"
                          value={currentCase.patientAge !== undefined ? currentCase.patientAge : ''}
                          onChange={(e) => setCurrentCase({ ...currentCase, patientAge: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                        />
                      </div>

                      {/* Geschlecht */}
                      <div className="sm:col-span-6">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="select-patient-gender">
                          {t('patientGender')}
                        </label>
                        <select
                          id="select-patient-gender"
                          value={currentCase.patientGender || 'weiblich'}
                          onChange={(e) => {
                            const newGender = e.target.value as any;
                            setCurrentCase({ 
                              ...currentCase, 
                              patientGender: newGender,
                              ...(newGender !== 'weiblich' ? { isPregnant: false, pregnancyMonth: undefined } : {})
                            });
                          }}
                          className="w-full px-2 py-2 border border-slate-300 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white h-[38px]"
                        >
                          <option value="weiblich">{t('genderFemale')}</option>
                          <option value="männlich">{t('genderMale')}</option>
                          <option value="divers">{t('genderOther')}</option>
                        </select>
                      </div>

                      {/* Körpergröße (cm) */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="input-patient-height">
                          {t('patientHeight')}
                        </label>
                        <div className="relative">
                          <input
                            id="input-patient-height"
                            type="number"
                            min="30"
                            max="260"
                            placeholder={t('patientHeightPlaceholder')}
                            value={currentCase.patientHeightCm !== undefined ? currentCase.patientHeightCm : ''}
                            onChange={(e) => setCurrentCase({ ...currentCase, patientHeightCm: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="w-full pl-3 pr-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                          />
                        </div>
                      </div>

                      {/* Gewicht (kg) */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="input-patient-weight">
                          {t('patientWeight' as TranslationKey) || 'Gewicht (kg)'}
                        </label>
                        <div className="relative">
                          <input
                            id="input-patient-weight"
                            type="number"
                            min="1"
                            max="300"
                            placeholder={t('patientWeightPlaceholder' as TranslationKey) || 'z.B. 75'}
                            value={currentCase.patientWeightKg !== undefined ? currentCase.patientWeightKg : ''}
                            onChange={(e) => setCurrentCase({ ...currentCase, patientWeightKg: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="w-full pl-3 pr-3 py-2 border border-slate-300 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 h-[38px]"
                          />
                        </div>
                      </div>

                      {/* Familienstand */}
                      <div className="sm:col-span-6">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="select-patient-marital">
                          {t('patientMaritalStatus' as TranslationKey) || 'Familienstand'}
                        </label>
                        <select
                          id="select-patient-marital"
                          value={currentCase.patientMaritalStatus || ''}
                          onChange={(e) => setCurrentCase({ ...currentCase, patientMaritalStatus: e.target.value as any })}
                          className="w-full px-2 py-2 border border-slate-300 rounded-md text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-teal-600 bg-white h-[38px]"
                        >
                          <option value="" disabled>-</option>
                          <option value="ledig">{t('maritalSingle' as TranslationKey) || 'Ledig'}</option>
                          <option value="verheiratet">{t('maritalMarried' as TranslationKey) || 'Verheiratet'}</option>
                          <option value="geschieden">{t('maritalDivorced' as TranslationKey) || 'Geschieden'}</option>
                          <option value="verwitwet">{t('maritalWidowed' as TranslationKey) || 'Verwitwet'}</option>
                          <option value="sonstiges">{t('maritalOther' as TranslationKey) || 'Sonstiges'}</option>
                        </select>
                      </div>

                      {/* Schwangerschaft (Nur wenn weiblich) */}"""

content = re.sub(target, replacement, content, flags=re.DOTALL)

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)
