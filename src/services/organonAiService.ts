import {
  EndprueferResult,
  EndprueferCategoryDecision,
  EndprueferAtomicClaim,
  EndprueferAuditChange,
  EndprueferDecisionStatus
} from '../types';

export interface OrganonSourceSpan {
  span_id: string;
  exact_text: string;
  type: 'COMPLAINT' | 'SENSATION' | 'LOCATION' | 'TEMPORAL' | 'INTENSITY' | 'NEGATION' | 'INTERVENTION' | 'MODALITY' | 'RELATIONSHIP' | 'UNCLEAR' | 'OTHER';
}

export interface OrganonEntity {
  entity_id: string;
  patient_label: string;
  status: 'CONFIRMED' | 'DENIED' | 'UNCLEAR';
  evidence_span_ids: string[];
}

export interface OrganonUncertainty {
  uncertainty_id: string;
  text: string;
  reason: string;
  related_entity_id: string | null;
  related_claim_ids?: string[];
}

export interface OrganonClaim {
  claim_id: string;
  subject_entity_id: string;
  attribute: string;
  value: string;
  status: 'CONFIRMED' | 'DENIED' | 'UNCLEAR';
  evidence_span_ids: string[];
}

export interface OrganonTemporalBinding {
  temporal_binding_id: string;
  subject_entity_id: string;
  claim_id: string;
  time_expression: string;
  evidence_span_ids: string[];
  status: 'CONFIRMED' | 'DENIED' | 'UNCLEAR';
}

export interface OrganonSymptomState {
  state_id: string;
  subject_entity_id: string;
  presence: 'PRESENT' | 'ABSENT' | 'UNCLEAR';
  intensity_text: string | null;
  time_expression: string;
  source_claim_ids: string[];
  source_temporal_binding_ids: string[];
  status: 'CONFIRMED' | 'DENIED' | 'UNCLEAR';
}

export interface OrganonCorrection {
  correction_id: string;
  subject_entity_id: string;
  old_claim_id: string;
  new_claim_id: string;
  relation: 'SUPERSEDED_BY';
  evidence_span_ids: string[];
}

export interface OrganonContradiction {
  contradiction_id: string;
  subject_entity_id: string;
  attribute: string;
  claim_ids: string[];
  status: 'UNRESOLVED' | 'RESOLVED';
  evidence_span_ids: string[];
}

export interface OrganonNextQuestion {
  question_id: string;
  text: string;
  reason_code: string;
  related_entity_id: string | null;
  related_claim_ids: string[];
  related_contradiction_id: string | null;
  status: 'OPEN' | 'RESOLVED';
}

export interface OrganonValidation {
  is_valid: boolean;
  is_complete: boolean;
  blocking_issues: string[];
  warnings: string[];
}

export interface OrganonHahnemannFeature {
  analysis_id: string;
  text: string;
  related_entity_ids?: string[];
  related_claim_ids?: string[];
  related_state_ids?: string[];
  reason_code: string;
}

export interface OrganonHahnemannAnalysis {
  analysis_status: 'READY' | 'INCOMPLETE';
  characteristic_features: OrganonHahnemannFeature[];
  general_features: OrganonHahnemannFeature[];
  modalities: OrganonHahnemannFeature[];
  concomitants: OrganonHahnemannFeature[];
  course_features: OrganonHahnemannFeature[];
  missing_information: OrganonHahnemannFeature[];
  organon_references: string[];
}

export interface OrganonSelectedFeature {
  selection_id: string;
  feature_type: 'SENSATION' | 'LOCATION' | 'MODALITY' | 'CONCOMITANT' | 'COURSE' | 'OTHER';
  text: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason_code: string;
  related_entity_ids?: string[];
  related_claim_ids?: string[];
  related_state_ids?: string[];
}

export interface OrganonExcludedFeature {
  selection_id: string;
  text: string;
  reason_code: string;
  related_entity_ids?: string[];
  related_claim_ids?: string[];
}

export interface OrganonSelectionForRemedyAnalysis {
  status: 'READY' | 'BLOCKED';
  selected_features: OrganonSelectedFeature[];
  excluded_features: OrganonExcludedFeature[];
  blocking_reasons: string[];
}

export interface OrganonFeatureQuery {
  query_id: string;
  selection_id: string;
  feature_type: string;
  original_text: string;
  normalized_search_terms: string[];
  status: string;
}

export interface OrganonRepertoryMatch {
  match_id: string;
  selection_id: string;
  source: string;
  source_file: string;
  source_record_id: string;
  matched_text: string;
  match_type: string;
  remedy_entries: any[];
  provenance_valid: boolean;
}

export interface OrganonMateriaMedicaMatch {
  match_id: string;
  selection_id: string;
  source: string;
  source_file: string;
  source_record_id: string;
  matched_text: string;
  remedy_id?: string;
  match_type: string;
  provenance_valid: boolean;
}

export interface OrganonRemedyRetrieval {
  status: string;
  feature_queries: OrganonFeatureQuery[];
  repertory_matches: OrganonRepertoryMatch[];
  materia_medica_matches: OrganonMateriaMedicaMatch[];
  warnings: string[];
}

