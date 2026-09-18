import re

with open('src/components/TherapistProfileEditor.tsx', 'r') as f:
    content = f.read()

imports_addition = "import { addNameChangeRequest } from '../services/storage';\n"
if 'addNameChangeRequest' not in content:
    content = content.replace("import { useTranslation } from '../i18n/LanguageContext';", imports_addition + "import { useTranslation } from '../i18n/LanguageContext';")

# Add missing icons if needed: Edit3, FileText
if 'Edit3' not in content:
    content = content.replace('History,\n', 'History,\n  Edit3,\n  FileText,\n')

# State variables
state_additions = '''
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameChangeForm, setNameChangeForm] = useState({ vorname: therapist.vorname, nachname: therapist.nachname, reason: '' });
  const [nameChangeSuccess, setNameChangeSuccess] = useState(false);
'''

if 'const [isNameModalOpen' not in content:
    content = content.replace('const [emailInput, setEmailInput] = useState(therapist.email);', state_additions + '\n  const [emailInput, setEmailInput] = useState(therapist.email);')

# In handleSaveAll, add logic to track previous address and praxisname
save_logic = '''
    let changed = false;

    // PraxisName History
    if (praxisName.trim() !== (therapist.praxisName || '').trim()) {
      if (!updatedTherapist.previousPraxisNames) updatedTherapist.previousPraxisNames = [];
      if (therapist.praxisName) {
        updatedTherapist.previousPraxisNames.unshift({
          value: therapist.praxisName,
          changedAt: new Date().toISOString()
        });
      }
      updatedTherapist.praxisName = praxisName;
      changed = true;
    }

    // Address/Land History
    const oldAddrStr = `${therapist.adresse || ''}, ${therapist.land || ''}`.trim();
    const newAddrStr = `${adresse}, ${land}`.trim();
    if (oldAddrStr !== newAddrStr && oldAddrStr !== ',') {
      if (!updatedTherapist.previousAddresses) updatedTherapist.previousAddresses = [];
      if (therapist.adresse || therapist.land) {
        updatedTherapist.previousAddresses.unshift({
          value: oldAddrStr,
          changedAt: new Date().toISOString()
        });
      }
      updatedTherapist.adresse = adresse;
      updatedTherapist.land = land;
      changed = true;
    }
'''

# The current save logic has:
#    const hasEmailChanged = emailInput !== therapist.email;
#    const hasPhoneChanged = phoneInput !== therapist.telefon;
#    if (hasEmailChanged) { ... }
# Let's just prepend our logic before `if (hasEmailChanged)`

if 'PraxisName History' not in content:
    content = content.replace('const hasEmailChanged =', save_logic + '\n    const hasEmailChanged =')
    
    # We also need to fix `const hasAnyChanges`.
    # Currently it is:
    # const hasAnyChanges = emailInput !== therapist.email || phoneInput !== therapist.telefon || vorname !== therapist.vorname || nachname !== therapist.nachname || praxisName !== (therapist.praxisName || '') || adresse !== therapist.adresse || land !== therapist.land;
    
    # Actually wait, `handleSaveAll` uses `updatedTherapist.vorname = vorname` etc. 
    # Let's replace the whole assignment part in `handleSaveAll`.

# Let's just find `handleSaveAll`:
#   const handleSaveAll = (e?: React.FormEvent) => {
#    if (e) e.preventDefault();
#    
#    const updatedTherapist = { ...therapist };

