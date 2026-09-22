/**
 * Client Service für die globale Organon-Abschlussprüfung und dynamische Restklärung
 */

import {
  OrganonGlobalReviewInput,
  OrganonGlobalReviewResult,
  ClarificationTurn,
  OrganonOpenIssue
} from '../types/organonGlobalReview';
import { Stage2Category } from '../types/organonStage2Workflow';
import {
  executeOrganonGlobalReview,
  applyClarificationToCategory
} from './organonGlobalReviewEngine';

/**
 * Führt die Organon-Abschlussprüfung aus (über Backend API mit lokalem Fallback)
 */
export async function runOrganonGlobalReview(
  input: OrganonGlobalReviewInput
): Promise<OrganonGlobalReviewResult> {
  try {
    const res = await fetch('/api/organon/global-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        const r = data.result;
        return {
          ...r,
          openIssues: Array.isArray(r.openIssues) ? r.openIssues : [],
          unresolvedIssues: Array.isArray(r.unresolvedIssues) ? r.unresolvedIssues : [],
          resolvedIssues: Array.isArray(r.resolvedIssues) ? r.resolvedIssues : [],
          summaryNotes: Array.isArray(r.summaryNotes) ? r.summaryNotes : []
        } as OrganonGlobalReviewResult;
      }
    }
  } catch (err) {
    console.warn('[runOrganonGlobalReview] API call failed or unavailable, executing local engine:', err);
  }

  // Lokaler deterministischer Fallback
  return executeOrganonGlobalReview(input);
}

/**
 * Verarbeitet eine Restklärungs-Antwort und führt sie in die betroffene Kategorie zurück.
 */
export function processClarificationResponse(
  currentRecords: Record<Stage2Category, { category: Stage2Category; status: string; text: string; details?: any }>,
  activeIssue: OrganonOpenIssue,
  answer: string
): {
  updatedRecords: Record<Stage2Category, { category: Stage2Category; status: string; text: string; details?: any }>;
  clarificationTurn: ClarificationTurn;
} {
  const targetCategory = activeIssue.affectedCategory || 'LOCALISATIO';
  const existingRecord = currentRecords[targetCategory] || {
    category: targetCategory,
    status: 'COMPLETED',
    text: ''
  };

  const { updatedText, resolvedIssue, note } = applyClarificationToCategory(
    targetCategory,
    existingRecord.text,
    activeIssue,
    answer
  );

  const updatedRecords = {
    ...currentRecords,
    [targetCategory]: {
      ...existingRecord,
      status: 'COMPLETED',
      text: updatedText
    }
  };

  const turn: ClarificationTurn = {
    id: `turn-${Date.now()}`,
    issueId: activeIssue.id,
    question: activeIssue.proposedQuestion || '',
    answer: answer.trim(),
    timestamp: new Date().toISOString(),
    resolvedIssue,
    affectedCategory: targetCategory,
    appliedUpdateSnippet: note
  };

  return {
    updatedRecords,
    clarificationTurn: turn
  };
}