export interface OrganonFeatureWeight {
  selection_id: string;
  feature_type: string;
  priority: string;
  weight: number;
}

export interface OrganonRepertoryContribution {
  selection_id: string;
  source_record_id: string;
  feature_weight: number;
  repertory_grade: number | null;
  contribution: number;
}

export interface OrganonSupportiveMmEvidence {
  selection_id: string;
  source: string;
  source_record_id: string;
  matched_text: string;
}

export interface OrganonRemedyScore {
  remedy_id: string;
  repertory_score: number;
  matched_feature_count: number;
  matched_selection_ids: string[];
  repertory_contributions: OrganonRepertoryContribution[];
  supportive_mm_evidence: OrganonSupportiveMmEvidence[];
}

export interface OrganonRepertoryScoring {
  status: string;
  feature_weights: OrganonFeatureWeight[];
  remedy_scores: OrganonRemedyScore[];
  warnings: string[];
}

export interface OrganonUnmatchedFeature {
  selection_id: string;
  feature_type: string;
  text: string;
  priority: string;
  reason: string;
}

export interface OrganonScoringAdequacy {
  status: string;
  selected_feature_count: number;
  repertory_matched_feature_count: number;
  supportive_mm_feature_count: number;
  repertory_coverage_ratio: number;
  weighted_possible_score_basis: number;
  weighted_repertory_coverage: number;
  unmatched_selected_features: OrganonUnmatchedFeature[];
  warnings: string[];
}

export interface OrganonComplaintMatrix {
  complaint_id: string;
  patient_label: string;
  temporal_status: 'NEW_CURRENT' | 'CURRENT_ONGOING' | 'CHRONIC_BASELINE' | 'CHRONIC_CHANGED' | 'RECURRENT' | 'HISTORICAL_RESOLVED' | 'UNKNOWN';
  complaint_type: 'INDEX_COMPLAINT' | 'CURRENT_ASSOCIATED_COMPLAINT' | 'CHRONIC_BACKGROUND' | 'HISTORICAL' | 'UNKNOWN';
  onset: string | null;
  duration: string | null;
  course: string | null;
  causa: string | null;
  location: string | null;
  sensation: string | null;
  modalities: string[];
  concomitants: string[];
  mind: string | null;
  intensity: string | null;
  frequency: string | null;
  negations: string[];
  uncertainties: string[];
  relation_to_current_episode: string | null;
  evidence_span_ids: string[];
}

export interface OrganonComplaintRelation {
  relation_id: string;
  source_complaint_id: string;
  target_complaint_id: string;
  relation_type: 'SAME_ONSET' | 'BEFORE' | 'AFTER' | 'DURING' | 'OVERLAPPING' | 'UNRELATED_BY_PATIENT' | 'UNKNOWN';
  status: string;
  evidence_span_ids: string[];
}

export interface OrganonStage1Item {
  category_key: string;
  category_name: string;
  core_question: string;
  result_text: string;
}

export interface OrganonStage2Item {
  text_snippet: string;
  examination: string;
  adopted_complaint: string;
}

export interface OrganonStage3Item {
  control_notes: string;
  clarification_question: string;
}

export interface OrganonThreeStageAnalysis {
  stage1: OrganonStage1Item[];
  stage2: OrganonStage2Item[];
  stage3: OrganonStage3Item;
}

export interface OrganonAiAnalysisResult {
  raw_text: string;
  three_stage?: OrganonThreeStageAnalysis;
  source_spans: OrganonSourceSpan[];
  entities: OrganonEntity[];
  uncertainties: OrganonUncertainty[];
  claims: OrganonClaim[];
  temporal_bindings: OrganonTemporalBinding[];
  symptom_states: OrganonSymptomState[];
  corrections: OrganonCorrection[];
  contradictions: OrganonContradiction[];
  next_question: OrganonNextQuestion | null;
  validation: OrganonValidation;
  hahnemann_analysis: OrganonHahnemannAnalysis;
  selection_for_remedy_analysis: OrganonSelectionForRemedyAnalysis;
  remedy_retrieval: OrganonRemedyRetrieval;
  repertory_scoring: OrganonRepertoryScoring;
  scoring_adequacy: OrganonScoringAdequacy;
  complaint_matrices: OrganonComplaintMatrix[];
  complaint_relations: OrganonComplaintRelation[];
}

