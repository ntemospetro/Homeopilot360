import { AnamnesisStepConfig } from '../types.extendedAnamnesis';

export const anamnesisSchema: AnamnesisStepConfig[] = [
  {
    id: 'gesundheitszustand',
    title: '1. Gesundheitszustand',
    fields: [
      {
        id: 'allgemeinzustand',
        label: 'Wie würden Sie Ihren Allgemeingesundheitszustand beschreiben?',
        type: 'radio',
        options: ['Sehr gut', 'Gut', 'Mittel', 'Schlecht', 'Sehr schlecht']
      },
      {
        id: 'energieniveau',
        label: 'Wie würden Sie Ihr Energieniveau beschreiben?',
        type: 'radio',
        options: ['Hoch', 'Mittel', 'Niedrig', 'Sehr niedrig']
      },
      {
        id: 'hat_beschwerden',
        label: 'Haben Sie derzeit Beschwerden oder Symptome?',
        type: 'radio',
        options: ['Nein', 'Ja']
      },
      {
        id: 'beschwerden_liste',
        label: 'Welche Beschwerden oder Symptome haben Sie?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_beschwerden', value: 'Ja' },
        addLabel: '+ Beschwerde hinzufügen',
        subFields: [
          { id: 'beschwerde', label: 'Beschwerde/Symptom', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'medizinische_vorgeschichte',
    title: '2. Medizinische Vorgeschichte',
    fields: [
      {
        id: 'hat_gesundheitsprobleme',
        label: 'Haben oder hatten Sie bekannte gesundheitliche Probleme, körperlich oder psychisch?',
        type: 'radio',
        options: ['Nein', 'Ja']
      },
      {
        id: 'gesundheitsprobleme_liste',
        label: 'Falls ja, welche?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_gesundheitsprobleme', value: 'Ja' },
        addLabel: '+ weiteres Gesundheitsproblem hinzufügen',
        subFields: [
          { id: 'problem', label: 'Gesundheitsproblem', type: 'text' }
        ]
      },
      {
        id: 'wurde_operiert',
        label: 'Wurden Sie schon einmal operiert?',
        type: 'radio',
        options: ['Nein', 'Ja']
      },
      {
        id: 'operationen_liste',
        label: 'Operationen',
        type: 'dynamic_list',
        condition: { fieldId: 'wurde_operiert', value: 'Ja' },
        addLabel: '+ weitere Operation hinzufügen',
        subFields: [
          { id: 'was', label: 'Was wurde operiert?', type: 'text' },
          { id: 'wann', label: 'Wann war die Operation?', type: 'text' },
          { id: 'verlauf', label: 'Ergebnis / Verlauf', type: 'text' },
          { id: 'bemerkungen', label: 'Weitere Bemerkungen', type: 'text' }
        ]
      },
      {
        id: 'hat_chronische_krankheiten',
        label: 'Leiden Sie unter chronischen Krankheiten?',
        type: 'radio',
        options: ['Nein', 'Ja']
      },
      {
        id: 'chronische_krankheiten_liste',
        label: 'Welche chronischen Krankheiten?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_chronische_krankheiten', value: 'Ja' },
        addLabel: '+ chronische Erkrankung hinzufügen',
        subFields: [
          { id: 'krankheit', label: 'Krankheit', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'medikamente',
    title: '3. Medikamente',
    fields: [
      {
        id: 'nimmt_medikamente',
        label: 'Nehmen Sie derzeit Medikamente ein?',
        type: 'radio',
        options: ['Nein', 'Ja']
      },
      {
        id: 'medikamente_liste',
        label: 'Medikamente',
        type: 'dynamic_list',
        condition: { fieldId: 'nimmt_medikamente', value: 'Ja' },
        addLabel: '+ weiteres Medikament hinzufügen',
        subFields: [
          { id: 'name', label: 'Medikamentenname (Tippen zum Suchen)', type: 'text', placeholder: 'z.B. Ibu...' },
          { id: 'dosierung', label: 'Dosierung in mg', type: 'text' },
          { id: 'haeufigkeit', label: 'Häufigkeit pro Tag', type: 'radio', options: ['1 x täglich', '2 x täglich', '3 x täglich', '4 x täglich', 'Bei Bedarf'] },
          { id: 'einnahmezeitpunkt', label: 'Einnahmezeitpunkt(e)', type: 'checkbox', options: ['morgens', 'vormittags', 'mittags', 'nachmittags', 'abends', 'nachts'], multiple: true },
          { id: 'uhrzeit', label: 'Konkrete Uhrzeit (optional)', type: 'text' },
          { id: 'lindert_beschwerden', label: 'Lindert dieses Medikament die Beschwerden?', type: 'radio', options: ['Ja', 'Nein', 'Weiß ich nicht'] }
        ]
      }
    ]
  },
  {
    id: 'allergien',
    title: '4. Allergien und Unverträglichkeiten',
    fields: [
      {
        id: 'hat_allergien',
        label: 'Haben Sie Allergien oder Unverträglichkeiten gegen Medikamente, Lebensmittel oder Umweltfaktoren?',
        type: 'radio',
        options: ['Nein', 'Ja']
      },
      {
        id: 'allergien_liste',
        label: 'Worauf haben Sie Allergien oder Unverträglichkeiten?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_allergien', value: 'Ja' },
        addLabel: '+ weitere Allergie / Unverträglichkeit hinzufügen',
        subFields: [
          { id: 'kategorie', label: 'Kategorie', type: 'radio', options: ['Medikamente', 'Lebensmittel', 'Umwelt', 'Sonstiges'] },
          { id: 'ausloeser', label: 'Welche Substanz / Lebensmittel / Auslöser?', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'nahrungsergaenzung',
    title: '5. Nahrungsergänzungsmittel und pflanzliche Präparate',
    fields: [
      {
        id: 'nimmt_nahrungsergaenzung',
        label: 'Nehmen Sie Nahrungsergänzungsmittel oder pflanzliche Präparate ein?',
        type: 'radio',
        options: ['Nein', 'Ja']
      },
      {
        id: 'nahrungsergaenzung_liste',
        label: 'Präparate',
        type: 'dynamic_list',
        condition: { fieldId: 'nimmt_nahrungsergaenzung', value: 'Ja' },
        addLabel: '+ weiteres Nahrungsergänzungsmittel hinzufügen',
        subFields: [
          { id: 'name', label: 'Name', type: 'text' },
          { id: 'art', label: 'Art / Kategorie', type: 'text' },
          { id: 'menge', label: 'Menge / Dosierung', type: 'text' },
          { id: 'haeufigkeit', label: 'Häufigkeit', type: 'text' },
          { id: 'einnahmezeitpunkt', label: 'Einnahmezeitpunkt', type: 'text' },
          { id: 'bemerkungen', label: 'Bemerkungen (optional)', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'ernaehrung',
    title: '6. Ernährungsgewohnheiten',
    fields: [
      {
        id: 'ernaehrungsart',
        label: 'Wie würden Sie Ihre Ernährung beschreiben? (Mehrfachauswahl)',
        type: 'checkbox',
        options: ['Ausgewogen', 'Vegetarisch', 'Vegan', 'Fleischreich', 'Reich an verarbeiteten Lebensmitteln', 'Andere'],
        multiple: true
      },
      {
        id: 'ernaehrungsart_andere',
        label: 'Wie würden Sie Ihre Ernährung beschreiben?',
        type: 'text',
        condition: { fieldId: 'ernaehrungsart', value: 'Andere', operator: 'includes' }
      },
      {
        id: 'hat_vorlieben_unvertraeglichkeiten',
        label: 'Haben Sie Vorlieben oder Unverträglichkeiten bei bestimmten Lebensmitteln?',
        type: 'radio',
        options: ['Nein', 'Ja']
      },
      {
        id: 'lebensmittel_liste',
        label: 'Lebensmittel Vorlieben/Unverträglichkeiten',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_vorlieben_unvertraeglichkeiten', value: 'Ja' },
        addLabel: '+ weiteres Lebensmittel hinzufügen',
        subFields: [
          { id: 'lebensmittel', label: 'Lebensmittel', type: 'text' },
          { id: 'art', label: 'Art', type: 'radio', options: ['Vorliebe', 'Unverträglichkeit'] },
          { id: 'bemerkung', label: 'Bemerkung / Reaktion (optional)', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'getraenke',
    title: '7. Wasser, Kaffee und Tee',
    fields: [
      { id: 'wasser_liter', label: 'Wie viele Liter Wasser trinken Sie ungefähr pro Tag?', type: 'number', unit: 'Liter / Tag' },
      { id: 'trinkt_kaffee', label: 'Trinken Sie Kaffee?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'kaffee_tassen', label: 'Wie viele Tassen pro Tag?', type: 'number', condition: { fieldId: 'trinkt_kaffee', value: 'Ja' }, unit: 'Tassen' },
      { id: 'kaffee_art', label: 'Kaffeeart', type: 'radio', options: ['Koffeinhaltig', 'Koffeinfrei', 'Beides'], condition: { fieldId: 'trinkt_kaffee', value: 'Ja' } },
      { id: 'trinkt_tee', label: 'Trinken Sie Tee?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'tee_liste',
        label: 'Teesorten',
        type: 'dynamic_list',
        condition: { fieldId: 'trinkt_tee', value: 'Ja' },
        addLabel: '+ weiteren Tee hinzufügen',
        subFields: [
          { id: 'sorte', label: 'Welche Teesorte?', type: 'text' },
          { id: 'tassen', label: 'Wie viele Tassen pro Tag?', type: 'number', unit: 'Tassen' },
          { id: 'art', label: 'Art', type: 'radio', options: ['Koffeinhaltig', 'Koffeinfrei'] },
          { id: 'bemerkung', label: 'Weitere Bemerkungen (optional)', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'alkohol_rauchen',
    title: '8. Alkohol und Rauchen',
    fields: [
      { id: 'trinkt_alkohol', label: 'Trinken Sie Alkohol?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'alkohol_konsum', label: 'Wie häufig trinken Sie Alkohol?', type: 'radio', options: ['Gelegentlich', 'Regelmäßig'], condition: { fieldId: 'trinkt_alkohol', value: 'Ja' } },
      {
        id: 'alkohol_gelegentlich_haeufigkeit',
        label: 'Häufigkeit',
        type: 'radio',
        options: ['monatlich', 'mehrmals monatlich', 'wöchentlich', 'mehrmals wöchentlich', 'andere'],
        condition: { fieldId: 'alkohol_konsum', value: 'Gelegentlich' }
      },
      {
        id: 'alkohol_gelegentlich_menge',
        label: 'Ungefähre Menge pro Anlass',
        type: 'text',
        condition: { fieldId: 'alkohol_konsum', value: 'Gelegentlich' }
      },
      {
        id: 'alkohol_regelmaessig_haeufigkeit',
        label: 'Häufigkeit',
        type: 'radio',
        options: ['täglich', 'mehrmals täglich', 'mehrmals pro Woche', 'wöchentlich', 'andere'],
        condition: { fieldId: 'alkohol_konsum', value: 'Regelmäßig' }
      },
      {
        id: 'alkohol_regelmaessig_menge',
        label: 'Welche Menge ungefähr?',
        type: 'text',
        condition: { fieldId: 'alkohol_konsum', value: 'Regelmäßig' }
      },
      { id: 'raucht', label: 'Rauchen Sie?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'rauchen_art',
        label: 'Was rauchen Sie? (Mehrfachauswahl)',
        type: 'checkbox',
        options: ['Zigaretten', 'E-Zigaretten / Vapes', 'Zigarren / Pfeife', 'Tabakerhitzer', 'Andere'],
        multiple: true,
        condition: { fieldId: 'raucht', value: 'Ja' }
      },
      {
        id: 'rauchen_menge',
        label: 'Wie viele Einheiten pro Tag?',
        type: 'number',
        unit: 'pro Tag',
        condition: { fieldId: 'raucht', value: 'Ja' }
      },
      {
        id: 'rauchen_dauer',
        label: 'Seit wie vielen Jahren rauchen Sie?',
        type: 'text',
        condition: { fieldId: 'raucht', value: 'Ja' }
      }
    ]
  },
  {
    id: 'verdauung',
    title: '9. Verdauung und Ausscheidung',
    fields: [
      { id: 'hat_verdauungsbeschwerden', label: 'Haben Sie Beschwerden im Bereich Verdauung und Ausscheidung?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'verdauung_art', label: 'Wie würden Sie Ihre Verdauung und Ausscheidung beschreiben?', type: 'radio', options: ['Normal', 'Verstopfung', 'Weicher Stuhl', 'Durchfall', 'Wechselnd', 'Andere'], condition: { fieldId: 'hat_verdauungsbeschwerden', value: 'Ja' } },
      { id: 'verdauung_andere', label: 'Andere Verdauung:', type: 'text', condition: { fieldId: 'verdauung_art', value: 'Andere' } },
      { id: 'hat_nahrungsmittel_probleme', label: 'Gibt es bestimmte Nahrungsmittel, nach denen Sie Verdauungsprobleme bekommen?', type: 'radio', options: ['Nein', 'Ja'], condition: { fieldId: 'hat_verdauungsbeschwerden', value: 'Ja' } },
      {
        id: 'nahrungsmittel_probleme_liste',
        label: 'Welche?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_nahrungsmittel_probleme', value: 'Ja' },
        addLabel: '+ weiteres Lebensmittel hinzufügen',
        subFields: [{ id: 'lebensmittel', label: 'Lebensmittel', type: 'text' }]
      },
      { id: 'hat_magen_darm_probleme', label: 'Haben Sie Blähungen, ein Schweregefühl im Magen oder andere Magen-Darm-Probleme?', type: 'radio', options: ['Nein', 'Ja'], condition: { fieldId: 'hat_verdauungsbeschwerden', value: 'Ja' } },
      { id: 'magen_darm_probleme_art', label: 'Welche Beschwerden haben Sie genau?', type: 'text', condition: { fieldId: 'hat_magen_darm_probleme', value: 'Ja' } },
      { id: 'magen_darm_probleme_wann', label: 'Wann treten die Beschwerden auf? (optional)', type: 'text', condition: { fieldId: 'hat_magen_darm_probleme', value: 'Ja' } }
    ]
  },
  {
    id: 'schlaf',
    title: '10. Schlaf',
    fields: [
      { id: 'schlafqualitaet', label: 'Wie würden Sie die Qualität Ihres Schlafs beschreiben?', type: 'radio', options: ['Sehr gut', 'Gut', 'Mittel', 'Schlecht', 'Sehr schlecht'] },
      { id: 'schlafdauer', label: 'Wie viele Stunden schlafen Sie ungefähr pro Nacht?', type: 'number' },
      { id: 'macht_mittagsschlaf', label: 'Machen Sie tagsüber einen Mittagsschlaf oder schlafen Sie nachmittags?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'mittagsschlaf_wann', label: 'Wann? (optional)', type: 'text', condition: { fieldId: 'macht_mittagsschlaf', value: 'Ja' } },
      { id: 'mittagsschlaf_dauer', label: 'Wie viele Stunden / Minuten? (optional)', type: 'text', condition: { fieldId: 'macht_mittagsschlaf', value: 'Ja' } },
      { id: 'schlafengehzeit_typ', label: 'Gehen Sie eher früh oder spät schlafen?', type: 'radio', options: ['Früh', 'Spät', 'Unterschiedlich'] },
      { id: 'schlafengehzeit_frueh', label: 'In der Regel gegen welche Uhrzeit?', type: 'text', condition: { fieldId: 'schlafengehzeit_typ', value: 'Früh' } },
      { id: 'schlafengehzeit_spaet', label: 'In der Regel gegen welche Uhrzeit?', type: 'text', condition: { fieldId: 'schlafengehzeit_typ', value: 'Spät' } },
      { id: 'hat_schlafprobleme', label: 'Haben Sie Schlafprobleme?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'schlafprobleme_art', label: 'Welche Schlafprobleme?', type: 'checkbox', options: ['Einschlafprobleme', 'Durchschlafprobleme', 'Frühes Erwachen', 'Häufiges Erwachen', 'Gedanken / Grübeln', 'Unruhe', 'Andere'], multiple: true, condition: { fieldId: 'hat_schlafprobleme', value: 'Ja' } },
      { id: 'schlafprobleme_andere', label: 'Andere Schlafprobleme:', type: 'text', condition: { fieldId: 'schlafprobleme_art', value: 'Andere', operator: 'includes' } },
      { id: 'hat_besondere_schlafgewohnheiten', label: 'Haben Sie besondere Schlafgewohnheiten (z.B. bevorzugte Schlafposition, Temperatur der Füße)?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'schlafposition', label: 'Welche Schlafposition bevorzugen Sie? (optional)', type: 'radio', options: ['Rückenlage', 'Seitenlage', 'Bauchlage', 'Wechselnd'], condition: { fieldId: 'hat_besondere_schlafgewohnheiten', value: 'Ja' } },
      { id: 'fuesse_temperatur', label: 'Sind Ihre Füße während des Schlafs eher warm oder kalt? (optional)', type: 'radio', options: ['Warm', 'Kalt', 'Wechselnd'], condition: { fieldId: 'hat_besondere_schlafgewohnheiten', value: 'Ja' } },
      { id: 'deckt_sich_zu', label: 'Decken Sie sich im Schlaf zu? (optional)', type: 'radio', options: ['Ja, immer', 'Teilweise', 'Nein'], condition: { fieldId: 'hat_besondere_schlafgewohnheiten', value: 'Ja' } },
      { id: 'hat_auffaellige_traeume', label: 'Haben Sie auffällige Träume oder Besonderheiten im Schlaf (z.B. Albträume, Sprechen, Schlafwandeln)?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'traeume', label: 'Wie erleben Sie Ihre Träume bzw. Ihr Schlafverhalten? (Mehrfachauswahl)', type: 'checkbox', options: ['Keine Erinnerung an Träume', 'Normale Träume', 'Albträume', 'Wiederkehrende Träume', 'Schlafwandeln', 'Sprechen im Schlaf', 'Andere'], multiple: true, condition: { fieldId: 'hat_auffaellige_traeume', value: 'Ja' } },
      { id: 'traeume_andere', label: 'Andere:', type: 'text', condition: { fieldId: 'traeume', value: 'Andere', operator: 'includes' } }
    ]
  },
  {
    id: 'lebensstil',
    title: '11. Lebensstil und Stress',
    fields: [
      { id: 'aktivitaet', label: 'Wie aktiv sind Sie im Alltag?', type: 'radio', options: ['Sitzend', 'Moderat aktiv', 'Aktiv', 'Sehr aktiv'] },
      { id: 'macht_sport', label: 'Betreiben Sie Sport?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'sport_liste',
        label: 'Sportarten',
        type: 'dynamic_list',
        condition: { fieldId: 'macht_sport', value: 'Ja' },
        addLabel: '+ weitere Sportart hinzufügen',
        subFields: [
          { id: 'art', label: 'Welche Sportart?', type: 'text' },
          { id: 'haeufigkeit', label: 'Wie häufig?', type: 'radio', options: ['täglich', 'mehrmals täglich', 'mehrmals pro Woche', 'wöchentlich', 'monatlich', 'andere'] },
          { id: 'dauer', label: 'Wie viele Stunden / Minuten?', type: 'text' },
          { id: 'tageszeit', label: 'Zu welcher Tageszeit?', type: 'radio', options: ['morgens', 'mittags', 'nachmittags', 'abends', 'unterschiedlich'] }
        ]
      },
      { id: 'stressniveau', label: 'Wie würden Sie Ihr Stressniveau einschätzen?', type: 'radio', options: ['Niedrig', 'Mittel', 'Hoch', 'Sehr hoch'] },
      { id: 'hat_stress_umgang', label: 'Haben Sie bestimmte Strategien im Umgang mit Stress?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'stress_umgang', label: 'Wie gehen Sie mit Stress um? (Mehrfachauswahl)', type: 'checkbox', options: ['Sport', 'Gespräche', 'Rückzug', 'Entspannung', 'Schlaf', 'Essen', 'Alkohol', 'Andere', 'Kein bestimmter Umgang'], multiple: true, condition: { fieldId: 'hat_stress_umgang', value: 'Ja' } },
      { id: 'stress_umgang_beschreibung', label: 'Weitere Beschreibung (optional)', type: 'text', condition: { fieldId: 'hat_stress_umgang', value: 'Ja' } },
      { id: 'hat_belastungen', label: 'Gibt es derzeit Situationen, die Sie belasten? (Ja/Nein)', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'belastungen_liste',
        label: 'Belastende Situationen',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_belastungen', value: 'Ja' },
        addLabel: '+ weitere belastende Situation hinzufügen',
        subFields: [
          { id: 'situation', label: 'Welche Situation belastet Sie?', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'wetter',
    title: '12. Wetterempfindlichkeit',
    fields: [
      { id: 'wetter_empfindlich', label: 'Werden Sie durch Wetter- oder Temperaturänderungen beeinflusst?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'wetter_faktoren', label: 'Wetterfaktoren (Mehrfachauswahl)', type: 'checkbox', options: ['Feuchtigkeit', 'Kälte', 'Hitze', 'Luftdruck', 'Zugluft', 'Regen', 'Gewitter', 'Wetterwechsel', 'Andere'], multiple: true, condition: { fieldId: 'wetter_empfindlich', value: 'Ja' } },
      { id: 'wetter_faktoren_andere', label: 'Andere Wetterfaktoren:', type: 'text', condition: { fieldId: 'wetter_faktoren', value: 'Andere', operator: 'includes' } },
      {
        id: 'weitere_wetterfaktoren_liste',
        label: 'Weitere Wetterfaktoren',
        type: 'dynamic_list',
        condition: { fieldId: 'wetter_empfindlich', value: 'Ja' },
        addLabel: '+ weiteren Wetterfaktor hinzufügen',
        subFields: [{ id: 'faktor', label: 'Faktor', type: 'text' }]
      }
    ]
  },
  {
    id: 'familie',
    title: '13. Familiäre Krankengeschichte',
    fields: [
      { id: 'familie_chronisch', label: 'Gibt es chronische oder erbliche Krankheiten in Ihrer Familie?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'familie_chronisch_art', label: 'Welche? (Mehrfachauswahl)', type: 'checkbox', options: ['Herzerkrankungen', 'Diabetes', 'Krebs', 'Autoimmunerkrankungen', 'Andere'], multiple: true, condition: { fieldId: 'familie_chronisch', value: 'Ja' } },
      { id: 'familie_chronisch_andere', label: 'Andere:', type: 'text', condition: { fieldId: 'familie_chronisch_art', value: 'Andere', operator: 'includes' } },
      {
        id: 'weitere_familienkrankheiten_liste',
        label: 'Weitere familiäre Erkrankungen',
        type: 'dynamic_list',
        condition: { fieldId: 'familie_chronisch', value: 'Ja' },
        addLabel: '+ weitere familiäre Erkrankung hinzufügen',
        subFields: [{ id: 'erkrankung', label: 'Erkrankung', type: 'text' }]
      },
      { id: 'familie_psychisch', label: 'Gibt es psychische Erkrankungen in Ihrer Familie?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'familie_psychisch_art', label: 'Welche? (Mehrfachauswahl)', type: 'checkbox', options: ['Depression', 'Angststörung', 'Suchterkrankung', 'Andere'], multiple: true, condition: { fieldId: 'familie_psychisch', value: 'Ja' } },
      {
        id: 'weitere_psychische_liste',
        label: 'Weitere psychische Erkrankungen',
        type: 'dynamic_list',
        condition: { fieldId: 'familie_psychisch', value: 'Ja' },
        addLabel: '+ weitere Erkrankung hinzufügen',
        subFields: [{ id: 'erkrankung', label: 'Erkrankung', type: 'text' }]
      },
      { id: 'familie_besonderheiten', label: 'Gibt es bekannte genetische oder andere medizinische Besonderheiten in Ihrer Familie?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'besonderheiten_liste',
        label: 'Besonderheiten',
        type: 'dynamic_list',
        condition: { fieldId: 'familie_besonderheiten', value: 'Ja' },
        addLabel: '+ weitere Besonderheit hinzufügen',
        subFields: [{ id: 'besonderheit', label: 'Welche Besonderheiten sind bekannt?', type: 'text' }]
      }
    ]
  },
  {
    id: 'psychologie',
    title: '14. Psychologisches Profil',
    fields: [
      { id: 'psych_zustand', label: 'Wie würden Sie Ihren aktuellen psychischen bzw. emotionalen Zustand beschreiben? (Mehrfachauswahl)', type: 'checkbox', options: ['Stabil', 'Belastet', 'Ängstlich', 'Depressive Stimmung', 'Phobisch', 'Erschöpft', 'Andere'], multiple: true },
      { id: 'hat_psych_beschreibung', label: 'Möchten Sie Ihren aktuellen emotionalen Zustand näher beschreiben?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'psych_zustand_beschreibung', label: 'Möchten Sie Ihren aktuellen Zustand näher beschreiben?', type: 'textarea', condition: { fieldId: 'hat_psych_beschreibung', value: 'Ja' } },
      { id: 'psych_symptome', label: 'Haben Sie kürzlich vermehrt Angst, Freudlosigkeit oder depressive Verstimmungen erlebt?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'psych_symptome_details', label: 'Was genau haben Sie erlebt?', type: 'textarea', condition: { fieldId: 'psych_symptome', value: 'Ja' } },
      { id: 'psych_therapie_historie', label: 'Hatten Sie in der Vergangenheit psychische Störungen oder befinden Sie sich derzeit in Psychotherapie?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'psych_therapie_art', label: 'Art', type: 'checkbox', options: ['Ärztlich / psychologisch diagnostizierte psychische Störung', 'Psychotherapie', 'Beides'], multiple: true, condition: { fieldId: 'psych_therapie_historie', value: 'Ja' } },
      { id: 'psych_diagnose', label: 'Welche Diagnose / Störung wurde festgestellt?', type: 'text', condition: { fieldId: 'psych_therapie_art', value: 'Ärztlich / psychologisch diagnostizierte psychische Störung', operator: 'includes' } },
      {
        id: 'psych_therapie_details',
        label: 'Details zur Psychotherapie',
        type: 'conditional_group',
        condition: { fieldId: 'psych_therapie_art', value: 'Psychotherapie', operator: 'includes' },
        subFields: [
          { id: 'warum', label: 'Warum befinden/befanden Sie sich in Psychotherapie?', type: 'text' },
          { id: 'seit_wann', label: 'Seit wann?', type: 'text' },
          { id: 'wie_lange', label: 'Wie lange?', type: 'text' },
          { id: 'status', label: 'Aktuell oder abgeschlossen?', type: 'radio', options: ['Aktuell', 'Abgeschlossen'] }
        ]
      }
    ]
  },
  {
    id: 'soziales',
    title: '15. Soziales Umfeld',
    fields: [
      { id: 'soziales_umfeld', label: 'Wie würden Sie Ihr soziales Umfeld beschreiben?', type: 'radio', options: ['Sehr unterstützend', 'Mäßig unterstützend', 'Wenig unterstützend', 'Keine / minimale Unterstützung'] },
      { id: 'erhaelt_unterstuetzung', label: 'Erhalten Sie Unterstützung aus Ihrem Umfeld?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'unterstuetzung_von', label: 'Von wem erhalten Sie Unterstützung? (Mehrfachauswahl)', type: 'checkbox', options: ['Familienangehörige', 'Partner/in', 'Freunde', 'Bekannte', 'Andere'], multiple: true, condition: { fieldId: 'erhaelt_unterstuetzung', value: 'Ja' } },
      { id: 'unterstuetzung_andere', label: 'Andere:', type: 'text', condition: { fieldId: 'unterstuetzung_von', value: 'Andere', operator: 'includes' } }
    ]
  },
  {
    id: 'konflikte',
    title: '16. Familiäre und persönliche Konflikte',
    fields: [
      { id: 'hat_konflikte', label: 'Gibt es familiäre oder persönliche Konflikte, die Sie aktuell beeinflussen?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'konflikte_liste',
        label: 'Konflikte',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_konflikte', value: 'Ja' },
        addLabel: '+ weiteren Konflikt hinzufügen',
        subFields: [
          { id: 'mit_wem', label: 'Mit wem besteht der Konflikt? (Mehrfachauswahl)', type: 'checkbox', options: ['Partner/in', 'Eltern', 'Geschwister', 'Großeltern', 'Onkel/Tanten', 'Andere'], multiple: true },
          { id: 'beschreibung', label: 'Möchten Sie den Konflikt näher beschreiben?', type: 'textarea' }
        ]
      }
    ]
  },
  {
    id: 'hauptbeschwerde',
    title: '17. Hauptbeschwerde und homöopathische Modalitäten',
    fields: [
      { id: 'hauptanliegen', label: 'Was ist aktuell Ihr wichtigstes gesundheitliches Anliegen?', type: 'textarea' },
      { id: 'seit_wann', label: 'Seit wann besteht es?', type: 'text' },
      { id: 'beginn', label: 'Wie hat es begonnen?', type: 'textarea' },
      { id: 'hat_ausloeser', label: 'Gab es einen erkennbaren Auslöser?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'ausloeser', label: 'Welcher Auslöser?', type: 'text', condition: { fieldId: 'hat_ausloeser', value: 'Ja' } },
      { id: 'verlauf', label: 'Verlauf der Beschwerden', type: 'radio', options: ['Dauerhaft', 'In Schüben / Anfällen', 'Wechselnd / Unregelmäßig'] },
      { id: 'intensitaet', label: 'Wie stark ist es auf einer Skala von 0–10?', type: 'number' },
      { id: 'art_der_beschwerden', label: 'Art der Beschwerden (Mehrfachauswahl)', type: 'checkbox', options: ['Stechend', 'Drückend', 'Brennend', 'Ziehend', 'Pulsierend', 'Krampfartig', 'Dumpf', 'Andere'], multiple: true },
      { id: 'hat_verschlechterung', label: 'Gibt es Faktoren, die die Beschwerden verschlechtern?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'verschlechterung', label: 'Was verschlechtert die Beschwerden? (Mehrfachauswahl)', type: 'checkbox', options: ['Kälte', 'Wärme', 'Bewegung', 'Ruhe', 'Berührung', 'Druck', 'bestimmte Körperposition', 'Essen', 'Trinken', 'Tageszeit', 'Wetter', 'Stress', 'Andere'], multiple: true, condition: { fieldId: 'hat_verschlechterung', value: 'Ja' } },
      { id: 'hat_verbesserung', label: 'Gibt es Faktoren, die die Beschwerden verbessern?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'verbesserung', label: 'Was verbessert die Beschwerden? (Mehrfachauswahl)', type: 'checkbox', options: ['Kälte', 'Wärme', 'Bewegung', 'Ruhe', 'Berührung', 'Druck', 'bestimmte Körperposition', 'Essen', 'Trinken', 'Tageszeit', 'Wetter', 'Stress', 'Andere'], multiple: true, condition: { fieldId: 'hat_verbesserung', value: 'Ja' } },
      { id: 'hat_weitere_modalitaeten', label: 'Gibt es weitere besondere Modalitäten oder Begleitsymptome?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'modalitaeten_andere', label: 'Andere Modalitäten (Verschlechterung/Verbesserung):', type: 'textarea', condition: { fieldId: 'hat_weitere_modalitaeten', value: 'Ja' } }
    ]
  },
  {
    id: 'durst',
    title: '18. Durst und Trinkverhalten',
    fields: [
      { id: 'durstauspraegung', label: 'Wie ausgeprägt ist Ihr Durst normalerweise?', type: 'radio', options: ['Kaum Durst', 'Wenig', 'Normal', 'Stark', 'Sehr stark'] },
      { id: 'trinkweise', label: 'Wie trinken Sie normalerweise?', type: 'radio', options: ['Kleine Mengen häufig', 'Große Mengen auf einmal', 'Unterschiedlich'] },
      { id: 'getraenketemperatur', label: 'Bevorzugen Sie eher:', type: 'radio', options: ['Kalte Getränke', 'Zimmertemperatur', 'Warme Getränke', 'Unterschiedlich'] }
    ]
  },
  {
    id: 'temperatur',
    title: '19. Wärme- und Kälteempfinden',
    fields: [
      { id: 'allgemeines_empfinden', label: 'Empfinden Sie sich allgemein eher als:', type: 'radio', options: ['Schnell frierend', 'Eher warm', 'Wechselnd', 'Ausgeglichen'] },
      { id: 'hat_kaelteempfindlichkeit', label: 'Reagieren bestimmte Körperbereiche besonders empfindlich auf Kälte?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'kaelteempfindlich', label: 'Welche Körperbereiche?', type: 'text', condition: { fieldId: 'hat_kaelteempfindlichkeit', value: 'Ja' } },
      { id: 'hat_waermeempfindlichkeit', label: 'Reagieren bestimmte Körperbereiche besonders empfindlich auf Wärme?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'waermeempfindlich', label: 'Welche Körperbereiche?', type: 'text', condition: { fieldId: 'hat_waermeempfindlichkeit', value: 'Ja' } }
    ]
  },
  {
    id: 'schweiss',
    title: '20. Schweiß',
    fields: [
      { id: 'hat_auffaelligen_schweiss', label: 'Haben Sie Auffälligkeiten beim Schwitzen (z.B. starkes Schwitzen, Nachtschweiß)?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'schweiss_menge', label: 'Wie stark schwitzen Sie normalerweise?', type: 'radio', options: ['Wenig', 'Normal', 'Stark', 'Sehr stark'], condition: { fieldId: 'hat_auffaelligen_schweiss', value: 'Ja' } },
      { id: 'schweiss_orte', label: 'Wo schwitzen Sie besonders? (Mehrfachauswahl)', type: 'checkbox', options: ['Kopf', 'Gesicht', 'Achseln', 'Hände', 'Füße', 'Brust', 'Rücken', 'Gesamter Körper', 'Andere'], multiple: true, condition: { fieldId: 'hat_auffaelligen_schweiss', value: 'Ja' } },
      { id: 'schweiss_wann', label: 'Wann schwitzen Sie besonders?', type: 'radio', options: ['Tagsüber', 'Nachts', 'Beim Sport', 'Bei Stress', 'Beim Schlafen', 'Andere'], condition: { fieldId: 'hat_auffaelligen_schweiss', value: 'Ja' } },
      { id: 'schweiss_geruch', label: 'Gibt es einen auffälligen Schweißgeruch? (optional)', type: 'radio', options: ['Nein', 'Ja'], condition: { fieldId: 'hat_auffaelligen_schweiss', value: 'Ja' } },
      { id: 'schweiss_geruch_art', label: 'Wie würden Sie den Geruch beschreiben?', type: 'radio', options: ['Säuerlich', 'Stechend / Scharf', 'Süßlich', 'Aasig / Faulig', 'Anderer Geruch'], condition: { fieldId: 'schweiss_geruch', value: 'Ja' } }
    ]
  },
  {
    id: 'haut',
    title: '21. Haut und Schleimhäute',
    fields: [
      { id: 'hat_hautprobleme', label: 'Haben Sie Hautprobleme oder besondere Hauterscheinungen?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'hautprobleme_art', label: 'Welche? (Mehrfachauswahl)', type: 'checkbox', options: ['Trockene Haut', 'Fettige Haut', 'Ekzeme', 'Ausschlag', 'Juckreiz', 'Akne', 'Andere'], multiple: true, condition: { fieldId: 'hat_hautprobleme', value: 'Ja' } },
      {
        id: 'hautprobleme_details',
        label: 'Details zu Hautproblemen',
        type: 'conditional_group',
        condition: { fieldId: 'hat_hautprobleme', value: 'Ja' },
        subFields: [
          { id: 'wo', label: 'Wo?', type: 'text' },
          { id: 'seit_wann', label: 'Seit wann?', type: 'text' },
          { id: 'verschlechterung', label: 'Was verschlechtert es?', type: 'text' },
          { id: 'verbesserung', label: 'Was verbessert es?', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'appetit',
    title: '22. Appetit, Verlangen und Abneigungen',
    fields: [
      { id: 'appetit', label: 'Wie würden Sie Ihren Appetit beschreiben?', type: 'radio', options: ['Sehr gut', 'Gut', 'Normal', 'Vermindert', 'Stark vermindert', 'Wechselnd'] },
      { id: 'hat_verlangen', label: 'Haben Sie ein ausgeprägtes Verlangen nach bestimmten Lebensmitteln oder Geschmacksrichtungen?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'verlangen', label: 'Haben Sie ein ausgeprägtes Verlangen nach bestimmten Lebensmitteln? (Mehrfachauswahl)', type: 'checkbox', options: ['Süß', 'Salzig', 'Sauer', 'Scharf', 'Fleisch', 'Milchprodukte', 'Eier', 'Brot / Teigwaren', 'Andere'], multiple: true, condition: { fieldId: 'hat_verlangen', value: 'Ja' } },
      { id: 'verlangen_andere', label: 'Andere (Verlangen):', type: 'text', condition: { fieldId: 'verlangen', value: 'Andere', operator: 'includes' } },
      { id: 'hat_abneigungen', label: 'Haben Sie Abneigungen gegen bestimmte Lebensmittel?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'abneigungen_liste',
        label: 'Welche?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_abneigungen', value: 'Ja' },
        addLabel: '+ weitere Abneigung hinzufügen',
        subFields: [{ id: 'lebensmittel', label: 'Lebensmittel', type: 'text' }]
      }
    ]
  },
  {
    id: 'ereignisse',
    title: '23. Besondere Lebensereignisse',
    fields: [
      { id: 'hat_ereignisse', label: 'Gab es wichtige körperliche oder emotionale Ereignisse, nach denen gesundheitliche Beschwerden begonnen oder sich verändert haben?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'ereignisse_liste',
        label: 'Welche Ereignisse?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_ereignisse', value: 'Ja' },
        addLabel: '+ weiteres Ereignis hinzufügen',
        subFields: [
          { id: 'art', label: 'Art (Mehrfachauswahl)', type: 'checkbox', options: ['Unfall', 'Operation', 'Schwere Infektion', 'Geburt', 'Trennung', 'Trauerfall', 'Berufliche Veränderung', 'Starker Stress', 'Anderes'], multiple: true },
          { id: 'wann', label: 'Wann?', type: 'text' },
          { id: 'was', label: 'Was ist passiert?', type: 'textarea' },
          { id: 'beschwerden_danach', label: 'Welche Beschwerden traten danach auf?', type: 'textarea' }
        ]
      }
    ]
  },
  {
    id: 'frühere_behandlungen',
    title: '24. Frühere Behandlungen',
    fields: [
      { id: 'hat_fruehere_behandlungen', label: 'Haben Sie bereits Behandlungen oder Therapien gegen Ihre Beschwerden ausprobiert?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'behandlungen_liste',
        label: 'Welche Behandlungen haben Sie bisher gegen Ihre aktuellen oder früheren Beschwerden ausprobiert?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_fruehere_behandlungen', value: 'Ja' },
        addLabel: '+ weitere Behandlung hinzufügen',
        subFields: [
          { id: 'behandlung', label: 'Behandlung / Medikament', type: 'text' },
          { id: 'zeitraum', label: 'Zeitraum', type: 'text' },
          { id: 'wirkung', label: 'Wirkung', type: 'text' },
          { id: 'verbesserung', label: 'Verbesserung', type: 'text' },
          { id: 'verschlechterung', label: 'Verschlechterung', type: 'text' },
          { id: 'nebenwirkungen', label: 'Nebenwirkungen', type: 'text' },
          { id: 'bemerkungen', label: 'Bemerkungen', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'homöopathische_behandlungen',
    title: '25. Frühere homöopathische Behandlungen',
    fields: [
      { id: 'hat_homoeopathie', label: 'Haben Sie bereits homöopathische Mittel eingenommen?', type: 'radio', options: ['Nein', 'Ja'] },
      {
        id: 'homoeopathie_liste',
        label: 'Welche Mittel?',
        type: 'dynamic_list',
        condition: { fieldId: 'hat_homoeopathie', value: 'Ja' },
        addLabel: '+ weiteres homöopathisches Mittel hinzufügen',
        subFields: [
          { id: 'name', label: 'Name des Mittels', type: 'text' },
          { id: 'potenz', label: 'Potenz', type: 'text' },
          { id: 'dosierung', label: 'Dosierung', type: 'text' },
          { id: 'haeufigkeit', label: 'Einnahmehäufigkeit', type: 'text' },
          { id: 'zeitraum', label: 'Zeitraum', type: 'text' },
          { id: 'wirkung', label: 'Wirkung', type: 'text' },
          { id: 'verschlechterung', label: 'Verschlechterung / Erstreaktion', type: 'text' },
          { id: 'bemerkungen', label: 'weitere Bemerkungen', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'sonstiges',
    title: '26. Weitere gesundheitliche oder emotionale Themen',
    fields: [
      { id: 'hat_sonstiges', label: 'Möchten Sie noch weitere gesundheitliche, psychische oder emotionale Themen erwähnen?', type: 'radio', options: ['Nein', 'Ja'] },
      { id: 'abschlussfrage', label: 'Welche weiteren Besonderheiten oder Beschwerden möchten Sie erwähnen?', type: 'textarea', condition: { fieldId: 'hat_sonstiges', value: 'Ja' } }
    ]
  }
];
