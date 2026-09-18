# Projekt-Richtlinien & Lokalisierungs-Standard (i18n)

## 1. Strikte Trennung von Texten & Programmcode
- **Keine fest im Code verankerten UI-Texte:** Sämtliche sichtbaren Benutzeroberflächen-Texte, Beschriftungen, Buttons, Platzhalter, Fehlermeldungen, Modale, Tooltips und Titel MÜSSEN über den Übersetzungs-Hook `useTranslation()` (`const { t } = useTranslation();`) aufgerufen werden (`{t('meineTextSchluessel')}`).
- **Programmcode-Fokus:** Bei Code-Änderungen an Komponenten und Seiten wird nur der eigentliche Anwendungs- und Steuerungs-Code bearbeitet. Alle Textinhalte verbleiben zentral in den Lokalisierungsdateien.

## 2. Lokalisierungsdateien (`src/i18n/locales/`)
Alle Übersetzungsschlüssel und Texte sind in den separaten Sprachdateien abgelegt:
- `src/i18n/locales/de.ts` (Deutsch - Referenz)
- `src/i18n/locales/en.ts` (English)
- `src/i18n/locales/es.ts` (Español)
- `src/i18n/locales/fr.ts` (Français)
- `src/i18n/locales/it.ts` (Italiano)
- `src/i18n/locales/el.ts` (Ελληνικά)
- `src/i18n/locales/ru.ts` (Русский)

## 3. Workflow bei neuen Texten oder Features
Wann immer ein neuer Text, ein neues Feld oder eine neue Seite hinzugefügt wird:
1. Füge den Übersetzungsschlüssel (`translationKey`) in `src/i18n/locales/de.ts` ein.
2. Kopiere und übersetze diesen Schlüssel synchron in ALLE weiteren Sprachdateien (`en.ts`, `es.ts`, `fr.ts`, `it.ts`, `el.ts`, `ru.ts`), sodass für alle 7 Sprachen stets Vollständigkeit gewährleistet ist.
3. Verwende im React-Code ausschließlich `t('translationKey')` bzw. mit Parametern `t('translationKey', { param: value })`.
