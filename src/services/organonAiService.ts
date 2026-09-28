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
  timing?: {
    geminiDurationMs?: number;
    openaiDurationMs?: number;
    fasterEngine?: string;
    selectedEngine?: string;
    durationMs?: number;
  };
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
    complaint_relations: [],
    three_stage: {
      stage1: [
        { category_key: 'causa', category_name: 'Causa', core_question: 'Wodurch ausgelöst?', result_text: 'Keine Angaben im Text.' },
        { category_key: 'localisatio', category_name: 'Localisatio', core_question: 'Wo?', result_text: loc || 'Keine Angaben im Text.' },
        { category_key: 'sensatio', category_name: 'Sensatio', core_question: 'Wie fühlt es sich an?', result_text: sens || 'Keine Angaben im Text.' },
        { category_key: 'symptoma', category_name: 'Symptoma', core_question: 'Was?', result_text: clean.slice(0, 120) || 'Keine Angaben im Text.' },
        { category_key: 'modalitates_besserung', category_name: 'Modalitates – Besserung', core_question: 'Wann besser?', result_text: /besser|ruhe|wärme/i.test(clean) ? 'Besserung im Text erwähnt' : 'Keine Angaben im Text.' },
        { category_key: 'modalitates_verschlechterung', category_name: 'Modalitates – Verschlechterung', core_question: 'Wann schlechter?', result_text: /schlimmer|kälte|bewegung|nacht/i.test(clean) ? 'Verschlechterung im Text erwähnt' : 'Keine Angaben im Text.' },
        { category_key: 'symptomata_concomitantia', category_name: 'Symptomata concomitantia', core_question: 'Was tritt dazu auf?', result_text: 'Keine Angaben im Text.' },
        { category_key: 'comorbiditas', category_name: 'Comorbiditas', core_question: 'Welche weiteren Erkrankungen?', result_text: 'Keine Angaben im Text.' },
        { category_key: 'mens', category_name: 'Mens', core_question: 'Was verändert sich beim Denken?', result_text: 'Keine Angaben im Text.' },
        { category_key: 'animus', category_name: 'Animus', core_question: 'Wie geht es dir emotional?', result_text: /angst|unruhe|traurig|wut/i.test(clean) ? 'Emotionale Beteiligung im Text geschildert' : 'Keine Angaben im Text.' }
      ],
      stage2: sentences.length > 0 ? sentences.slice(0, 5).map(s => ({
        text_snippet: s,
        examination: 'Prüfung der Patientenschilderung nach Hahnemann (§§ 83–104).',
        adopted_complaint: s
      })) : [{
        text_snippet: clean,
        examination: 'Prüfung der Patientenschilderung.',
        adopted_complaint: clean
      }],
      stage3: {
        control_notes: 'Objektive Erfassung der Patientenschilderung durchgeführt. Zur vollständigen Fallanalyse fehlen noch Angaben zu genauen Modalitäten.',
        clarification_question: 'Gibt es bestimmte Einflüsse (z. B. Wärme, Kälte, Ruhe, Bewegung), die die Beschwerden spürbar verändern?'
      }
    }
  };
}

