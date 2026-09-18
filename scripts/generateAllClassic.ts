// scripts/generateAllClassic.ts
import * as fs from 'fs';
import * as path from 'path';

export interface RawClassicEntry {
  id: string;
  latinName: string;
  categoryKey: 'plant' | 'mineral' | 'animal' | 'nosode' | 'acid' | 'other';
  authors: ('hahnemann' | 'kent' | 'hering')[];
  isPolychrest?: boolean;
  importanceTier?: number;
  names: { de: string; en: string; es: string; fr: string; it: string; el: string; ru: string };
  originDe: string;
  originEn: string;
  essenceDe: string;
  essenceEn: string;
  indicationsDe: string[];
  indicationsEn: string[];
  keynotesDe: string[];
  keynotesEn: string[];
  mindDe: string;
  mindEn: string;
  betterDe: string[];
  betterEn: string[];
  worseDe: string[];
  worseEn: string[];
  dosageDe: string;
  dosageEn: string;
  sphereDe: string[];
  sphereEn: string[];
  diffs: string[];
  keywords: string[];
}

console.log('Script template ready');
