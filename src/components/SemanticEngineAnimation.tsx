import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  ArrowRight, 
  Activity, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Check,
  Stethoscope,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export function SemanticEngineAnimation() {
  const { t, language } = useTranslation();
  const prevLangRef = useRef(language);
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Stages: 'typing' -> 'tokens' -> 'remedies' -> 'hold'
  const [stage, setStage] = useState<'typing' | 'tokens' | 'remedies' | 'hold'>('typing');
  const [typedChars, setTypedChars] = useState<number>(0);
  const [visibleTokens, setVisibleTokens] = useState<number>(0);
  const [visibleRemedies, setVisibleRemedies] = useState<number>(0);

  // When language switches mid-flight: reset typing counter so text isn't truncated or mismatched
  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      if (stage === 'typing') {
        setTypedChars(0);
      }
    }
  }, [language, stage]);

  // Define Case 1 & Case 2 data fully linked to i18n
  const cases = [
    {
      id: 'case1',
      title: t('landingSimCase1Title'),
      btnLabel: t('landingSimCase1Btn'),
      rawText: t('landingSimSampleText'),
      tokens: [
        { text: t('landingSimTag2'), chapter: t('landingSimChapterTime') },
        { text: t('landingSimTag1'), chapter: t('landingSimChapterMind') },
        { text: t('landingSimTag3'), chapter: t('landingSimChapterGeneral') },
        { text: t('landingSimTag4'), chapter: t('landingSimChapterModality') }
      ],
      remedies: [
        {
          name: t('landingSimRemedy1'),
          score: t('landingSimRemedy1Score'),
          percentage: 96,
          rubricsMatched: t('landingSimMatchedCount'),
          detail: t('landingSimRemedy1Detail'),
          isTop: true
        },
        {
          name: t('landingSimRemedy2'),
          score: t('landingSimRemedy2Score'),
          percentage: 91,
          rubricsMatched: "3 / 4",
          detail: t('landingSimRemedy2Detail'),
          isTop: false
        },
        {
          name: t('landingSimRemedy3'),
          score: t('landingSimRemedy3Score'),
          percentage: 82,
          rubricsMatched: "3 / 4",
          detail: t('landingSimRemedy3Detail'),
          isTop: false
        }
      ]
    },
    {
      id: 'case2',
      title: t('landingSimCase2Title'),
      btnLabel: t('landingSimCase2Btn'),
      rawText: t('landingSimSampleText2'),
      tokens: [
        { text: t('landingSimCase2Tag1'), chapter: t('landingSimChapterGeneral') },
        { text: t('landingSimCase2Tag2'), chapter: t('landingSimChapterModality') },
        { text: t('landingSimCase2Tag3'), chapter: t('landingSimChapterLocation') },
        { text: t('landingSimCase2Tag4'), chapter: t('landingSimChapterModality') }
      ],
      remedies: [
        {
          name: t('landingSimCase2Remedy1'),
          score: t('landingSimCase2Remedy1Score'),
          percentage: 95,
          rubricsMatched: t('landingSimMatchedCount'),
          detail: t('landingSimCase2Remedy1Detail'),
          isTop: true
        },
        {
          name: t('landingSimCase2Remedy2'),
          score: t('landingSimCase2Remedy2Score'),
          percentage: 88,
          rubricsMatched: "3 / 4",
          detail: t('landingSimCase2Remedy2Detail'),
          isTop: false
        },
        {
          name: t('landingSimCase2Remedy3'),
          score: t('landingSimCase2Remedy3Score'),
          percentage: 81,
          rubricsMatched: "3 / 4",
          detail: t('landingSimCase2Remedy3Detail'),
          isTop: false
        }
      ]
    }
  ];

  const currentCase = cases[activeCaseIndex];
  const fullText = currentCase.rawText;

  // Manual reset when changing cases or jumping
  const resetToCase = (index: number) => {
    setActiveCaseIndex(index);
    setStage('typing');
    setTypedChars(0);
    setVisibleTokens(0);
    setVisibleRemedies(0);
  };

  // Typewriter and sequential animation orchestration
  useEffect(() => {
    if (!isPlaying) return;

    // 1. Stage 'typing': fast single letter typing
    if (stage === 'typing') {
      if (typedChars < fullText.length) {
        const timer = setTimeout(() => {
          // Type 1-2 characters per tick for smooth natural fast speed (~16ms)
          setTypedChars(prev => Math.min(prev + 1, fullText.length));
        }, 16);
        return () => clearTimeout(timer);
      } else {
        // Typing finished, wait 350ms before showing recognized tokens
        const timer = setTimeout(() => {
          setStage('tokens');
          setVisibleTokens(1);
        }, 350);
        return () => clearTimeout(timer);
      }
    }

    // 2. Stage 'tokens': pop in each token sequentially
    if (stage === 'tokens') {
      if (visibleTokens < currentCase.tokens.length) {
        const timer = setTimeout(() => {
          setVisibleTokens(prev => prev + 1);
        }, 280);
        return () => clearTimeout(timer);
      } else {
        // All tokens visible, wait 400ms before showing remedies from top to bottom
        const timer = setTimeout(() => {
          setStage('remedies');
          setVisibleRemedies(1); // First reveal top remedy (index 0, Simile)
        }, 400);
        return () => clearTimeout(timer);
      }
    }

    // 3. Stage 'remedies': reveal remedies sequentially from top to bottom (idx 0 -> 1 -> 2)
    if (stage === 'remedies') {
      if (visibleRemedies < currentCase.remedies.length) {
        const timer = setTimeout(() => {
          setVisibleRemedies(prev => prev + 1);
        }, 450);
        return () => clearTimeout(timer);
      } else {
        // All remedies displayed, switch to hold
        const timer = setTimeout(() => {
          setStage('hold');
        }, 500);
        return () => clearTimeout(timer);
      }
    }

    // 4. Stage 'hold': hold visible for 5.5 seconds, then transition to next case
    if (stage === 'hold') {
      const timer = setTimeout(() => {
        const nextIndex = (activeCaseIndex + 1) % cases.length;
        resetToCase(nextIndex);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, stage, typedChars, visibleTokens, visibleRemedies, fullText.length, activeCaseIndex, currentCase.tokens.length, currentCase.remedies.length, cases.length]);

  return (
    <div 
      id="semantic-engine-animation-container" 
      className="relative w-full rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden font-sans text-slate-800 transition-all duration-300"
    >
      
      {/* 1. Header Bar in HomeoPilot360 Style (Clean, high-contrast slate-900 & teal accents) */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
            <BrainCircuit className="w-4 h-4 text-teal-400" />
            <span className="text-slate-100">{t('landingSimHeader')}</span>
          </div>
        </div>

        {/* Real-time status pill & Case controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-medium text-teal-300 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span>{t('landingSimLiveStatus')}</span>
          </div>

          {/* Case switch tabs */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => resetToCase(0)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                activeCaseIndex === 0 
                  ? 'bg-teal-700 text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('landingSimCase1Btn')}
            </button>
            <button
              onClick={() => resetToCase(1)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                activeCaseIndex === 1 
                  ? 'bg-teal-700 text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('landingSimCase2Btn')}
            </button>
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? t('landingSimPauseTooltip') : t('landingSimPlayTooltip')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-teal-300" /> : <Play className="w-3.5 h-3.5 text-emerald-300" />}
          </button>
        </div>
      </div>

      {/* 2. Step Progress Track (Refined HomeoPilot360 Sub-bar) */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-6 min-w-max">
          {[
            { label: t('landingSimStep1Label'), active: stage === 'typing', done: stage !== 'typing' },
            { label: t('landingSimStep2Label'), active: stage === 'tokens', done: stage === 'remedies' || stage === 'hold' },
            { label: t('landingSimStep3Label'), active: stage === 'remedies' || stage === 'hold', done: stage === 'hold' }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                item.active 
                  ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                  : item.done
                  ? 'text-slate-700'
                  : 'text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                item.active ? 'bg-teal-600 animate-pulse' : item.done ? 'bg-teal-700' : 'bg-slate-300'
              }`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
          <Zap className="w-3.5 h-3.5" />
          <span>{t('landingSimSpeed')}</span>
        </div>
      </div>

      {/* 3. Main Clinical Simulation Viewport (HomeoPilot360 White & Soft Teal Theme) */}
      <div className="p-4 sm:p-6 lg:p-7 grid lg:grid-cols-12 gap-6 bg-[#FAFBFB]">
        
        {/* Left Column (5 Cols): Live Anamnesis Typewriter & Extracted Symptoms */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 pb-5 sm:pb-6 shadow-sm">
            {/* Anamnesis Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                  {t('landingSimLiveTyping')}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                {currentCase.title}
              </span>
            </div>

            {/* Typewriter Text Container - Fixed Height to fit full text without cut-off */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans min-h-[175px] h-[175px] sm:h-[180px] overflow-y-auto">
              <span>{stage === 'typing' ? fullText.slice(0, typedChars) : fullText}</span>
              {stage === 'typing' && (
                <span className="inline-block w-0.5 h-4 bg-teal-600 ml-0.5 align-middle animate-pulse" />
              )}
            </div>

            {/* 2. Sequentially Extracted Parameters with proper bottom spacing */}
            <div className="mt-4 pt-3 border-t border-slate-100 min-h-[190px] pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  {t('landingSimExtractedTitle')}:
                </span>
                {stage !== 'typing' && (
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                    {visibleTokens} / {currentCase.tokens.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {currentCase.tokens.map((token, idx) => {
                  const isVisible = stage !== 'typing' && idx < visibleTokens;
                  if (!isVisible) {
                    return (
                      <div 
                        key={idx}
                        className="h-8 rounded-lg border border-dashed border-slate-200 bg-slate-50/40 opacity-40 transition-all duration-300" 
                      />
                    );
                  }
                  return (
                    <div 
                      key={idx}
                      className="h-8 text-xs px-3 py-1.5 rounded-lg bg-teal-50/90 border border-teal-200/90 text-teal-950 font-medium flex items-center justify-between shadow-xs transition-all duration-300 animate-fadeIn"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span className="truncate">{token.text}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-700 uppercase bg-white/80 px-1.5 py-0.5 rounded border border-teal-100 shrink-0">
                        {token.chapter}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sub-card: Repertory Pipeline Context - Fixed Height */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-700 shadow-xs h-[46px]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <span className="font-semibold">{t('landingSimPipelineBadge')}</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              {t('landingSimGradeBadge')}
            </span>
          </div>

        </div>

        {/* Right Column (7 Cols): Sequentially Displayed Remedies & Literature Links */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          
          <div>
            {/* Header - Fixed Height */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 h-[42px]">
              <div className="flex items-center gap-2">
                {stage === 'typing' || stage === 'tokens' ? (
                  <>
                    <Activity className="w-4 h-4 text-teal-700" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide">
                      {t('landingSimExplPhase1Title')}
                    </h4>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide">
                      {t('landingSimTopRemedyTitle')}
                    </h4>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>{stage === 'typing' || stage === 'tokens' ? t('landingSimLiveStatus') : t('landingSimDiffLabel')}</span>
              </div>
            </div>

            {/* Stages 1 & 2: Stable, Calm Explanation Cockpit - No black background, content does not jump */}
            {(stage === 'typing' || stage === 'tokens') && (
              <div className="h-[340px] flex flex-col justify-between">
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-100/80 text-teal-900 text-xs font-bold border border-teal-200">
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                      <span>{t('landingSimExplLiveDiagnostics')}</span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 font-mono">
                      {t('landingSimExplPhase1Badge')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {t('landingSimExplPhase1Title')}
                  </h3>
                  <p className="text-xs text-slate-600 mb-3.5">
                    {t('landingSimExplPhase1Sub')}
                  </p>

                  <div className="space-y-2.5 pt-2.5 border-t border-teal-100/90 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t('landingSimExplPhase1Step1')}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t('landingSimExplPhase1Step2')}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t('landingSimExplPhase1Step3')}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar reflects typing then token analysis smoothly without altering the text card */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
                    <span className="font-medium">
                      {stage === 'typing' ? t('landingSimExplAnalyzingTokens') : t('landingSimExplCalculating')}
                    </span>
                  </div>
                  <div className="w-24 sm:w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-600 rounded-full transition-all duration-200"
                      style={{ 
                        width: stage === 'typing'
                          ? `${Math.min(55, Math.round((typedChars / Math.max(1, fullText.length)) * 55))}%`
                          : `${55 + Math.round((visibleTokens / Math.max(1, currentCase.tokens.length)) * 45)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stages 3 & 4: Remedies List - Revealed sequentially from top to bottom */}
            {(stage === 'remedies' || stage === 'hold') && (
              <div className="h-[340px] flex flex-col justify-between space-y-2.5">
                {currentCase.remedies.map((remedy, idx) => {
                  // Revealed sequentially from top to bottom (Step 1: idx 0 [Simile], Step 2: idx 1, Step 3: idx 2)
                  const isVisible = stage === 'hold' || (stage === 'remedies' && idx < visibleRemedies);
                  const isWinner = remedy.isTop;

                  if (!isVisible) {
                    return (
                      <div 
                        key={idx}
                        className={`rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 transition-all duration-300 ${
                          isWinner ? 'h-[105px]' : 'h-[95px]'
                        }`}
                      />
                    );
                  }

                  return (
                    <div
                      key={remedy.name}
                      className={`p-3.5 rounded-xl transition-all duration-500 ease-out transform translate-y-0 opacity-100 ${
                        isWinner 
                          ? 'h-[105px] bg-gradient-to-r from-teal-50/90 via-white to-white border-2 border-teal-600 shadow-sm' 
                          : 'h-[95px] bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full text-[11px] font-extrabold flex items-center justify-center ${
                            isWinner ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`font-bold ${isWinner ? 'text-sm sm:text-base text-slate-900' : 'text-xs sm:text-sm text-slate-800'}`}>
                            {remedy.name}
                          </span>
                          {isWinner && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                              <Check className="w-3 h-3 text-teal-700" /> {t('landingSimSimileCandidate')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                            {remedy.rubricsMatched}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                            isWinner 
                              ? 'bg-teal-700 text-white shadow-xs' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {remedy.score}
                          </span>
                        </div>
                      </div>

                      {/* Percentage Progress Bar in HomeoPilot360 Teal */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            isWinner ? 'bg-gradient-to-r from-teal-700 to-teal-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${remedy.percentage}%` }}
                        />
                      </div>

                      {/* Detailed Clinical Repertory Verification */}
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans pl-7 line-clamp-2">
                        {remedy.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Footer Transparency Badge - Fixed Height */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 h-[36px]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{t('landingSimTranspNote')}</span>
            </span>
            <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
              {t('landingSimNoBlackbox')}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