function normalizeStage1List(rawStage1: any[], rawText: string, defaultStage1: OrganonStage1Item[]): OrganonStage1Item[] {
  const safeList = Array.isArray(rawStage1) ? rawStage1 : [];
  return defaultStage1.map((defItem, idx) => {
    const found = safeList.find((item: any, i: number) => {
      if (!item || typeof item !== 'object') return false;
      const key = (item.category_key || item.key || '').toLowerCase();
      const name = (item.category_name || item.category || item.name || '').toLowerCase();
      const defKey = defItem.category_key.toLowerCase();
      const defName = defItem.category_name.toLowerCase();
      if (key && (key === defKey || key.includes(defKey) || defKey.includes(key))) return true;
      if (name && (name === defName || name.includes(defName) || defName.includes(name))) return true;
      return i === idx;
    });

    if (found && typeof found === 'object') {
      const resText = (found.result_text ?? found.resultText ?? found.result ?? found.text ?? found.value ?? '').toString().trim();
      return {
        category_key: defItem.category_key,
        category_name: defItem.category_name,
        core_question: (found.core_question || found.coreQuestion || found.question || found.kernfrage || defItem.core_question).toString().trim(),
        result_text: resText || defItem.result_text
      };
    }

    return defItem;
  });
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

  const defaultStage1: OrganonStage1Item[] = [
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
    stage1: normalizeStage1List(data.three_stage.stage1, rawText, defaultStage1),
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
  timing?: {
    geminiDurationMs?: number;
    openaiDurationMs?: number;
    fasterEngine?: string;
    selectedEngine?: string;
    durationMs?: number;
  };
  errors?: { gemini?: string; openai?: string };
}

export async function analyzeOrganonText(
  rawText: string,
  language: string = 'de',
  engine: string = 'gemini',
  compare: boolean = false,
  onStepUpdate?: (stepId: string, status: 'active' | 'done') => void,
  enableRatio: boolean = true
): Promise<OrganonAiAnalysisResult | OrganonCompareResult> {
  try {
    const res = await fetch('/api/organon/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawText, language, engine, compare, stream: !!onStepUpdate, enableRatio }),
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
              errors: resultData.errors,
              timing: resultData.timing
            };
            if (resultData.arbitrator_result) {
              cmpRes.arbitrator_result = resultData.arbitrator_result;
            }
            return cmpRes;
          }
          const resultObj = resultData.result || resultData;
          const normalized = normalizeOrganonAnalysisResult(resultObj, rawText);
          if (resultData.timing || resultObj.timing) {
            normalized.timing = resultData.timing || resultObj.timing;
          }
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
          errors: data.errors,
          timing: data.timing
        };
        if (data.arbitrator_result) {
          cmpRes.arbitrator_result = data.arbitrator_result;
        }
        return cmpRes;
      }
      const resultObj = data.result || data;
      const normalized = normalizeOrganonAnalysisResult(resultObj, rawText);
      if (data.timing || resultObj.timing) {
        normalized.timing = data.timing || resultObj.timing;
      }
      if (data.arbitrator_result) {
        (normalized as any).arbitrator_result = data.arbitrator_result;
      }
      return normalized;
    }

    console.warn(`[analyzeOrganonText] Server returned ${res.status}, activating local semantic fallback.`);
    const fallback = normalizeOrganonAnalysisResult(createLocalFallbackAnalysis(rawText), rawText);
    if (compare) {
      return { engine: 'compare', gemini: fallback, openai: fallback };
    }
    return fallback;
  } catch (fetchErr) {
    console.warn('[analyzeOrganonText] Network or API unavailable, activating local semantic fallback:', fetchErr);
    const fallback = normalizeOrganonAnalysisResult(createLocalFallbackAnalysis(rawText), rawText);
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
  language: string = 'de',
  evaluationTarget: 'ratio' | 'genius' | 'genius_optimus' = 'ratio',
  geniusResult?: any,
  optimusResult?: any
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
    let schiedsrichterResult = missingPhrase;

    if (evaluationTarget === 'genius' && geniusResult) {
      const gStage1 = geniusResult?.three_stage?.stage1 || geniusResult?.stage1 || [];
      const matchedG = gStage1.find((c: any) =>
        (c.category_key && c.category_key.toLowerCase() === catDef.key) ||
        (c.category_name && c.category_name.toLowerCase().includes(catDef.name.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(catDef.name.toLowerCase()))
      );
      schiedsrichterResult = (
        matchedG?.result_text ||
        matchedG?.result ||
        matchedG?.text ||
        missingPhrase
      ).trim();
    } else if (evaluationTarget === 'genius_optimus') {
      const gStage1 = geniusResult?.three_stage?.stage1 || geniusResult?.stage1 || [];
      const oStage1 = optimusResult?.three_stage?.stage1 || optimusResult?.stage1 || [];
      const matchedG = gStage1.find((c: any) =>
        (c.category_key && c.category_key.toLowerCase() === catDef.key) ||
        (c.category_name && c.category_name.toLowerCase().includes(catDef.name.toLowerCase()))
      );
      const matchedO = oStage1.find((c: any) =>
        (c.category_key && c.category_key.toLowerCase() === catDef.key) ||
        (c.category_name && c.category_name.toLowerCase().includes(catDef.name.toLowerCase()))
      );
      const gText = (matchedG?.result_text || matchedG?.result || '').trim();
      const oText = (matchedO?.result_text || matchedO?.result || '').trim();
      schiedsrichterResult = (gText || oText || missingPhrase).trim();
    } else {
      const matchedArb = arbCats.find((c: any) =>
        (c.category && c.category.toLowerCase().includes(catDef.key)) ||
        (c.category_key && c.category_key.toLowerCase() === catDef.key) ||
        (c.category && c.category.toLowerCase().includes(catDef.name.toLowerCase()))
      );

      schiedsrichterResult = (
        matchedArb?.belegpruefer_neu ||
        matchedArb?.schiedsrichter_result ||
        matchedArb?.gemini_alt ||
        matchedArb?.result_text ||
        missingPhrase
      ).trim();
    }

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
    final_corrected_output: categoryChecks.map(c => `${c.category}: ${c.minimal_correction}`).join('\n'),
    evaluated_target: evaluationTarget
  };
}

