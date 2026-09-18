// Script to generate comprehensive Materia Medica data for all homeopathic remedies A-Z
import fs from 'fs';
import path from 'path';

interface RemedyDef {
  id: string;
  latinName: string;
  categoryKey: 'plant' | 'mineral' | 'animal' | 'nosode' | 'acid' | 'other';
  isPolychrest?: boolean;
  importanceTier: 1 | 2 | 3;
  de: {
    commonName: string;
    category: string;
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
    category: string;
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
  es?: Partial<{
    commonName: string;
    category: string;
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
  }>;
  fr?: Partial<{
    commonName: string;
    category: string;
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
  }>;
  el?: Partial<{
    commonName: string;
    category: string;
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
  }>;
  it?: Partial<{
    commonName: string;
    category: string;
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
  }>;
  ru?: Partial<{
    commonName: string;
    category: string;
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
  }>;
}

export const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  plant: {
    de: 'Pflanzlich',
    en: 'Plant',
    es: 'Vegetal',
    fr: 'Végétal',
    el: 'Φυτικό',
    it: 'Vegetale',
    ru: 'Растительный'
  },
  mineral: {
    de: 'Mineralisch',
    en: 'Mineral',
    es: 'Mineral',
    fr: 'Minéral',
    el: 'Ορυκτό',
    it: 'Minerale',
    ru: 'Минеральный'
  },
  animal: {
    de: 'Tierisch',
    en: 'Animal',
    es: 'Animal',
    fr: 'Animal',
    el: 'Ζωικό',
    it: 'Animale',
    ru: 'Животный'
  },
  acid: {
    de: 'Säure',
    en: 'Acid',
    es: 'Ácido',
    fr: 'Acide',
    el: 'Οξύ',
    it: 'Acido',
    ru: 'Кислота'
  },
  nosode: {
    de: 'Nosode',
    en: 'Nosode',
    es: 'Nosode',
    fr: 'Nosode',
    el: 'Νοσώδες',
    it: 'Nosode',
    ru: 'Нозод'
  },
  other: {
    de: 'Sonstiges',
    en: 'Other',
    es: 'Otro',
    fr: 'Autre',
    el: 'Άλλο',
    it: 'Altro',
    ru: 'Другое'
  }
};
