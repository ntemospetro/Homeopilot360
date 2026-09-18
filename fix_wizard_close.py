import re

with open('src/components/ExtendedAnamnesisWizard.tsx', 'r') as f:
    content = f.read()

# Add states
if "showCloseConfirm" not in content:
    target = "const [currentStep, setCurrentStep] = useState(0);"
    replacement = "const [currentStep, setCurrentStep] = useState(0);\n  const [showCloseConfirm, setShowCloseConfirm] = useState(false);\n  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);"
    content = content.replace(target, replacement)

# Replace the close button action
target_close_btn = '''<button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>'''
replacement_close_btn = '''<button onClick={() => setShowCloseConfirm(true)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>'''
content = content.replace(target_close_btn, replacement_close_btn)

# Add the dialogs before the closing </div> of the main wrapper
target_end = '''</div>
    </div>
  );
};'''

replacement_dialogs = '''
        {/* Close Confirmation Dialog */}
        {showCloseConfirm && !showDiscardConfirm && (
          <div className="absolute inset-0 z-[200] bg-slate-900/40 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('wizardCloseTitle' as any) || 'Fortschritt speichern?'}</h3>
              <p className="text-sm text-slate-600 mb-6">
                {t('wizardCloseDesc' as any) || 'Möchten Sie die bisherigen Antworten speichern, bevor Sie den Fragebogen schließen?'}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onSave(values);
                    onClose();
                  }}
                  className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnSaveClose' as any) || 'Speichern & Schließen'}
                </button>
                <button
                  onClick={() => setShowDiscardConfirm(true)}
                  className="w-full px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnDiscard' as any) || 'Nicht speichern'}
                </button>
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnCancel' as any) || 'Abbrechen'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discard Confirmation Dialog */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 z-[200] bg-slate-900/40 flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-rose-600 mb-2">{t('wizardDiscardTitle' as any) || 'Sind Sie sicher?'}</h3>
              <p className="text-sm text-slate-600 mb-6">
                {t('wizardDiscardDesc' as any) || 'Alle ungespeicherten Eingaben in diesem Fragebogen gehen dauerhaft verloren.'}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onClose()}
                  className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnConfirmDiscard' as any) || 'Ja, verwerfen'}
                </button>
                <button
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    setShowCloseConfirm(false);
                  }}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('wizardBtnKeepEditing' as any) || 'Weiter bearbeiten'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};'''

if "{/* Close Confirmation Dialog */}" not in content:
    content = content.replace(target_end, replacement_dialogs)

with open('src/components/ExtendedAnamnesisWizard.tsx', 'w') as f:
    f.write(content)
