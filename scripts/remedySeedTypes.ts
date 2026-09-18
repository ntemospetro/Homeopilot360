import fs from 'fs';
import path from 'path';

// Let's create the master dictionary of raw remedy definitions for all 297 remedies.
// This script contains the clinical homeopathic monographs for each remedy.

export interface RemedySeed {
  id: string;
  latinName: string;
  categoryKey: 'plant' | 'mineral' | 'animal' | 'nosode' | 'acid' | 'other';
  isPolychrest?: boolean;
  importanceTier: 1 | 2 | 3;
  de: {
    commonName: string;
    origin: string;
    essence: string;
    mainIndications: string[];
    keynotes: string[];
    mindEmotional: string;
    modalitiesBetter: string[];
    modalitiesWorse: string[];
    potenciesAndDosage: string;
    defaultTagesdosis?: string;
    sphereOfAction: string[];
    differentialRemedies: string[];
    searchKeywords: string[];
  };
  en: {
    commonName: string;
    origin: string;
    essence: string;
    mainIndications: string[];
    keynotes: string[];
    mindEmotional: string;
    modalitiesBetter: string[];
    modalitiesWorse: string[];
    potenciesAndDosage: string;
    defaultTagesdosis?: string;
    sphereOfAction: string[];
    differentialRemedies: string[];
    searchKeywords: string[];
  };
  fr?: { commonName: string };
  es?: { commonName: string };
  it?: { commonName: string };
  el?: { commonName: string };
  ru?: { commonName: string };
}
