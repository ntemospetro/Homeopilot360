/**
 * Organon Abschlussprüfung & Dynamische Restklärung
 * Spezifikation nach Organon §§ 83–104
 */

import { Stage2Category } from './organonStage2Workflow';

export type OrganonOpenIssueType =
  | 'MISSING_RELEVANT_INFORMATION'
  | 'CONTRADICTION'
  | 'AMBIGUITY'
  | 'ASSIGNMENT_UNCLEAR'
  | 'SYMPTOM_BINDING_UNCLEAR'
  | 'EPISODE_BINDING_UNCLEAR'
  | 'EVIDENCE_CEILING_CONFLICT';

export type OrganonIssuePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type OrganonIssueStatus =
  | 'OPEN'
  | 'RESOLVED'
  | 'NOT_FURTHER_CLARIFIABLE';

export interface EvidenceReference {
  textSnippet: string;
  sourceCategory?: Stage2Category | 'STAGE_1';
  sourceLocation?: string;
  statementIndex?: number;
}

export interface OrganonOpenIssue {
  id: string;
  issueType: OrganonOpenIssueType;
  affectedCategory?: Stage2Category;
  affectedDimensionIds?: string[];
  symptomId?: string | null;
  episodeId?: string | null;
  evidenceRefs: EvidenceReference[];
  description: string;
  clarifiable: boolean;
  priority: OrganonIssuePriority;
  informationNeeded?: string;
  proposedQuestion?: string;
  status: OrganonIssueStatus;
  resolutionNote?: string;
}

export type OrganonReviewStatus =
  | 'PASS'
  | 'ISSUES_DETECTED'
  | 'NOT_FURTHER_CLARIFIABLE';

export type OrganonNextAction =
  | 'ASK_CLARIFICATION'
  | 'COMPLETE';

export interface ClarificationTurn {
  id: string;
  issueId: string;
  question: string;
  answer: string;
  timestamp: string;
  resolvedIssue: boolean;
  affectedCategory?: Stage2Category;
  appliedUpdateSnippet?: string;
}

export interface OrganonGlobalReviewInput {
  rawText: string;
  stage1Values?: Record<string, string>;
  endprueferResult?: any | null;
  stage2Records: Record<Stage2Category, {
    category: Stage2Category;
    status: string;
    text: string;
    details?: any;
  }>;
  clarificationHistory?: ClarificationTurn[];
  hahnemannCrossCheck?: boolean;
  language?: string;
}

export interface OrganonCategoryCompleteness {
  totalCategories: number;
  completedCount: number;
  skippedCount: number;
  pendingCount: number;
  isFullySettled: boolean;
  pendingCategories: Stage2Category[];
}

export interface OrganonGlobalReviewResult {
  reviewStatus: OrganonReviewStatus;
  openIssues: OrganonOpenIssue[];
  unresolvedIssues: OrganonOpenIssue[];
  resolvedIssues: OrganonOpenIssue[];
  nextAction: OrganonNextAction;
  currentIssue?: OrganonOpenIssue | null;
  proposedQuestion?: string;
  summaryNotes: string[];
  timestamp: string;
  completeness?: OrganonCategoryCompleteness;
  meta: {
    totalCheckedCategories: number;
    evidenceCeilingVerified: boolean;
    noDiagnosticInference: boolean;
    noRepertorisationInference: boolean;
    crossCheckMode: 'gemini-only' | 'hahnemann-crosscheck';
  };
}

export type GlobalReviewStepState =
  | 'IDLE'
  | 'GLOBAL_REVIEW_RUNNING'
  | 'GLOBAL_REVIEW_COMPLETE'
  | 'RESIDUAL_CLARIFICATION'
  | 'COMPLETED';