export function createLocalFallbackAnalysis(rawText: string): OrganonAiAnalysisResult {
  const clean = (rawText || '').trim();
  const sentences = clean.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  
  const spans: OrganonSourceSpan[] = sentences.length > 0 ? sentences.map((s, idx) => ({
    span_id: `span_${idx + 1}`,
    exact_text: s,
    type: 'COMPLAINT' as const
  })) : [{ span_id: 'span_1', exact_text: clean, type: 'COMPLAINT' as const }];

  const entities: OrganonEntity[] = [{
    entity_id: 'ent_1',
    patient_label: clean.slice(0, 50) || 'Beschwerde',
    status: 'CONFIRMED' as const,
    evidence_span_ids: ['span_1']
  }];

  const claims: OrganonClaim[] = [{
    claim_id: 'claim_1',
    subject_entity_id: 'ent_1',
    attribute: 'presence',
    value: 'present',
    status: 'CONFIRMED' as const,
    evidence_span_ids: ['span_1']
  }];

  // Basic keyword extraction for location and sensations
  let loc: string | null = null;
  if (/knie/i.test(clean)) loc = 'Knie';
  else if (/kopf/i.test(clean)) loc = 'Kopf';
  else if (/magen|bauch/i.test(clean)) loc = 'Magen/Bauch';
  else if (/hals/i.test(clean)) loc = 'Hals';
  else if (/ruecken|rücken/i.test(clean)) loc = 'Rücken';

  let sens: string | null = null;
  if (/stechend/i.test(clean)) sens = 'stechend';
  else if (/brennend/i.test(clean)) sens = 'brennend';
  else if (/pochend/i.test(clean)) sens = 'pochend';
  else if (/drueckend|drückend/i.test(clean)) sens = 'drückend';
  else if (/schmerz/i.test(clean)) sens = 'Schmerz';

  let onset: string = 'aktuell';
  if (/montag/i.test(clean)) onset = 'seit Montag';
  else if (/gestern/i.test(clean)) onset = 'seit gestern';
  else if (/woche/i.test(clean)) onset = 'seit einer Woche';

  const complaintMatrices: OrganonComplaintMatrix[] = [{
    complaint_id: 'comp_1',
    patient_label: clean.slice(0, 60),
    temporal_status: 'NEW_CURRENT',
    complaint_type: 'INDEX_COMPLAINT',
    onset,
    duration: 'vorliegend',
    course: 'akut',
    causa: null,
    location: loc,
    sensation: sens,
    modalities: [],
    concomitants: [],
    mind: null,
    intensity: 'mittel',
    frequency: 'anhaltend',
    negations: [],
    uncertainties: [],
    relation_to_current_episode: 'INDEX',
    evidence_span_ids: ['span_1']
  }];

  return {
    raw_text: clean,
    source_spans: spans,
    entities,
    uncertainties: [],
    claims,
    temporal_bindings: [],
    symptom_states: [{
      state_id: 'state_1',
      subject_entity_id: 'ent_1',
      presence: 'PRESENT',
      intensity_text: 'vorliegend',
      time_expression: onset,
      source_claim_ids: ['claim_1'],
      source_temporal_binding_ids: [],
      status: 'CONFIRMED'
    }],
    corrections: [],
    contradictions: [],
    next_question: {
      question_id: 'q_1',
      text: 'Wann genau und wodurch (z. B. Ruhe, Bewegung, Wärme, Kälte) bessern oder verschlechtern sich die Beschwerden?',
      reason_code: 'ORGANON_MODALITY',
      related_entity_id: 'ent_1',
      related_claim_ids: ['claim_1'],
      related_contradiction_id: null,
      status: 'OPEN'
    },
    validation: {
      is_valid: true,
      is_complete: false,
      blocking_issues: [],
      warnings: []
    },
    hahnemann_analysis: {
      analysis_status: 'READY',
      characteristic_features: [],
      general_features: [],
      modalities: [],
      concomitants: [],
      course_features: [],
      missing_information: [
        {
          analysis_id: 'miss_1',
          text: 'Modalitäten nach Organon (§§ 83-104)',
          reason_code: 'MODALITY_MISSING'
        }
      ],
      organon_references: ['§§83–104', '§84']
    },
    selection_for_remedy_analysis: {
      status: 'READY',
      selected_features: [],
      excluded_features: [],
      blocking_reasons: []
    },
    remedy_retrieval: {
      status: 'READY',
      feature_queries: [],
      repertory_matches: [],
      materia_medica_matches: [],
      warnings: []
    },
    repertory_scoring: {
      status: 'READY',
      feature_weights: [],
      remedy_scores: [],
      warnings: []
    },
    scoring_adequacy: {
      status: 'READY',
      selected_feature_count: 0,
      repertory_matched_feature_count: 0,
      supportive_mm_feature_count: 0,
      repertory_coverage_ratio: 0,
      weighted_possible_score_basis: 0,
      weighted_repertory_coverage: 0,
      unmatched_selected_features: [],
      warnings: []
    },
    complaint_matrices: complaintMatrices,
    complaint_relations: []
  };
}

