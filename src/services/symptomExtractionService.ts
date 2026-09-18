/**
 * Symptom Extraction Service
 * 
 * Implements the strict rule: "Beschwerdekern statt vollständigen Satzteil erfassen".
 * Extracts the semantic core complaint (Beschwerdekern) stripped of all context
 * (time, onset, intensity, triggers, modalities, auxiliary verbs) without altering
 * or substituting patient terminology with unmentioned medical synonyms.
 */

export interface RecognizedSymptom {
  id: string;
  label: string;
  category: 'beschwerde' | 'leit' | 'causa' | 'lokalisation' | 'empfindung' | 'modalitaet' | 'begleit' | 'gemuet';
  categoryLabel: string;
}

export interface ExtractionResult {
  symptoms: RecognizedSymptom[];
  timeline?: string;
}

export function extractRecognizedSymptoms(text: string, language: string = 'de'): RecognizedSymptom[] {
  return extractExtractionResult(text, language).symptoms;
}

export function extractExtractionResult(text: string, language: string = 'de'): ExtractionResult {
  if (!text || !text.trim()) {
    return { symptoms: [] };
  }

  const symptoms: RecognizedSymptom[] = [];
  const addedKeys = new Set<string>();

  // Detect time / timeline pattern like "2 stunden später" or "nach 2 stunden"
  let timeline: string | undefined = undefined;
  const timeMatch = text.match(/(\d+)\s*(stunden?|std\.?|minuten?|min\.?|tagen?|wochen?)\s*(später|nachher|vorher)?/i);
  if (timeMatch) {
    const amount = timeMatch[1];
    const unit = timeMatch[2];
    const rel = timeMatch[3] || 'später';
    timeline = language === 'de'
      ? `Zeitlicher Verlauf: ${amount} ${unit} ${rel}`
      : `Timeline: ${amount} ${unit} ${rel}`;
  } else if (/später|danach|dann/i.test(text)) {
    timeline = language === 'de'
      ? `Zeitlicher Verlauf: Nacheinander aufgetreten`
      : `Sequential timeline`;
  }

  const add = (id: string, label: string) => {
    let cleanLabel = label
      // Strip context words: temporal, onset, intensity, modifiers, pronouns, auxiliary verbs
      .replace(/\b(gestern|heute|morgen|seit\s+gestern|seit\s+heute|plötzlich|starke?|leichte?|schwere?|starkes|leichtes|beim\s+\w+|danach|später|dann|vorher|\d+\s*(stunden?|std\.?|minuten?|min\.?|tagen?|wochen?))\b/gi, '')
      .replace(/^(ich\s+habe|ich\s+bin|ich\s+hatte|ich|und\s+ich|dann\s+habe|dann|eine?|ein|der|die|das|musste)\s+/i, '')
      .replace(/\s+(gehabt|hatte|hat|war|wurde|bekommen|bekam|auftrat|aufgetreten|eingesetzt|wurden\s+schlimmer)$/gi, '')
      .trim();

    // Clean extra punctuation or articles
    cleanLabel = cleanLabel.replace(/^[:,\.\s-]+|[:,\.\s-]+$/g, '').trim();

    if (!cleanLabel || cleanLabel.length < 2) return;

    // Filter out pure stop/context words
    if (/^(\d+\s*(stunden?|std\.?|minuten?|min\.?|tagen?|wochen?)|später|danach|dann|vorher|während|stunden?|minuten?|und)$/i.test(cleanLabel)) {
      return;
    }

    // Keep exact patient terminology (Beschwerdekern), no forced medical synonyms
    const finalLabel = cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);
    const finalKey = finalLabel.toLowerCase();

    if (!addedKeys.has(finalKey)) {
      addedKeys.add(finalKey);
      symptoms.push({
        id,
        label: finalLabel,
        category: 'beschwerde',
        categoryLabel: language === 'de' ? 'Genannte Beschwerde' : 'Reported Symptom'
      });
    }
  };

  // Split text by sentence boundaries or conjunctions
  const sentences = text.split(/[.;?!]+|\s+und\s+|\s+dann\s+|\s+später\s+|\s+sowie\s+/i);
  sentences.forEach((sent, sIdx) => {
    const s = sent.trim();
    if (!s) return;

    const cleaned = s
      .replace(/\b(gestern|heute|seit\s+gestern|plötzlich|starke?|leichte?|beim\s+\w+|danach|später|dann|vorher|ich\s+habe|ich\s+hatte|gehabt|bekommen|bekam|\d+\s*stunden?|und|eine?|ein|musste)\b/gi, '')
      .trim();

    if (cleaned.length > 1) {
      add(`sym_core_${sIdx}`, cleaned);
    }
  });

  return { symptoms, timeline };
}
