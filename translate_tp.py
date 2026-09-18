import re

with open('src/components/TherapistPanel.tsx', 'r') as f:
    content = f.read()

# 1. Update localTrans
de_trans = """  de: {
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
    addCustomField: 'Weiteres Feld hinzufügen',
    customFieldName: 'Feldname (z.B. BZ)',
    customFieldValue: 'Wert (z.B. 120 mg/dl)',
    unknown: 'Unbekannt / Offen',
    step3Name: '3. Fragebogen (Erweiterte Anamnese)',
    step4Name: '4. Befund',
    step5Name: '5. Medikamenteneinnahme',
    step6Name: '6. Übersicht & Analyse',
    recordFindings: 'Befund erfassen?',
    overviewTitle: 'Fall-Übersicht',
    noData: 'Nicht erfasst',
    fieldsRecorded: 'Felder erfasst',
    findingsDetailsRecorded: 'Befunddetails erfasst',
    noText: 'Kein Text',
    medsRecorded: 'Medikamente erfasst',
    none: 'Keine',
    addMedInfo: 'Hier können Sie die aktuelle Medikation des Patienten erfassen.',
    chiefComplaint: 'Hauptbeschwerde',
    modalities: 'Modalitäten',
    better: 'Besser durch',
    worse: 'Schlechter durch',
    mindPsyche: 'Gemüt / Psyche',
    bodyGeneral: 'Körper / Allgemein',
    localSymptoms: 'Lokalsymptome',
    pastRemedies: 'Bisherige Mittel',
    medications: 'Medikamente',
    editSection: 'Bearbeiten',
    saveSuccess: 'Fall gespeichert!'
  },"""

en_trans = """  en: {
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
    addCustomField: 'Add Custom Field',
    customFieldName: 'Field Name (e.g., Blood Sugar)',
    customFieldValue: 'Value (e.g., 120 mg/dl)',
    unknown: 'Unknown / Open',
    step3Name: '3. Questionnaire (Extended)',
    step4Name: '4. Findings',
    step5Name: '5. Medications',
    step6Name: '6. Overview & Analysis',
    recordFindings: 'Record findings?',
    overviewTitle: 'Case Overview',
    noData: 'Not recorded',
    fieldsRecorded: 'fields recorded',
    findingsDetailsRecorded: 'Findings details recorded',
    noText: 'No text',
    medsRecorded: 'medications recorded',
    none: 'None',
    addMedInfo: 'Record the patient\\'s current medications here.',
    chiefComplaint: 'Chief Complaint',
    modalities: 'Modalities',
    better: 'Better by',
    worse: 'Worse by',
    mindPsyche: 'Mind / Psyche',
    bodyGeneral: 'Body / General',
    localSymptoms: 'Local Symptoms',
    pastRemedies: 'Past Remedies',
    medications: 'Medications',
    editSection: 'Edit',
    saveSuccess: 'Case saved!'
  }"""

# Replace localTrans object content
start_idx = content.find('const localTrans: Record<string, Record<string, string>> = {')
end_idx = content.find('};\nexport const TherapistPanel', start_idx)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + 'const localTrans: Record<string, Record<string, string>> = {\n' + de_trans + '\n' + en_trans + '\n' + content[end_idx:]

# 2. Replace Step Names
step_names_target = """  const stepNames = [
    t('step1Name'),
    t('step2Name'),
    "3. Fragebogen (Erweiterte Anamnese)",
    "4. Befund",
    "5. Medikamenteneinnahme",
    "6. Übersicht & Analyse",
  ];"""
step_names_repl = """  const stepNames = [
    t('step1Name'),
    t('step2Name'),
    tLocal('step3Name'),
    tLocal('step4Name'),
    tLocal('step5Name'),
    tLocal('step6Name'),
  ];"""
content = content.replace(step_names_target, step_names_repl)

# 3. Replace "Befund erfassen?" label
content = content.replace('Befund erfassen?', "{tLocal('recordFindings')}")

# 4. Replace other hardcoded texts in overview
content = content.replace("Object.keys(currentCase.extendedAnamnesis).length + ' Felder erfasst' : 'Nicht erfasst'", "Object.keys(currentCase.extendedAnamnesis).length + ' ' + tLocal('fieldsRecorded') : tLocal('noData')")
content = content.replace("'Befunddetails erfasst' : (currentCase.befundText || 'Kein Text')) : 'Nicht gewünscht'", "tLocal('findingsDetailsRecorded') : (currentCase.befundText || tLocal('noText'))) : tLocal('notDesired')")
content = content.replace("currentCase.medikamenteList.length + ' Medikamente erfasst' : 'Keine'", "currentCase.medikamenteList.length + ' ' + tLocal('medsRecorded') : tLocal('none')")

content = content.replace(">Hauptbeschwerde<", ">{tLocal('chiefComplaint')}<")
content = content.replace(">Modalitäten<", ">{tLocal('modalities')}<")
content = content.replace(">Besser durch:<", ">{tLocal('better')}:<")
content = content.replace(">Schlechter durch:<", ">{tLocal('worse')}:<")
content = content.replace(">Gemüt / Psyche<", ">{tLocal('mindPsyche')}<")
content = content.replace(">Körper / Allgemein<", ">{tLocal('bodyGeneral')}<")
content = content.replace(">Lokalsymptome<", ">{tLocal('localSymptoms')}<")
content = content.replace(">Bisherige Mittel<", ">{tLocal('pastRemedies')}<")
content = content.replace(">Medikamente<", ">{tLocal('medications')}<")
content = content.replace(">{t('stepEditSection')}<", ">{tLocal('editSection')}<")

# 5. Fix Medikamente description
content = content.replace("Erfassen Sie hier die aktuelle Medikation des Patienten.", "{tLocal('addMedInfo')}")
content = content.replace('Klinischer Befund', "{tLocal('clinicalFindings')}")

with open('src/components/TherapistPanel.tsx', 'w') as f:
    f.write(content)

print("Updated TherapistPanel translations")