export function normalizeOrganonAnalysisResult(data: any, rawText: string): OrganonAiAnalysisResult {
  const safeArr = (arr: any) => (Array.isArray(arr) ? arr : []);
  
  const entities: OrganonEntity[] = safeArr(data.entities).map((e: any, i: number) => ({
    entity_id: e?.entity_id || `ent_${i + 1}`,
    patient_label: e?.patient_label || 'Symptom',
    status: e?.status || 'CONFIRMED',
    evidence_span_ids: safeArr(e?.evidence_span_ids)
  }));

  const claims: OrganonClaim[] = safeArr(data.claims).map((c: any, i: number) => ({
    claim_id: c?.claim_id || `claim_${i + 1}`,
    subject_entity_id: c?.subject_entity_id || 'ent_1',
    attribute: c?.attribute || 'presence',
    value: c?.value || '',
    status: c?.status || 'CONFIRMED',
    evidence_span_ids: safeArr(c?.evidence_span_ids)
  }));

  const temporal_bindings: OrganonTemporalBinding[] = safeArr(data.temporal_bindings).map((tb: any, i: number) => ({
    temporal_binding_id: tb?.temporal_binding_id || `tb_${i + 1}`,
    subject_entity_id: tb?.subject_entity_id || 'ent_1',
    claim_id: tb?.claim_id || 'claim_1',
    time_expression: tb?.time_expression || '',
    status: tb?.status || 'ATTACHED',
    evidence_span_ids: safeArr(tb?.evidence_span_ids)
  }));

  const symptom_states: OrganonSymptomState[] = safeArr(data.symptom_states).map((s: any, i: number) => ({
    state_id: s?.state_id || `state_${i + 1}`,
    subject_entity_id: s?.subject_entity_id || 'ent_1',
    presence: s?.presence || 'PRESENT',
    intensity_text: s?.intensity_text || '',
    time_expression: s?.time_expression || '',
    source_claim_ids: safeArr(s?.source_claim_ids),
    source_temporal_binding_ids: safeArr(s?.source_temporal_binding_ids),
    status: s?.status || 'CONFIRMED'
  }));

  const corrections: OrganonCorrection[] = safeArr(data.corrections).map((cr: any, i: number) => ({
    correction_id: cr?.correction_id || `corr_${i + 1}`,
    subject_entity_id: cr?.subject_entity_id || 'ent_1',
    old_claim_id: cr?.old_claim_id || '',
    new_claim_id: cr?.new_claim_id || '',
    relation: cr?.relation || 'SUPERSEDES',
    evidence_span_ids: safeArr(cr?.evidence_span_ids)
  }));

  const contradictions: OrganonContradiction[] = safeArr(data.contradictions).map((cd: any, i: number) => ({
    contradiction_id: cd?.contradiction_id || `con_${i + 1}`,
    subject_entity_id: cd?.subject_entity_id || 'ent_1',
    claim_ids: safeArr(cd?.claim_ids),
    attribute: cd?.attribute || 'general',
    status: cd?.status || 'UNRESOLVED',
    evidence_span_ids: safeArr(cd?.evidence_span_ids)
  }));

  const uncertainties: OrganonUncertainty[] = safeArr(data.uncertainties).map((u: any, i: number) => ({
    uncertainty_id: u?.uncertainty_id || `unc_${i + 1}`,
    text: u?.text || '',
    reason: u?.reason || '',
    related_entity_id: u?.related_entity_id || null,
    related_claim_ids: safeArr(u?.related_claim_ids)
  }));

  const complaint_matrices: OrganonComplaintMatrix[] = safeArr(data.complaint_matrices).map((m: any, i: number) => ({
    complaint_id: m?.complaint_id || `comp_${i + 1}`,
    patient_label: m?.patient_label || 'Beschwerde',
    temporal_status: m?.temporal_status || 'NEW_CURRENT',
    complaint_type: m?.complaint_type || 'INDEX_COMPLAINT',
    onset: m?.onset || '',
    duration: m?.duration || '',
    course: m?.course || '',
    causa: m?.causa || null,
    location: m?.location || null,
    sensation: m?.sensation || null,
    modalities: safeArr(m?.modalities),
    concomitants: safeArr(m?.concomitants),
    mind: m?.mind || null,
    intensity: m?.intensity || null,
    frequency: m?.frequency || null,
    negations: safeArr(m?.negations),
    uncertainties: safeArr(m?.uncertainties),
    relation_to_current_episode: m?.relation_to_current_episode || 'INDEX',
    evidence_span_ids: safeArr(m?.evidence_span_ids)
  }));

  const hahnemann = data.hahnemann_analysis || {};
  const normalizeFeatureList = (list: any) => safeArr(list).map((f: any, idx: number) => ({
    analysis_id: f?.analysis_id || `feat_${idx + 1}`,
    text: f?.text || '',
    reason_code: f?.reason_code || 'ORGANON',
    related_entity_ids: safeArr(f?.related_entity_ids),
    related_claim_ids: safeArr(f?.related_claim_ids),
    related_state_ids: safeArr(f?.related_state_ids)
  }));

  const hahnemann_analysis: OrganonHahnemannAnalysis = {
    analysis_status: hahnemann.analysis_status || 'READY',
    characteristic_features: normalizeFeatureList(hahnemann.characteristic_features),
    general_features: normalizeFeatureList(hahnemann.general_features),
    modalities: normalizeFeatureList(hahnemann.modalities),
    concomitants: normalizeFeatureList(hahnemann.concomitants),
    course_features: normalizeFeatureList(hahnemann.course_features),
    missing_information: safeArr(hahnemann.missing_information).map((m: any, idx: number) => 
      typeof m === 'string' ? { analysis_id: `miss_${idx + 1}`, text: m, reason_code: 'MISSING' } : m
    ),
    organon_references: safeArr(hahnemann.organon_references)
  };

  const sel = data.selection_for_remedy_analysis || {};
  const selection_for_remedy_analysis: OrganonSelectionForRemedyAnalysis = {
    status: sel.status || 'READY',
    selected_features: safeArr(sel.selected_features).map((f: any, idx: number) => ({
      selection_id: f?.selection_id || `sel_${idx + 1}`,
      feature_type: f?.feature_type || 'CHARACTERISTIC',
      text: f?.text || '',
      priority: f?.priority || 'MEDIUM',
      reason_code: f?.reason_code || 'ORGANON',
      related_entity_ids: safeArr(f?.related_entity_ids),
      related_claim_ids: safeArr(f?.related_claim_ids),
      related_state_ids: safeArr(f?.related_state_ids)
    })),
    excluded_features: safeArr(sel.excluded_features).map((f: any, idx: number) => ({
      selection_id: f?.selection_id || `exc_${idx + 1}`,
      feature_type: f?.feature_type || 'GENERAL',
      text: f?.text || '',
      priority: f?.priority || 'LOW',
      reason_code: f?.reason_code || 'ORGANON',
      related_entity_ids: safeArr(f?.related_entity_ids),
      related_claim_ids: safeArr(f?.related_claim_ids),
      related_state_ids: safeArr(f?.related_state_ids)
    })),
    blocking_reasons: safeArr(sel.blocking_reasons)
  };

  const defaultStage1 = [
    { category_key: 'causa', category_name: 'Causa', core_question: 'Wodurch ausgelöst?', result_text: 'Keine Angaben im Text.' },
    { category_key: 'localisatio', category_name: 'Localisatio', core_question: 'Wo?', result_text: 'Keine Angaben im Text.' },
    { category_key: 'sensatio', category_name: 'Sensatio', core_question: 'Wie fühlt es sich an?', result_text: 'Keine Angaben im Text.' },
    { category_key: 'symptoma', category_name: 'Symptoma', core_question: 'Was?', result_text: rawText.slice(0, 100) || 'Keine Angaben im Text.' },
    { category_key: 'modalitates_besserung', category_name: 'Modalitates – Besserung', core_question: 'Wann besser?', result_text: 'Keine Angaben im Text.' },
    { category_key: 'modalitates_verschlechterung', category_name: 'Modalitates – Verschlechterung', core_question: 'Wann schlechter?', result_text: 'Keine Angaben im Text.' },
    { category_key: 'symptomata_concomitantia', category_name: 'Symptomata concomitantia', core_question: 'Was tritt dazu auf?', result_text: 'Keine Angaben im Text.' },
    { category_key: 'comorbiditas', category_name: 'Comorbiditas', core_question: 'Welche weiteren Erkrankungen?', result_text: 'Keine Angaben im Text.' },
    { category_key: 'mens', category_name: 'Mens', core_question: 'Was verändert sich beim Denken?', result_text: 'Keine Angaben im Text.' },
    { category_key: 'animus', category_name: 'Animus', core_question: 'Wie geht es dir emotional?', result_text: 'Keine Angaben im Text.' }
  ];

  const three_stage = data.three_stage ? {
    stage1: safeArr(data.three_stage.stage1).length > 0 ? safeArr(data.three_stage.stage1) : defaultStage1,
    stage2: safeArr(data.three_stage.stage2).length > 0 ? safeArr(data.three_stage.stage2) : [{ text_snippet: rawText.slice(0, 80), examination: 'Rohtext analysiert.', adopted_complaint: 'Hauptbeschwerde' }],
    stage3: data.three_stage.stage3 || { control_notes: 'Prüfung abgeschlossen.', clarification_question: 'Gibt es weitere Begleitsymptome?' }
  } : {
    stage1: defaultStage1,
    stage2: [{ text_snippet: rawText.slice(0, 80), examination: 'Rohtext analysiert.', adopted_complaint: 'Hauptbeschwerde' }],
    stage3: { control_notes: 'Prüfung abgeschlossen.', clarification_question: 'Gibt es weitere Begleitsymptome?' }
  };

  return {
    raw_text: data.raw_text || rawText,
    three_stage,
    source_spans: safeArr(data.source_spans),
    entities,
    uncertainties,
    claims,
    temporal_bindings,
    symptom_states,
    corrections,
    contradictions,
    next_question: data.next_question || null,
    validation: data.validation || { is_valid: true, is_complete: true, blocking_issues: [], warnings: [] },
    hahnemann_analysis,
    selection_for_remedy_analysis,
    remedy_retrieval: data.remedy_retrieval || {
      status: 'READY',
      feature_queries: [],
      repertory_matches: [],
      materia_medica_matches: [],
      warnings: []
    },
    repertory_scoring: data.repertory_scoring || {
      status: 'READY',
      feature_weights: [],
      remedy_scores: [],
      warnings: []
    },
    scoring_adequacy: data.scoring_adequacy || {
      status: 'READY',
      selected_feature_count: 0,
      repertory_matched_feature_count: 0,
      supportive_mm_feature_count: 0,
      repertory_coverage_ratio: 0,
      weighted_possible_score_basis: 0,
      weighted_repertory_coverage: 0,
      unmatched_selected_features: [],
      warnings: []
    },
    complaint_matrices,
    complaint_relations: safeArr(data.complaint_relations)
  };
}

