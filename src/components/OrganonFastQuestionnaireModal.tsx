import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { EndprueferResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Zap,
  Info,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Shield,
  FileText
} from 'lucide-react';

export interface OrganonFastQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  stage1Values?: Record<string, string>;
  endprueferResult?: EndprueferResult | null;
  arbitratorResult?: any;
  onAdoptResults: (synthesizedRecords: Record<string, any>, fullSummaryText: string) => void;
}

interface ChipItem {
  id: string;
  labelKey: TranslationKey;
  searchTerms: string[];
}

export const OrganonFastQuestionnaireModal: React.FC<OrganonFastQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  rawText,
  stage1Values,
  endprueferResult,
  arbitratorResult,
  onAdoptResults
}) => {
  const { t } = useTranslation();

  // Active section tab for quick jump
  const [activeSection, setActiveSection] = useState<'causa' | 'localisatio' | 'sensatio' | 'modalities' | 'concomitants' | 'mind'>('causa');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sectionSequence: Array<'causa' | 'localisatio' | 'sensatio' | 'modalities' | 'concomitants' | 'mind'> = [
    'causa',
    'localisatio',
    'sensatio',
    'modalities',
    'concomitants',
    'mind'
  ];

  const currentSectionIndex = sectionSequence.indexOf(activeSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sectionSequence.length - 1;

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setActiveSection(sectionSequence[currentSectionIndex - 1]);
      scrollToTop();
    }
  };

  const goToNextSection = () => {
    if (currentSectionIndex < sectionSequence.length - 1) {
      setActiveSection(sectionSequence[currentSectionIndex + 1]);
      scrollToTop();
    } else {
      handleValidateAndSubmit();
    }
  };

  const handleSelectTab = (tab: 'causa' | 'localisatio' | 'sensatio' | 'modalities' | 'concomitants' | 'mind') => {
    setActiveSection(tab);
    scrollToTop();
  };

  // Selected chip IDs per module
  const [selectedCausa, setSelectedCausa] = useState<Set<string>>(new Set());
  const [selectedLoc, setSelectedLoc] = useState<Set<string>>(new Set());
  const [selectedSens, setSelectedSens] = useState<Set<string>>(new Set());
  const [selectedModWorse, setSelectedModWorse] = useState<Set<string>>(new Set());
  const [selectedModBetter, setSelectedModBetter] = useState<Set<string>>(new Set());
  const [selectedConcom, setSelectedConcom] = useState<Set<string>>(new Set());
  const [selectedMind, setSelectedMind] = useState<Set<string>>(new Set());

  // Automatically detected pre-selections from text & Decisor (for visual indicator)
  const [autoPreselected, setAutoPreselected] = useState<Set<string>>(new Set());

  // Custom patient descriptions / free text
  const [customCausa, setCustomCausa] = useState<string>('');
  const [customLoc, setCustomLoc] = useState<string>('');
  const [customSens, setCustomSens] = useState<string>('');
  const [customModWorse, setCustomModWorse] = useState<string>('');
  const [customModBetter, setCustomModBetter] = useState<string>('');
  const [customConcom, setCustomConcom] = useState<string>('');
  const [customMind, setCustomMind] = useState<string>('');

  // Clarification state (when system detects ambiguity or questions)
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [clarificationData, setClarificationData] = useState<{
    needsClarification: boolean;
    question: string;
    options: string[];
    reason?: string;
    synthesizedSummary?: string;
    categorySynthesis?: Record<string, string>;
  } | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState<string>('');

  // 1. Definition of Hahnemannian Chips (§§ 83–104)
  const causaChipsEmotional: ChipItem[] = useMemo(() => [
    { id: 'optCausaGrief', labelKey: 'optCausaGrief', searchTerms: ['kummer', 'trauer', 'traurig', 'verlust', 'grief', 'sorrow'] },
    { id: 'optCausaFright', labelKey: 'optCausaFright', searchTerms: ['schreck', 'angst', 'panik', 'furcht', 'fright', 'fear'] },
    { id: 'optCausaAnger', labelKey: 'optCausaAnger', searchTerms: ['ärger', 'zorn', 'wut', 'kränk', 'anger', 'vexation'] },
    { id: 'optCausaMortification', labelKey: 'optCausaMortification', searchTerms: ['demütigung', 'kränkung', 'beschämt', 'mortification'] },
    { id: 'optCausaOverwork', labelKey: 'optCausaOverwork', searchTerms: ['überarbeit', 'erschöpfung', 'stress', 'burnout', 'overwork'] },
    { id: 'optCausaSleepDeprivation', labelKey: 'optCausaSleepDeprivation', searchTerms: ['schlafmangel', 'wachen', 'nachtarbeit', 'sleep'] }
  ], []);

  const causaChipsPhysical: ChipItem[] = useMemo(() => [
    { id: 'optCausaCold', labelKey: 'optCausaCold', searchTerms: ['kälte', 'frost', 'frieren', 'abkühlung', 'cold', 'frost'] },
    { id: 'optCausaWetCold', labelKey: 'optCausaWetCold', searchTerms: ['nass', 'durchnäss', 'regen', 'feucht', 'wet', 'damp'] },
    { id: 'optCausaDraft', labelKey: 'optCausaDraft', searchTerms: ['zugluft', 'wind', 'durchzug', 'draft'] },
    { id: 'optCausaHeat', labelKey: 'optCausaHeat', searchTerms: ['hitze', 'sonnenstich', 'sonne', 'überhitzung', 'heat', 'sun'] },
    { id: 'optCausaSuppression', labelKey: 'optCausaSuppression', searchTerms: ['unterdrück', 'ausschlag', 'absonderung', 'suppress'] },
    { id: 'optCausaTrauma', labelKey: 'optCausaTrauma', searchTerms: ['verletzung', 'trauma', 'schlag', 'sturz', 'unfall', 'injury'] },
    { id: 'optCausaDiet', labelKey: 'optCausaDiet', searchTerms: ['diätfehler', 'alkohol', 'kaffee', 'essen', 'magen', 'diet'] },
    { id: 'optCausaVaccination', labelKey: 'optCausaVaccination', searchTerms: ['impfung', 'arznei', 'medikament', 'vaccin'] }
  ], []);

  const locChipsLaterality: ChipItem[] = useMemo(() => [
    { id: 'optLocRight', labelKey: 'optLocRight', searchTerms: ['rechts', 'rechter', 'rechte', 'right'] },
    { id: 'optLocLeft', labelKey: 'optLocLeft', searchTerms: ['links', 'linker', 'linke', 'left'] },
    { id: 'optLocBoth', labelKey: 'optLocBoth', searchTerms: ['beidseitig', 'beide', 'both', 'bilateral'] },
    { id: 'optLocAlternating', labelKey: 'optLocAlternating', searchTerms: ['seitenwechselnd', 'wechselnd', 'alternating'] },
    { id: 'optLocDiagonal', labelKey: 'optLocDiagonal', searchTerms: ['diagonal', 'schräg', 'diagonal'] }
  ], []);

  const locChipsRegions: ChipItem[] = useMemo(() => [
    { id: 'optLocHead', labelKey: 'optLocHead', searchTerms: ['kopf', 'stirn', 'cephalea', 'migräne', 'head', 'forehead'] },
    { id: 'optLocTemples', labelKey: 'optLocTemples', searchTerms: ['schläfe', 'hinterkopf', 'occiput', 'temple'] },
    { id: 'optLocEyesEars', labelKey: 'optLocEyesEars', searchTerms: ['auge', 'augen', 'ohr', 'ohren', 'eye', 'ear'] },
    { id: 'optLocFaceJaw', labelKey: 'optLocFaceJaw', searchTerms: ['gesicht', 'kiefer', 'zahn', 'face', 'jaw'] },
    { id: 'optLocThroat', labelKey: 'optLocThroat', searchTerms: ['hals', 'kehle', 'schlucken', 'mandel', 'throat'] },
    { id: 'optLocChest', labelKey: 'optLocChest', searchTerms: ['thorax', 'brust', 'brustkorb', 'lunge', 'husten', 'chest'] },
    { id: 'optLocHeart', labelKey: 'optLocHeart', searchTerms: ['herz', 'präcordial', 'herzregion', 'heart'] },
    { id: 'optLocStomach', labelKey: 'optLocStomach', searchTerms: ['magen', 'epigastr', 'sodbrennen', 'übelkeit', 'stomach'] },
    { id: 'optLocAbdomen', labelKey: 'optLocAbdomen', searchTerms: ['abdomen', 'bauch', 'darm', 'unterleib', 'abdomen'] },
    { id: 'optLocBack', labelKey: 'optLocBack', searchTerms: ['rücken', 'lenden', 'lws', 'kreuz', 'wirbel', 'back'] },
    { id: 'optLocShoulderNeck', labelKey: 'optLocShoulderNeck', searchTerms: ['schulter', 'nacken', 'halswirbel', 'shoulder', 'neck'] },
    { id: 'optLocArmsHands', labelKey: 'optLocArmsHands', searchTerms: ['arm', 'arme', 'hand', 'hände', 'finger', 'arm', 'hand'] },
    { id: 'optLocLegsKnees', labelKey: 'optLocLegsKnees', searchTerms: ['bein', 'beine', 'knie', 'hüfte', 'schenkel', 'leg', 'knee'] },
    { id: 'optLocFeetJoints', labelKey: 'optLocFeetJoints', searchTerms: ['fuß', 'füße', 'sprunggelenk', 'zehen', 'foot', 'feet'] }
  ], []);

  const locChipsRadiation: ChipItem[] = useMemo(() => [
    { id: 'optLocNoRadiation', labelKey: 'optLocNoRadiation', searchTerms: ['keine ausstrahlung', 'punktuell', 'lokal fixiert'] },
    { id: 'optLocRadUpward', labelKey: 'optLocRadUpward', searchTerms: ['nach oben', 'aufsteigend', 'upward'] },
    { id: 'optLocRadBack', labelKey: 'optLocRadBack', searchTerms: ['in den rücken', 'in den nacken', 'nach hinten'] },
    { id: 'optLocRadDown', labelKey: 'optLocRadDown', searchTerms: ['nach unten', 'in die beine', 'absteigend', 'downward'] },
    { id: 'optLocRadShoulder', labelKey: 'optLocRadShoulder', searchTerms: ['in die schulter', 'in den arm', 'in arme'] },
    { id: 'optLocRadWandering', labelKey: 'optLocRadWandering', searchTerms: ['wandernd', 'springend', 'wandert'] }
  ], []);

  const sensChips: ChipItem[] = useMemo(() => [
    { id: 'optSensStitching', labelKey: 'optSensStitching', searchTerms: ['stech', 'stich', 'stabbing', 'stitch'] },
    { id: 'optSensBurning', labelKey: 'optSensBurning', searchTerms: ['brenn', 'brand', 'burning', 'burn'] },
    { id: 'optSensPulsating', labelKey: 'optSensPulsating', searchTerms: ['pulsier', 'poch', 'puls', 'pulsat', 'throb'] },
    { id: 'optSensPressing', labelKey: 'optSensPressing', searchTerms: ['drück', 'druck', 'schwere', 'pressing', 'press'] },
    { id: 'optSensTearing', labelKey: 'optSensTearing', searchTerms: ['reiß', 'zerreiß', 'tearing', 'tear'] },
    { id: 'optSensCramping', labelKey: 'optSensCramping', searchTerms: ['krampf', 'spast', 'krampfig', 'cramp', 'spasm'] },
    { id: 'optSensDull', labelKey: 'optSensDull', searchTerms: ['dumpf', 'diffus', 'dull'] },
    { id: 'optSensBruised', labelKey: 'optSensBruised', searchTerms: ['wund', 'zerschlagen', 'wundheitsgefühl', 'bruised', 'sore'] },
    { id: 'optSensHammering', labelKey: 'optSensHammering', searchTerms: ['hämmer', 'hammer', 'hammering'] },
    { id: 'optSensThrobbing', labelKey: 'optSensThrobbing', searchTerms: ['klopf', 'klopfen', 'throbbing'] },
    { id: 'optSensSplinter', labelKey: 'optSensSplinter', searchTerms: ['splitter', 'nadelstich', 'splinter', 'needle'] },
    { id: 'optSensDrawing', labelKey: 'optSensDrawing', searchTerms: ['zieh', 'ziehend', 'drawing'] },
    { id: 'optSensCutting', labelKey: 'optSensCutting', searchTerms: ['schneid', 'schneidend', 'cutting'] },
    { id: 'optSensNumbness', labelKey: 'optSensNumbness', searchTerms: ['taub', 'kribbel', 'pelzig', 'numb', 'tingling'] },
    { id: 'optSensConstricting', labelKey: 'optSensConstricting', searchTerms: ['zusammenschnür', 'band', 'beengung', 'constrict'] }
  ], []);

  const modWorseChips: ChipItem[] = useMemo(() => [
    { id: 'optModWorseCold', labelKey: 'optModWorseCold', searchTerms: ['kälte', 'kaltes wetter', 'frost', '< kälte'] },
    { id: 'optModWorseWarmth', labelKey: 'optModWorseWarmth', searchTerms: ['wärme', 'hitze', 'zimmer', '< wärme'] },
    { id: 'optModWorseRest', labelKey: 'optModWorseRest', searchTerms: ['ruhe', 'sitzen', 'stilliegen', '< ruhe'] },
    { id: 'optModWorseMotionBeginning', labelKey: 'optModWorseMotionBeginning', searchTerms: ['beginn der bewegung', 'anfang', 'aufstehen'] },
    { id: 'optModWorseContinuedMotion', labelKey: 'optModWorseContinuedMotion', searchTerms: ['bewegung', 'fortgesetzte bewegung', 'gehen'] },
    { id: 'optModWorseTouch', labelKey: 'optModWorseTouch', searchTerms: ['berührung', 'leichte berührung', '< berührung'] },
    { id: 'optModWorsePressure', labelKey: 'optModWorsePressure', searchTerms: ['druck', 'kleidung', 'bund', '< druck'] },
    { id: 'optModWorseDraft', labelKey: 'optModWorseDraft', searchTerms: ['zugluft', 'wind', 'lüften'] },
    { id: 'optModWorseMorning', labelKey: 'optModWorseMorning', searchTerms: ['morgens', 'erwachen', 'aufwachen', 'früh'] },
    { id: 'optModWorseAfternoon', labelKey: 'optModWorseAfternoon', searchTerms: ['nachmittags', '16 uhr', '17 uhr', '18 uhr'] },
    { id: 'optModWorseEvening', labelKey: 'optModWorseEvening', searchTerms: ['abends', 'dämmerung', 'abend'] },
    { id: 'optModWorseNight', labelKey: 'optModWorseNight', searchTerms: ['nachts', 'mitternacht', 'schlaf'] },
    { id: 'optModWorseEating', labelKey: 'optModWorseEating', searchTerms: ['nach dem essen', 'nahrungsaufnahme', 'speisen'] },
    { id: 'optModWorseLyingPainSide', labelKey: 'optModWorseLyingPainSide', searchTerms: ['auf kranker seite', 'schmerzhafte seite'] }
  ], []);

  const modBetterChips: ChipItem[] = useMemo(() => [
    { id: 'optModBetterFreshAir', labelKey: 'optModBetterFreshAir', searchTerms: ['frische luft', 'kühle', 'draussen', '> frische luft'] },
    { id: 'optModBetterWarmth', labelKey: 'optModBetterWarmth', searchTerms: ['wärme', 'einhüllen', 'wärmflasche', '> wärme'] },
    { id: 'optModBetterRest', labelKey: 'optModBetterRest', searchTerms: ['ruhe', 'stilliegen', 'augen schliessen', '> ruhe'] },
    { id: 'optModBetterMotion', labelKey: 'optModBetterMotion', searchTerms: ['fortgesetzte bewegung', 'herumgehen', '> bewegung'] },
    { id: 'optModBetterHardPressure', labelKey: 'optModBetterHardPressure', searchTerms: ['fester druck', 'gegendrücken', '> druck'] },
    { id: 'optModBetterColdCompress', labelKey: 'optModBetterColdCompress', searchTerms: ['kalte umschläge', 'kühlen', 'kaltes wasser'] },
    { id: 'optModBetterLyingDown', labelKey: 'optModBetterLyingDown', searchTerms: ['liegen', 'bettruhe', 'hinlegen'] },
    { id: 'optModBetterWarmDrinks', labelKey: 'optModBetterWarmDrinks', searchTerms: ['warme getränke', 'tee', 'warmes essen'] },
    { id: 'optModBetterAlone', labelKey: 'optModBetterAlone', searchTerms: ['alleinsein', 'dunkelheit', 'ruhe vor menschen'] }
  ], []);

  const concomChips: ChipItem[] = useMemo(() => [
    { id: 'optConcomChilly', labelKey: 'optConcomChilly', searchTerms: ['frostig', 'friert', 'schüttelfrost', 'chilly'] },
    { id: 'optConcomWarmBlooded', labelKey: 'optConcomWarmBlooded', searchTerms: ['hitzig', 'wirft decke ab', 'heiß'] },
    { id: 'optConcomHotFlashes', labelKey: 'optConcomHotFlashes', searchTerms: ['fliegende hitze', 'wallungen', 'hitzewallung'] },
    { id: 'optConcomColdSweat', labelKey: 'optConcomColdSweat', searchTerms: ['kalter schweiß', 'kaltschweißig'] },
    { id: 'optConcomWarmSweat', labelKey: 'optConcomWarmSweat', searchTerms: ['warmer schweiß', 'reichlich schweiß'] },
    { id: 'optConcomColdExtremities', labelKey: 'optConcomColdExtremities', searchTerms: ['kalte füße', 'kalte hände', 'eiskalt'] },
    { id: 'optConcomGreatThirstCold', labelKey: 'optConcomGreatThirstCold', searchTerms: ['großer durst', 'kaltes wasser', 'durst'] },
    { id: 'optConcomThirstless', labelKey: 'optConcomThirstless', searchTerms: ['durstlos', 'kein durst', 'trinkt kaum'] },
    { id: 'optConcomSips', labelKey: 'optConcomSips', searchTerms: ['kleine schlucke', 'häufig kleine schlucke'] },
    { id: 'optConcomWarmDrinksDesire', labelKey: 'optConcomWarmDrinksDesire', searchTerms: ['verlangen nach warm', 'warme getränke'] },
    { id: 'optConcomRestlessSleep', labelKey: 'optConcomRestlessSleep', searchTerms: ['unruhiger schlaf', 'wälzen', 'umherwerfen'] },
    { id: 'optConcomWakeEarly', labelKey: 'optConcomWakeEarly', searchTerms: ['erwachen 2', 'erwachen 3', 'erwachen 4', 'früh aufwachen'] },
    { id: 'optConcomSuddenWeakness', labelKey: 'optConcomSuddenWeakness', searchTerms: ['schwäche', 'kräfteverfall', 'prostration', 'matt'] }
  ], []);

  const mindChips: ChipItem[] = useMemo(() => [
    { id: 'optMindIrritable', labelKey: 'optMindIrritable', searchTerms: ['reizbar', 'zornig', 'will nicht angesprochen', 'wütend'] },
    { id: 'optMindAnxious', labelKey: 'optMindAnxious', searchTerms: ['ängstlich', 'angst', 'furcht', 'panik'] },
    { id: 'optMindWeepy', labelKey: 'optMindWeepy', searchTerms: ['weinerlich', 'trost', 'weinen', 'anhänglich'] },
    { id: 'optMindApathetic', labelKey: 'optMindApathetic', searchTerms: ['apathisch', 'gleichgültig', 'teilnahmslos'] },
    { id: 'optMindRestless', labelKey: 'optMindRestless', searchTerms: ['unruhig', 'rastlos', 'treibt umher'] },
    { id: 'optMindDespairing', labelKey: 'optMindDespairing', searchTerms: ['verzweifelt', 'ungeduldig', 'klagt', 'jammert'] },
    { id: 'optMindSilentGrief', labelKey: 'optMindSilentGrief', searchTerms: ['stiller kummer', 'in sich gekehrt', 'schweigsam'] },
    { id: 'optMindStartled', labelKey: 'optMindStartled', searchTerms: ['schreckhaft', 'zusammenfahren', 'lärmempfindlich'] }
  ], []);

  // 2. Intelligent Pre-Selection from Raw Text & Decisor
  useEffect(() => {
    if (!isOpen) return;

    // Combine text pool for smart detection
    const textPoolParts: string[] = [rawText || ''];

    if (stage1Values) {
      Object.values(stage1Values).forEach(v => textPoolParts.push(v));
    }

    if (endprueferResult) {
      if (Array.isArray(endprueferResult.category_checks)) {
        endprueferResult.category_checks.forEach(c => {
          textPoolParts.push(c.category || '');
          textPoolParts.push(c.schiedsrichter_result || '');
          textPoolParts.push(c.minimal_correction || '');
          textPoolParts.push(c.reasoning || '');
        });
      }
      if (endprueferResult.final_corrected_output) {
        textPoolParts.push(endprueferResult.final_corrected_output);
      }
    }

    if (arbitratorResult) {
      if (Array.isArray(arbitratorResult.categoryDecisions)) {
        arbitratorResult.categoryDecisions.forEach((cd: any) => {
          textPoolParts.push(cd.approvedText || '');
          textPoolParts.push(cd.rationale || '');
        });
      }
    }

    const fullNormalizedText = textPoolParts.join(' ').toLowerCase();

    const preselectedIds = new Set<string>();

    const checkAndAdd = (chips: ChipItem[], targetSet: Set<string>) => {
      chips.forEach(chip => {
        const matched = chip.searchTerms.some(term => fullNormalizedText.includes(term.toLowerCase()));
        if (matched) {
          targetSet.add(chip.id);
          preselectedIds.add(chip.id);
        }
      });
    };

    const newCausa = new Set<string>();
    const newLoc = new Set<string>();
    const newSens = new Set<string>();
    const newModWorse = new Set<string>();
    const newModBetter = new Set<string>();
    const newConcom = new Set<string>();
    const newMind = new Set<string>();

    checkAndAdd(causaChipsEmotional, newCausa);
    checkAndAdd(causaChipsPhysical, newCausa);
    checkAndAdd(locChipsLaterality, newLoc);
    checkAndAdd(locChipsRegions, newLoc);
    checkAndAdd(locChipsRadiation, newLoc);
    checkAndAdd(sensChips, newSens);
    checkAndAdd(modWorseChips, newModWorse);
    checkAndAdd(modBetterChips, newModBetter);
    checkAndAdd(concomChips, newConcom);
    checkAndAdd(mindChips, newMind);

    setSelectedCausa(newCausa);
    setSelectedLoc(newLoc);
    setSelectedSens(newSens);
    setSelectedModWorse(newModWorse);
    setSelectedModBetter(newModBetter);
    setSelectedConcom(newConcom);
    setSelectedMind(newMind);
    setAutoPreselected(preselectedIds);

    // Also populate custom note fields if specific text exists
    if (stage1Values?.['CAUSA'] && !customCausa) {
      setCustomCausa(stage1Values['CAUSA'].trim());
    }
    if (stage1Values?.['LOCALISATIO'] && !customLoc) {
      setCustomLoc(stage1Values['LOCALISATIO'].trim());
    }
    if (stage1Values?.['SENSATIO'] && !customSens) {
      setCustomSens(stage1Values['SENSATIO'].trim());
    }
  }, [isOpen, rawText, stage1Values, endprueferResult, arbitratorResult]);

  // Toggle helper
  const toggleChip = (id: string, currentSet: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Total count of selected items
  const totalCount = useMemo(() => {
    return (
      selectedCausa.size +
      selectedLoc.size +
      selectedSens.size +
      selectedModWorse.size +
      selectedModBetter.size +
      selectedConcom.size +
      selectedMind.size +
      (customCausa.trim() ? 1 : 0) +
      (customLoc.trim() ? 1 : 0) +
      (customSens.trim() ? 1 : 0) +
      (customModWorse.trim() ? 1 : 0) +
      (customModBetter.trim() ? 1 : 0) +
      (customConcom.trim() ? 1 : 0) +
      (customMind.trim() ? 1 : 0)
    );
  }, [
    selectedCausa,
    selectedLoc,
    selectedSens,
    selectedModWorse,
    selectedModBetter,
    selectedConcom,
    selectedMind,
    customCausa,
    customLoc,
    customSens,
    customModWorse,
    customModBetter,
    customConcom,
    customMind
  ]);

  // Format labels from IDs for API or local synthesis
  const mapIdsToLabels = (ids: Set<string>, chips: ChipItem[]): string[] => {
    const chipMap = new Map(chips.map(c => [c.id, c.labelKey]));
    return Array.from(ids).map(id => {
      const key = chipMap.get(id);
      return key ? t(key) : id;
    });
  };

  const allChips = useMemo(() => [
    ...causaChipsEmotional,
    ...causaChipsPhysical,
    ...locChipsLaterality,
    ...locChipsRegions,
    ...locChipsRadiation,
    ...sensChips,
    ...modWorseChips,
    ...modBetterChips,
    ...concomChips,
    ...mindChips
  ], [
    causaChipsEmotional,
    causaChipsPhysical,
    locChipsLaterality,
    locChipsRegions,
    locChipsRadiation,
    sensChips,
    modWorseChips,
    modBetterChips,
    concomChips,
    mindChips
  ]);

  // Handle Submit & Validation (§§ 83–104 review)
  const handleValidateAndSubmit = async () => {
    setIsValidating(true);
    setClarificationData(null);

    const causaLabels = [...mapIdsToLabels(selectedCausa, allChips), customCausa.trim()].filter(Boolean);
    const locLabels = [...mapIdsToLabels(selectedLoc, allChips), customLoc.trim()].filter(Boolean);
    const sensLabels = [...mapIdsToLabels(selectedSens, allChips), customSens.trim()].filter(Boolean);
    const modWorseLabels = [...mapIdsToLabels(selectedModWorse, allChips), customModWorse.trim()].filter(Boolean);
    const modBetterLabels = [...mapIdsToLabels(selectedModBetter, allChips), customModBetter.trim()].filter(Boolean);
    const concomLabels = [...mapIdsToLabels(selectedConcom, allChips), customConcom.trim()].filter(Boolean);
    const mindLabels = [...mapIdsToLabels(selectedMind, allChips), customMind.trim()].filter(Boolean);

    const answersPayload = {
      causa: causaLabels,
      localisatio: locLabels,
      sensatio: sensLabels,
      modalitiesWorse: modWorseLabels,
      modalitiesBetter: modBetterLabels,
      concomitants: concomLabels,
      mind: mindLabels,
      customNotes: {
        causa: customCausa,
        localisatio: customLoc,
        sensatio: customSens,
        modalitiesWorse: customModWorse,
        modalitiesBetter: customModBetter,
        concomitants: customConcom,
        mind: customMind
      }
    };

    // Client-side quick clinical ambiguity check (fail-safe)
    let localClarification: {
      needsClarification: boolean;
      question: string;
      options: string[];
      reason?: string;
    } | null = null;

    // Check for custom pain ambiguity (e.g. user mentioned "wie hämmern" or unusual expressions)
    const customPainLower = customSens.toLowerCase();
    if (customPainLower.includes('hämmer') || customPainLower.includes('hammer')) {
      localClarification = {
        needsClarification: true,
        question: t('optSensHammering') + ': ' + t('organonFastClarificationSubtitle') + ' ' + (customSens || t('optSensHammering')),
        options: [
          'Pulsierend / synchron zum Herzschlag',
          'Verschlimmerung durch Erschütterung und jede Bewegung',
          'Dumpf-rhythmisches Hämmern in Ruhe'
        ],
        reason: 'Hahnemann § 86: Präzisierung des Schmerzcharakters bei Hämmern.'
      };
    } else if (selectedModWorse.has('optModWorseCold') && selectedModBetter.has('optModBetterColdCompress')) {
      localClarification = {
        needsClarification: true,
        question: 'Kälte-Modalität: Sie haben sowohl Verschlimmerung durch Kälte (<) als auch Besserung durch kalte Umschläge (>) gewählt. Bezieht sich die Besserung lokal auf die schmerzhafte Stelle und die Verschlechterung auf den Gesamtkörper?',
        options: [
          'Ja: Kopf / lokale Stelle > Kälte, Gesamtkörper < Kälte',
          'Kälte bessert generell',
          'Kälte verschlimmert generell'
        ],
        reason: 'Hahnemann § 95: Widerspruchsauflösung lokaler vs. allgemeiner Modalitäten.'
      };
    }

    try {
      const response = await fetch('/api/organon/fast-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          answers: answersPayload,
          endprueferResult
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.needsClarification && data.clarificationQuestion) {
          setClarificationData({
            needsClarification: true,
            question: data.clarificationQuestion,
            options: data.clarificationOptions || [],
            reason: data.clarificationReason,
            synthesizedSummary: data.synthesizedSummary,
            categorySynthesis: data.categorySynthesis
          });
          setIsValidating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Fast validate API notice, using local clinical synthesis:', err);
    }

    if (localClarification && localClarification.needsClarification) {
      setClarificationData({
        needsClarification: true,
        question: localClarification.question,
        options: localClarification.options,
        reason: localClarification.reason
      });
      setIsValidating(false);
      return;
    }

    // No clarification needed -> finalize directly!
    finalizeAndAdopt(answersPayload);
  };

  // Finalize and adopt results
  const finalizeAndAdopt = (answersPayload: any, clarificationText?: string) => {
    const causaText = [
      ...mapIdsToLabels(selectedCausa, allChips),
      customCausa.trim()
    ].filter(Boolean).join(', ');

    const locText = [
      ...mapIdsToLabels(selectedLoc, allChips),
      customLoc.trim()
    ].filter(Boolean).join(', ');

    let sensText = [
      ...mapIdsToLabels(selectedSens, allChips),
      customSens.trim()
    ].filter(Boolean).join(', ');

    if (clarificationText && clarificationText.trim()) {
      sensText = sensText ? `${sensText} (${clarificationText.trim()})` : clarificationText.trim();
    }

    const modBetterText = [
      ...mapIdsToLabels(selectedModBetter, allChips),
      customModBetter.trim()
    ].filter(Boolean).map(s => s.startsWith('>') ? s : `> ${s}`).join(', ');

    const modWorseText = [
      ...mapIdsToLabels(selectedModWorse, allChips),
      customModWorse.trim()
    ].filter(Boolean).map(s => s.startsWith('<') ? s : `< ${s}`).join(', ');

    const concomText = [
      ...mapIdsToLabels(selectedConcom, allChips),
      customConcom.trim()
    ].filter(Boolean).join(', ');

    const mindText = [
      ...mapIdsToLabels(selectedMind, allChips),
      customMind.trim()
    ].filter(Boolean).join(', ');

    const fullSummaryLines: string[] = [
      `[Hahnemann Organon §§ 83–104 - Organon Fast Befund]`,
      causaText ? `• Causa: ${causaText}` : '',
      locText ? `• Localisatio: ${locText}` : '',
      sensText ? `• Sensatio: ${sensText}` : '',
      modWorseText ? `• Modalitates (<): ${modWorseText}` : '',
      modBetterText ? `• Modalitates (>): ${modBetterText}` : '',
      concomText ? `• Concomitantia: ${concomText}` : '',
      mindText ? `• Gemüt: ${mindText}` : ''
    ].filter(Boolean);

    const fullSummary = fullSummaryLines.join('\n');

    const records: Record<string, any> = {
      CAUSA: { category: 'CAUSA', status: 'COMPLETED', text: causaText, timestamp: new Date().toISOString() },
      LOCALISATIO: { category: 'LOCALISATIO', status: 'COMPLETED', text: locText, timestamp: new Date().toISOString() },
      SENSATIO: { category: 'SENSATIO', status: 'COMPLETED', text: sensText, timestamp: new Date().toISOString() },
      SYMPTOMA: { category: 'SYMPTOMA', status: 'COMPLETED', text: `${locText}: ${sensText}`.trim(), timestamp: new Date().toISOString() },
      MODALITATES_BESSERUNG: { category: 'MODALITATES_BESSERUNG', status: 'COMPLETED', text: modBetterText, timestamp: new Date().toISOString() },
      MODALITATES_VERSCHLECHTERUNG: { category: 'MODALITATES_VERSCHLECHTERUNG', status: 'COMPLETED', text: modWorseText, timestamp: new Date().toISOString() },
      SYMPTOMATA_CONCOMITANTIA: { category: 'SYMPTOMATA_CONCOMITANTIA', status: 'COMPLETED', text: concomText, timestamp: new Date().toISOString() },
      COMORBIDITAS: { category: 'COMORBIDITAS', status: 'COMPLETED', text: '', timestamp: new Date().toISOString() },
      MENS: { category: 'MENS', status: 'COMPLETED', text: mindText, timestamp: new Date().toISOString() },
      ANIMUS: { category: 'ANIMUS', status: 'COMPLETED', text: mindText, timestamp: new Date().toISOString() }
    };

    onAdoptResults(records, fullSummary);
    setIsValidating(false);
    setClarificationData(null);
    onClose();
  };

  // Reset helper
  const handleReset = () => {
    setSelectedCausa(new Set());
    setSelectedLoc(new Set());
    setSelectedSens(new Set());
    setSelectedModWorse(new Set());
    setSelectedModBetter(new Set());
    setSelectedConcom(new Set());
    setSelectedMind(new Set());
    setCustomCausa('');
    setCustomLoc('');
    setCustomSens('');
    setCustomModWorse('');
    setCustomModBetter('');
    setCustomConcom('');
    setCustomMind('');
    setAutoPreselected(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl text-white shadow-md flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">{t('organonFastModalTitle')}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t('btnOrganonFast')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{t('organonFastModalSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700 text-xs font-semibold text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              {t('organonFastSelectedCount', { count: totalCount })}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('organonFastClose')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pre-selection notice banner */}
        <div className="bg-teal-50 border-b border-teal-200/80 px-4 py-2 flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-700 shrink-0" />
            <span>{t('organonFastPreselectedNotice')}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-teal-100/60 rounded-md font-medium transition-colors cursor-pointer text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('organonFastResetBtn')}</span>
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => handleSelectTab('causa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'causa'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>{t('organonFastSectionCausa')}</span>
            {selectedCausa.size > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-900 text-[10px] flex items-center justify-center font-bold">
                {selectedCausa.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('localisatio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'localisatio'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>{t('organonFastSectionLocalisatio')}</span>
            {selectedLoc.size > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-900 text-[10px] flex items-center justify-center font-bold">
                {selectedLoc.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('sensatio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'sensatio'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>{t('organonFastSectionSensatio')}</span>
            {selectedSens.size > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-900 text-[10px] flex items-center justify-center font-bold">
                {selectedSens.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('modalities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'modalities'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>{t('organonFastSectionModalities')}</span>
            {(selectedModWorse.size + selectedModBetter.size) > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-900 text-[10px] flex items-center justify-center font-bold">
                {selectedModWorse.size + selectedModBetter.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('concomitants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'concomitants'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>{t('organonFastSectionConcomitants')}</span>
            {selectedConcom.size > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-900 text-[10px] flex items-center justify-center font-bold">
                {selectedConcom.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('mind')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'mind'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>{t('organonFastSectionMind')}</span>
            {selectedMind.size > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-900 text-[10px] flex items-center justify-center font-bold">
                {selectedMind.size}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Clarification Drawer / Dialog if active */}
          <AnimatePresence>
            {clarificationData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 shadow-md space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-amber-900">{t('organonFastClarificationTitle')}</h3>
                    <p className="text-xs text-amber-800 mt-1 font-medium">{clarificationData.question}</p>
                    {clarificationData.reason && (
                      <p className="text-[11px] text-amber-700 mt-0.5 italic">{clarificationData.reason}</p>
                    )}
                  </div>
                </div>

                {clarificationData.options && clarificationData.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {clarificationData.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setClarificationAnswer(opt);
                          finalizeAndAdopt({}, opt);
                        }}
                        className="px-3 py-2 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950 text-left transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={clarificationAnswer}
                    onChange={(e) => setClarificationAnswer(e.target.value)}
                    placeholder={t('organonFastClarificationAnswerPlaceholder')}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => finalizeAndAdopt({}, clarificationAnswer)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('organonFastClarificationSubmit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => finalizeAndAdopt({}, '')}
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      {t('organonFastClarificationSkip')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 1: Causa & Auslöser (§§ 84, 93) */}
          <div className={`space-y-4 ${activeSection === 'causa' ? 'block' : 'hidden'}`}>
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {t('organonFastSectionCausa')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('organonFastSectionCausaDesc')}</p>
            </div>

            {/* Emotional */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('organonFastCausaEmotional')}</span>
              <div className="flex flex-wrap gap-2">
                {causaChipsEmotional.map(chip => {
                  const isSelected = selectedCausa.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedCausa, setSelectedCausa)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Physical / Environment */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('organonFastCausaPhysical')}</span>
              <div className="flex flex-wrap gap-2">
                {causaChipsPhysical.map(chip => {
                  const isSelected = selectedCausa.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedCausa, setSelectedCausa)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Causa Input */}
            <div className="pt-2">
              <textarea
                value={customCausa}
                onChange={(e) => setCustomCausa(e.target.value)}
                placeholder={t('organonFastCustomCausaPlaceholder')}
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 2: Localisatio & Ausstrahlung (§§ 84, 95) */}
          <div className={`space-y-4 ${activeSection === 'localisatio' ? 'block' : 'hidden'}`}>
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {t('organonFastSectionLocalisatio')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('organonFastSectionLocalisatioDesc')}</p>
            </div>

            {/* Laterality */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('organonFastLocLaterality')}</span>
              <div className="flex flex-wrap gap-2">
                {locChipsLaterality.map(chip => {
                  const isSelected = selectedLoc.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedLoc, setSelectedLoc)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body Regions */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('organonFastLocRegions')}</span>
              <div className="flex flex-wrap gap-2">
                {locChipsRegions.map(chip => {
                  const isSelected = selectedLoc.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedLoc, setSelectedLoc)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Radiation */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('organonFastLocRadiation')}</span>
              <div className="flex flex-wrap gap-2">
                {locChipsRadiation.map(chip => {
                  const isSelected = selectedLoc.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedLoc, setSelectedLoc)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Location Input */}
            <div className="pt-2">
              <textarea
                value={customLoc}
                onChange={(e) => setCustomLoc(e.target.value)}
                placeholder={t('organonFastCustomLocPlaceholder')}
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 3: Sensatio & Schmerzcharakter (§§ 84, 86, 95) */}
          <div className={`space-y-4 ${activeSection === 'sensatio' ? 'block' : 'hidden'}`}>
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {t('organonFastSectionSensatio')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('organonFastSectionSensatioDesc')}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('organonFastSensations')}</span>
              <div className="flex flex-wrap gap-2">
                {sensChips.map(chip => {
                  const isSelected = selectedSens.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedSens, setSelectedSens)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Sensation Input (e.g. 'wie Hämmern', 'wie heißes Öl') */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('organonFastCustomTextPlaceholder')}
              </label>
              <textarea
                value={customSens}
                onChange={(e) => setCustomSens(e.target.value)}
                placeholder={t('organonFastCustomPainPlaceholder')}
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 4: Modalitäten (§§ 86, 95) */}
          <div className={`space-y-5 ${activeSection === 'modalities' ? 'block' : 'hidden'}`}>
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {t('organonFastSectionModalities')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('organonFastSectionModalitiesDesc')}</p>
            </div>

            {/* Verschlimmerung (<) */}
            <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/70 space-y-2">
              <span className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {t('organonFastModWorse')}
              </span>
              <div className="flex flex-wrap gap-2">
                {modWorseChips.map(chip => {
                  const isSelected = selectedModWorse.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedModWorse, setSelectedModWorse)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-white hover:bg-red-100/60 text-slate-800 border border-red-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
              <textarea
                value={customModWorse}
                onChange={(e) => setCustomModWorse(e.target.value)}
                placeholder={t('organonFastCustomModWorsePlaceholder')}
                rows={1}
                className="w-full mt-2 p-2 text-xs bg-white border border-red-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Besserung (>) */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t('organonFastModBetter')}
              </span>
              <div className="flex flex-wrap gap-2">
                {modBetterChips.map(chip => {
                  const isSelected = selectedModBetter.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedModBetter, setSelectedModBetter)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white hover:bg-emerald-100/60 text-slate-800 border border-emerald-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
              <textarea
                value={customModBetter}
                onChange={(e) => setCustomModBetter(e.target.value)}
                placeholder={t('organonFastCustomModBetterPlaceholder')}
                rows={1}
                className="w-full mt-2 p-2 text-xs bg-white border border-emerald-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 5: Allgemeines & Begleitsymptome (§§ 88, 89, 94) */}
          <div className={`space-y-4 ${activeSection === 'concomitants' ? 'block' : 'hidden'}`}>
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {t('organonFastSectionConcomitants')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('organonFastSectionConcomitantsDesc')}</p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {concomChips.map(chip => {
                  const isSelected = selectedConcom.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedConcom, setSelectedConcom)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <textarea
                value={customConcom}
                onChange={(e) => setCustomConcom(e.target.value)}
                placeholder={t('organonFastCustomConcomPlaceholder')}
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Section 6: Gemüt & Psyche (§§ 210–230) */}
          <div className={`space-y-4 ${activeSection === 'mind' ? 'block' : 'hidden'}`}>
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                {t('organonFastSectionMind')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('organonFastSectionMindDesc')}</p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {mindChips.map(chip => {
                  const isSelected = selectedMind.has(chip.id);
                  const isAuto = autoPreselected.has(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleChip(chip.id, selectedMind, setSelectedMind)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      } ${isAuto && !isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{t(chip.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <textarea
                value={customMind}
                onChange={(e) => setCustomMind(e.target.value)}
                placeholder={t('organonFastCustomMindPlaceholder')}
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {!isFirstSection && (
              <button
                type="button"
                id="organon-fast-footer-prev-btn"
                onClick={goToPrevSection}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('organonFastBtnPrev')}</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 ml-1">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('organonFastSummaryTitle')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('organonFastClose')}
            </button>

            {!isLastSection ? (
              <>
                <button
                  type="button"
                  id="organon-fast-footer-adopt-and-continue-btn"
                  onClick={goToNextSection}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 hover:from-teal-800 hover:via-teal-900 hover:to-indigo-950 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
                >
                  <Check className="w-4 h-4 text-teal-300" />
                  <span>{t('organonFastAdoptAndContinue')}</span>
                  <ChevronRight className="w-4 h-4 text-teal-200" />
                </button>

                <button
                  type="button"
                  disabled={isValidating}
                  onClick={handleValidateAndSubmit}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                  title={t('organonFastValidateDirectBtn')}
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                      <span>{t('organonFastValidating')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t('organonFastValidateDirectBtn')}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                id="organon-fast-footer-adopt-and-finish-btn"
                disabled={isValidating}
                onClick={handleValidateAndSubmit}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 hover:from-emerald-700 hover:via-teal-800 hover:to-indigo-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>{t('organonFastValidating')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>{t('organonFastAdoptAndFinish')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
