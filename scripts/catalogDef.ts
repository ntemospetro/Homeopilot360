// scripts/catalogDef.ts
// Definition of all classical remedies from Hahnemann, Kent, and Hering

export interface RawClassicRemedy {
  id: string;
  latinName: string;
  categoryKey: 'plant' | 'mineral' | 'animal' | 'nosode' | 'acid' | 'other';
  authors: ('hahnemann' | 'kent' | 'hering')[];
  isPolychrest?: boolean;
  importanceTier?: number;
  names: {
    de: string;
    en: string;
    es: string;
    fr: string;
    it: string;
    el: string;
    ru: string;
  };
  origin: {
    de: string;
    en: string;
  };
  essence: {
    de: string;
    en: string;
  };
  indications: {
    de: string[];
    en: string[];
  };
  keynotes: {
    de: string[];
    en: string[];
  };
  mind: {
    de: string;
    en: string;
  };
  better: {
    de: string[];
    en: string[];
  };
  worse: {
    de: string[];
    en: string[];
  };
  dosage: string;
  sphere: string[];
  diffs: string[];
  keywords: string[];
}