export interface OrganonCompareResult {
  engine: string;
  gemini: OrganonAiAnalysisResult;
  openai: OrganonAiAnalysisResult;
  errors?: { gemini?: string; openai?: string };
}

export async function analyzeOrganonText(
  rawText: string,
  language: string = 'de',
  engine: string = 'gemini',
  compare: boolean = false,
  onStepUpdate?: (stepId: string, status: 'active' | 'done') => void
): Promise<OrganonAiAnalysisResult | OrganonCompareResult> {
  try {
    const res = await fetch('/api/organon/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawText, language, engine, compare, stream: !!onStepUpdate }),
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      const isStreamingResponse = onStepUpdate && res.body && (contentType.includes('application/x-ndjson') || contentType.includes('chunked') || contentType.includes('text/'));

      if (isStreamingResponse) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullStreamText = '';
        let resultData: any = null;
        let streamError: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          fullStreamText += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const msg = JSON.parse(trimmed);
              if (msg.type === 'step' && msg.stepId && msg.status) {
                onStepUpdate!(msg.stepId, msg.status);
              } else if (msg.type === 'result' && msg.data) {
                resultData = msg.data;
              } else if (msg.type === 'error') {
                streamError = msg.error || 'Server error during stream';
              } else if (msg.result || msg.three_stage || msg.gemini) {
                resultData = msg;
              }
            } catch {
              // ignore partial line JSON parse errors
            }
          }
        }

        if (buffer.trim()) {
          try {
            const msg = JSON.parse(buffer.trim());
            if (msg.type === 'step' && msg.stepId && msg.status) {
              onStepUpdate!(msg.stepId, msg.status);
            } else if (msg.type === 'result' && msg.data) {
              resultData = msg.data;
            } else if (msg.type === 'error') {
              streamError = msg.error || 'Server error during stream';
            } else if (msg.result || msg.three_stage || msg.gemini) {
              resultData = msg;
            }
          } catch {}
        }

        if (!resultData && fullStreamText.trim()) {
          try {
            const parsedWhole = JSON.parse(fullStreamText.trim());
            if (parsedWhole.type === 'result' && parsedWhole.data) {
              resultData = parsedWhole.data;
            } else if (parsedWhole.result || parsedWhole.three_stage || parsedWhole.gemini) {
              resultData = parsedWhole;
            }
          } catch {}
        }

        if (streamError) {
          throw new Error(`Server stream reported error: ${streamError}`);
        }

        if (resultData) {
          if (compare && resultData.gemini && resultData.openai) {
            const cmpRes: any = {
              engine: 'compare',
              gemini: normalizeOrganonAnalysisResult(resultData.gemini, rawText),
              openai: normalizeOrganonAnalysisResult(resultData.openai, rawText),
              errors: resultData.errors
            };
            if (resultData.arbitrator_result) {
              cmpRes.arbitrator_result = resultData.arbitrator_result;
            }
            return cmpRes;
          }
          const resultObj = resultData.result || resultData;
          const normalized = normalizeOrganonAnalysisResult(resultObj, rawText);
          if (resultData.arbitrator_result) {
            (normalized as any).arbitrator_result = resultData.arbitrator_result;
          }
          return normalized;
        }

        throw new Error('Stream finished without returning a valid result payload.');
      }

      // Non-streaming response branch (res.body has not been read by getReader)
      const data = await res.json();
      if (compare && data.gemini && data.openai) {
        const cmpRes: any = {
          engine: 'compare',
          gemini: normalizeOrganonAnalysisResult(data.gemini, rawText),
          openai: normalizeOrganonAnalysisResult(data.openai, rawText),
          errors: data.errors
        };
        if (data.arbitrator_result) {
          cmpRes.arbitrator_result = data.arbitrator_result;
        }
        return cmpRes;
      }
      const resultObj = data.result || data;
      const normalized = normalizeOrganonAnalysisResult(resultObj, rawText);
      if (data.arbitrator_result) {
        (normalized as any).arbitrator_result = data.arbitrator_result;
      }
      return normalized;
    }

    console.warn(`[analyzeOrganonText] Server returned ${res.status}, activating local semantic fallback.`);
    const fallback = createLocalFallbackAnalysis(rawText);
    if (compare) {
      return { engine: 'compare', gemini: fallback, openai: fallback };
    }
    return fallback;
  } catch (fetchErr) {
    console.warn('[analyzeOrganonText] Network or API unavailable, activating local semantic fallback:', fetchErr);
    const fallback = createLocalFallbackAnalysis(rawText);
    if (compare) {
      return { engine: 'compare', gemini: fallback, openai: fallback };
    }
    return fallback;
  }
}