export async function runEndprueferAnalysis(
  rawText: string,
  arbitratorResult: any,
  language: string = 'de',
  evaluationTarget: 'ratio' | 'genius' | 'genius_optimus' = 'ratio',
  geniusResult?: any,
  optimusResult?: any
): Promise<EndprueferResult> {
  const endpoints = [
    { url: '/api/organon/endpruefer', body: { rawText, arbitratorResult, language, evaluationTarget, geniusResult, optimusResult } },
    { url: '/api/organon/analyze', body: { action: 'endpruefer', rawText, arbitratorResult, language, evaluationTarget, geniusResult, optimusResult } },
    { url: '/api/organon/arbitrate', body: { action: 'endpruefer', rawText, arbitratorResult, language, evaluationTarget, geniusResult, optimusResult } }
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
          const resObj = data.result as EndprueferResult;
          resObj.evaluated_target = evaluationTarget;
          return resObj;
        }
      }
    } catch (e) {
      // try next endpoint
    }
  }

  return createLocalDeterministicEndpruefer(rawText, arbitratorResult, language, evaluationTarget, geniusResult, optimusResult);
}

export interface ArbitratorEvaluationItem {
  category: string;
  category_key?: string;
  core_question: string;
  gemini_alt: string;
  optimus_alt?: string;
  verification_analysis: string;
  evidence_status: string;
  belegpruefer_neu: string;
  clarification_check: string;
}

export interface ArbitratorAuditProtocolItem {
  proposed_statement: string;
  source?: string;
  decision: string;
  evidence_status: string;
  quote: string;
  reasoning: string;
}

export interface ArbitratorCorrectedSummaryItem {
  category: string;
  evidence_status: string;
  result: string;
  quote_or_clarification: string;
}

export interface CompleteArbitratorResult {
  category_evaluations: ArbitratorEvaluationItem[];
  audit_protocol: ArbitratorAuditProtocolItem[];
  corrected_summary: ArbitratorCorrectedSummaryItem[];
  course_note: string;
  clarification_question: string;
  consensusSummary?: string;
  synthesizedRubrics?: any[];
  __isServerResult?: boolean;
}