handle_save_all_regex = re.compile(r'const handleSaveAll = .*?updatedTherapist\.land = land;', re.DOTALL)
new_handle_save_all = '''const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const updatedTherapist = { ...therapist };
    let changed = false;

    // Email
    if (emailInput !== therapist.email) {
      if (!updatedTherapist.previousEmails) updatedTherapist.previousEmails = [];
      updatedTherapist.previousEmails.unshift({
        value: therapist.email,
        changedAt: new Date().toISOString()
      });
      updatedTherapist.email = emailInput;
      changed = true;
    }

    // Telefon
    if (phoneInput !== therapist.telefon) {
      if (!updatedTherapist.previousPhones) updatedTherapist.previousPhones = [];
      updatedTherapist.previousPhones.unshift({
        value: therapist.telefon,
        changedAt: new Date().toISOString()
      });
      updatedTherapist.telefon = phoneInput;
      changed = true;
    }

    // PraxisName History
    if (praxisName.trim() !== (therapist.praxisName || '').trim()) {
      if (!updatedTherapist.previousPraxisNames) updatedTherapist.previousPraxisNames = [];
      if (therapist.praxisName) {
        updatedTherapist.previousPraxisNames.unshift({
          value: therapist.praxisName,
          changedAt: new Date().toISOString()
        });
      }
      updatedTherapist.praxisName = praxisName.trim();
      changed = true;
    }

    // Address History
    const oldAddrStr = `${therapist.adresse || ''}, ${therapist.land || ''}`.trim();
    const newAddrStr = `${adresse}, ${land}`.trim();
    if (oldAddrStr !== newAddrStr && oldAddrStr !== ',') {
      if (!updatedTherapist.previousAddresses) updatedTherapist.previousAddresses = [];
      if (therapist.adresse || therapist.land) {
        updatedTherapist.previousAddresses.unshift({
          value: oldAddrStr,
          changedAt: new Date().toISOString()
        });
      }
      updatedTherapist.adresse = adresse;
      updatedTherapist.land = land;
      changed = true;
    }
'''
content = handle_save_all_regex.sub(new_handle_save_all, content)


# Now let's fix `hasAnyChanges`
has_any_changes_regex = re.compile(r'const hasAnyChanges = .*?;', re.DOTALL)
new_has_any_changes = '''const hasAnyChanges = emailInput !== therapist.email || 
    phoneInput !== therapist.telefon || 
    praxisName !== (therapist.praxisName || '') || 
    adresse !== therapist.adresse || 
    land !== therapist.land;'''

# Actually, the regex might replace too much if there are multiple. 
# Let's do it safely:
content = content.replace(
    "const hasAnyChanges = emailInput !== therapist.email || phoneInput !== therapist.telefon || vorname !== therapist.vorname || nachname !== therapist.nachname || praxisName !== (therapist.praxisName || '') || adresse !== therapist.adresse || land !== therapist.land;",
    new_has_any_changes
)

# Render the name fields correctly (readOnly with a button)
# We need to find the "3. PERSÖNLICHE STAMMDATEN & PRAXISDATEN" section
stammdaten_regex = re.compile(r'\{\/\* 3\. PERSÖNLICHE STAMMDATEN \& PRAXISDATEN \*\/}.*?\{\/\* Land \*\/\}\s*<div>\s*<label.*?<\/div>\s*<\/div>\s*<\/div>', re.DOTALL)

