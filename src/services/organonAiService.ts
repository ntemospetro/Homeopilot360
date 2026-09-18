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
    { category_key: 'causa', category_name: 'Causa', core_question: 'Wodurch ausgelöst?', result_text: 'Kein Auslöser genannt.' },
    { category_key: 'localisatio', category_name: 'Localisatio', core_question: 'Wo?', result_text: 'Nicht explizit genannt.' },
    { category_key: 'sensatio', category_name: 'Sensatio', core_question: 'Wie fühlt es sich an?', result_text: 'Nicht näher beschrieben.' },
    { category_key: 'symptoma', category_name: 'Symptoma', core_question: 'Was?', result_text: rawText.slice(0, 100) },
    { category_key: 'modalitates_besserung', category_name: 'Modalitates – Besserung', core_question: 'Wann besser?', result_text: 'Keine Angabe.' },
    { category_key: 'modalitates_verschlechterung', category_name: 'Modalitates – Verschlechterung', core_question: 'Wann schlechter?', result_text: 'Keine Angabe.' },
    { category_key: 'symptomata_concomitantia', category_name: 'Symptomata concomitantia', core_question: 'Was tritt dazu auf?', result_text: 'Keine Angaben.' },
    { category_key: 'comorbiditas', category_name: 'Comorbiditas', core_question: 'Welche weiteren Erkrankungen?', result_text: 'Keine bekannt.' },
    { category_key: 'mens', category_name: 'Mens', core_question: 'Was verändert sich beim Denken?', result_text: 'Keine Angabe.' },
    { category_key: 'animus', category_name: 'Animus', core_question: 'Wie geht es dir emotional?', result_text: 'Keine Angabe.' }
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

export async function analyzeOrganonText(rawText: string, language: string = 'de', engine: string = 'gemini', compare: boolean = false): Promise<OrganonAiAnalysisResult | OrganonCompareResult> {
  try {
    const res = await fetch('/api/organon/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawText, language, engine, compare }),
    });

    if (res.ok) {
      const data = await res.json();
      if (compare && data.gemini && data.openai) {
        return {
          engine: 'compare',
          gemini: normalizeOrganonAnalysisResult(data.gemini, rawText),
          openai: normalizeOrganonAnalysisResult(data.openai, rawText),
          errors: data.errors
        };
      }
      const resultObj = data.result || data;
      return normalizeOrganonAnalysisResult(resultObj, rawText);
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