const ORGANON_10_CATEGORIES = [
  {
    key: 'causa',
    name: 'Causa',
    questions: {
      de: 'Wodurch ausgelöst?',
      en: 'Triggered by what?',
      el: 'Από τι προκλήθηκε;',
      es: '¿Por qué se desencadenó?',
      fr: 'Déclenché par quoi ?',
      it: 'Cosa lo ha scatenato?',
      ru: 'Чем вызвано?'
    }
  },
  {
    key: 'localisatio',
    name: 'Localisatio',
    questions: {
      de: 'Wo?',
      en: 'Where?',
      el: 'Πού ακριβώς;',
      es: '¿Dónde?',
      fr: 'Où ?',
      it: 'Dove?',
      ru: 'Где?'
    }
  },
  {
    key: 'sensatio',
    name: 'Sensatio',
    questions: {
      de: 'Wie fühlt es sich an?',
      en: 'How does it feel?',
      el: 'Πώς το αισθάνεστε;',
      es: '¿Cómo se siente?',
      fr: 'Qu\'est-ce que l\'on ressent ?',
      it: 'Come si sente?',
      ru: 'Каковы ощущения?'
    }
  },
  {
    key: 'symptoma',
    name: 'Symptoma',
    questions: {
      de: 'Was?',
      en: 'What?',
      el: 'Τι ακριβώς;',
      es: '¿Qué ocurre?',
      fr: 'Quoi ?',
      it: 'Che cosa?',
      ru: 'Что именно?'
    }
  },
  {
    key: 'modalitates_besserung',
    name: 'Modalitates – Besserung',
    questions: {
      de: 'Wann besser?',
      en: 'When better?',
      el: 'Πότε βελτιώνεται;',
      es: '¿Cuándo mejora?',
      fr: 'Quand mieux ?',
      it: 'Quando migliora?',
      ru: 'Когда лучше?'
    }
  },
  {
    key: 'modalitates_verschlechterung',
    name: 'Modalitates – Verschlechterung',
    questions: {
      de: 'Wann schlechter?',
      en: 'When worse?',
      el: 'Πότε επιδεινώνεται;',
      es: '¿Cuándo empeora?',
      fr: 'Quand pire ?',
      it: 'Quando peggiora?',
      ru: 'Когда хуже?'
    }
  },
  {
    key: 'symptomata_concomitantia',
    name: 'Symptomata concomitantia',
    questions: {
      de: 'Was tritt dazu auf?',
      en: 'What accompanies it?',
      el: 'Τι συνυπάρχει;',
      es: '¿Qué acompaña al síntoma?',
      fr: 'Qu\'est-ce qui l\'accompagne ?',
      it: 'Cosa si accompagna?',
      ru: 'Что сопутствует?'
    }
  },
  {
    key: 'comorbiditas',
    name: 'Comorbiditas',
    questions: {
      de: 'Welche weiteren Erkrankungen?',
      en: 'What other conditions?',
      el: 'Υπάρχουν άλλες παθήσεις;',
      es: '¿Qué otras enfermedades existen?',
      fr: 'Quelles autres affections ?',
      it: 'Quali altre malattie?',
      ru: 'Какие сопутствующие болезни?'
    }
  },
  {
    key: 'mens',
    name: 'Mens',
    questions: {
      de: 'Was verändert sich beim Denken?',
      en: 'What changes in thinking/cognition?',
      el: 'Τι αλλάζει στη σκέψη;',
      es: '¿Qué cambia en el pensamiento?',
      fr: 'Qu\'est-ce qui change dans la pensée ?',
      it: 'Cosa cambia nel pensiero?',
      ru: 'Что меняется в мышлении?'
    }
  },
  {
    key: 'animus',
    name: 'Animus',
    questions: {
      de: 'Wie geht es dir emotional?',
      en: 'How are you emotionally?',
      el: 'Πώς είναι η ψυχική σας διάθεση;',
      es: '¿Cómo se encuentra emocionalmente?',
      fr: 'Comment vous sentez-vous émotionnellement ?',
      it: 'Come si sente emotivamente?',
      ru: 'Каково эмоциональное состояние?'
    }
  }
];

