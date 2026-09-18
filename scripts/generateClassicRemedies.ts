// scripts/generateClassicRemedies.ts
// Compiles and verifies the master list of classical remedies from Samuel Hahnemann, James Tyler Kent, and Constantine Hering

export interface ClassicRemedyDefinition {
  id: string;
  latinName: string;
  germanCommon: string;
  englishCommon: string;
  category: 'plant' | 'mineral' | 'animal' | 'nosode' | 'acid' | 'other';
  authors: ('hahnemann' | 'kent' | 'hering')[];
  isPolychrest?: boolean;
  importanceTier?: number;
  origin: { de: string; en: string };
  essence: { de: string; en: string };
  mainIndications: { de: string[]; en: string[] };
  keynotes: { de: string[]; en: string[] };
  mindEmotional: { de: string; en: string };
  modalitiesBetter: { de: string[]; en: string[] };
  modalitiesWorse: { de: string[]; en: string[] };
  potenciesAndDosage: { de: string; en: string };
  sphereOfAction: { de: string[]; en: string[] };
  differentialRemedies: string[];
  searchKeywords: string[];
}

// We will populate all missing classical remedies
