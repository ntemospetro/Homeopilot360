import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageCode } from '../types';
import { RepertoriumSymptomInput } from '../services/boerickeRepertoryService';
import { analyzeChiefComplaint } from '../services/chiefComplaintAnalysisService';
import { startSpeechRecognition, SpeechRecognitionSession } from '../services/speechService';
import { 
  extractCuesFromInitialComplaint, 
  generateAdaptiveQuestions, 
  getAdaptiveQuestionsForPillar,
  getAdaptiveRadiationQuestion,
  buildSynthesizedSymptomText,
  getStructuredAnswerOptions,
  analyzePatientStatement,
  evaluateTherapistQuestion,
  generateFollowUpDeepenings,
  analyzeAnamnesisInformationNeeds,
  AnamnesisDialogueStep,
  StructuredOptionItem
} from '../services/adaptiveAnamnesisEngine';
import { 
  CascadeFunnelPillarSelector, 
  SelectedCascadeItem 
} from './CascadeFunnelPillarSelector';

interface AdaptiveAnamnesisWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptom: RepertoriumSymptomInput;
  onSave: (updated: RepertoriumSymptomInput) => void;
  language: LanguageCode;
  initialStep?: number;
}

export const AdaptiveAnamnesisWizardModal: React.FC<AdaptiveAnamnesisWizardModalProps> = ({
  isOpen,
  onClose,
  symptom,
  onSave,
  language,
  initialStep = 0
}) => {
  const { t } = useTranslation();

  // Local draft of symptom so edits can be saved on finish or cancelled
  const [draft, setDraft] = useState<RepertoriumSymptomInput>(symptom);

  // Wizard active step:
  // 0 = Einstieg (Hauptbeschwerde)
  // 1 = WO? (Lokalisation)
  // 2 = WAS? (Empfindung)
  // 3 = WODURCH? (Causa & Auslöser - eigenes Fenster vor Modalitäten)
  // 4 = WANN? (Modalitäten - mit Tabs [Besser (>)] und [Schlechter (<)])
  // 5 = WAS NOCH? (Körperliche Begleitsymptome)
  // 6 = GEMÜT? (Gemüt & Psyche - separates Fenster)
  // 7 = SYNTHESE & REPERTORISATION (Prüfung & Übernahme)
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialStep !== undefined && initialStep >= 0 && initialStep <= 7) return initialStep;
    return draft.chiefComplaint ? 1 : 0;
  });

  // Cancel confirmation modal state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Current active question per step
  const [customQuestion, setCustomQuestion] = useState('');
  const [additionalQuestions, setAdditionalQuestions] = useState<string[]>([]);
  const [isCustomQuestionMode, setIsCustomQuestionMode] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');

  // Free text patient quote for active question
  const [patientQuote, setPatientQuote] = useState('');

  // Selected structured answer options (multi-select)
  const [selectedOptions, setSelectedOptions] = useState<StructuredOptionItem[]>([]);

  // Notice warning when user attempts to proceed with an empty pillar
  const [showEmptyPillarWarning, setShowEmptyPillarWarning] = useState(false);

  // Deepening questions list
  const [deepenings, setDeepenings] = useState<string[]>([]);

  // Step 0 initial free text
  const [step0Input, setStep0Input] = useState(draft.chiefComplaint || '');
  const [selectedPrimaryComplaint, setSelectedPrimaryComplaint] = useState<string | null>(null);
  const [isStep0Recording, setIsStep0Recording] = useState(false);
  const step0SpeechRef = React.useRef<SpeechRecognitionSession | null>(null);
  const activeStepBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const stepperContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll stepper roll bar so active pillar is always in view
  React.useEffect(() => {
    if (activeStepBtnRef.current) {
      activeStepBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentStep]);

  React.useEffect(() => {
    return () => {
      step0SpeechRef.current?.stop();
    };
  }, []);

  const toggleStep0Speech = () => {
    if (isStep0Recording) {
      step0SpeechRef.current?.stop();
      setIsStep0Recording(false);
      return;
    }

    try {
      setIsStep0Recording(true);
      step0SpeechRef.current = startSpeechRecognition({
        language,
        continuous: true,
        interimResults: true,
        onResult: (transcript) => {
          if (transcript?.trim()) {
            setStep0Input(transcript);
          }
        },
        onError: (err) => {
          console.warn('Speech error:', err);
          setIsStep0Recording(false);
        },
        onEnd: () => {
          setIsStep0Recording(false);
        }
      });
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsStep0Recording(false);
    }
  };

  const multiAnalysis = useMemo(() => {
    return analyzeChiefComplaint(step0Input, language);
  }, [step0Input, language]);

  const step0Analysis = useMemo(() => {
    const activeText = selectedPrimaryComplaint || step0Input;
    const res = analyzeChiefComplaint(activeText, language);
    return {
      ...res,
      detectedComplaints: multiAnalysis.detectedComplaints,
      hasMultipleComplaints: multiAnalysis.hasMultipleComplaints
    };
  }, [step0Input, selectedPrimaryComplaint, language, multiAnalysis]);

  // Sub-Tab inside Step 4 (WANN / Modalitäten): Besser (>) vs. Schlechter (<)
  const [modalitySubTab, setModalitySubTab] = useState<'better' | 'worse'>('better');

  // Snapshot ref for dirty-state check (comparing initial vs current state)
  const initialSnapshotRef = React.useRef<string>('');

  const serializeForDirtyCheck = (s: RepertoriumSymptomInput, step0: string) => {
    return JSON.stringify({
      chiefComplaint: (s.chiefComplaint || '').trim(),
      location: (s.location || '').trim(),
      sensation: (s.sensation || '').trim(),
      modalities: (s.modalities || '').trim(),
      concomitants: (s.concomitants || '').trim(),
      mind: (s.mind || '').trim(),
      causaEvent: (s.causaEvent || '').trim(),
      causaTemporal: (s.causaTemporal || '').trim(),
      causaEffect: s.causaEffect || '',
      step0: step0.trim(),
      steps: (s.anamnesisDialogueSteps || []).map(st => ({ q: st.question, a: st.answer, p: st.pillar }))
    });
  };

  // Keep draft in sync if external symptom changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setDraft(symptom);
      const initStep0 = symptom.chiefComplaint || '';
      setStep0Input(initStep0);
      if (symptom.modalities) {
        if (symptom.modalities.includes('>')) {
          setModalitySubTab('better');
        } else if (symptom.modalities.includes('<')) {
          setModalitySubTab('worse');
        }
      }
      initialSnapshotRef.current = serializeForDirtyCheck(symptom, initStep0);

      if (initialStep !== undefined && initialStep >= 0 && initialStep <= 8) {
        setCurrentStep(initialStep);
      } else {
        setCurrentStep(symptom.chiefComplaint ? 1 : 0);
      }
      setSelectedOptions([]);
      setSelectedQuestionId('');
      setPatientQuote('');
      setIsCustomQuestionMode(false);
      setCustomQuestion('');
      setAdditionalQuestions([]);
      setDeepenings([]);
      setShowCancelConfirm(false);
      setShowEmptyPillarWarning(false);
    }
  }, [isOpen, symptom, initialStep]);

  // Is data modified since modal was opened?
  const isDirty = useMemo(() => {
    const currentSnapshot = serializeForDirtyCheck(draft, step0Input);
    if (initialSnapshotRef.current && currentSnapshot !== initialSnapshotRef.current) return true;
    if (patientQuote.trim().length > 0) return true;
    if (selectedOptions.length > 0) return true;
    if (customQuestion.trim().length > 0 || additionalQuestions.some(q => q.trim().length > 0)) return true;
    return false;
  }, [draft, step0Input, patientQuote, selectedOptions, customQuestion, additionalQuestions]);

  // Derive target pillar from current step:
  // 1 = location, 2 = sensation, 3 = causa, 4 = modalities (better >), 5 = modalities (worse <), 6 = concomitants, 7 = mind, 8 = review
  const getPillarForStep = (step: number): 'location' | 'sensation' | 'causa' | 'modalities' | 'concomitants' | 'mind' => {
    switch (step) {
      case 1: return 'location';
      case 2: return 'sensation';
      case 3: return 'causa';
      case 4: return 'modalities';
      case 5: return 'modalities';
      case 6: return 'concomitants';
      case 7: return 'mind';
      default: return 'location';
    }
  };

  const currentPillar = getPillarForStep(currentStep);

  // Synchronisiere modalitySubTab mit den getrennten Schritten 4.1 (better) und 4.2 (worse)
  React.useEffect(() => {
    if (currentStep === 4) {
      setModalitySubTab('better');
    } else if (currentStep === 5) {
      setModalitySubTab('worse');
    }
  }, [currentStep]);

  // Dynamic Bedarfsanalyse der Patientenangaben nach Hahnemann & Bönninghausen
  const needsAnalysis = useMemo(() => {
    return analyzeAnamnesisInformationNeeds(draft, language);
  }, [draft, language]);

  // Track which steps have confirmed/adopted answers
  const [adoptedSteps, setAdoptedSteps] = useState<Set<number>>(() => {
    const s = new Set<number>();
    if (symptom.chiefComplaint) s.add(0);
    if (symptom.location) s.add(1);
    if (symptom.sensation) s.add(2);
    if (symptom.causaEvent) s.add(3);
    if (symptom.modalities?.includes('>')) s.add(4);
    if (symptom.modalities?.includes('<')) s.add(5);
    if (symptom.concomitants) s.add(6);
    if (symptom.mind) s.add(7);
    return s;
  });

  // Sync adopted steps if symptom prop changes
  React.useEffect(() => {
    if (isOpen) {
      const s = new Set<number>();
      if (symptom.chiefComplaint) s.add(0);
      if (symptom.location) s.add(1);
      if (symptom.sensation) s.add(2);
      if (symptom.causaEvent) s.add(3);
      if (symptom.modalities?.includes('>')) s.add(4);
      if (symptom.modalities?.includes('<')) s.add(5);
      if (symptom.concomitants) s.add(6);
      if (symptom.mind) s.add(7);
      setAdoptedSteps(s);
    }
  }, [isOpen, symptom]);

  // Is current step ready for forward navigation?
  const isCurrentStepAdopted = useMemo(() => {
    if (currentStep === 0) return !!(step0Input.trim() || draft.chiefComplaint);
    if (currentStep === 8) return true;
    if (adoptedSteps.has(currentStep)) return true;
    const field: keyof RepertoriumSymptomInput = 
      currentPillar === 'causa' ? 'causaEvent' :
      currentPillar === 'location' ? 'location' :
      currentPillar === 'sensation' ? 'sensation' :
      currentPillar === 'modalities' ? 'modalities' :
      currentPillar === 'mind' ? 'mind' : 'concomitants';
    const val = (draft[field] as string || '').trim();
    return val.length > 0 || patientQuote.trim().length > 0 || selectedOptions.length > 0;
  }, [currentStep, step0Input, draft, adoptedSteps, currentPillar, patientQuote, selectedOptions]);

  // Can the user click "Antwort übernehmen" right now?
  const canAdopt = useMemo(() => {
    if (patientQuote.trim().length > 0) return true;
    const field: keyof RepertoriumSymptomInput = 
      currentPillar === 'causa' ? 'causaEvent' :
      currentPillar === 'location' ? 'location' :
      currentPillar === 'sensation' ? 'sensation' :
      currentPillar === 'modalities' ? 'modalities' :
      currentPillar === 'mind' ? 'mind' : 'concomitants';
    const val = (draft[field] as string || '').trim();
    if (val.length > 0) return true;
    const hasPillarSteps = (draft.anamnesisDialogueSteps || []).some(
      s => s.pillar === currentPillar && s.status !== 'NOT_STATED'
    );
    return hasPillarSteps;
  }, [patientQuote, currentPillar, draft]);

  if (!isOpen) return null;

  // Suggested questions specifically for the current pillar (adapts directly to complaint and modality tab!)
  const stepModalityDirection = currentStep === 4 ? 'better' : currentStep === 5 ? 'worse' : undefined;

  const suggestedQuestions = getAdaptiveQuestionsForPillar(
    draft,
    currentPillar,
    draft.anamnesisDialogueSteps || [],
    language,
    stepModalityDirection || (currentPillar === 'modalities' ? modalitySubTab : undefined)
  );

  const activeQuestionItem = suggestedQuestions.find(q => q.id === selectedQuestionId) || suggestedQuestions[0];
  const allCustomQuestions = [customQuestion.trim(), ...additionalQuestions.map(q => q.trim()).filter(Boolean)].filter(Boolean);
  const activeQuestionText = allCustomQuestions.length > 0
    ? allCustomQuestions.join(' | ')
    : (activeQuestionItem ? activeQuestionItem.text : '');

  // Structured answer options for this pillar, tab and question
  const { options: structuredOptions } = getStructuredAnswerOptions(
    currentPillar,
    activeQuestionText,
    draft.chiefComplaint || '',
    language,
    stepModalityDirection || (currentPillar === 'modalities' ? modalitySubTab : undefined)
  );

  // Target field for AI analysis
  const currentPillarField: keyof RepertoriumSymptomInput = 
    currentPillar === 'causa' ? 'causaEvent' :
    currentPillar === 'location' ? 'location' :
    currentPillar === 'sensation' ? 'sensation' :
    currentPillar === 'modalities' ? 'modalities' :
    currentPillar === 'mind' ? 'mind' : 'concomitants';

  // Live AI analysis of the current statement
  const aiAnalysis = analyzePatientStatement(
    currentPillar,
    patientQuote,
    (draft[currentPillarField] as string) || undefined,
    language
  );

  // Live AI evaluation of therapist question if in custom question mode
  const questionAnalysis = customQuestion.trim()
    ? evaluateTherapistQuestion(customQuestion, currentPillar, language)
    : null;

  // Handle Step 0 Start
  const handleStep0Next = () => {
    if (!step0Input.trim()) return;

    // Strict validation: Unrecognized chief complaint cannot be accepted
    if (!step0Analysis.isRecognized) {
      return;
    }

    const chosenPrimary = selectedPrimaryComplaint || step0Input.trim();
    const cues = extractCuesFromInitialComplaint(chosenPrimary);

    let initialConcomitants = draft.concomitants || cues.concomitants || '';
    if (selectedPrimaryComplaint && step0Analysis.hasMultipleComplaints) {
      const otherComplaints = step0Analysis.detectedComplaints
        .filter(c => c.toLowerCase() !== selectedPrimaryComplaint.toLowerCase())
        .join(', ');
      if (otherComplaints) {
        initialConcomitants = initialConcomitants
          ? `${initialConcomitants}, ${otherComplaints}`
          : otherComplaints;
      }
    }

    const updated: RepertoriumSymptomInput = {
      ...draft,
      chiefComplaint: chosenPrimary,
      chiefQuote: step0Input.trim(),
      location: draft.location || cues.location || '',
      locationQuote: draft.locationQuote || (cues.location ? step0Input.trim() : ''),
      sensation: draft.sensation || cues.sensation || '',
      sensationQuote: draft.sensationQuote || (cues.sensation ? step0Input.trim() : ''),
      modalities: draft.modalities || cues.modalities || '',
      modalitiesQuote: draft.modalitiesQuote || (cues.modalities ? step0Input.trim() : ''),
      concomitants: initialConcomitants,
      concomitantsQuote: draft.concomitantsQuote || (initialConcomitants ? step0Input.trim() : ''),
      causaEvent: draft.causaEvent || cues.causaEvent || '',
      causaTemporal: draft.causaTemporal || cues.causaTemporal || '',
      causaEffect: draft.causaEffect || (cues.causaEffect as '' | 'worse' | 'better' | 'unchanged' | 'uncertain') || '',
      causaQuote: draft.causaQuote || (cues.causaEvent ? step0Input.trim() : ''),
    };

    const initialStepEntry: AnamnesisDialogueStep = {
      id: `step-0-${Date.now()}`,
      question: t('anamnesisOpeningQuestion'),
      answer: step0Input.trim(),
      pillar: 'chiefComplaint',
      timestamp: Date.now(),
      depthLevel: 1,
      status: 'EXPLICIT'
    };

    updated.anamnesisDialogueSteps = [
      ...(draft.anamnesisDialogueSteps || []).filter(s => s.pillar !== 'chiefComplaint'),
      initialStepEntry
    ];

    updated.text = buildSynthesizedSymptomText(updated);
    setDraft(updated);
    setAdoptedSteps(prev => new Set(prev).add(0));
    setCurrentStep(1);
    setSelectedOptions([]);
    setPatientQuote('');
    setDeepenings([]);
  };

  // Handle adopting an answer in Steps 1 to 6
  const handleAdoptAnswer = () => {
    const field: keyof RepertoriumSymptomInput = 
      currentPillar === 'causa' ? 'causaEvent' :
      currentPillar === 'location' ? 'location' :
      currentPillar === 'sensation' ? 'sensation' :
      currentPillar === 'modalities' ? 'modalities' :
      currentPillar === 'mind' ? 'mind' : 'concomitants';

    const currentVal = (draft[field] as string || '').trim();
    const quoteVal = patientQuote.trim();

    if (!currentVal && !quoteVal && currentPillar !== 'causa') return;

    let updated = { ...draft };

    // If patient quote was entered, record as dialogue step and update quote field
    if (quoteVal) {
      const stepId = `step-quote-${currentPillar}-${Date.now()}`;
      const questionUsed = activeQuestionText || t('anamnesisDepthInvestigationTitle');
      const newStepEntry: AnamnesisDialogueStep = {
        id: stepId,
        question: questionUsed,
        answer: quoteVal,
        pillar: currentPillar,
        timestamp: Date.now(),
        depthLevel: (updated.anamnesisDialogueSteps || []).filter(s => s.pillar === currentPillar).length + 1,
        status: 'EXPLICIT',
        direction: currentPillar === 'modalities' ? modalitySubTab : aiAnalysis.direction,
        certainty: aiAnalysis.certainty
      };
      updated.anamnesisDialogueSteps = [...(updated.anamnesisDialogueSteps || []), newStepEntry];

      if (currentPillar === 'location') {
        updated.locationQuote = quoteVal;
        if (!currentVal) updated.location = quoteVal;
      } else if (currentPillar === 'sensation') {
        updated.sensationQuote = quoteVal;
        if (!currentVal) updated.sensation = quoteVal;
      } else if (currentPillar === 'modalities') {
        updated.modalitiesQuote = quoteVal;
        const dir = currentStep === 4 ? 'better' : currentStep === 5 ? 'worse' : modalitySubTab;
        const formattedQuote = dir === 'better'
          ? (quoteVal.startsWith('>') ? quoteVal : `> ${quoteVal}`)
          : (quoteVal.startsWith('<') ? quoteVal : `< ${quoteVal}`);
        if (!currentVal) {
          updated.modalities = formattedQuote;
        } else if (!currentVal.toLowerCase().includes(quoteVal.toLowerCase())) {
          updated.modalities = `${currentVal}, ${formattedQuote}`;
        }
      } else if (currentPillar === 'causa') {
        updated.causaQuote = quoteVal;
        if (!currentVal) updated.causaEvent = quoteVal;
      } else if (currentPillar === 'concomitants') {
        updated.concomitantsQuote = quoteVal;
        if (!currentVal) updated.concomitants = quoteVal;
      } else if (currentPillar === 'mind') {
        updated.mindQuote = quoteVal;
        if (!currentVal) updated.mind = quoteVal;
      }
    }

    updated.text = buildSynthesizedSymptomText(updated);
    setDraft(updated);

    // Mark current step as adopted
    setAdoptedSteps(prev => new Set(prev).add(currentStep));

    // Reset temporary quote/question inputs
    setPatientQuote('');
    setCustomQuestion('');
    setAdditionalQuestions([]);
    setIsCustomQuestionMode(false);
    setDeepenings([]);
  };

  // Dedicated handler for Modalities Direction toggle (Besserung > vs. Verschlechterung <)
  const handleSetModalityDirection = (direction: 'better' | 'worse') => {
    setModalitySubTab(direction);
    setDraft(prev => {
      let currentMods = (prev.modalities || '').trim();
      if (currentMods) {
        if (direction === 'better') {
          if (currentMods.startsWith('<')) {
            currentMods = currentMods.replace(/^<\s*/, '> ');
          } else if (!currentMods.startsWith('>')) {
            currentMods = `> ${currentMods}`;
          }
        } else {
          if (currentMods.startsWith('>')) {
            currentMods = currentMods.replace(/^>\s*/, '< ');
          } else if (!currentMods.startsWith('<')) {
            currentMods = `< ${currentMods}`;
          }
        }
      }
      const updated: RepertoriumSymptomInput = {
        ...prev,
        modalities: currentMods
      };
      updated.text = buildSynthesizedSymptomText(updated);
      return updated;
    });
  };

  // Check if a structured or standard option is currently selected/active
  const isOptionActive = (opt: StructuredOptionItem) => {
    const pillarSteps = (draft.anamnesisDialogueSteps || []).filter(s => s.pillar === currentPillar);
    if (pillarSteps.some(s => s.optionId === opt.id || s.answer.trim().toLowerCase() === opt.label.trim().toLowerCase())) {
      return true;
    }
    const field: keyof RepertoriumSymptomInput = 
      currentPillar === 'causa' ? 'causaEvent' :
      currentPillar === 'location' ? 'location' :
      currentPillar === 'sensation' ? 'sensation' :
      currentPillar === 'modalities' ? 'modalities' :
      currentPillar === 'mind' ? 'mind' : 'concomitants';
    const val = (draft[field] as string || '');
    if (!val) return false;
    const parts = val.split(',').map(s => s.trim().replace(/^[<>]\s*/, '').toLowerCase());
    return parts.includes(opt.label.trim().replace(/^[<>]\s*/, '').toLowerCase());
  };

  // Toggle option: if active -> deselect and remove from pillar and statements; if inactive -> select and insert
  const handleToggleOption = (opt: StructuredOptionItem) => {
    const field: keyof RepertoriumSymptomInput = 
      currentPillar === 'causa' ? 'causaEvent' :
      currentPillar === 'location' ? 'location' :
      currentPillar === 'sensation' ? 'sensation' :
      currentPillar === 'modalities' ? 'modalities' :
      currentPillar === 'mind' ? 'mind' : 'concomitants';

    const active = isOptionActive(opt);

    if (active) {
      // Abwählen / Deselect: remove from steps & pillar text
      const updatedSteps = (draft.anamnesisDialogueSteps || []).filter(
        s => !(s.pillar === currentPillar && (s.optionId === opt.id || s.answer.trim().toLowerCase() === opt.label.trim().toLowerCase()))
      );
      const currentVal = (draft[field] as string || '');
      const parts = currentVal.split(',').map(s => s.trim()).filter(Boolean);
      const newParts = parts.filter(p => {
        const cleanP = p.replace(/^[<>]\s*/, '').toLowerCase();
        const cleanOpt = opt.label.replace(/^[<>]\s*/, '').toLowerCase();
        return cleanP !== cleanOpt;
      });
      const newText = newParts.join(', ');

      setDraft(prev => {
        const updated = {
          ...prev,
          [field]: newText,
          anamnesisDialogueSteps: updatedSteps
        };
        if (currentPillar === 'causa' && newParts.length === 0) {
          updated.causaEffect = '';
        }
        updated.text = buildSynthesizedSymptomText(updated);
        return updated;
      });

      // User modified selection -> must click 'Antwort übernehmen' to confirm updated state
      setAdoptedSteps(prev => {
        const next = new Set(prev);
        next.delete(currentStep);
        return next;
      });
    } else {
      // Auswählen / Select: add to steps & pillar text (stays active!)
      const stepId = `step-${currentPillar}-${opt.id || Date.now()}`;
      const questionUsed = activeQuestionText || t('anamnesisDepthInvestigationTitle');
      const newStepEntry: AnamnesisDialogueStep = {
        id: stepId,
        question: questionUsed,
        answer: opt.label,
        pillar: currentPillar,
        timestamp: Date.now(),
        depthLevel: 1,
        status: opt.statusCode || 'EXPLICIT',
        direction: opt.direction || (currentPillar === 'modalities' ? modalitySubTab : undefined),
        optionId: opt.id
      };
      const existingSteps = (draft.anamnesisDialogueSteps || []).filter(
        s => !(s.pillar === currentPillar && (s.optionId === opt.id || s.answer.trim().toLowerCase() === opt.label.trim().toLowerCase()))
      );
      const updatedSteps = [...existingSteps, newStepEntry];

      const currentVal = (draft[field] as string || '').trim();
      const parts = currentVal ? currentVal.split(',').map(s => s.trim()).filter(Boolean) : [];
      
      let itemLabel = opt.label;
      if (currentPillar === 'modalities') {
        const stepDir = currentStep === 4 ? 'better' : currentStep === 5 ? 'worse' : undefined;
        const dir = opt.direction || stepDir || modalitySubTab;
        if (dir === 'better' && !itemLabel.startsWith('>')) {
          itemLabel = `> ${itemLabel}`;
        } else if (dir === 'worse' && !itemLabel.startsWith('<')) {
          itemLabel = `< ${itemLabel}`;
        }
      }

      if (!parts.some(p => p.replace(/^[<>]\s*/, '').toLowerCase() === opt.label.replace(/^[<>]\s*/, '').toLowerCase())) {
        parts.push(itemLabel);
      }
      const newText = parts.join(', ');

      setDraft(prev => {
        const updated = {
          ...prev,
          [field]: newText,
          anamnesisDialogueSteps: updatedSteps
        };
        if (currentPillar === 'causa' && (opt.direction === 'worse' || opt.direction === 'better')) {
          updated.causaEffect = opt.direction;
        }
        updated.text = buildSynthesizedSymptomText(updated);
        return updated;
      });

      // User modified selection -> must click 'Antwort übernehmen' to confirm
      setAdoptedSteps(prev => {
        const next = new Set(prev);
        next.delete(currentStep);
        return next;
      });
    }
  };

  // Handler for 3-Level Cascade Funnel multi-select changes
  const handleCascadeSelectionChange = (selectedItems: SelectedCascadeItem[], combinedSynthesizedText: string) => {
    const field: keyof RepertoriumSymptomInput = 
      currentPillar === 'causa' ? 'causaEvent' :
      currentPillar === 'location' ? 'location' :
      currentPillar === 'sensation' ? 'sensation' :
      currentPillar === 'modalities' ? 'modalities' :
      currentPillar === 'mind' ? 'mind' : 'concomitants';

    // Remove existing dialogue steps for this pillar that came from cascade selection
    const otherSteps = (draft.anamnesisDialogueSteps || []).filter(
      s => !(s.pillar === currentPillar && s.optionId && s.optionId.startsWith('cascade-'))
    );

    // Create fresh dialogue steps for each selected item
    const questionUsed = activeQuestionText || t('anamnesisDepthInvestigationTitle');
    const newCascadeSteps: AnamnesisDialogueStep[] = selectedItems.map((item, idx) => {
      const stepAnswer = item.tier3Label
        ? `${item.tier2Label} (${item.tier3Label})`
        : item.tier2Label;

      return {
        id: `step-cascade-${currentPillar}-${item.tier2Id}-${Date.now()}-${idx}`,
        question: questionUsed,
        answer: stepAnswer,
        pillar: currentPillar,
        timestamp: Date.now(),
        depthLevel: item.tier3Label ? 2 : 1,
        status: 'EXPLICIT',
        direction: item.direction,
        optionId: `cascade-${item.tier2Id}`
      };
    });

    // Check if any selected item sets causaEffect
    let newCausaEffect = draft.causaEffect;
    if (currentPillar === 'causa') {
      const worseItem = selectedItems.find(it => it.direction === 'worse');
      const betterItem = selectedItems.find(it => it.direction === 'better');
      if (worseItem) newCausaEffect = 'worse';
      else if (betterItem) newCausaEffect = 'better';
      else if (selectedItems.length === 0) newCausaEffect = '';
    }

    setDraft(prev => {
      let fieldValue = combinedSynthesizedText;
      if (currentPillar === 'modalities') {
        const prevMods = (prev.modalities || '').split(',').map(m => m.trim()).filter(Boolean);
        if (currentStep === 4) {
          // Keep existing '<' items, replace '>' items with new selection
          const existingWorse = prevMods.filter(m => m.startsWith('<'));
          const newBetter = combinedSynthesizedText.split(',').map(m => m.trim()).filter(Boolean);
          fieldValue = [...existingWorse, ...newBetter].join(', ');
        } else if (currentStep === 5) {
          // Keep existing '>' items, replace '<' items with new selection
          const existingBetter = prevMods.filter(m => m.startsWith('>'));
          const newWorse = combinedSynthesizedText.split(',').map(m => m.trim()).filter(Boolean);
          fieldValue = [...existingBetter, ...newWorse].join(', ');
        }
      }

      const updated = {
        ...prev,
        [field]: fieldValue,
        anamnesisDialogueSteps: [...otherSteps, ...newCascadeSteps]
      };
      if (currentPillar === 'causa') {
        updated.causaEffect = newCausaEffect;
      }
      updated.text = buildSynthesizedSymptomText(updated);
      return updated;
    });

    // Keep state open until user clicks 'Antwort übernehmen'
    setAdoptedSteps(prev => {
      const next = new Set(prev);
      next.delete(currentStep);
      return next;
    });
  };

  // Remove single dialogue step and clean up consolidated field
  const handleRemoveDialogueStep = (stepId: string) => {
    const stepToRemove = (draft.anamnesisDialogueSteps || []).find(s => s.id === stepId);
    const updatedSteps = (draft.anamnesisDialogueSteps || []).filter(s => s.id !== stepId);
    let updated = { ...draft, anamnesisDialogueSteps: updatedSteps };

    if (stepToRemove) {
      const field: keyof RepertoriumSymptomInput = 
        stepToRemove.pillar === 'causa' ? 'causaEvent' :
        stepToRemove.pillar === 'location' ? 'location' :
        stepToRemove.pillar === 'sensation' ? 'sensation' :
        stepToRemove.pillar === 'modalities' ? 'modalities' :
        stepToRemove.pillar === 'mind' ? 'mind' : 'concomitants';
      
      const currentVal = (draft[field] as string || '');
      const parts = currentVal.split(',').map(s => s.trim()).filter(Boolean);
      const newParts = parts.filter(p => {
        const cleanP = p.replace(/^[<>]\s*/, '').toLowerCase();
        const cleanAns = stepToRemove.answer.trim().replace(/^[<>]\s*/, '').toLowerCase();
        return cleanP !== cleanAns;
      });
      (updated as any)[field] = newParts.join(', ');
      if (stepToRemove.pillar === 'causa' && newParts.length === 0) {
        updated.causaEffect = '';
      }
    }

    updated.text = buildSynthesizedSymptomText(updated);
    setDraft(updated);

    // If removing dialogue step leaves the pillar empty, un-adopt
    const currentPillarSteps = updatedSteps.filter(s => s.pillar === currentPillar && s.status !== 'NOT_STATED');
    const field: keyof RepertoriumSymptomInput = 
      currentPillar === 'causa' ? 'causaEvent' :
      currentPillar === 'location' ? 'location' :
      currentPillar === 'sensation' ? 'sensation' :
      currentPillar === 'modalities' ? 'modalities' :
      currentPillar === 'mind' ? 'mind' : 'concomitants';
    if (currentPillarSteps.length === 0 && !(updated[field] as string || '').trim()) {
      setAdoptedSteps(prev => {
        const next = new Set(prev);
        next.delete(currentStep);
        return next;
      });
    }
  };

  // Finish and save complete anamnesis
  const handleFinishAndSave = () => {
    const finalDraft = { ...draft };
    finalDraft.text = buildSynthesizedSymptomText(finalDraft);
    onSave(finalDraft);
    onClose();
  };

  // Cancel button logic: if data was changed -> ask "Aenderungen speichern ja nein", then close; if not changed -> close immediately
  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  // "Speichern" in cancel confirmation -> save changes and close popup
  const handleConfirmCancelWithSave = () => {
    const finalDraft = { ...draft };
    finalDraft.text = buildSynthesizedSymptomText(finalDraft);
    onSave(finalDraft);
    setShowCancelConfirm(false);
    setShowDiscardConfirm(false);
    onClose();
  };

  // "Ja" in secondary discard confirmation -> discard changes and close popup
  const handleConfirmCancelWithoutSave = () => {
    setShowDiscardConfirm(false);
    setShowCancelConfirm(false);
    onClose();
  };

  // Stay in wizard (keep editing)
  const handleRejectCancel = () => {
    setShowCancelConfirm(false);
    setShowDiscardConfirm(false);
  };

  // Tab definitions: 9-Schritte-Modell (Hauptbeschwerde + WO + WAS + WODURCH + 4.1 Besserung + 4.2 Verschlimmerung + Begleitsymptome + Gemüt + Abschluss)
  const steps = [
    { idx: 0, stepNumber: '0', label: t('anamnesisStepChief'), short: t('anamnesisStepChief'), hasData: !!draft.chiefComplaint },
    { idx: 1, stepNumber: '1', label: t('anamnesisStepPillar1Short'), short: t('anamnesisPillarLocationShort'), hasData: !!draft.location },
    { idx: 2, stepNumber: '2', label: t('anamnesisStepPillar2Short'), short: t('anamnesisPillarSensationShort'), hasData: !!draft.sensation },
    { idx: 3, stepNumber: '3', label: t('anamnesisCausaTriggerTitle'), short: t('anamnesisCausaEventShort'), hasData: !!draft.causaEvent },
    { idx: 4, stepNumber: '4.1', label: t('anamnesisModalitiesBetterTitle'), short: t('anamnesisStepModalitiesBetterShort'), hasData: !!(draft.modalities && draft.modalities.includes('>')) },
    { idx: 5, stepNumber: '4.2', label: t('anamnesisModalitiesWorseTitle'), short: t('anamnesisStepModalitiesWorseShort'), hasData: !!(draft.modalities && draft.modalities.includes('<')) },
    { idx: 6, stepNumber: '5', label: t('anamnesisConcomitantsTitle'), short: t('anamnesisPillarConcomitantsShort'), hasData: !!draft.concomitants },
    { idx: 7, stepNumber: '6', label: t('anamnesisMindTitle'), short: t('anamnesisPillarMindShort'), hasData: !!draft.mind },
    { idx: 8, stepNumber: '7', label: t('anamnesisStepReviewAndDeepen'), short: t('anamnesisStepReviewAndConclusion'), hasData: !!(draft.location && draft.sensation && draft.modalities && draft.concomitants) },
  ];

  // Check if current pillar currently has any recorded data
  const checkCurrentPillarHasData = (): boolean => {
    // If the user has entered text in the quote field, it will be automatically adopted -> has data
    if (patientQuote.trim().length > 0) return true;

    // Check dialogue steps recorded for this pillar
    const stepsForPillar = (draft.anamnesisDialogueSteps || []).filter(s => {
      if (s.pillar !== currentPillar) return false;
      if (currentPillar === 'modalities') {
        if (currentStep === 4) {
          return s.direction === 'better' || s.answer.startsWith('>');
        }
        if (currentStep === 5) {
          return s.direction === 'worse' || s.answer.startsWith('<');
        }
      }
      return true;
    });

    if (stepsForPillar.length > 0) return true;

    // Check consolidated field on draft
    if (currentStep === 1) return !!(draft.location && draft.location.trim());
    if (currentStep === 2) return !!(draft.sensation && draft.sensation.trim());
    if (currentStep === 3) return !!(draft.causaEvent && draft.causaEvent.trim());
    if (currentStep === 4) return !!(draft.modalities && draft.modalities.includes('>'));
    if (currentStep === 5) return !!(draft.modalities && draft.modalities.includes('<'));
    if (currentStep === 6) return !!(draft.concomitants && draft.concomitants.trim());
    if (currentStep === 7) return !!(draft.mind && draft.mind.trim());

    return false;
  };

  // Perform step advance and cleanup temporary fields
  const advanceToNextStep = () => {
    if (canAdopt) {
      handleAdoptAnswer();
    }
    setCurrentStep(currentStep + 1);
    setSelectedQuestionId('');
    setSelectedOptions([]);
    setPatientQuote('');
    setCustomQuestion('');
    setAdditionalQuestions([]);
    setDeepenings([]);
  };

  // Handler for footer "Weiter zur nächsten Frage" or "Tiefenbefragung & Abschluss"
  const handleProceedNext = () => {
    if (currentStep === 0) {
      handleStep0Next();
      return;
    }

    // For steps 1 to 7, check if data has been entered
    if (currentStep >= 1 && currentStep <= 7) {
      const hasData = checkCurrentPillarHasData();
      if (!hasData) {
        setShowEmptyPillarWarning(true);
        return;
      }
    }

    advanceToNextStep();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[92vh] max-h-[880px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-600/70 border border-teal-400/40 flex items-center justify-center font-bold text-sm shadow-inner">
              <span className="text-teal-200">✨</span>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{t('anamnesisWizardTitle')}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-teal-200/90 truncate max-w-[260px] sm:max-w-xl">
                {t('anamnesisWizardSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-3 py-1.5 text-xs text-teal-100 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-1.5 border border-teal-400/30 cursor-pointer"
            >
              <span className="text-rose-300 font-bold">X</span>
              <span>{t('anamnesisNavCancel')}</span>
            </button>
          </div>
        </div>

        {/* WIZARD STEPPER NAVIGATION BAR */}
        <div 
          ref={stepperContainerRef}
          className="bg-slate-100 border-b border-slate-200 px-3 sm:px-6 py-2 shrink-0 overflow-x-auto scroll-smooth"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            {steps.map((step) => {
              const isActive = currentStep === step.idx;
              return (
                <button
                  key={step.idx}
                  ref={isActive ? activeStepBtnRef : null}
                  type="button"
                  onClick={() => {
                    if (step.idx > 0 && !draft.chiefComplaint && !step0Input.trim()) {
                      return;
                    }
                    if (canAdopt && currentStep > 0) {
                      handleAdoptAnswer();
                    }
                    setCurrentStep(step.idx);
                    setSelectedQuestionId('');
                    setSelectedOptions([]);
                    setPatientQuote('');
                    setCustomQuestion('');
                    setAdditionalQuestions([]);
                    setDeepenings([]);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? step.idx === 4
                        ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400/40'
                        : step.idx === 5
                        ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-400/40'
                        : 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-400/40'
                      : step.hasData
                      ? 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-50/70'
                      : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className={`px-1.5 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-slate-900'
                      : step.hasData
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-300 text-slate-700'
                  }`}>
                    {step.hasData ? <span className="text-xs font-bold font-mono">✓</span> : step.stepNumber}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODAL BODY (PAGE-BY-PAGE VIEW) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* STEP 0: EINSTIEG (Freie Hauptbeschwerde) */}
          {currentStep === 0 && (
            <div className="max-w-2xl mx-auto py-6 space-y-6 animate-in fade-in duration-150">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  &bdquo;{t('anamnesisOpeningQuestion')}&ldquo;
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  {t('anamnesisModelSubtitle')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('anamnesisOriginalQuoteTitle')}
                  </label>
                  <button
                    type="button"
                    onClick={toggleStep0Speech}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isStep0Recording
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                    }`}
                    title={isStep0Recording ? t('chiefComplaintListening') : t('chiefComplaintVoiceBtn')}
                  >
                    <span className="text-[10px] font-black uppercase mr-1">{isStep0Recording ? 'Stop' : 'Rec'}</span>
                    <span>{isStep0Recording ? t('chiefComplaintListening') : t('chiefComplaintVoiceBtn')}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={step0Input}
                    onChange={(e) => {
                      setStep0Input(e.target.value);
                      setSelectedPrimaryComplaint(null);
                    }}
                    placeholder={t('anamnesisOpeningPlaceholder')}
                    className="w-full px-4 py-3 text-sm bg-slate-50/70 rounded-xl border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none font-medium leading-relaxed shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleStep0Next();
                      }
                    }}
                  />
                </div>

                {/* Multiple Complaints Disambiguation / Clarification Card */}
                {step0Input.trim() && step0Analysis.hasMultipleComplaints && step0Analysis.detectedComplaints.length > 1 && (
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border-2 border-amber-300 space-y-2.5 shadow-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <span>{t('chiefComplaintMultipleDetectedTitle')}</span>
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-medium">
                      {t('chiefComplaintMultipleDetectedPrompt')}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {step0Analysis.detectedComplaints.map((complaint, idx) => {
                        const isSelected = selectedPrimaryComplaint === complaint;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedPrimaryComplaint(complaint);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-400'
                                : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-100/70 hover:border-amber-400'
                            }`}
                          >
                            {isSelected && <span className="text-xs font-bold mr-1 text-white">✓</span>}
                            <span>{complaint}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-amber-700/70 px-1.5 py-0.5 rounded text-amber-100">
                                {t('chiefComplaintSelectPrimaryBadge')}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setSelectedPrimaryComplaint(null)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          selectedPrimaryComplaint === null
                            ? 'bg-slate-700 text-white border-slate-800'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{t('chiefComplaintKeepCombinedOption')}</span>
                      </button>
                    </div>

                    {selectedPrimaryComplaint && (
                      <p className="text-[11px] text-amber-900 font-medium pt-0.5 flex items-center gap-1.5">
                        <span>{t('chiefComplaintOtherAsConcomitants')}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Domain verification badge or unrecognized warning */}
                {step0Input.trim() && (
                  step0Analysis.isRecognized && step0Analysis.organDomain ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{t('chiefComplaintVerified')}: <strong className="text-emerald-800 font-bold">{step0Analysis.organDomain}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-amber-900">
                        <span>{t('chiefComplaintUnrecognized')}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800/90 pl-6">
                        {t('chiefComplaintUnrecognizedPrompt')}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
                <p className="leading-relaxed">
                  {t('repertoriumClearAuditNotice')}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!step0Input.trim() || !step0Analysis.isRecognized}
                  onClick={handleStep0Next}
                  className="py-2.5 px-5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>{t('anamnesisNavNext')}</span>
                  <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 TO 7: DIE SÄULEN NACH HAHNEMANN & BÖNNINGHAUSEN */}
          {currentStep >= 1 && currentStep <= 7 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* PILLAR CARD HEADER */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                    currentPillar === 'location' ? 'bg-sky-600' :
                    currentPillar === 'sensation' ? 'bg-amber-600' :
                    currentPillar === 'causa' ? 'bg-indigo-600' :
                    currentStep === 4 ? 'bg-emerald-600' :
                    currentStep === 5 ? 'bg-rose-600' :
                    currentPillar === 'concomitants' ? 'bg-purple-600' : 'bg-pink-600'
                  }`}>
                    <span>{currentStep}</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {currentPillar === 'location' && t('anamnesisStepPillar1Short')}
                      {currentPillar === 'sensation' && t('anamnesisStepPillar2Short')}
                      {currentPillar === 'causa' && t('anamnesisCausaTriggerTitle')}
                      {currentStep === 4 && t('anamnesisModalitiesBetterTitle')}
                      {currentStep === 5 && t('anamnesisModalitiesWorseTitle')}
                      {currentPillar === 'concomitants' && t('anamnesisConcomitantsTitle')}
                      {currentPillar === 'mind' && t('anamnesisMindTitle')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {draft.chiefComplaint ? `${t('anamnesisStartingPointLabel')}: „${draft.chiefComplaint}“` : ''}
                    </p>
                  </div>
                </div>

                {/* Current Content Badge */}
                <div className="text-right">
                  {currentPillar === 'location' && draft.location && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                      {draft.location}
                    </span>
                  )}
                  {currentPillar === 'sensation' && draft.sensation && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                      {draft.sensation}
                    </span>
                  )}
                  {currentPillar === 'causa' && draft.causaEvent && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {draft.causaEvent}
                    </span>
                  )}
                  {currentPillar === 'modalities' && draft.modalities && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                      currentStep === 4
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}>
                      {(() => {
                        const allMods = (draft.modalities || '').split(',').map(m => m.trim()).filter(Boolean);
                        if (currentStep === 4) {
                          return allMods.filter(m => m.startsWith('>')).join(', ') || draft.modalities;
                        }
                        if (currentStep === 5) {
                          return allMods.filter(m => m.startsWith('<')).join(', ') || draft.modalities;
                        }
                        return draft.modalities;
                      })()}
                    </span>
                  )}
                  {currentPillar === 'concomitants' && draft.concomitants && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
                      {draft.concomitants}
                    </span>
                  )}
                  {currentPillar === 'mind' && draft.mind && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
                      {draft.mind}
                    </span>
                  )}
                </div>
              </div>

              {/* ECHTE 3-STUFIGE TRICHTER-BEFRAGUNG FÜR JEDE SÄULE */}
              <div className="w-full bg-slate-50/90 border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-inner space-y-4">
                <div className="space-y-2">
                  <CascadeFunnelPillarSelector
                    key={`funnel-${currentStep}-${currentPillar}`}
                    pillar={currentPillar}
                    language={language}
                    chiefComplaint={draft.chiefComplaint || step0Input}
                    existingValue={(() => {
                      if (currentPillar !== 'modalities') {
                        return (draft[
                          currentPillar === 'causa' ? 'causaEvent' :
                          currentPillar === 'location' ? 'location' :
                          currentPillar === 'sensation' ? 'sensation' :
                          currentPillar === 'mind' ? 'mind' : 'concomitants'
                        ] as string) || '';
                      }
                      // For modalities, filter existingValue to only items matching the current step's direction
                      const allMods = (draft.modalities || '').split(',').map(m => m.trim()).filter(Boolean);
                      if (currentStep === 4) {
                        return allMods.filter(m => m.startsWith('>')).join(', ');
                      }
                      if (currentStep === 5) {
                        return allMods.filter(m => m.startsWith('<')).join(', ');
                      }
                      return draft.modalities || '';
                    })()}
                    activeDirection={currentStep === 4 ? 'better' : currentStep === 5 ? 'worse' : undefined}
                    onDirectionChange={currentPillar === 'modalities' ? handleSetModalityDirection : undefined}
                    onSelectionChange={handleCascadeSelectionChange}
                  />
                </div>

                    {/* SECTION 2: Originalaussage des Patienten (Freitext) */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{t('anamnesisOriginalQuoteTitle')}</span>
                        </label>
                        <span className="text-[10px] text-amber-900 font-medium italic">
                          {t('anamnesisPriorityOverSelection')}
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={patientQuote}
                        onChange={(e) => setPatientQuote(e.target.value)}
                        placeholder={t('anamnesisOriginalQuotePlaceholder')}
                        className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-500 text-slate-900 outline-none font-medium leading-relaxed resize-none shadow-xs"
                      />
                    </div>

                    {/* SECTION 3: Live KI-Analyse der Aussage */}
                    {(patientQuote.trim() || selectedOptions.length > 0) && (
                      <div className="p-3 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                            <span>{t('anamnesisAiAnalysisTitle')}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            aiAnalysis.certainty === 'high' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {aiAnalysis.certainty === 'high' ? t('anamnesisAiCertaintyHigh') : t('anamnesisAiCertaintyMedium')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                          <div>
                            <span className="text-slate-400 block">{t('anamnesisAiDomain')}</span>
                            <span className="font-semibold text-slate-800">{aiAnalysis.informationDomain}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">{t('anamnesisAiTrigger')}</span>
                            <span className="font-semibold text-slate-800">{aiAnalysis.triggerOrQuality}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">{t('anamnesisAiDirection')}</span>
                            {currentPillar === 'modalities' ? (
                              <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-lg border ${
                                currentStep === 4 || modalitySubTab === 'better'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}>
                                <span>{currentStep === 4 || modalitySubTab === 'better' ? '>' : '<'}</span>
                                <span>{currentStep === 4 || modalitySubTab === 'better' ? t('anamnesisDirectionBetter') : t('anamnesisDirectionWorse')}</span>
                              </span>
                            ) : (
                              <span className={`font-semibold ${
                                aiAnalysis.direction === 'worse'
                                  ? 'text-rose-700'
                                  : aiAnalysis.direction === 'better'
                                  ? 'text-emerald-700'
                                  : 'text-slate-700'
                              }`}>
                                {aiAnalysis.direction === 'worse'
                                  ? `< ${t('anamnesisDirectionWorse')}`
                                  : aiAnalysis.direction === 'better'
                                  ? `> ${t('anamnesisDirectionBetter')}`
                                  : t('anamnesisDirectionNeutral')}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-400 block">{t('anamnesisAiStatus')}</span>
                            <span className="font-semibold text-teal-900">
                              {aiAnalysis.status === 'explicit' ? t('anamnesisStatusExplicit') :
                               aiAnalysis.status === 'unknown' ? t('anamnesisStatusUnknown') :
                               aiAnalysis.status === 'not_observed' ? t('anamnesisStatusNotObserved') :
                               aiAnalysis.status === 'not_stated' ? t('anamnesisStatusNotStated') : t('anamnesisStatusDenied')}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10.5px] text-teal-800 bg-teal-50/70 p-2 rounded-lg border border-teal-100 leading-snug">
                          {aiAnalysis.noGeneralizationNotice}
                        </p>
                      </div>
                    )}

                    {/* SECTION 4: DYNAMISCHE VERTIEFUNGSFRAGEN (falls angefordert) */}
                    {deepenings.length > 0 && (
                      <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 space-y-2">
                        <span className="text-xs font-bold text-teal-950 block">
                          {t('anamnesisTargetedDeepeningsTitle')}
                        </span>
                        <div className="space-y-1">
                          {deepenings.map((deepQ, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setCustomQuestion(deepQ);
                                setIsCustomQuestionMode(true);
                              }}
                              className="w-full text-left p-2 rounded-lg bg-white border border-teal-200 text-xs text-slate-800 hover:bg-teal-100/50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <span className="text-teal-600 text-[10px] font-bold">└─&gt;</span>
                              <span>&bdquo;{deepQ}&ldquo;</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

              {/* BEREITS ERFASSTE DIALOGSCHRITTE DIESER SÄULE */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('anamnesisRecordedStatementsTitle')}:
                </label>
                {(() => {
                  const pillarSteps = (draft.anamnesisDialogueSteps || []).filter(s => {
                    if (s.pillar !== currentPillar) return false;
                    if (currentPillar === 'modalities') {
                      if (currentStep === 4) {
                        return s.direction === 'better' || s.answer.startsWith('>');
                      }
                      if (currentStep === 5) {
                        return s.direction === 'worse' || s.answer.startsWith('<');
                      }
                    }
                    return true;
                  });
                  if (pillarSteps.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 italic py-1">
                        {t('anamnesisPillarEmptyNotice')}
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-1.5">
                      {pillarSteps.map((st) => (
                        <div key={st.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-slate-500 font-medium block text-[11px]">&bdquo;{st.question}&ldquo;</span>
                            <span className="font-semibold text-slate-900 block mt-0.5">
                              &bdquo;{st.answer}&ldquo;
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDialogueStep(st.id)}
                            className="text-slate-500 hover:text-rose-600 text-xs font-bold px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title={t('anamnesisDeleteStep')}
                          >
                            <span>X</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* STEP 8: ADAPTIVE SYNTHESE, 6-SÄULEN-REVIEW & ABSCHLUSS */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-855 text-white shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-teal-200 text-lg">
                    <span>✨</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t('anamnesisReviewDeepeningTitle')}
                    </h3>
                    <p className="text-xs text-teal-100/80">
                      {t('anamnesisReviewDeepeningSubtitle')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overview cards of Chief Complaint + 6 Pillars */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{t('anamnesisModelTitle')}</span>
                </h4>

                {/* Ausgangspunkt / Hauptbeschwerde */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      {t('anamnesisStepChief')} ({t('anamnesisChiefComplaintDescription')})
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)}
                      className="text-[10.5px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                    >
                      {t('anamnesisEditInWizard')}
                    </button>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {draft.chiefComplaint || <span className="italic text-slate-400 font-normal">{t('anamnesisPillarEmptyNotice')}</span>}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Säule 1 - WO */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        {t('anamnesisStepPillar1Short')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {t('anamnesisEditInWizard')}
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {draft.location || <span className="italic text-slate-400 font-normal">{t('anamnesisPillarEmptyNotice')}</span>}
                    </p>
                    {draft.locationQuote && (
                      <p className="text-[11px] text-slate-500 italic">&bdquo;{draft.locationQuote}&ldquo;</p>
                    )}
                  </div>

                  {/* Säule 2 - WAS */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        {t('anamnesisStepPillar2Short')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {t('anamnesisEditInWizard')}
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {draft.sensation || <span className="italic text-slate-400 font-normal">{t('anamnesisPillarEmptyNotice')}</span>}
                    </p>
                    {draft.sensationQuote && (
                      <p className="text-[11px] text-slate-500 italic">&bdquo;{draft.sensationQuote}&ldquo;</p>
                    )}
                  </div>

                  {/* Säule 3 - WODURCH (Causa & Auslöser) */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        {t('anamnesisCausaTriggerTitle')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {t('anamnesisEditInWizard')}
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {draft.causaEvent || <span className="italic text-slate-400 font-normal">{t('anamnesisPillarEmptyNotice')}</span>}
                    </p>
                    {draft.causaTemporal && (
                      <p className="text-[11px] text-slate-600 font-medium">{t('symptomCausaTemporalLabel')}: {draft.causaTemporal}</p>
                    )}
                    {draft.causaQuote && (
                      <p className="text-[11px] text-slate-500 italic">&bdquo;{draft.causaQuote}&ldquo;</p>
                    )}
                  </div>

                  {/* Säule 4.1 - WANN: Besserung (>) */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        {t('anamnesisModalitiesBetterTitle')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {t('anamnesisEditInWizard')}
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {(draft.modalities && draft.modalities.includes('>')) ? draft.modalities : <span className="italic text-slate-400 font-normal">{t('anamnesisPillarEmptyNotice')}</span>}
                    </p>
                    {draft.modalitiesQuote && (
                      <p className="text-[11px] text-slate-500 italic">&bdquo;{draft.modalitiesQuote}&ldquo;</p>
                    )}
                  </div>

                  {/* Säule 4.2 - WANN: Verschlimmerung (<) */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        {t('anamnesisModalitiesWorseTitle')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(5)}
                        className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {t('anamnesisEditInWizard')}
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {(draft.modalities && draft.modalities.includes('<')) ? draft.modalities : <span className="italic text-slate-400 font-normal">{t('anamnesisPillarEmptyNotice')}</span>}
                    </p>
                  </div>

                  {/* Säule 5 - WAS NOCH (Körperliche Begleitsymptome) */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        {t('anamnesisConcomitantsTitle')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(6)}
                        className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {t('anamnesisEditInWizard')}
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {draft.concomitants || <span className="italic text-slate-400 font-normal">{t('anamnesisPillarEmptyNotice')}</span>}
                    </p>
                    {draft.concomitantsQuote && (
                      <p className="text-[11px] text-slate-500 italic">&bdquo;{draft.concomitantsQuote}&ldquo;</p>
                    )}
                  </div>

                  {/* Säule 6 - GEMÜT (Gemüt & Psyche) */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        {t('anamnesisMindTitle')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(7)}
                        className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {t('anamnesisEditInWizard')}
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {draft.mind || <span className="italic text-slate-400 font-normal">{t('anamnesisPillarEmptyNotice')}</span>}
                    </p>
                    {draft.mindQuote && (
                      <p className="text-[11px] text-slate-500 italic">&bdquo;{draft.mindQuote}&ldquo;</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Prominent finish button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleFinishAndSave}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                >
                  <span className="font-bold text-white mr-1">✓</span>
                  <span>{t('anamnesisNavFinish')}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER NAVIGATION */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="text-rose-500 font-black mr-1">X</span>
              <span>{t('anamnesisNavCancel')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setSelectedQuestionId('');
                  setSelectedOptions([]);
                  setPatientQuote('');
                  setCustomQuestion('');
                  setAdditionalQuestions([]);
                  setDeepenings([]);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="font-bold mr-1">←</span>
                <span>{t('anamnesisNavBack')}</span>
              </button>
            )}

            {currentStep < 8 ? (
              <div className="inline-flex">
                <button
                  type="button"
                  disabled={currentStep === 0 && !step0Input.trim() && !draft.chiefComplaint}
                  onClick={handleProceedNext}
                  className={`py-2 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                    currentStep > 0 || step0Input.trim() || draft.chiefComplaint
                      ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>{currentStep === 7 ? t('anamnesisStepReviewAndDeepen') : t('anamnesisNavNext')}</span>
                  <span className="font-bold ml-1">→</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFinishAndSave}
                className="py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <span className="font-bold text-white mr-1">✓</span>
                <span>{t('anamnesisNavFinish')}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* HINWEIS: NOCH KEINE DATEN IN DIESER SÄULE HINTERLEGT */}
      {showEmptyPillarWarning && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-amber-200 space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {t('anamnesisEmptyPillarWarningTitle')}
                </h4>
                <p className="text-xs font-semibold text-teal-800 mt-0.5">
                  {steps.find(s => s.idx === currentStep)?.label}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
              {t('anamnesisEmptyPillarWarningMessage', { pillar: steps.find(s => s.idx === currentStep)?.label || '' })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowEmptyPillarWarning(false)}
                className="px-4 py-2 rounded-xl border border-teal-600 text-teal-800 hover:bg-teal-50 text-xs font-bold cursor-pointer transition-colors"
              >
                {t('anamnesisEmptyPillarEditBtn')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEmptyPillarWarning(false);
                  advanceToNextStep();
                }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
              >
                {t('anamnesisEmptyPillarProceedBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABBRUCH-BESTÄTIGUNGSDIALOG */}
      {showCancelConfirm && !showDiscardConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {t('anamnesisCancelModalTitle')}
                </h4>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  {t('anamnesisCancelModalQuestion')}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {t('anamnesisCancelModalInfo')}
            </p>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleRejectCancel}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
              >
                {t('anamnesisCancelModalStay')}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  {t('anamnesisCancelModalReject')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelWithSave}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <span>{t('anamnesisCancelModalConfirm')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KONTROLLFRAGE BEI OHNE SPEICHERUNG */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {t('anamnesisDiscardConfirmTitle')}
                </h4>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  {t('anamnesisDiscardConfirmQuestion')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                {t('anamnesisDiscardConfirmCancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelWithoutSave}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
              >
                {t('anamnesisDiscardConfirmYes')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