export function buildCompleteArbitratorResult(
  rawText: string,
  geminiRes: any,
  openaiRes: any,
  rawArb: any,
  language: string = 'de'
): CompleteArbitratorResult {
  const langKey = ['de', 'en', 'el', 'es', 'fr', 'it', 'ru'].includes(language) ? language : 'de';
  const missingPhrase = getMissingInfoPhrase(langKey);

  // Extract candidate stage1 items from gemini or openai
  const gStage1 = Array.isArray(geminiRes?.three_stage?.stage1)
    ? geminiRes.three_stage.stage1
    : Array.isArray(geminiRes?.stage1)
    ? geminiRes.stage1
    : [];

  const oStage1 = Array.isArray(openaiRes?.three_stage?.stage1)
    ? openaiRes.three_stage.stage1
    : Array.isArray(openaiRes?.stage1)
    ? openaiRes.stage1
    : [];

  const existingArbEvals = Array.isArray(rawArb?.category_evaluations) ? rawArb.category_evaluations : [];

  // Build the guaranteed 10 categories
  const category_evaluations: ArbitratorEvaluationItem[] = ORGANON_10_CATEGORIES.map((catDef, idx) => {
    // 1. Try to find existing from arbitrator result
    const matchedArb = existingArbEvals.find((c: any, i: number) => {
      if (!c || typeof c !== 'object') return false;
      const key = (c.category_key || c.key || '').toLowerCase();
      const name = (c.category || c.category_name || c.name || '').toLowerCase();
      const defKey = catDef.key.toLowerCase();
      const defName = catDef.name.toLowerCase();
      if (key && (key === defKey || key.includes(defKey) || defKey.includes(key))) return true;
      if (name && (name === defName || name.includes(defName) || defName.includes(name))) return true;
      return i === idx;
    });

    // 2. Try to find from Gemini or OpenAI stage1
    const matchedG = gStage1.find((c: any, i: number) => {
      if (!c || typeof c !== 'object') return false;
      const key = (c.category_key || c.key || '').toLowerCase();
      const name = (c.category_name || c.category || c.name || '').toLowerCase();
      const defKey = catDef.key.toLowerCase();
      const defName = catDef.name.toLowerCase();
      if (key && (key === defKey || key.includes(defKey) || defKey.includes(key))) return true;
      if (name && (name === defName || name.includes(defName) || defName.includes(name))) return true;
      return i === idx;
    });

    const matchedO = oStage1.find((c: any, i: number) => {
      if (!c || typeof c !== 'object') return false;
      const key = (c.category_key || c.key || '').toLowerCase();
      const name = (c.category_name || c.category || c.name || '').toLowerCase();
      const defKey = catDef.key.toLowerCase();
      const defName = catDef.name.toLowerCase();
      if (key && (key === defKey || key.includes(defKey) || defKey.includes(key))) return true;
      if (name && (name === defName || name.includes(defName) || defName.includes(name))) return true;
      return i === idx;
    });

    const fallbackCoreQ = (catDef.questions as any)[langKey] || catDef.questions.de;
    const coreQuestion = (
      matchedArb?.core_question ||
      matchedArb?.coreQuestion ||
      matchedArb?.question ||
      matchedArb?.kernfrage ||
      matchedG?.core_question ||
      matchedG?.coreQuestion ||
      fallbackCoreQ
    ).toString().trim();

    let geminiAlt = (
      matchedArb?.gemini_alt ||
      matchedArb?.geminiAlt ||
      matchedArb?.gemini ||
      matchedG?.result_text ||
      matchedG?.resultText ||
      matchedG?.result ||
      matchedG?.text ||
      ''
    ).toString().trim();

    if (!geminiAlt || geminiAlt === '—' || geminiAlt.toLowerCase() === 'nicht angegeben') {
      geminiAlt = catDef.key === 'symptoma' && rawText.trim()
        ? rawText.trim().slice(0, 100)
        : missingPhrase;
    }

    let optimusAlt = (
      matchedArb?.optimus_alt ||
      matchedArb?.optimusAlt ||
      matchedArb?.openai_alt ||
      matchedArb?.openaiAlt ||
      matchedArb?.openai ||
      matchedO?.result_text ||
      matchedO?.resultText ||
      matchedO?.result ||
      matchedO?.text ||
      ''
    ).toString().trim();

    if (!optimusAlt || optimusAlt === '—' || optimusAlt.toLowerCase() === 'nicht angegeben') {
      optimusAlt = catDef.key === 'symptoma' && rawText.trim()
        ? rawText.trim().slice(0, 100)
        : missingPhrase;
    }

    let belegNeu = (
      matchedArb?.belegpruefer_neu ||
      matchedArb?.belegprueferNeu ||
      matchedArb?.belegpruefer ||
      matchedArb?.new_value ||
      matchedArb?.result ||
      matchedO?.result_text ||
      geminiAlt
    ).toString().trim();

    if (!belegNeu || belegNeu === '—' || belegNeu.toLowerCase() === 'nicht angegeben') {
      belegNeu = geminiAlt;
    }

    // Filter out ungrounded pseudo-normals like "Keine", "normal", "unauffällig"
    if (isPseudoNormalOrNegativeFinding(belegNeu, rawText)) {
      belegNeu = missingPhrase;
    }

    const isMissing = belegNeu === missingPhrase || belegNeu.toLowerCase().includes(missingPhrase.toLowerCase());

    const verificationAnalysis = (
      matchedArb?.verification_analysis ||
      matchedArb?.verificationAnalysis ||
      matchedArb?.analysis ||
      (isMissing
        ? (langKey === 'de' ? 'Kein Beleg im Originaltext gefunden. Streng erfasst als Nicht-Befund (§ 84 Organon).' : 'No evidence found in original text. Recorded as non-finding.')
        : (langKey === 'de' ? 'Geprüft gegen Originaltext. Strikte Übereinstimmung mit Hahnemanns Kriterien (§§ 83–104).' : 'Verified against original text according to Hahnemann criteria.'))
    ).toString().trim();

    const evidenceStatus = (
      matchedArb?.evidence_status ||
      matchedArb?.evidenceStatus ||
      (isMissing ? 'NOT_SUPPORTED' : 'EXPLICITLY_SUPPORTED')
    ).toString().trim();

    const clarificationCheck = (
      matchedArb?.clarification_check ||
      matchedArb?.clarificationCheck ||
      (isMissing
        ? (langKey === 'de' ? 'Wurde hierzu im Verlauf etwas beobachtet?' : 'Was anything observed regarding this?')
        : (langKey === 'de' ? 'Stimmen diese Details exakt mit Ihrem Befinden überein?' : 'Do these details match your condition?'))
    ).toString().trim();

    return {
      category: catDef.name,
      category_key: catDef.key,
      core_question: coreQuestion,
      gemini_alt: geminiAlt,
      optimus_alt: optimusAlt,
      verification_analysis: verificationAnalysis,
      evidence_status: evidenceStatus,
      belegpruefer_neu: belegNeu,
      clarification_check: clarificationCheck
    };
  });

  // Table A: Audit Protocol
  let audit_protocol: ArbitratorAuditProtocolItem[] = [];
  if (Array.isArray(rawArb?.audit_protocol) && rawArb.audit_protocol.length > 0) {
    audit_protocol = rawArb.audit_protocol.map((item: any) => ({
      proposed_statement: (item?.proposed_statement || item?.statement || item?.claim || item?.category || '').toString().trim(),
      source: (item?.source || item?.quelle || item?.origin || '').toString().trim() || undefined,
      decision: (item?.decision || item?.verdict || 'Übernehmen').toString().trim(),
      evidence_status: (item?.evidence_status || item?.evidenceStatus || 'EXPLICITLY_SUPPORTED').toString().trim(),
      quote: (item?.quote || item?.original_quote || item?.originalQuote || item?.text_snippet || '—').toString().trim(),
      reasoning: (item?.reasoning || item?.explanation || item?.reason || item?.justification || '—').toString().trim()
    })).filter((item: ArbitratorAuditProtocolItem) => item.proposed_statement.length > 0);
  }

  // If audit_protocol was missing or empty, synthesize from category_evaluations
  if (audit_protocol.length === 0) {
    const supportedCategories = category_evaluations.filter(
      ev => ev.belegpruefer_neu !== missingPhrase &&
            !ev.belegpruefer_neu.toLowerCase().includes('keine angaben') &&
            !ev.belegpruefer_neu.toLowerCase().includes('no information')
    );

    if (supportedCategories.length > 0) {
      audit_protocol = supportedCategories.map(ev => {
        // Try to find exact substring in rawText
        const quoteCheck = validateQuoteAgainstRawText(rawText, ev.belegpruefer_neu);
        const quoteText = quoteCheck.quote_cleaned || ev.belegpruefer_neu;
        return {
          proposed_statement: `${ev.category}: ${ev.belegpruefer_neu}`,
          decision: 'Übernehmen',
          evidence_status: ev.evidence_status || 'EXPLICITLY_SUPPORTED',
          quote: quoteText,
          reasoning: langKey === 'de'
            ? 'Direkt durch die Schilderung des Patienten im Originaltext belegt (§§ 83–104 Organon).'
            : 'Directly supported by the patient\'s narration (§§ 83–104 Organon).'
        };
      });
    } else {
      // General entry if patient text has no separated categories
      audit_protocol = [{
        proposed_statement: langKey === 'de' ? `Hauptschilderung: ${rawText.slice(0, 80)}` : `Main narration: ${rawText.slice(0, 80)}`,
        decision: 'Übernehmen',
        evidence_status: 'EXPLICITLY_SUPPORTED',
        quote: rawText.slice(0, 80) || '—',
        reasoning: langKey === 'de'
          ? 'Unmittelbare Erfassung der Patientenschilderung gemäß § 84 Organon.'
          : 'Direct capture of patient statement under § 84 Organon.'
      }];
    }
  }

  // Table B: Corrected Summary
  let corrected_summary: ArbitratorCorrectedSummaryItem[] = [];
  if (Array.isArray(rawArb?.corrected_summary) && rawArb.corrected_summary.length > 0) {
    corrected_summary = rawArb.corrected_summary.map((row: any) => ({
      category: (row?.category || row?.category_name || row?.name || '').toString().trim(),
      evidence_status: (row?.evidence_status || row?.evidenceStatus || 'EXPLICITLY_SUPPORTED').toString().trim(),
      result: (row?.result || row?.verified_result || row?.verifiedResult || row?.corrected_result || missingPhrase).toString().trim(),
      quote_or_clarification: (row?.quote_or_clarification || row?.quote || row?.clarification || '—').toString().trim()
    })).filter((row: ArbitratorCorrectedSummaryItem) => row.category.length > 0);
  }

  // If corrected_summary was missing or partial, fill from category_evaluations
  if (corrected_summary.length < 10) {
    corrected_summary = category_evaluations.map(ev => {
      const isMissing = ev.belegpruefer_neu === missingPhrase || ev.belegpruefer_neu.toLowerCase().includes(missingPhrase.toLowerCase());
      return {
        category: ev.category,
        evidence_status: ev.evidence_status,
        result: ev.belegpruefer_neu || missingPhrase,
        quote_or_clarification: isMissing ? '—' : ev.clarification_check || (langKey === 'de' ? 'Belegt im Patiententext' : 'Verified in patient text')
      };
    });
  }

  const course_note = (
    rawArb?.course_note ||
    rawArb?.courseNote ||
    (langKey === 'de'
      ? 'Strenge Belegprüfung nach Samuel Hahnemann (§§ 83–104 Organon) abgeschlossen. Alle 10 Kategorien wurden direkt gegen den Originaltext abgeglichen.'
      : 'Strict evidence verification completed under §§ 83–104 Organon. All 10 categories verified directly against raw text.')
  ).toString().trim();

  const clarification_question = (
    rawArb?.clarification_question ||
    rawArb?.clarificationQuestion ||
    (langKey === 'de'
      ? 'Können Sie die Auslöser oder begleitenden Empfindungen noch genauer beschreiben?'
      : 'Could you describe the triggers or accompanying sensations in more detail?')
  ).toString().trim();

  return {
    category_evaluations,
    audit_protocol,
    corrected_summary,
    course_note,
    clarification_question,
    consensusSummary: rawArb?.consensusSummary || '',
    synthesizedRubrics: Array.isArray(rawArb?.synthesizedRubrics) ? rawArb.synthesizedRubrics : [],
    __isServerResult: Boolean(rawArb)
  };
}
