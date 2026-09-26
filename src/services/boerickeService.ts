import { LanguageCode } from '../types';

export interface BoerickeSection {
  heading: string;
  content: string;
  depth: number;
}

export interface BoerickeRemedy {
  id: number;
  abbrev: string;
  name: string;
}

export interface BoerickeMonograph {
  title: string;
  sections: BoerickeSection[];
}

export async function fetchBoerickeRemedyInfo(abbrev: string): Promise<BoerickeRemedy | null> {
  try {
    // Standardize abbrev for search (strip trailing dot for search but Boericke usually has it)
    const response = await fetch(`/api/boericke/remedy/${encodeURIComponent(abbrev)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Error fetching Boericke remedy info:", err);
    return null;
  }
}

export async function fetchBoerickeMonograph(remedyId: number): Promise<BoerickeMonograph | null> {
  try {
    const response = await fetch(`/api/boericke/materia-medica/${remedyId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Error fetching Boericke monograph:", err);
    return null;
  }
}

export async function searchBoericke(query: string): Promise<BoerickeRemedy[]> {
  try {
    const response = await fetch(`/api/boericke/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error("Error searching Boericke:", err);
    return [];
  }
}

export async function fetchAllBoerickeRemedies(): Promise<BoerickeRemedy[]> {
  try {
    const response = await fetch('/api/boericke/all-remedies');
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error("Error fetching all Boericke remedies:", err);
    return [];
  }
}

export async function fetchBoerickeRelationship(remedyId: number): Promise<string | null> {
    try {
      const response = await fetch(`/api/boericke/relationship/${remedyId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.relationship;
    } catch (err) {
      console.error("Error fetching Boericke relationship:", err);
      return null;
    }
}