stammdaten_new = '''{/* 3. PERSÖNLICHE STAMMDATEN & PRAXISDATEN */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                {t('profilePersonalDataTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Angaben zur Person, Praxisbezeichnung und Standortadresse. Name und Vorname können nur auf Anfrage geändert werden.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100 shrink-0">
              Historien-Tracking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vorname */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regFirstName')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={therapist.vorname}
                  readOnly
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Nachname */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t('regLastName')} *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNameChangeForm({ vorname: therapist.vorname, nachname: therapist.nachname, reason: '' });
                    setIsNameModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors border border-teal-200"
                >
                  <Edit3 className="w-3 h-3" />
                  Änderung beantragen
                </button>
              </div>
              <input
                type="text"
                value={therapist.nachname}
                readOnly
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            {/* Praxisname */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regPraxisName')}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={praxisName}
                  onChange={(e) => setPraxisName(e.target.value)}
                  placeholder="z.B. Praxis für Klassische Homöopathie"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            {/* Praxisadresse */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regAddress')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Straße, Hausnummer, PLZ Ort"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            {/* Land */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regCountry')}
              </label>
              <select
                value={land}
                onChange={(e) => setLand(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
              >
                <option value="Deutschland">Deutschland</option>
                <option value="Österreich">Österreich</option>
                <option value="Schweiz">Schweiz</option>
                <option value="Andere">Andere</option>
              </select>
            </div>
          </div>

          {/* HISTORY SECTION FOR MASTER DATA */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-slate-400" />
              Protokollierte Änderungen
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Names History */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-600">Name & Vorname</h5>
                {(!therapist.previousNames || therapist.previousNames.length === 0) ? (
                  <div className="text-[11px] text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                    Keine vorherigen Namen vorhanden.
                  </div>
                ) : (
                  therapist.previousNames.map((item, idx) => (
                    <div key={`name-${idx}`} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-mono line-through text-slate-500 text-xs">{item.value}</span>
                      <span className="text-[10px] text-slate-400">Geändert am: {formatDate(item.changedAt)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Praxis / Address History */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-600">Praxisbezeichnung</h5>
                  {(!therapist.previousPraxisNames || therapist.previousPraxisNames.length === 0) ? (
                    <div className="text-[11px] text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                      Keine vorherigen Praxisnamen vorhanden.
                    </div>
                  ) : (
                    therapist.previousPraxisNames.map((item, idx) => (
                      <div key={`praxis-${idx}`} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-mono line-through text-slate-500 text-xs">{item.value}</span>
                        <span className="text-[10px] text-slate-400">Geändert am: {formatDate(item.changedAt)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-600">Standortadresse</h5>
                  {(!therapist.previousAddresses || therapist.previousAddresses.length === 0) ? (
                    <div className="text-[11px] text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                      Keine vorherigen Adressen vorhanden.
                    </div>
                  ) : (
                    therapist.previousAddresses.map((item, idx) => (
                      <div key={`addr-${idx}`} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-mono line-through text-slate-500 text-xs">{item.value}</span>
                        <span className="text-[10px] text-slate-400">Geändert am: {formatDate(item.changedAt)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>'''
        
content = stammdaten_regex.sub(stammdaten_new, content)

# Name Change Modal
modal_ui = '''
      {/* Name Change Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                Namensänderung beantragen
              </h3>
              <button 
                onClick={() => { setIsNameModalOpen(false); setNameChangeSuccess(false); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {nameChangeSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Antrag erfolgreich gesendet</h4>
                  <p className="text-sm text-slate-500">
                    Der Administrator wurde benachrichtigt und wird Ihre Namensänderung in Kürze prüfen. Sie erhalten eine Benachrichtigung.
                  </p>
                  <button
                    onClick={() => { setIsNameModalOpen(false); setNameChangeSuccess(false); }}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-sm transition-colors"
                  >
                    Schließen
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Aus Sicherheits- und Rechnungsgründen müssen Namensänderungen durch einen Administrator bestätigt werden.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Neuer Vorname</label>
                      <input 
                        type="text" 
                        value={nameChangeForm.vorname}
                        onChange={(e) => setNameChangeForm({...nameChangeForm, vorname: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Neuer Nachname</label>
                      <input 
                        type="text" 
                        value={nameChangeForm.nachname}
                        onChange={(e) => setNameChangeForm({...nameChangeForm, nachname: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Grund der Änderung</label>
                      <textarea 
                        value={nameChangeForm.reason}
                        onChange={(e) => setNameChangeForm({...nameChangeForm, reason: e.target.value})}
                        placeholder="z.B. Heirat, Namensänderung..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsNameModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      disabled={!nameChangeForm.vorname || !nameChangeForm.nachname || !nameChangeForm.reason}
                      onClick={() => {
                        addNameChangeRequest({
                          therapistId: therapist.id,
                          therapistEmail: therapist.email,
                          oldVorname: therapist.vorname,
                          oldNachname: therapist.nachname,
                          requestedVorname: nameChangeForm.vorname,
                          requestedNachname: nameChangeForm.nachname,
                          reason: nameChangeForm.reason
                        });
                        setNameChangeSuccess(true);
                      }}
                      className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Antrag absenden
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
'''

content = content.replace('    </div>\n  );\n};', modal_ui + '\n    </div>\n  );\n};')

with open('src/components/TherapistProfileEditor.tsx', 'w') as f:
    f.write(content)
