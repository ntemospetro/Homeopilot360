import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

# 1. Change sidebar width from w-64 to w-80 or w-72 so the list fits well
content = content.replace('className="w-full md:w-64 bg-slate-100 border-r border-slate-200 flex flex-col flex-shrink-0"', 'className="w-full md:w-80 bg-slate-100 border-r border-slate-200 flex flex-col flex-shrink-0"')

# 2. Extract the cases list
cases_list_regex = r'(\s*\{\/\* Patient Cases List \*\/.*?\s*\{\/\* Quick Presets for instant testing \*\/.*?\n\s*<\/div>\n\s*<\/div>)'
match = re.search(cases_list_regex, content, re.DOTALL)
if match:
    cases_list_content = match.group(1)
    
    # We want to replace the whole lg:col-span-4 wrapper and leave only the right column
    wrapper_regex = r'(\s*)\{\/\* Left Column: Cases List & Quick Templates \*\/\}\n\s*<div className="lg:col-span-4 space-y-5">.*?<\/div>\n\s*<\/div>'
    
    # Actually it's easier to find the div by using the regex above
    content = re.sub(r'(\s*\{\/\* Left Column: Cases List & Quick Templates \*\/.*?\n\s*<\/div>\n\s*<\/div>)', '', content, flags=re.DOTALL)
    
    # 3. Change the right column to be full width
    content = content.replace('<div className="lg:col-span-8 card p-6 sm:p-8">', '<div className="w-full max-w-4xl mx-auto card p-6 sm:p-8">')
    content = content.replace('<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">', '<div className="w-full">')
    
    # 4. Inject the cases list into the sidebar
    # Find the button for cases
    button_regex = r'(<LayoutDashboard className="w-4 h-4" \/>\s*\{t\(\'tabCaseManagement\'\)\}\s*<\/button>)'
    
    sidebar_cases_list = """
            {panelTab === 'cases' && (
              <div className="mt-4 px-1">
                {/* Search Cases */}
                <div className="mb-3">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      id="input-case-search"
                      type="text"
                      placeholder="Patient suchen..."
                      value={caseSearchQuery}
                      onChange={(e) => setCaseSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 h-[34px]"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <VoiceInputButton
                        value={caseSearchQuery}
                        onChange={(val) => setCaseSearchQuery(val)}
                        size="xs"
                        mode="append"
                        id="btn-voice-case-search"
                      />
                    </div>
                  </div>
                </div>

                {/* Patient List */}
                {cases.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                    <BookOpen className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <span>{t('noCasesFound')}</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                    {cases
                      .filter((c) => {
                        if (!caseSearchQuery.trim()) return true;
                        const q = caseSearchQuery.toLowerCase();
                        return (
                          (c.patientName && c.patientName.toLowerCase().includes(q)) ||
                          (c.hauptbeschwerde && c.hauptbeschwerde.toLowerCase().includes(q)) ||
                          (c.spontanbericht && c.spontanbericht.toLowerCase().includes(q))
                        );
                      })
                      .map((c) => {
                        const isSelected = selectedCaseId === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCase(c)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col group ${
                              isSelected
                                ? 'bg-teal-50/70 border-teal-300 text-teal-950 font-medium shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                               <div className="font-semibold text-slate-900 truncate pr-2">
                                 {c.patientName || t('patientName')}
                               </div>
                               <div className="flex items-center gap-1 shrink-0">
                                 {c.analyzedAt && (
                                   <span className="w-2 h-2 rounded-full bg-teal-500" title="Analyzed" />
                                 )}
                                 <button
                                   onClick={(e) => handleDeleteCase(c.id, e)}
                                   title="Delete"
                                   className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                                 >
                                   <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               </div>
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-2">
                              {c.hauptbeschwerde || t('caseNotAnalyzed')}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
                
                <button
                  id="btn-new-case"
                  onClick={handleNewCase}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-teal-200/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('newCaseBtn')}</span>
                </button>
              </div>
            )}
"""
    
    content = re.sub(button_regex, r'\1\n' + sidebar_cases_list, content)
    
    with open('src/components/TherapistPanel.tsx', 'w') as f:
        f.write(content)
    print("Modifications done.")
else:
    print("Could not find cases list to extract.")