export function getMissingInfoPhrase(lang: string = 'de'): string {
  const map: Record<string, string> = {
    de: "Keine Angaben im Text.",
    en: "No information in text.",
    el: "Δεν υπάρχουν στοιχεία στο κείμενο.",
    es: "Sin datos en el texto.",
    fr: "Aucune information dans le texte.",
    it: "Nessuna informazione nel testo.",
    ru: "В тексте нет сведений."
  };
  return map[lang] || map.de;
}

export function isPseudoNormalOrNegativeFinding(text: string | null | undefined, rawText: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim().toLowerCase();

  const pseudoNormalPatterns = [
    /unauffällig/i,
    /ohne befund/i,
    /keine vorerkrankung/i,
    /keine veränderung/i,
    /keine begleitsymptom/i,
    /keine weiteren beschwerden/i,
    /keine auffälligkeit/i,
    /denken unauffällig/i,
    /gemüt unauffällig/i,
    /keine psychopathologie/i,
    /unauffälliger befund/i,
    /normalbefund/i,
    /o\.b\./i
  ];

  for (const pat of pseudoNormalPatterns) {
    if (pat.test(t)) {
      if (!rawText.toLowerCase().includes(t)) {
        return true;
      }
    }
  }
  return false;
}

export function validateQuoteAgainstRawText(
  rawText: string,
  quote: string
): { quote_valid: boolean; quote_cleaned: string; reason?: string } {
  if (!quote || typeof quote !== 'string') {
    return { quote_valid: false, quote_cleaned: '', reason: 'Empty quote' };
  }

  let cleaned = quote.trim();
  cleaned = cleaned.replace(/^["'„»«]+|["'“»«]+$/g, '').trim();

  if (!cleaned) {
    return { quote_valid: false, quote_cleaned: '', reason: 'Quote was empty after removing quotation marks.' };
  }

  if (rawText.includes(cleaned)) {
    return { quote_valid: true, quote_cleaned: cleaned };
  }

  const normalizedRaw = rawText.replace(/\s+/g, ' ').toLowerCase();
  const normalizedCleaned = cleaned.replace(/\s+/g, ' ').toLowerCase();

  if (normalizedRaw.includes(normalizedCleaned)) {
    const startIdx = normalizedRaw.indexOf(normalizedCleaned);
    return { quote_valid: true, quote_cleaned: rawText.substr(startIdx, cleaned.length) || cleaned };
  }

  return {
    quote_valid: false,
    quote_cleaned: cleaned,
    reason: 'Quote does not match raw text verbatim.'
  };
}

export function createLocalDeterministicEndpruefer(
  rawText: string,
  arbitratorResult: any,
  language: string = 'de'
): EndprueferResult {
  const missingPhrase = getMissingInfoPhrase(language);
  const categories = [
    { key: 'causa', name: 'Causa' },
    { key: 'localisatio', name: 'Localisatio' },
    { key: 'sensatio', name: 'Sensatio' },
    { key: 'symptoma', name: 'Symptoma' },
    { key: 'modalitates_besserung', name: 'Modalitates – Besserung' },
    { key: 'modalitates_verschlechterung', name: 'Modalitates – Verschlechterung' },
    { key: 'symptomata_concomitantia', name: 'Symptomata concomitantia' },
    { key: 'comorbiditas', name: 'Comorbiditas' },
    { key: 'mens', name: 'Mens' },
    { key: 'animus', name: 'Animus' }
  ];

  const arbCats = Array.isArray(arbitratorResult?.category_evaluations)
    ? arbitratorResult.category_evaluations
    : [];

  const categoryChecks: EndprueferCategoryDecision[] = [];
  const auditChanges: EndprueferAuditChange[] = [];
  let correctCount = 0;
  let flaggedCount = 0;

  for (const catDef of categories) {
    const matchedArb = arbCats.find((c: any) =>
      (c.category && c.category.toLowerCase().includes(catDef.key)) ||
      (c.category_key && c.category_key.toLowerCase() === catDef.key) ||
      (c.category && c.category.toLowerCase().includes(catDef.name.toLowerCase()))
    );

    const schiedsrichterResult = (
      matchedArb?.belegpruefer_neu ||
      matchedArb?.schiedsrichter_result ||
      matchedArb?.gemini_alt ||
      matchedArb?.result_text ||
      missingPhrase
    ).trim();

    const isPseudoNormal = isPseudoNormalOrNegativeFinding(schiedsrichterResult, rawText);
    const isMissingPhrase = schiedsrichterResult === missingPhrase ||
      schiedsrichterResult.toLowerCase().includes('keine angaben im text');

    let decision: EndprueferDecisionStatus = 'CORRECT';
    let issue: string | null = null;
    let reasoning = 'Stimmt mit den Angaben im Originaltext überein.';
    let minimalCorrection = schiedsrichterResult;
    let severity: 'GERING' | 'MITTEL' | 'HOCH' | null = null;
    const atomicClaims: EndprueferAtomicClaim[] = [];

    if (isPseudoNormal) {
      decision = 'MISSING_INFORMATION_TREATED_AS_NORMAL';
      issue = 'Fehlende Information wurde als Normal- oder Negativbefund formuliert.';
      reasoning = 'Fehlende Angaben dürfen nicht als negativer Befund interpretiert werden. Vorgabe: Keine Angaben im Text.';
      minimalCorrection = missingPhrase;
      severity = 'MITTEL';
      atomicClaims.push({
        claim: schiedsrichterResult,
        raw_text_snippet: null,
        is_supported: false,
        issue: 'Fehlende Angabe im Originaltext',
        decision: 'MISSING_INFORMATION_TREATED_AS_NORMAL'
      });
    } else if (isMissingPhrase) {
      decision = 'CORRECT';
      reasoning = 'Der Originaltext enthält hierzu keine Angaben. Korrekt als Nicht-Befund erfasst.';
      atomicClaims.push({
        claim: missingPhrase,
        raw_text_snippet: null,
        is_supported: true,
        issue: null,
        decision: 'CORRECT'
      });
    } else {
      const parts = schiedsrichterResult.split(/[,;\n]|\bund\b/i).map((s: string) => s.trim()).filter(Boolean);
      const claimsToTest = parts.length > 0 ? parts : [schiedsrichterResult];
      let hasAtomicIssue = false;

      for (const claim of claimsToTest) {
        const quoteCheck = validateQuoteAgainstRawText(rawText, claim);
        if (quoteCheck.quote_valid) {
          atomicClaims.push({
            claim,
            raw_text_snippet: quoteCheck.quote_cleaned,
            is_supported: true,
            issue: null,
            decision: 'CORRECT'
          });
        } else {
          const words = claim.split(/\s+/).filter((w: string) => w.length > 3);
          const foundWords = words.filter((w: string) => rawText.toLowerCase().includes(w.toLowerCase()));
          if (foundWords.length === words.length && words.length > 0) {
            atomicClaims.push({
              claim,
              raw_text_snippet: foundWords.join(' '),
              is_supported: true,
              issue: null,
              decision: 'CORRECT'
            });
          } else {
            hasAtomicIssue = true;
            atomicClaims.push({
              claim,
              raw_text_snippet: null,
              is_supported: false,
              issue: 'Aussage ist nicht wörtlich im Originaltext belegt.',
              decision: 'UNSUPPORTED_STATEMENT'
            });
          }
        }
      }

      if (hasAtomicIssue) {
        decision = 'UNSUPPORTED_STATEMENT';
        issue = 'Mindestens ein atomarer Claim ist im Originaltext nicht belegt.';
        reasoning = 'Die Formulierung weicht vom Wortlaut des Originaltexts ab oder fügt unbelegte Details hinzu.';
        severity = 'MITTEL';
      }
    }

    if (decision === 'CORRECT') {
      correctCount++;
    } else {
      flaggedCount++;
      auditChanges.push({
        category: catDef.name,
        original_schiedsrichter: schiedsrichterResult,
        corrected: minimalCorrection,
        reason: issue || 'Korrektur zur Texttreue',
        severity: severity || 'MITTEL'
      });
    }

    categoryChecks.push({
      category: catDef.name,
      schiedsrichter_result: schiedsrichterResult,
      raw_text_snippet: atomicClaims.find(a => a.raw_text_snippet)?.raw_text_snippet || null,
      decision,
      issue,
      reasoning,
      severity,
      minimal_correction: minimalCorrection,
      atomic_claims: atomicClaims
    });
  }

  const overallStatus = flaggedCount === 0 ? 'PASS' : 'CORRECTION_REQUIRED';
  const summary = overallStatus === 'PASS'
    ? 'Alle 10 Kategorien stimmen bei der atomaren Prüfung mit dem unveränderten Originaltext überein.'
    : `${flaggedCount} von 10 Kategorien weisen Abweichungen, unbelegte Claims oder unzulässige Normalbefunde auf.`;

  return {
    overall_status: overallStatus,
    summary,
    total_categories_checked: 10,
    correct_count: correctCount,
    flagged_count: flaggedCount,
    category_checks: categoryChecks,
    audit_changes: auditChanges,
    final_corrected_output: categoryChecks.map(c => `${c.category}: ${c.minimal_correction}`).join('\n')
  };
}

export async function runEndprueferAnalysis(
  rawText: string,
  arbitratorResult: any,
  language: string = 'de'
): Promise<EndprueferResult> {
  const endpoints = [
    { url: '/api/organon/endpruefer', body: { rawText, arbitratorResult, language } },
    { url: '/api/organon/analyze', body: { action: 'endpruefer', rawText, arbitratorResult, language } },
    { url: '/api/organon/arbitrate', body: { action: 'endpruefer', rawText, arbitratorResult, language } }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ep.body)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result && typeof data.result === 'object') {
          return data.result as EndprueferResult;
        }
      }
    } catch (e) {
      // try next endpoint
    }
  }

  return createLocalDeterministicEndpruefer(rawText, arbitratorResult, language);
}
