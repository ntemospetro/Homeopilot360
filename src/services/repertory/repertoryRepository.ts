import { CanonicalRepertoryRubric, CanonicalRemedyReference } from './canonicalTypes';

export class RepertoryRepository {
  private rubrics: Map<string, CanonicalRepertoryRubric> = new Map();

  public addRubric(rubric: CanonicalRepertoryRubric): boolean {
    if (this.rubrics.has(rubric.rubric_id)) {
      return false; // duplicate
    }
    this.rubrics.set(rubric.rubric_id, rubric);
    return true;
  }

  public getRubricById(id: string): CanonicalRepertoryRubric | null {
    return this.rubrics.get(id) || null;
  }

  public searchRubrics(query: string): CanonicalRepertoryRubric[] {
    const q = query.toLowerCase();
    const results: CanonicalRepertoryRubric[] = [];
    for (const rubric of this.rubrics.values()) {
      if (
        rubric.rubric_text_normalized.includes(q) ||
        rubric.chapter.toLowerCase().includes(q) ||
        rubric.keywords.some(k => k.toLowerCase().includes(q))
      ) {
        results.push(rubric);
      }
    }
    return results;
  }

  public getRubricsByChapter(chapter: string): CanonicalRepertoryRubric[] {
    const c = chapter.toLowerCase();
    const results: CanonicalRepertoryRubric[] = [];
    for (const rubric of this.rubrics.values()) {
      if (rubric.chapter.toLowerCase() === c) {
        results.push(rubric);
      }
    }
    return results;
  }

  public getRemediesForRubric(rubricId: string): CanonicalRemedyReference[] {
    const rubric = this.rubrics.get(rubricId);
    return rubric ? rubric.remedies : [];
  }

  public getRubricsForRemedy(remedyId: string): CanonicalRepertoryRubric[] {
    const rId = remedyId.toLowerCase();
    const results: CanonicalRepertoryRubric[] = [];
    for (const rubric of this.rubrics.values()) {
      if (rubric.remedies.some(r => r.remedy_id.toLowerCase() === rId)) {
        results.push(rubric);
      }
    }
    return results;
  }

  public size(): number {
    return this.rubrics.size;
  }
}
