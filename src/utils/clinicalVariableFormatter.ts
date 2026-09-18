import { AcuteVariableType } from '../components/AcuteVariableModal';
import { LanguageCode } from '../types';

/**
 * Strips comparison symbols (< and >) from clinical text
 */
export function stripComparisonSymbols(text: string): string {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Deduplicates adjacent repeated words and repeated parenthetical phrases
 */
export function deduplicateRepeatedExpressions(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  // Deduplicate exact repeated parenthetical expressions e.g. "(Cold wind) (Cold wind)"
  cleaned = cleaned.replace(/(\([^)]+\))(?:\s*\1)+/gi, '$1');
  // Deduplicate pipe or semicolon separated items
  const parts = cleaned.split(/\s*\|\s*|\s*;\s*/);
  if (parts.length > 1) {
    const seen = new Set<string>();
    const uniqueParts: string[] = [];
    for (const p of parts) {
      const trimmed = p.trim();
      const norm = trimmed.toLowerCase();
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        uniqueParts.push(trimmed);
      }
    }
    cleaned = uniqueParts.join(' | ');
  }
  return cleaned;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalizeFirst(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Returns localized modality better prefix without comparison symbols
 */
export function getModalityBetterPrefix(lang: LanguageCode): string {
  switch (lang) {
    case 'en':
      return 'Ameliorated by: ';
    case 'es':
      return 'Mejoría por: ';
    case 'fr':
      return 'Amélioration par : ';
    case 'it':
      return 'Migliorato da: ';
    case 'el':
      return 'Βελτίωση με: ';
    case 'ru':
      return 'Улучшение от: ';
    case 'de':
    default:
      return 'Gebessert durch: ';
  }
}

/**
 * Returns localized modality worse prefix without comparison symbols
 */
export function getModalityWorsePrefix(lang: LanguageCode): string {
  switch (lang) {
    case 'en':
      return 'Aggravated by: ';
    case 'es':
      return 'Empeorado por: ';
    case 'fr':
      return 'Aggravation par : ';
    case 'it':
      return 'Peggiorato da: ';
    case 'el':
      return 'Επιδείνωση με: ';
    case 'ru':
      return 'Ухудшение от: ';
    case 'de':
    default:
      return 'Verschlimmert durch: ';
  }
}

/**
 * Returns localized concomitant prefix
 */
export function getConcomitantPrefix(lang: LanguageCode): string {
  switch (lang) {
    case 'en':
      return 'Concomitant: ';
    case 'es':
      return 'Síntoma concomitante: ';
    case 'fr':
      return 'Symptôme concomitant : ';
    case 'it':
      return 'Sintomo concomitante: ';
    case 'el':
      return 'Συνοδό σύμπτωμα: ';
    case 'ru':
      return 'Сопутствующий симптом: ';
    case 'de':
    default:
      return 'Begleitsymptom: ';
  }
}

/**
 * Returns localized causa prefix
 */
export function getCausaPrefix(lang: LanguageCode): string {
  switch (lang) {
    case 'en':
      return 'Trigger (Causa): ';
    case 'es':
      return 'Desencadenante (Causa): ';
    case 'fr':
      return 'Déclencheur (Causa) : ';
    case 'it':
      return 'Fattore scatenante (Causa): ';
    case 'el':
      return 'Αίτιο / Έναυσμα (Causa): ';
    case 'ru':
      return 'Триггер (Causa): ';
    case 'de':
    default:
      return 'Auslöser (Causa): ';
  }
}

/**
 * Strips common prefixes in any of the 7 languages to retrieve core symptom text
 */
export function stripClinicalPrefix(text: string): {
  coreText: string;
  isBetter: boolean;
  isWorse: boolean;
  isConcomitant: boolean;
  isCausa: boolean;
} {
  let cleaned = text.trim();
  let isBetter = false;
  let isWorse = false;
  let isConcomitant = false;
  let isCausa = false;

  // Check leading brackets
  if (cleaned.startsWith('>')) {
    isBetter = true;
    cleaned = cleaned.substring(1).trim();
  } else if (cleaned.startsWith('<')) {
    isWorse = true;
    cleaned = cleaned.substring(1).trim();
  } else if (cleaned.startsWith('•')) {
    cleaned = cleaned.substring(1).trim();
  }

  // Regex patterns for prefixes across languages
  const betterPrefixes = [
    /^gebessert durch\s*:\s*/i,
    /^besserung durch\s*:\s*/i,
    /^ameliorated by\s*:\s*/i,
    /^mejoría por\s*:\s*/i,
    /^mejoria por\s*:\s*/i,
    /^amélioration par\s*:\s*/i,
    /^amelioration par\s*:\s*/i,
    /^migliorato da\s*:\s*/i,
    /^miglioramento con\s*:\s*/i,
    /^βελτίωση με\s*:\s*/i,
    /^βελτιωση με\s*:\s*/i,
    /^υлучшение от\s*:\s*/i,
    /^улучшение от\s*:\s*/i,
  ];

  const worsePrefixes = [
    /^verschlimmert durch\s*:\s*/i,
    /^verschlimmerung durch\s*:\s*/i,
    /^aggravated by\s*:\s*/i,
    /^empeorado por\s*:\s*/i,
    /^aggravation par\s*:\s*/i,
    /^peggiorato da\s*:\s*/i,
    /^επιδείνωση με\s*:\s*/i,
    /^επιδεινωση με\s*:\s*/i,
    /^ухудшение от\s*:\s*/i,
  ];

  const concomitantPrefixes = [
    /^begleitsymptom\s*:\s*/i,
    /^concomitant\s*:\s*/i,
    /^síntoma concomitante\s*:\s*/i,
    /^sintoma concomitante\s*:\s*/i,
    /^symptôme concomitant\s*:\s*/i,
    /^symptome concomitant\s*:\s*/i,
    /^sintomo concomitante\s*:\s*/i,
    /^συνοδό σύμπτωμα\s*:\s*/i,
    /^συνοδο συμπτωμα\s*:\s*/i,
    /^сопутствующий симптом\s*:\s*/i,
  ];

  const causaPrefixes = [
    /^auslöser\s*\(causa\)\s*:\s*/i,
    /^ausloeser\s*\(causa\)\s*:\s*/i,
    /^trigger\s*\(causa\)\s*:\s*/i,
    /^desencadenante\s*\(causa\)\s*:\s*/i,
    /^déclencheur\s*\(causa\)\s*:\s*/i,
    /^declencheur\s*\(causa\)\s*:\s*/i,
    /^fattore scatenante\s*\(causa\)\s*:\s*/i,
    /^αίτιο\s*\/\s*έναυσμα\s*\(causa\)\s*:\s*/i,
    /^αιτιο\s*\/\s*εναυσμα\s*\(causa\)\s*:\s*/i,
    /^триггер\s*\(causa\)\s*:\s*/i,
  ];

  for (const regex of betterPrefixes) {
    if (regex.test(cleaned)) {
      isBetter = true;
      cleaned = cleaned.replace(regex, '').trim();
      break;
    }
  }

  for (const regex of worsePrefixes) {
    if (regex.test(cleaned)) {
      isWorse = true;
      cleaned = cleaned.replace(regex, '').trim();
      break;
    }
  }

  for (const regex of concomitantPrefixes) {
    if (regex.test(cleaned)) {
      isConcomitant = true;
      cleaned = cleaned.replace(regex, '').trim();
      break;
    }
  }

  for (const regex of causaPrefixes) {
    if (regex.test(cleaned)) {
      isCausa = true;
      cleaned = cleaned.replace(regex, '').trim();
      break;
    }
  }

  // If direction is still undecided, analyze colloquially embedded words
  if (!isWorse && !isBetter) {
    const lowerCleaned = cleaned.toLowerCase();
    const hasWorseWord =
      /\b(schlimmer|schlechter|verschlimm|verschlecht|unerträglich|verstärkt|worse|aggravat|peor|empeor|agrava|pire|peggior|peggio|χειρότερ|χειροτερ|επιδείνωσ|επιδεινωσ|хуже|ухудш)\b/i.test(lowerCleaned) ||
      lowerCleaned.includes('schlimmer') ||
      lowerCleaned.includes('schlechter') ||
      lowerCleaned.includes('verschlimm') ||
      lowerCleaned.includes('verschlecht') ||
      lowerCleaned.includes('worse') ||
      lowerCleaned.includes('aggravat') ||
      lowerCleaned.includes('peor') ||
      lowerCleaned.includes('empeor') ||
      lowerCleaned.includes('pire') ||
      lowerCleaned.includes('peggior') ||
      lowerCleaned.includes('χειρότερ') ||
      lowerCleaned.includes('χειροτερ') ||
      lowerCleaned.includes('επιδείνωσ') ||
      lowerCleaned.includes('хуже') ||
      lowerCleaned.includes('ухудш');

    const hasBetterWord =
      /\b(besser|gebessert|besserung|erleichter|linderung|better|amelior|relie|mejora|mejor|soulag|mieux|miglior|meglio|βελτίωσ|βελτιωσ|καλύτερ|καλυτερ|улучш|лучше)\b/i.test(lowerCleaned) ||
      lowerCleaned.includes('besser') ||
      lowerCleaned.includes('gebessert') ||
      lowerCleaned.includes('besserung') ||
      lowerCleaned.includes('better') ||
      lowerCleaned.includes('amelior') ||
      lowerCleaned.includes('mejora') ||
      lowerCleaned.includes('mejor') ||
      lowerCleaned.includes('soulag') ||
      lowerCleaned.includes('miglior') ||
      lowerCleaned.includes('βελτίωσ') ||
      lowerCleaned.includes('καλύτερ') ||
      lowerCleaned.includes('улучш') ||
      lowerCleaned.includes('лучше');

    if (hasWorseWord && !hasBetterWord) {
      isWorse = true;
    } else if (hasBetterWord && !hasWorseWord) {
      isBetter = true;
    }
  }

  return { coreText: cleaned, isBetter, isWorse, isConcomitant, isCausa };
}

/**
 * Intelligently enriches and formats colloquial or brief user inputs
 * into precise, professional classical homoeopathic terminology
 * across all 7 supported languages.
 */
export function enrichClinicalText(
  varKey: AcuteVariableType,
  rawText: string,
  lang: LanguageCode = 'de'
): string {
  const trimmed = rawText.trim();
  if (!trimmed) return '';

  const { coreText, isBetter, isWorse } = stripClinicalPrefix(trimmed);
  const targetText = coreText || trimmed;
  const lower = targetText.toLowerCase();

  switch (varKey) {
    case 'modalitaeten': {
      // Early check for direction indicated in text or by prefix
      const userIndicatedWorse =
        isWorse ||
        /\b(schlimmer|schlechter|verschlimm|verschlecht|unerträglich|verstärkt|worse|aggravat|peor|empeor|agrava|pire|peggior|peggio|χειρότερ|χειροτερ|επιδείνωσ|επιδεινωσ|хуже|ухудш)\b/i.test(lower) ||
        lower.includes('schlimmer') ||
        lower.includes('schlechter') ||
        lower.includes('verschlimm') ||
        lower.includes('verschlecht') ||
        lower.includes('worse') ||
        lower.includes('aggravat') ||
        lower.includes('peor') ||
        lower.includes('empeor') ||
        lower.includes('pire') ||
        lower.includes('peggior') ||
        lower.includes('χειρότερ') ||
        lower.includes('χειροτερ') ||
        lower.includes('επιδείνωσ') ||
        lower.includes('επιδεινωσ') ||
        lower.includes('хуже') ||
        lower.includes('ухудш');

      const userIndicatedBetter =
        isBetter ||
        /\b(besser|gebessert|besserung|erleichter|linderung|better|amelior|relie|mejora|mejor|soulag|mieux|miglior|meglio|βελτίωσ|βελτιωσ|καλύτερ|καλυτερ|улучш|лучше)\b/i.test(lower) ||
        lower.includes('besser') ||
        lower.includes('gebessert') ||
        lower.includes('besserung') ||
        lower.includes('better') ||
        lower.includes('amelior') ||
        lower.includes('mejora') ||
        lower.includes('mejor') ||
        lower.includes('soulag') ||
        lower.includes('miglior') ||
        lower.includes('βελτίωσ') ||
        lower.includes('βελτιωσ') ||
        lower.includes('καλύτερ') ||
        lower.includes('καλυτερ') ||
        lower.includes('πιο πολύ με') ||
        lower.includes('πιο πολυ με') ||
        lower.includes('πιο καλά με') ||
        lower.includes('πιο καλα με') ||
        lower.includes('улучш') ||
        lower.includes('лучше');

      // 1. Thirst & Drinking modalities (e.g., drinking cold water)
      if (
        lower.includes('trink') ||
        lower.includes('wasser') ||
        lower.includes('water') ||
        lower.includes('agua') ||
        lower.includes('eau') ||
        lower.includes('acqua') ||
        lower.includes('νερό') ||
        lower.includes('νερο') ||
        lower.includes('πιείτε') ||
        lower.includes('πόση') ||
        lower.includes('пить') ||
        lower.includes('durst') ||
        lower.includes('thirst') ||
        lower.includes('sed') ||
        lower.includes('soif') ||
        lower.includes('sete') ||
        lower.includes('δίψ') ||
        lower.includes('διψ') ||
        lower.includes('жажд')
      ) {
        switch (lang) {
          case 'de':
            return '> Besserung durch Trinken großer Mengen (viel kaltes Wasser)';
          case 'en':
            return '> Ameliorated by drinking large quantities of cold water';
          case 'es':
            return '> Mejoría bebiendo abundante agua fresca';
          case 'fr':
            return '> Amélioration en buvant de grandes quantités d\'eau froide';
          case 'it':
            return '> Miglioramento bevendo abbondante acqua fresca';
          case 'el':
            return '> Βελτίωση με την κατανάλωση άφθονου κρύου νερού';
          case 'ru':
            return '> Улучшение от обильного питья холодной воды';
        }
      }

      // 2. Rest + Fresh Air / Cool Air / Calm (matches "Πιο πολύ με ηρεμία ο καθένας αέρας" / "Ruhe & frische Luft")
      const hasRest =
        lower.includes('ruhe') ||
        lower.includes('liegen') ||
        lower.includes('bett') ||
        lower.includes('rest') ||
        lower.includes('calm') ||
        lower.includes('quiet') ||
        lower.includes('lying') ||
        lower.includes('repos') ||
        lower.includes('riposo') ||
        lower.includes('ηρεμ') ||
        lower.includes('ησυχ') ||
        lower.includes('ανάπαυσ') ||
        lower.includes('αναπαυσ') ||
        lower.includes('ξεκουρασ') ||
        lower.includes('ξαπλ') ||
        lower.includes('покой') ||
        lower.includes('отдых') ||
        lower.includes('спокой');

      const hasAir =
        lower.includes('luft') ||
        lower.includes('frisch') ||
        lower.includes('air') ||
        lower.includes('fresh') ||
        lower.includes('aire') ||
        lower.includes('fresco') ||
        lower.includes('aria') ||
        lower.includes('αέρ') ||
        lower.includes('αερ') ||
        lower.includes('καθένας αέρας') ||
        lower.includes('καθενας αερας') ||
        lower.includes('δροσερ') ||
        lower.includes('καθαρ') ||
        lower.includes('воздух') ||
        lower.includes('свеж') ||
        lower.includes('ветер');

      if (hasRest && hasAir && !userIndicatedWorse) {
        switch (lang) {
          case 'de':
            return '> Besserung durch Ruhe & frische Luft | < Bewegung & stickige Wärme';
          case 'en':
            return '> Ameliorated by rest & fresh air | < Motion & stuffy warmth';
          case 'es':
            return '> Mejora con reposo y aire fresco | < Movimiento y calor sofocante';
          case 'fr':
            return '> Amélioration par le repos et l\'air frais | < Mouvement et chaleur étouffante';
          case 'it':
            return '> Miglioramento con riposo e aria fresca | < Movimento e calore soffocante';
          case 'el':
            return '> Βελτίωση με ανάπαυση, ηρεμία και καθαρό αέρα | < Κίνηση & ζέστη';
          case 'ru':
            return '> Улучшение от покоя и свежего воздуха | < Движение и духота';
        }
      }

      // 3. Warmth / Heat modalities (heiß, hitze, wärme, warm, hot, heat, calor, etc.)
      const hasHeat =
        lower.includes('heiß') ||
        lower.includes('heiss') ||
        lower.includes('hitze') ||
        lower.includes('wärm') ||
        lower.includes('warm') ||
        lower.includes('hot') ||
        lower.includes('heat') ||
        lower.includes('calor') ||
        lower.includes('chaleur') ||
        lower.includes('chaud') ||
        lower.includes('caldo') ||
        lower.includes('θερμ') ||
        lower.includes('ζεστ') ||
        lower.includes('жар') ||
        lower.includes('тепл') ||
        lower.includes('горяч');

      if (hasHeat) {
        if (userIndicatedWorse) {
          switch (lang) {
            case 'de':
              return '< Verschlimmert durch Hitze / heiße Umgebung & warme Luft | > Besser durch Kühle & frische Luft';
            case 'en':
              return '< Aggravated by heat / hot environment & warm air | > Ameliorated by cool & fresh air';
            case 'es':
              return '< Empeorado por el calor / ambiente caluroso | > Mejora con fresco y aire libre';
            case 'fr':
              return '< Aggravation par la chaleur / atmosphère chaude | > Amélioration par la fraîcheur et l\'air pur';
            case 'it':
              return '< Peggioramento con il caldo / aria calda | > Miglioramento con il fresco e aria pura';
            case 'el':
              return '< Επιδείνωση με τη ζέστη / θερμό περιβάλλον | > Βελτίωση με δροσιά & καθαρό αέρα';
            case 'ru':
              return '< Ухудшение от жары / горячего воздуха | > Улучшение от прохлады и свежего воздуха';
          }
        } else if (userIndicatedBetter) {
          switch (lang) {
            case 'de':
              return '> Gebessert durch lokale Wärme & Einhüllen | < Kälte';
            case 'en':
              return '> Ameliorated by local warmth & wrapping up | < Cold';
            case 'es':
              return '> Mejora por calor local y compresas calientes | < Frío';
            case 'fr':
              return '> Amélioration par la chaleur locale | < Froid';
            case 'it':
              return '> Miglioramento con il calore locale | < Freddo';
            case 'el':
              return '> Βελτίωση με τοπική ζέστη & ζεστά επιθέματα | < Κρύο';
            case 'ru':
              return '> Улучшение от тепла и укутывания | < Холод';
          }
        }
      }

      // 4. Cold / Fresh Air modalities alone
      const hasCold =
        hasAir ||
        lower.includes('kälte') ||
        lower.includes('kalt') ||
        lower.includes('zugluft') ||
        lower.includes('cold') ||
        lower.includes('chilly') ||
        lower.includes('frio') ||
        lower.includes('frío') ||
        lower.includes('froid') ||
        lower.includes('freddo') ||
        lower.includes('ψυχρ') ||
        lower.includes('κρύ') ||
        lower.includes('κρυ') ||
        lower.includes('холод') ||
        lower.includes('прохлад');

      if (hasCold) {
        if (userIndicatedWorse) {
          switch (lang) {
            case 'de':
              return '< Verschlimmert durch Kälte, kalten Wind & Entblößen | > Besser durch Wärme';
            case 'en':
              return '< Aggravated by cold, cold wind & uncovering | > Ameliorated by warmth';
            case 'es':
              return '< Empeorado por frío, viento frío y destaparse | > Mejora por calor';
            case 'fr':
              return '< Aggravation par le froid, vent froid et découvrement | > Amélioration par la chaleur';
            case 'it':
              return '< Peggioramento col freddo, vento freddo e scoprirsi | > Miglioramento col caldo';
            case 'el':
              return '< Επιδείνωση με το κρύο, κρύο αέρα & αποκάλυψη | > Βελτίωση με ζέστη';
            case 'ru':
              return '< Ухудшение от холода, холодного ветра и раскрывания | > Улучшение от тепла';
          }
        } else if (userIndicatedBetter) {
          switch (lang) {
            case 'de':
              return '> Gebessert durch kühle, frische Luft & Kälte | < Wärme';
            case 'en':
              return '> Ameliorated by cool, fresh air & cold | < Warmth';
            case 'es':
              return '> Mejora con frío y aire fresco | < Calor';
            case 'fr':
              return '> Amélioration par l\'air frais et le froid | < Chaleur';
            case 'it':
              return '> Miglioramento con aria fresca e freddo | < Calore';
            case 'el':
              return '> Βελτίωση με δροσερό, καθαρό αέρα & κρύο | < Ζέστη';
            case 'ru':
              return '> Улучшение от прохладного свежего воздуха и холода | < Тепло';
          }
        }
      }

      // 5. Rest / Lying down / Calm alone
      if (hasRest) {
        if (userIndicatedWorse) {
          switch (lang) {
            case 'de':
              return '< Verschlimmert in der Ruhe & beim Stillliegen | > Besser durch sanfte Bewegung';
            case 'en':
              return '< Aggravated by rest & lying still | > Ameliorated by gentle motion';
            case 'es':
              return '< Empeorado en reposo y quieto | > Mejora con movimiento suave';
            case 'fr':
              return '< Aggravation au repos et immobile | > Amélioration par mouvement doux';
            case 'it':
              return '< Peggioramento a riposo e stando fermi | > Miglioramento con movimento dolce';
            case 'el':
              return '< Επιδείνωση στην ηρεμία & ακινησία | > Βελτίωση με ήπια κίνηση';
            case 'ru':
              return '< Ухудшение в покое и неподвижности | > Улучшение от мягкого движения';
          }
        } else if (userIndicatedBetter) {
          switch (lang) {
            case 'de':
              return '> Gebessert durch absolute Ruhe & Liegen | < Geringste Bewegung';
            case 'en':
              return '> Ameliorated by complete rest & lying down | < Slightest movement';
            case 'es':
              return '> Mejora con reposo absoluto y cama | < El menor movimiento';
            case 'fr':
              return '> Amélioration par le repos complet et alité | < Moindre mouvement';
            case 'it':
              return '> Miglioramento con riposo assoluto a letto | < Minimo movimento';
            case 'el':
              return '> Βελτίωση με απόλυτη ηρεμία, ανάπαυση και κατάκλιση | < Παραμικρή κίνηση';
            case 'ru':
              return '> Улучшение от полного покоя и положения лежа | < Малейшее движение';
          }
        }
      }

      // 6. Motion / Movement
      if (
        lower.includes('beweg') ||
        lower.includes('motion') ||
        lower.includes('movement') ||
        lower.includes('movimiento') ||
        lower.includes('mouvement') ||
        lower.includes('movimento') ||
        lower.includes('κίνησ') ||
        lower.includes('κινησ') ||
        lower.includes('περπάτημα') ||
        lower.includes('περπατημα') ||
        lower.includes('движен')
      ) {
        if (userIndicatedBetter) {
          switch (lang) {
            case 'de':
              return '> Gebessert durch mäßige, fortgesetzte Bewegung | < Verschlimmert in Ruhe';
            case 'en':
              return '> Ameliorated by moderate, continued motion | < Aggravated at rest';
            case 'es':
              return '> Mejora con movimiento moderado y continuo | < Empeora en reposo';
            case 'fr':
              return '> Amélioration par le mouvement continu modéré | < Aggravation au repos';
            case 'it':
              return '> Miglioramento con movimento continuato moderato | < Peggioramento a riposo';
            case 'el':
              return '> Βελτίωση με συνεχή μέτρια κίνηση | < Επιδείνωση στην ηρεμία';
            case 'ru':
              return '> Улучшение от умеренного непрерывного движения | < Ухудшение в покое';
          }
        } else if (userIndicatedWorse) {
          switch (lang) {
            case 'de':
              return '< Verschlimmert durch Bewegung | > Gebessert durch Ruhe';
            case 'en':
              return '< Aggravated by motion | > Ameliorated by rest';
            case 'es':
              return '< Empeora con el movimiento | > Mejora con reposo';
            case 'fr':
              return '< Aggravation au mouvement | > Amélioration au repos';
            case 'it':
              return '< Peggiora con il movimento | > Migliora con il riposo';
            case 'el':
              return '< Επιδείνωση με την κίνηση | > Βελτίωση με ανάπαυση';
            case 'ru':
              return '< Ухудшение от движения | > Улучшение в покое';
          }
        }
      }

      // 7. Pressure / Hard pressure (only if better indicated)
      if (
        (lower.includes('druck') ||
        lower.includes('press') ||
        lower.includes('pression') ||
        lower.includes('pressione') ||
        lower.includes('πίεσ') ||
        lower.includes('σφίξιμο') ||
        lower.includes('давлен')) &&
        userIndicatedBetter
      ) {
        switch (lang) {
          case 'de':
            return '> Gebessert durch festen Druck & Halten';
          case 'en':
            return '> Ameliorated by firm pressure & holding';
          case 'es':
            return '> Mejora por presión firme y sujeción';
          case 'fr':
            return '> Amélioration par une pression forte';
          case 'it':
            return '> Miglioramento con forte pressione';
          case 'el':
            return '> Βελτίωση με σταθερή πίεση & κράτημα';
          case 'ru':
            return '> Улучшение от сильного давления';
        }
      }

      // 8. Evening / Time modalities (16-20h) (only if worse indicated)
      if (
        (lower.includes('abend') ||
        lower.includes('evening') ||
        lower.includes('tarde') ||
        lower.includes('soir') ||
        lower.includes('sera') ||
        lower.includes('βράδυ') ||
        lower.includes('βραδυ') ||
        lower.includes('απόγευμα') ||
        lower.includes('απογευμα') ||
        lower.includes('вечер') ||
        lower.includes('16') ||
        lower.includes('20')) &&
        userIndicatedWorse
      ) {
        switch (lang) {
          case 'de':
            return '< Typische Verschlimmerung am Abend (ca. 16–20 Uhr) | > Tagsüber';
          case 'en':
            return '< Characteristic evening aggravation (approx. 4–8 PM) | > Daytime';
          case 'es':
            return '< Agravación típica al atardecer (16–20 h) | > Durante el día';
          case 'fr':
            return '< Aggravation en soirée (16–20h) | > Dans la journée';
          case 'it':
            return '< Peggioramento serale (ore 16–20) | > Di giorno';
          case 'el':
            return '< Χαρακτηριστική επιδείνωση το απόγευμα/βράδυ (16–20) | > Την ημέρα';
          case 'ru':
            return '< Ухудшение вечером (16–20 ч) | > Днем';
        }
      }

      // 9. Morning / Waking (only if worse indicated)
      if (
        (lower.includes('morgen') ||
        lower.includes('morning') ||
        lower.includes('mañana') ||
        lower.includes('matin') ||
        lower.includes('mattina') ||
        lower.includes('πρωί') ||
        lower.includes('πρωι') ||
        lower.includes('ξύπνημα') ||
        lower.includes('утро')) &&
        userIndicatedWorse
      ) {
        switch (lang) {
          case 'de':
            return '< Typische Verschlimmerung morgens beim Erwachen';
          case 'en':
            return '< Aggravated in the morning on waking';
          case 'es':
            return '< Agravación matutina al despertar';
          case 'fr':
            return '< Aggravation le matin au réveil';
          case 'it':
            return '< Peggioramento mattutino al risveglio';
          case 'el':
            return '< Επιδείνωση το πρωί κατά το ξύπνημα';
          case 'ru':
            return '< Ухудшение утром при пробуждении';
        }
      }

      // Custom fallback formatting based on direction
      if (userIndicatedWorse) {
        return `${getModalityWorsePrefix(lang)}${capitalizeFirst(targetText)}`;
      }

      if (userIndicatedBetter) {
        return `${getModalityBetterPrefix(lang)}${capitalizeFirst(targetText)}`;
      }

      // If user provided a custom modality description without indicating better or worse,
      // return clean capitalized text without forcing a wrong prefix.
      return capitalizeFirst(targetText);
    }

    case 'causa': {
      // 1. Sea / Beach / Maritime Air (only if explicit marine words are used)
      const hasMarine =
        lower.includes('strand') ||
        lower.includes('beach') ||
        lower.includes('playa') ||
        lower.includes('plage') ||
        lower.includes('spiaggia') ||
        lower.includes('παραλία') ||
        lower.includes('παραλια') ||
        lower.includes('θάλασσ') ||
        lower.includes('θαλασσ') ||
        lower.includes('meerwasser') ||
        lower.includes('im meer') ||
        lower.includes('am meer') ||
        lower.includes('sea air') ||
        lower.includes('пляж') ||
        lower.includes('на море');

      // Sunstroke / Heatstroke / Intense direct sun exposure
      const hasSunstroke =
        lower.includes('sonnenstich') ||
        lower.includes('sonnenbad') ||
        lower.includes('hitzschlag') ||
        lower.includes('sonnenbrand') ||
        lower.includes('pralle sonne') ||
        lower.includes('in der sonne') ||
        lower.includes('sunstroke') ||
        lower.includes('heatstroke') ||
        lower.includes('sunburn') ||
        lower.includes('coup de soleil') ||
        lower.includes('insolacion') ||
        lower.includes('insolation') ||
        lower.includes('colpo di calore') ||
        lower.includes('ηλίαση') ||
        lower.includes('ηλιαση') ||
        lower.includes('солнечный удар');

      if (hasMarine && hasSunstroke) {
        switch (lang) {
          case 'de':
            return `${capitalizeFirst(targetText)} (Sonnen-, Hitze- & Meeresluft-Exposition)`;
          case 'en':
            return `${capitalizeFirst(targetText)} (Sun, heat and sea air exposure)`;
          case 'es':
            return `${capitalizeFirst(targetText)} (Exposición solar, calor y brisa marina)`;
          case 'fr':
            return `${capitalizeFirst(targetText)} (Exposition au soleil, chaleur et air marin)`;
          case 'it':
            return `${capitalizeFirst(targetText)} (Esposizione a sole, calore e aria marina)`;
          case 'el':
            return `${capitalizeFirst(targetText)} (Έκθεση στον ήλιο, ζέστη και θαλασσινό αέρα)`;
          case 'ru':
            return `${capitalizeFirst(targetText)} (Воздействие солнца, тепла и морского воздуха)`;
        }
      }

      if (hasMarine) {
        switch (lang) {
          case 'de':
            return `${capitalizeFirst(targetText)} (Meeresluft- & Meeres-Exposition)`;
          case 'en':
            return `${capitalizeFirst(targetText)} (Sea air and maritime exposure)`;
          case 'es':
            return `${capitalizeFirst(targetText)} (Exposición a la brisa marina y mar)`;
          case 'fr':
            return `${capitalizeFirst(targetText)} (Exposition à l'air marin et la mer)`;
          case 'it':
            return `${capitalizeFirst(targetText)} (Esposizione ad aria marina e mare)`;
          case 'el':
            return `${capitalizeFirst(targetText)} (Έκθεση σε θαλασσινό αέρα / θάλασσα)`;
          case 'ru':
            return `${capitalizeFirst(targetText)} (Воздействие морского воздуха и моря)`;
        }
      }

      if (hasSunstroke) {
        switch (lang) {
          case 'de':
            return `${capitalizeFirst(targetText)} (Sonnenstich / intensive Hitze-Exposition)`;
          case 'en':
            return `${capitalizeFirst(targetText)} (Sunstroke / intense heat exposure)`;
          case 'es':
            return `${capitalizeFirst(targetText)} (Insolación / exposición intensa al calor)`;
          case 'fr':
            return `${capitalizeFirst(targetText)} (Insolation / coup de chaleur)`;
          case 'it':
            return `${capitalizeFirst(targetText)} (Colpo di sole / calore intenso)`;
          case 'el':
            return `${capitalizeFirst(targetText)} (Ηλίαση / έντονη έκθεση σε θερμότητα)`;
          case 'ru':
            return `${capitalizeFirst(targetText)} (Солнечный удар / сильный перегрев)`;
        }
      }

      // 2. Cold Wind / Draft (requires draft/wind, not just generic cold)
      const hasDraftOrColdWind =
        lower.includes('zugluft') ||
        lower.includes('draft') ||
        lower.includes('ρεύμα') ||
        lower.includes('ρευμα') ||
        lower.includes('сквозняк') ||
        ((lower.includes('wind') || lower.includes('άνεμ') || lower.includes('ветер')) &&
         (lower.includes('kalt') || lower.includes('cold') || lower.includes('frio') || lower.includes('froid') || lower.includes('freddo') || lower.includes('ψυχρ') || lower.includes('холод')));

      if (hasDraftOrColdWind) {
        switch (lang) {
          case 'de':
            return `${capitalizeFirst(targetText)} (Kalter, trockener Wind / Zugluft-Exposition)`;
          case 'en':
            return `${capitalizeFirst(targetText)} (Cold dry wind / draft exposure)`;
          case 'es':
            return `${capitalizeFirst(targetText)} (Exposición a viento frío y seco o corrientes de aire)`;
          case 'fr':
            return `${capitalizeFirst(targetText)} (Exposition au vent froid et sec ou courants d'air)`;
          case 'it':
            return `${capitalizeFirst(targetText)} (Esposizione a vento freddo e secco o correnti d'aria)`;
          case 'el':
            return `${capitalizeFirst(targetText)} (Έκθεση σε ψυχρό άνεμο / ρεύμα αέρα)`;
          case 'ru':
            return `${capitalizeFirst(targetText)} (Воздействие холодного сухого ветра или сквозняка)`;
        }
      }

      // 3. Fright / Emotional Shock
      if (
        lower.includes('schreck') ||
        lower.includes('fright') ||
        lower.includes('shock') ||
        lower.includes('angst') ||
        lower.includes('fear') ||
        lower.includes('miedo') ||
        lower.includes('peur') ||
        lower.includes('φόβ') ||
        lower.includes('φοβ') ||
        lower.includes('σοκ') ||
        lower.includes('πανικ') ||
        lower.includes('испуг') ||
        lower.includes('шок')
      ) {
        switch (lang) {
          case 'de':
            return `${capitalizeFirst(targetText)} (Plötzlicher Schreck / emotionale Erschütterung)`;
          case 'en':
            return `${capitalizeFirst(targetText)} (Sudden fright / emotional shock)`;
          case 'es':
            return `${capitalizeFirst(targetText)} (Susto repentino o conmoción emocional)`;
          case 'fr':
            return `${capitalizeFirst(targetText)} (Frayeur soudaine / choc émotionnel)`;
          case 'it':
            return `${capitalizeFirst(targetText)} (Spavento improvviso / shock emotivo)`;
          case 'el':
            return `${capitalizeFirst(targetText)} (Αιφνίδιος φόβος / συναισθηματικό σοκ)`;
          case 'ru':
            return `${capitalizeFirst(targetText)} (Внезапный испуг / эмоциональный шок)`;
        }
      }

      // 4. Stress, Anger, Overwork
      if (
        lower.includes('stress') ||
        lower.includes('ärger') ||
        lower.includes('anger') ||
        lower.includes('wut') ||
        lower.includes('overwork') ||
        lower.includes('überlast') ||
        lower.includes('colère') ||
        lower.includes('rabbia') ||
        lower.includes('θυμ') ||
        lower.includes('εκνευρισμ') ||
        lower.includes('στρες') ||
        lower.includes('стресс')
      ) {
        switch (lang) {
          case 'de':
            return `${capitalizeFirst(targetText)} (Diätische Überlastung, Stress oder Ärger)`;
          case 'en':
            return `${capitalizeFirst(targetText)} (Dietary overload, mental stress or vexation)`;
          case 'es':
            return `${capitalizeFirst(targetText)} (Estrés mental, sobrecarga o cólera)`;
          case 'fr':
            return `${capitalizeFirst(targetText)} (Stress mental, surmenage ou contrariété)`;
          case 'it':
            return `${capitalizeFirst(targetText)} (Stress mentale, sovraccarico o collera)`;
          case 'el':
            return `${capitalizeFirst(targetText)} (Ψυχικό στρες, υπερκόπωση ή έντονος θυμός)`;
          case 'ru':
            return `${capitalizeFirst(targetText)} (Психологический стресс, перегрузка или гнев)`;
        }
      }

      // 5. Dietary overload / Coffee / Alcohol
      if (
        lower.includes('essen') ||
        lower.includes('food') ||
        lower.includes('comida') ||
        lower.includes('repas') ||
        lower.includes('cibo') ||
        lower.includes('φαγητό') ||
        lower.includes('φαγητο') ||
        lower.includes('alkohol') ||
        lower.includes('alcohol') ||
        lower.includes('vino') ||
        lower.includes('bière') ||
        lower.includes('bier') ||
        lower.includes('αλκοόλ') ||
        lower.includes('αλκοολ') ||
        lower.includes('κρασί') ||
        lower.includes('kaffee') ||
        lower.includes('coffee') ||
        lower.includes('café') ||
        lower.includes('καφές') ||
        lower.includes('καφες')
      ) {
        switch (lang) {
          case 'de':
            return `${capitalizeFirst(targetText)} (Diätischer Übergenuss / Stimulanzien)`;
          case 'en':
            return `${capitalizeFirst(targetText)} (Dietary indiscretion / stimulants)`;
          case 'es':
            return `${capitalizeFirst(targetText)} (Excesos dietéticos / estimulantes)`;
          case 'fr':
            return `${capitalizeFirst(targetText)} (Excès alimentaires / excitants)`;
          case 'it':
            return `${capitalizeFirst(targetText)} (Eccessi alimentari / stimolanti)`;
          case 'el':
            return `${capitalizeFirst(targetText)} (Διαιτητική υπερβολή / διεγερτικά)`;
          case 'ru':
            return `${capitalizeFirst(targetText)} (Диетическая перегрузка / стимуляторы)`;
        }
      }

      return capitalizeFirst(targetText);
    }

    case 'hauptbeschwerde': {
      const hasHead =
        lower.includes('kopf') ||
        lower.includes('migrän') ||
        lower.includes('migraen') ||
        lower.includes('headache') ||
        lower.includes('migraine') ||
        lower.includes('cabeza') ||
        lower.includes('tête') ||
        lower.includes('testa') ||
        lower.includes('πονοκέφαλ') ||
        lower.includes('πονοκεφαλ') ||
        lower.includes('κεφαλαλγ') ||
        lower.includes('ημικραν') ||
        lower.includes('головн');

      const hasAnal =
        lower.includes('popo') ||
        lower.includes('after') ||
        lower.includes('hämorrhoid') ||
        lower.includes('haemorrhoid') ||
        lower.includes('gesäß') ||
        lower.includes('gesaess') ||
        lower.includes('anal') ||
        lower.includes('rektal') ||
        lower.includes('rectal') ||
        lower.includes('hemorroid') ||
        lower.includes('hémorroid') ||
        lower.includes('αιμορροΐδ') ||
        lower.includes('геморро');

      const isThrobbing =
        lower.includes('puls') ||
        lower.includes('klopf') ||
        lower.includes('poch') ||
        lower.includes('throb') ||
        lower.includes('schlag') ||
        lower.includes('palpit');

      const isMigraine =
        lower.includes('migrän') ||
        lower.includes('migraen') ||
        lower.includes('migraine') ||
        lower.includes('ημικραν');

      const headText =
        (isThrobbing || isMigraine)
          ? (lang === 'de' ? 'Akute pulsierende Kopfschmerzen / Migräne' :
             lang === 'en' ? 'Acute throbbing headache / migraine' :
             lang === 'es' ? 'Cefalea pulsátil aguda / migraña' :
             lang === 'fr' ? 'Maux de tête battants aigus / migraine' :
             lang === 'it' ? 'Cefalea pulsante acuta / emicrania' :
             lang === 'el' ? 'Πονοκέφαλος (Κεφαλαλγία)' : 'Острая пульсирующая головная боль / мигрень')
          : (lang === 'de' ? 'Kopfschmerzen' :
             lang === 'en' ? 'Headache' :
             lang === 'es' ? 'Dolor de cabeza' :
             lang === 'fr' ? 'Maux de tête' :
             lang === 'it' ? 'Mal di testa' :
             lang === 'el' ? 'Πονοκέφαλος' : 'Головная боль');

      const analText =
        lang === 'de' ? 'Anal- & Gesäßschmerzen (Hämorrhoidalbeschwerden)' :
        lang === 'en' ? 'Anal and rectal pain (Hemorrhoidal complaints)' :
        lang === 'es' ? 'Dolor anal y rectal (Hemorroides)' :
        lang === 'fr' ? 'Douleur anale et hémorroïdaire' :
        lang === 'it' ? 'Dolore anale ed emorroidario' :
        lang === 'el' ? 'Πόνος στον πρωκτό & αιμορροΐδες' : 'Анальные и геморроидальные боли';

      if (hasHead && hasAnal) {
        return `1. ${headText} | 2. ${analText}`;
      }
      if (hasAnal) {
        return analText;
      }
      if (hasHead) {
        return headText;
      }

      // Fever
      if (
        lower.includes('fieber') ||
        lower.includes('fever') ||
        lower.includes('fiebre') ||
        lower.includes('fièvre') ||
        lower.includes('febbre') ||
        lower.includes('πυρετ') ||
        lower.includes('лихорад')
      ) {
        const isSudden = lower.includes('plötzlich') || lower.includes('sudden') || lower.includes('repent') || lower.includes('soudain') || lower.includes('improvvis') || lower.includes('αιφνίδι') || lower.includes('внезапн');
        const isHigh = lower.includes('hoch') || lower.includes('high') || lower.includes('alt') || lower.includes('élevé') || lower.includes('υψηλ') || lower.includes('высок');
        const hasHeatSensation = lower.includes('hitze') || lower.includes('heat') || lower.includes('calor') || lower.includes('chaleur') || lower.includes('caldo') || lower.includes('ζέστ') || lower.includes('жар');

        if (isSudden && isHigh && hasHeatSensation) {
          switch (lang) {
            case 'de':
              return 'Plötzliches hohes Fieber und Hitzegefühl';
            case 'en':
              return 'Sudden high fever and heat sensation';
            case 'es':
              return 'Fiebre alta repentina y sensación de calor';
            case 'fr':
              return 'Fièvre élevée soudaine et sensation de chaleur';
            case 'it':
              return 'Febbre alta improvvisa e sensazione di calore';
            case 'el':
              return 'Αιφνίδιος υψηλός πυρετός και αίσθημα θερμότητας';
            case 'ru':
              return 'Внезапная высокая температура и ощущение жара';
          }
        }
        if (isSudden && isHigh) {
          switch (lang) {
            case 'de': return 'Plötzliches hohes Fieber';
            case 'en': return 'Sudden high fever';
            case 'es': return 'Fiebre alta repentina';
            case 'fr': return 'Fièvre élevée soudaine';
            case 'it': return 'Febbre alta improvvisa';
            case 'el': return 'Αιφνίδιος υψηλός πυρετός';
            case 'ru': return 'Внезапная высокая температура';
          }
        }
        if (isHigh) {
          switch (lang) {
            case 'de': return 'Hohes Fieber';
            case 'en': return 'High fever';
            case 'es': return 'Fiebre alta';
            case 'fr': return 'Forte fièvre';
            case 'it': return 'Febbre alta';
            case 'el': return 'Υψηλός πυρετός';
            case 'ru': return 'Высокая температура';
          }
        }
        switch (lang) {
          case 'de': return 'Fieber';
          case 'en': return 'Fever';
          case 'es': return 'Fiebre';
          case 'fr': return 'Fièvre';
          case 'it': return 'Febbre';
          case 'el': return 'Πυρετός';
          case 'ru': return 'Лихорадка / температура';
        }
      }

      // Stomach / Abdomen / Colic
      if (
        lower.includes('bauch') ||
        lower.includes('magen') ||
        lower.includes('stomach') ||
        lower.includes('krampf') ||
        lower.includes('kolik') ||
        lower.includes('cramp') ||
        lower.includes('colic') ||
        lower.includes('κοιλ') ||
        lower.includes('σπασμ') ||
        lower.includes('στομάχ') ||
        lower.includes('στομαχ') ||
        lower.includes('живот')
      ) {
        const isColic =
          lower.includes('krampf') ||
          lower.includes('kolik') ||
          lower.includes('cramp') ||
          lower.includes('colic') ||
          lower.includes('σπασμ');

        if (isColic) {
          switch (lang) {
            case 'de':
              return 'Akute krampfartige Bauchschmerzen (Kolik)';
            case 'en':
              return 'Acute spasmodic abdominal colic';
            case 'es':
              return 'Cólico abdominal espasmódico agudo';
            case 'fr':
              return 'Coliques abdominales spasmodiques aiguës';
            case 'it':
              return 'Colica addominale crampiforme acuta';
            case 'el':
              return 'Οξείες σπαστικές κοιλιακές κράμπες (κολικός)';
            case 'ru':
              return 'Острые спастические боли в животе (колика)';
          }
        }
        switch (lang) {
          case 'de': return 'Bauchschmerzen';
          case 'en': return 'Abdominal pain';
          case 'es': return 'Dolor abdominal';
          case 'fr': return 'Douleurs abdominales';
          case 'it': return 'Dolore addominale';
          case 'el': return 'Κοιλιακό άλγος';
          case 'ru': return 'Боли в животе';
        }
      }

      return capitalizeFirst(targetText);
    }

    case 'begleitsymptome': {
      // Restlessness & Anxiety
      if (
        lower.includes('unruhe') ||
        lower.includes('angst') ||
        lower.includes('restless') ||
        lower.includes('anxiety') ||
        lower.includes('inquiet') ||
        lower.includes('agitation') ||
        lower.includes('ansia') ||
        lower.includes('ανησυχ') ||
        lower.includes('φόβ') ||
        lower.includes('φοβ') ||
        lower.includes('πανικ') ||
        lower.includes('беспокой')
      ) {
        switch (lang) {
          case 'de':
            return 'Psychovegetativ: Ausgeprägte motorische Unruhe und Angst';
          case 'en':
            return 'Psychovegetative: Marked motor restlessness and anxiety';
          case 'es':
            return 'Psicovegetativo: Marcada inquietud motora y ansiedad';
          case 'fr':
            return 'Psychovégétatif : Agitation motrice et anxiété marquées';
          case 'it':
            return 'Psicovegetativo: Marcata irrequietezza motoria e ansia';
          case 'el':
            return 'Ψυχοσωματικά: Έντονη κινητική ανησυχία και φόβος';
          case 'ru':
            return 'Психовегетативные: выраженное двигательное беспокойство и тревога';
        }
      }

      // Thirst Concomitant
      if (
        lower.includes('durst') ||
        lower.includes('thirst') ||
        lower.includes('sed') ||
        lower.includes('soif') ||
        lower.includes('sete') ||
        lower.includes('δίψ') ||
        lower.includes('διψ') ||
        lower.includes('νερό') ||
        lower.includes('νερο') ||
        lower.includes('жажд')
      ) {
        switch (lang) {
          case 'de':
            return 'Auffällige Durstmodalität (starker Durst auf kaltes Wasser)';
          case 'en':
            return 'Marked thirst modality (great thirst for cold water)';
          case 'es':
            return 'Modalidad de sed marcada (gran sed de agua fría)';
          case 'fr':
            return 'Modalité de soif marquée (grande soif d\'eau froide)';
          case 'it':
            return 'Marcata modalità della sete (forte sete di acqua fredda)';
          case 'el':
            return 'Έντονη τροποποίηση δίψας (μεγάλη δίψα για κρύο νερό)';
          case 'ru':
            return 'Выраженная жажда холодной воды';
        }
      }

      // Sweating / Perspiration
      if (
        lower.includes('schweiß') ||
        lower.includes('schweiss') ||
        lower.includes('sweat') ||
        lower.includes('sudor') ||
        lower.includes('sueur') ||
        lower.includes('sudore') ||
        lower.includes('ιδρώ') ||
        lower.includes('ιδρω') ||
        lower.includes('пот')
      ) {
        switch (lang) {
          case 'de':
            return 'Vegetatives Begleitsymptom: Profuse Schweißausbrüche';
          case 'en':
            return 'Vegetative concomitant: Profuse perspiration';
          case 'es':
            return 'Síntoma vegetativo: Sudoración profusa';
          case 'fr':
            return 'Symptôme végétatif : Sueurs abondantes';
          case 'it':
            return 'Sintomo vegetativo: Sudorazione abbondante';
          case 'el':
            return 'Φυτικό σύμπτωμα: Άφθονη εφίδρωση';
          case 'ru':
            return 'Вегетативный спутник: обильное потоотделение';
        }
      }

      // Irritability / Anger
      if (
        lower.includes('reizbar') ||
        lower.includes('irritable') ||
        lower.includes('zorn') ||
        lower.includes('anger') ||
        lower.includes('irrit') ||
        lower.includes('colère') ||
        lower.includes('rabbia') ||
        lower.includes('ευερέθιστ') ||
        lower.includes('ευερεθιστ') ||
        lower.includes('εκνευρισμ') ||
        lower.includes('раздраж')
      ) {
        switch (lang) {
          case 'de':
            return 'Gemüt: Ausgeprägte Reizbarkeit, Zorn und Überempfindlichkeit';
          case 'en':
            return 'Mind: Marked irritability, anger and hypersensitivity';
          case 'es':
            return 'Ánimo: Marcada irritabilidad, ira e hipersensibilidad';
          case 'fr':
            return 'Mental : Irritabilité marquée, colère et hypersensibilité';
          case 'it':
            return 'Mente: Marcata irritabilità, rabbia e ipersensibilità';
          case 'el':
            return 'Διάνοια: Έντονος εκνευρισμός, θυμός και υπερευαισθησία';
          case 'ru':
            return 'Психика: выраженная раздражительность, гнев и гиперчувствительность';
        }
      }

      // Drowsiness / Apathy
      if (
        lower.includes('müde') ||
        lower.includes('muede') ||
        lower.includes('tired') ||
        lower.includes('schläfrig') ||
        lower.includes('schlaefrig') ||
        lower.includes('drowsy') ||
        lower.includes('somnol') ||
        lower.includes('сонлив') ||
        lower.includes('υπνηλ') ||
        lower.includes('νύστα')
      ) {
        switch (lang) {
          case 'de':
            return 'Gemüt: Ausgeprägte Schläfrigkeit, Schweregefühl und Apathie';
          case 'en':
            return 'Mind: Marked drowsiness, heaviness and apathy';
          case 'es':
            return 'Ánimo: Marcada somnolencia, pesadez y apatía';
          case 'fr':
            return 'Mental : Somnolence marquée, lourdeur et apathie';
          case 'it':
            return 'Mente: Marcata sonnolenza, pesantezza e apatia';
          case 'el':
            return 'Διάνοια: Έντονη υπνηλία, αίσθημα βάρους και απάθεια';
          case 'ru':
            return 'Психика: выраженная сонливость, тяжесть и апатия';
        }
      }

      return `${getConcomitantPrefix(lang)}${capitalizeFirst(targetText)}`;
    }
  }
}

/**
 * Formats clinical variable for live display in cards:
 * 1. Checks if the variable contains raw unformatted text (such as "Πιο πολύ με ηρεμία ο καθένας αέρας"),
 *    and runs clinical enrichment.
 * 2. If it already has a foreign prefix (e.g. German "> Gebessert durch:" displayed in Greek UI),
 *    converts the prefix to the active language.
 */
export function formatClinicalVariableForDisplay(
  val: string,
  varKey: AcuteVariableType,
  lang: LanguageCode
): string {
  const trimmed = (val || '').trim();
  if (!trimmed) return '';

  const lowerTrimmed = trimmed.toLowerCase();
  if (
    lowerTrimmed.includes('unbekannt') ||
    lowerTrimmed.includes('unknown') ||
    lowerTrimmed.includes('desconocido') ||
    lowerTrimmed.includes('inconnu') ||
    lowerTrimmed.includes('sconosciuto') ||
    lowerTrimmed.includes('άγνωστο') ||
    lowerTrimmed.includes('αγνωστο') ||
    lowerTrimmed.includes('неизвестно') ||
    lowerTrimmed.includes('noch nicht genannt') ||
    lowerTrimmed.includes('bitte erfragen') ||
    lowerTrimmed.includes('please inquire')
  ) {
    return trimmed;
  }

  const { coreText, isBetter, isWorse, isConcomitant, isCausa } = stripClinicalPrefix(trimmed);

  // Check if coreText can be clinically enriched
  const enriched = enrichClinicalText(varKey, coreText, lang);

  let formattedResult = trimmed;
  // If enrichClinicalText returned a richer professional phrase, use it
  if (enriched && enriched.toLowerCase() !== coreText.toLowerCase()) {
    formattedResult = enriched;
  } else if (varKey === 'modalitaeten') {
    if (isWorse) {
      formattedResult = `${getModalityWorsePrefix(lang)}${capitalizeFirst(coreText)}`;
    } else if (isBetter) {
      formattedResult = `${getModalityBetterPrefix(lang)}${capitalizeFirst(coreText)}`;
    } else {
      formattedResult = capitalizeFirst(coreText);
    }
  } else if (varKey === 'begleitsymptome' && isConcomitant) {
    formattedResult = `${getConcomitantPrefix(lang)}${capitalizeFirst(coreText)}`;
  } else if (varKey === 'causa' && isCausa) {
    formattedResult = `${getCausaPrefix(lang)}${capitalizeFirst(coreText)}`;
  }

  return stripComparisonSymbols(deduplicateRepeatedExpressions(formattedResult));
}
