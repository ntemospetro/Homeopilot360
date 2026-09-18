import sys

with open('src/components/TherapistPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                        <div className="prose prose-slate max-w-none print:prose-sm print:text-black">"""

replacement = """                        <div className="prose prose-slate max-w-none print:prose-sm print:text-black">
                          {/* Print-only Header for Analysis */}
                          <div className="hidden print:block mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Homöopathische Analyse & Diagnostik</h1>
                            <div className="text-sm text-slate-600 border-b border-slate-200 pb-4 mb-4">
                              <p><strong>Patient:</strong> {currentCase.patientName || 'Unbenannt'}</p>
                              <p><strong>Datum:</strong> {new Date().toLocaleDateString('de-DE')}</p>
                              <p><strong>Therapeut:</strong> {therapist?.name || 'Unbekannt'}</p>
                            </div>
                          </div>"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("target not found")

with open('src/components/TherapistPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated print layout.")
