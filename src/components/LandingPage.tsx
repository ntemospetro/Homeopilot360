import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  ShieldCheck, 
  Languages, 
  ArrowRight, 
  ClipboardList,
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Infinity as InfinityIcon, 
  Check, 
  Activity, 
  FileText, 
  Layers, 
  Scale, 
  Search, 
  BookOpen, 
  HeartHandshake, 
  Clock, 
  ChevronRight, 
  Shield, 
  Stethoscope,
  Globe,
  Laptop,
  Pill,
  CheckCheck,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { PackagePlan } from '../types';
import { getPackagePlans, getLocalizedRegistrationTrial } from '../services/storage';
import { SemanticEngineAnimation } from './SemanticEngineAnimation';

interface LandingPageProps {
  onGetStarted: () => void;
  onGoToLogin: () => void;
}

export function LandingPage({ onGetStarted, onGoToLogin }: LandingPageProps) {
  const { t, language } = useTranslation();
  const [plans, setPlans] = useState<PackagePlan[]>([]);
  const trialConfig = getLocalizedRegistrationTrial(language);

  const getLocalizedPlanInfo = (plan: PackagePlan) => {
    if (plan.id === 'starter_10') {
      return {
        name: t('planStarterName'),
        badge: t('planStarterBadge'),
        description: t('planStarterDesc'),
        features: [t('planStarterF1'), t('planStarterF2'), t('planStarterF3')]
      };
    }
    if (plan.id === 'praxis_50') {
      return {
        name: t('planPraxisName'),
        badge: t('planPraxisBadge'),
        description: t('planPraxisDesc'),
        features: [t('planPraxisF1'), t('planPraxisF2'), t('planPraxisF3')]
      };
    }
    if (plan.id === 'pro_unlimited') {
      return {
        name: t('planProName'),
        badge: t('planProBadge'),
        description: t('planProDesc'),
        features: [t('planProF1'), t('planProF2'), t('planProF3'), t('planProF4')]
      };
    }
    return {
      name: plan.name,
      badge: plan.badge,
      description: plan.description,
      features: plan.features || []
    };
  };

  useEffect(() => {
    // Only load active packages
    setPlans(getPackagePlans().filter(p => p.isActive));
    
    const handleUpdate = () => {
      setPlans(getPackagePlans().filter(p => p.isActive));
    };

    window.addEventListener('homoeo_saas_packages_updated', handleUpdate);
    window.addEventListener('homoeo_reg_trial_updated', handleUpdate);
    
    return () => {
      window.removeEventListener('homoeo_saas_packages_updated', handleUpdate);
      window.removeEventListener('homoeo_reg_trial_updated', handleUpdate);
    };
  }, []);

  return (
    <div id="landing-page-root" className="bg-[#faf9f6] text-slate-800 antialiased font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. HERO SECTION WITH SEMANTIC ENGINE ANIMATION */}
      <section id="landing-hero" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/70">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#0f766e_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.035] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-teal-100/40 via-slate-100/20 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Top Eyebrow Badge */}
            <div id="landing-hero-pill" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('landingHeroBadgeSemantic')}</span>
            </div>

            {/* Main Headline */}
            <h1 id="landing-hero-title" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              <span>{t('landingHeroMainTitle1')}</span>
              <span className="text-teal-700 block sm:inline">{t('landingHeroMainTitle2')}</span>
            </h1>

            {/* Subline */}
            <p id="landing-hero-subline" className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-4">
              {t('landingHeroMainSubline')}
            </p>

            {/* Lead Description */}
            <p id="landing-hero-lead" className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto mb-6 leading-relaxed">
              {t('landingHeroMainLead')}
            </p>

            {/* 3 Pillars Summary Bar */}
            <div id="landing-hero-three-pillars" className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-xl bg-teal-50/80 border border-teal-200/80 text-xs sm:text-sm font-semibold text-teal-900 mb-8">
              <span>{t('landingHeroThreePillars')}</span>
            </div>

            {/* Call to Action Buttons */}
            <div id="landing-hero-cta-group" className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
              <button 
                id="landing-hero-btn-primary"
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{t('landingHeroCtaTest')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                id="landing-hero-btn-secondary"
                onClick={onGoToLogin}
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-semibold text-base rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              >
                {t('landingHeroCtaLogin')}
              </button>
            </div>

            {/* Trust Micro-Badges */}
            <div id="landing-hero-trust-badges" className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{t('landingHeroTrust1')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{t('landingHeroTrust2')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{t('landingHeroTrust3')}</span>
              </div>
            </div>
          </div>

          {/* 1.1 INTERACTIVE LIVE SEMANTIC SIMULATION (Hostinger Hermes Agent Style) */}
          <div id="landing-hero-animation-wrapper" className="mt-14 max-w-6xl mx-auto">
            <SemanticEngineAnimation />
          </div>

          {/* 1.2 THREE COMPACT SPLIT-SCREEN PRAXIS SHOWCASES */}
          <div id="landing-showcases" className="mt-20 max-w-6xl mx-auto space-y-10">
            <div className="text-center max-w-3xl mx-auto mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100">
                {t('landingShowcasesEyebrow')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-2">
                {t('landingShowcasesTitle')}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('landingShowcasesLead')}
              </p>
            </div>

            {/* Showcase 1: Homöopathische Materia Medica */}
            <div id="showcase-materia-medica" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid md:grid-cols-12 gap-8 items-center">
                {/* Left: Explanation */}
                <div className="md:col-span-6 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('landingShowcase1Badge')}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {t('landingShowcase1Title')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('landingShowcase1Desc')}
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-1">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase1Feature1')}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase1Feature2')}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase1Feature3')}</span>
                    </li>
                  </ul>
                </div>

                {/* Right: Materia Medica Monograph Mockup Card */}
                <div className="md:col-span-6 bg-slate-900 rounded-xl p-5 text-white shadow-inner border border-slate-800">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
                    <span className="font-serif italic text-teal-300 text-sm font-semibold">{t('landingShowcase1ArnicaName')}</span>
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50">
                      {t('landingShowcase1Authors')}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700">
                      <div className="font-bold text-slate-300 mb-1">{t('landingShowcase1KeynotesTitle')}</div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {t('landingShowcase1KeynotesDesc')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-rose-950/30 border border-rose-900/50 text-rose-200">
                        <strong className="block text-[10px] uppercase text-rose-400 font-bold mb-0.5">{t('landingShowcase1AggravationTitle')}</strong>
                        {t('landingShowcase1AggravationDesc')}
                      </div>
                      <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-200">
                        <strong className="block text-[10px] uppercase text-emerald-400 font-bold mb-0.5">{t('landingShowcase1AmeliorationTitle')}</strong>
                        {t('landingShowcase1AmeliorationDesc')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t('landingShowcase1SourceBook')}</span>
                    <span className="text-emerald-400 font-mono">{t('landingShowcase1Verified')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase 2: Klassisches Repertorium & Symptomwertigkeit */}
            <div id="showcase-repertorium" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid md:grid-cols-12 gap-8 items-center">
                {/* Left: Explanation */}
                <div className="md:col-span-6 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-50 text-violet-800 text-xs font-bold border border-violet-200/60">
                    <Scale className="w-3.5 h-3.5 text-violet-600" />
                    <span>{t('landingShowcase2Badge')}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {t('landingShowcase2Title')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('landingShowcase2Desc')}
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-1">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase2Feature1')}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase2Feature2')}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase2Feature3')}</span>
                    </li>
                  </ul>
                </div>

                {/* Right: Repertorium Rubrik & Grade Simulation Card */}
                <div className="md:col-span-6 bg-slate-900 rounded-xl p-5 text-white shadow-inner border border-slate-800">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-mono text-slate-300 font-semibold">{t('landingShowcase2RubricMatrix')}</span>
                    <span className="text-[10px] bg-violet-900/60 text-violet-300 px-2 py-0.5 rounded-full border border-violet-700/50">
                      {t('landingShowcase2Grades')}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <span className="text-slate-200">{t('landingShowcase2Rubric1Text')}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {t('landingShowcase2Rubric1Grade')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <span className="text-slate-200">{t('landingShowcase2Rubric2Text')}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {t('landingShowcase2Rubric2Grade')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <span className="text-slate-300">{t('landingShowcase2Rubric3Text')}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        {t('landingShowcase2Rubric3Grade')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-violet-300 font-medium">{t('landingShowcase2ScoreText')}</span>
                    <span className="text-emerald-400 font-bold">1. Bell. (3/3)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase 3: Schulmedizinische Medikamentenanalyse & Risikovergleich */}
            <div id="showcase-medication-analysis" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid md:grid-cols-12 gap-8 items-center">
                {/* Left: Explanation */}
                <div className="md:col-span-6 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/60">
                    <Pill className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('landingShowcase3Badge')}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {t('landingShowcase3Title')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('landingShowcase3Desc')}
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-1">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase3Feature1')}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase3Feature2')}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t('landingShowcase3Feature3')}</span>
                    </li>
                  </ul>
                </div>

                {/* Right: Clinical Drug Interaction & Side Effect Analysis Mockup Card */}
                <div className="md:col-span-6 bg-slate-900 rounded-xl p-5 text-white shadow-inner border border-slate-800">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono text-slate-300 font-semibold">{t('landingShowcase3CardTitle')}</span>
                    </div>
                    <span className="text-[10px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-full border border-amber-700/50">
                      {t('landingShowcase3CheckedCount')}
                    </span>
                  </div>
                  
                  {/* Results list mockup */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-200">{t('landingShowcase3Med1Name')}</div>
                        <div className="text-[11px] text-slate-400">{t('landingShowcase3Med1SideEffect')}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-700/50">
                        {t('landingShowcase3Prep1')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-200">{t('landingShowcase3Med2Name')}</div>
                        <div className="text-[11px] text-slate-400">{t('landingShowcase3Med2SideEffect')}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-700/50">
                        {t('landingShowcase3Prep2')}
                      </span>
                    </div>

                    {/* Risk & Interaction Check */}
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200">
                      <div className="flex items-center gap-1.5 font-bold text-rose-300 text-xs mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>{t('landingShowcase3RiskTitle')}</span>
                      </div>
                      <p className="text-[11px] text-rose-200/90 leading-relaxed">
                        {t('landingShowcase3RiskDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> {t('landingShowcase3RedFlag')}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{t('landingShowcase3Contraindication')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Red Flags & Clinical Safety Banner */}
            <div id="landing-redflags-banner" className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/80 rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{t('landingRedFlagsTitle')}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-200/80 text-rose-800 px-2 py-0.5 rounded-full">
                        {t('landingRedFlagsBadge')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-rose-900 mt-0.5">
                      {t('landingRedFlagsSubtitle')}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                      {t('landingRedFlagsDesc')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 self-stretch md:self-auto justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-white/80 border border-rose-200 px-3 py-1.5 rounded-lg shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    {t('landingRedFlagsPill')}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SECTION 2: DIE ZEITAUFWENDIGE SUCHE NEU GEDACHT */}
      <section id="landing-rethink" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            {t('landingRethinkEyebrow')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 mb-4">
            {t('landingRethinkTitle')}
          </h2>
          <p className="text-base sm:text-lg font-semibold text-slate-800 mb-6">
            {t('landingRethinkSubtitle')}
          </p>
          <div className="bg-slate-50/80 p-6 sm:p-8 rounded-2xl border border-slate-200/80 text-left text-sm sm:text-base text-slate-700 leading-relaxed shadow-sm">
            <p>{t('landingRethinkText')}</p>
          </div>
        </div>
      </section>

      {/* 3. SECTION 3: DIE 5 KERNSÄULEN FÜR IHRE PRAXIS */}
      <section id="landing-pillars" className="py-24 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {t('landingPillarsEyebrow')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 mb-4">
              {t('landingPillarsMainTitle')}
            </h2>
          </div>

          <div className="space-y-12 max-w-6xl mx-auto">
            
            {/* Pillar 1 */}
            <div id="landing-pillar-1" className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-9 shadow-sm">
              <div className="grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold">
                    <ClipboardList className="w-4 h-4" />
                    <span>{t('landingPillar1Badge')}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {t('landingPillar1Title')}
                  </h3>
                  <p className="text-sm sm:text-base font-semibold text-teal-800">
                    {t('landingPillar1Subtitle')}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('landingPillar1Text')}
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 italic">
                    «{t('landingPillar1Quote')}»
                  </div>
                </div>
                <div className="md:col-span-5 bg-slate-50 p-6 rounded-xl border border-slate-200/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    {t('landingPillar1BenefitsTitle')}
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t('landingPillar1Point1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t('landingPillar1Point2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t('landingPillar1Point3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t('landingPillar1Point4')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span>{t('landingPillar1Point5')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pillar 2 & 3 in Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Pillar 2 */}
              <div id="landing-pillar-2" className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold">
                    <BrainCircuit className="w-4 h-4" />
                    <span>{t('landingPillar2Badge')}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {t('landingPillar2Title')}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-teal-800">
                    {t('landingPillar2Subtitle')}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t('landingPillar2Text')}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 bg-teal-50/50 p-3.5 rounded-xl text-xs font-medium text-teal-900 italic">
                  «{t('landingPillar2Quote')}»
                </div>
              </div>

              {/* Pillar 3 */}
              <div id="landing-pillar-3" className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold">
                    <Scale className="w-4 h-4" />
                    <span>{t('landingPillar3Badge')}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {t('landingPillar3Title')}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-teal-800">
                    {t('landingPillar3Subtitle')}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t('landingPillar3Text')}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 bg-teal-50/50 p-3.5 rounded-xl text-xs font-medium text-teal-900 italic">
                  «{t('landingPillar3Quote')}»
                </div>
              </div>

            </div>

            {/* Pillar 4 & 5 in Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Pillar 4: Flexible Environment */}
              <div id="landing-pillar-4" className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold">
                    <Laptop className="w-4 h-4" />
                    <span>{t('landingPillar4Badge')}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {t('landingPillar4Title')}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-teal-800">
                    {t('landingPillar4Subtitle')}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t('landingPillar4Text')}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 pt-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-teal-700" />
                      <span>{t('landingPillar4Point1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-teal-700" />
                      <span>{t('landingPillar4Point2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-teal-700" />
                      <span>{t('landingPillar4Point3')}</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-xl text-xs font-medium text-slate-800 italic">
                  «{t('landingPillar4Quote')}»
                </div>
              </div>

              {/* Pillar 5: Multilingual */}
              <div id="landing-pillar-5" className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold">
                    <Globe className="w-4 h-4" />
                    <span>{t('landingPillar5Badge')}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {t('landingPillar5Title')}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-teal-800">
                    {t('landingPillar5Subtitle')}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t('landingPillar5Text')}
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-semibold">DE (Deutsch)</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-semibold">EN (English)</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-semibold">ES (Español)</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-semibold">FR (Français)</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-semibold">IT (Italiano)</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-semibold">EL (Ελληνικά)</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-semibold">RU (Русский)</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 bg-teal-50/50 p-3.5 rounded-xl text-xs font-medium text-teal-900 italic">
                  «{t('landingPillar5Quote')}»
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. SECTION 4: DIREKTER VERGLEICH (MATRIX) */}
      <section id="landing-compare" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {t('landingCompareEyebrow')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 mb-4">
              {t('landingCompareTitle')}
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="grid grid-cols-12 bg-slate-900 text-white text-xs sm:text-sm font-bold p-4 sm:p-5">
              <div className="col-span-6 text-slate-300">
                {t('landingCompareClassicHeader')}
              </div>
              <div className="col-span-6 text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{t('landingComparePlatformHeader')}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
              {[
                { old: t('landingCompareRow1Old'), neu: t('landingCompareRow1New') },
                { old: t('landingCompareRow2Old'), neu: t('landingCompareRow2New') },
                { old: t('landingCompareRow3Old'), neu: t('landingCompareRow3New') },
                { old: t('landingCompareRow4Old'), neu: t('landingCompareRow4New') },
                { old: t('landingCompareRow5Old'), neu: t('landingCompareRow5New') },
                { old: t('landingCompareRow6Old'), neu: t('landingCompareRow6New') }
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-6 text-slate-500 pr-4 flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>{row.old}</span>
                  </div>
                  <div className="col-span-6 text-slate-900 font-semibold pl-4 flex items-start gap-2">
                    <CheckCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>{row.neu}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. SECTION 5: FÜR DIE PRAXIS ENTWICKELT – MIT VERANTWORTUNG */}
      <section id="landing-philosophy" className="py-24 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {t('landingPhilosophyEyebrow')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 mb-4">
              {t('landingPhilosophyTitle1')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Card 1 */}
            <div id="landing-philosophy-card-1" className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center mb-5 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {t('landingPhilosophySub1')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('landingPhilosophyText1')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-mono font-semibold text-teal-800">
                {t('landingPhilosophyBadge1')}
              </div>
            </div>

            {/* Card 2 */}
            <div id="landing-philosophy-card-2" className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center mb-5 font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {t('landingPhilosophyTitle2')}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-teal-800 mb-2">
                  {t('landingPhilosophySub2')}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('landingPhilosophyText2')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-mono font-semibold text-teal-800">
                {t('landingPhilosophyBadge2')}
              </div>
            </div>

            {/* Card 3 */}
            <div id="landing-philosophy-card-3" className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center mb-5 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {t('landingPhilosophyTitle3')}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-teal-800 mb-2">
                  {t('landingPhilosophySub3')}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('landingPhilosophyText3')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-mono font-semibold text-teal-800">
                {t('landingPhilosophyBadge3')}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. SECTION 6: DER ABLAUF IN 5 EINFACHEN SCHRITTEN */}
      <section id="landing-workflow" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {t('landingWorkflowEyebrow')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-4 mb-4">
              {t('landingWorkflowTitle')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[
              { num: t('landingWorkflowStep1Num'), title: t('landingWorkflowStep1Title'), desc: t('landingWorkflowStep1Desc') },
              { num: t('landingWorkflowStep2Num'), title: t('landingWorkflowStep2Title'), desc: t('landingWorkflowStep2Desc') },
              { num: t('landingWorkflowStep3Num'), title: t('landingWorkflowStep3Title'), desc: t('landingWorkflowStep3Desc') },
              { num: t('landingWorkflowStep4Num'), title: t('landingWorkflowStep4Title'), desc: t('landingWorkflowStep4Desc') },
              { num: t('landingWorkflowStep5Num'), title: t('landingWorkflowStep5Title'), desc: t('landingWorkflowStep5Desc') }
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-teal-700 font-mono block mb-3">
                    {step.num}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. SECTION 7: EXPERTISE CALLOUT */}
      <section id="landing-expertise" className="py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {t('landingExpertiseTitle')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('landingExpertiseText')}
          </p>
          <div className="pt-2 text-sm sm:text-base font-bold text-teal-400 font-mono">
            {t('landingExpertisePunchline')}
          </div>
        </div>
      </section>

      {/* 8. SECTION 8: DYNAMIC PACKAGES & PRICING */}
      <section id="landing-pricing" className="py-24 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              {t('landingPricingMainHeadline')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {t('landingPricingMainSubline')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center max-w-7xl mx-auto">
            
            {/* 1. Free Trial Package */}
            <div id="landing-plan-trial" className="bg-white rounded-2xl border-2 border-teal-600 shadow-md relative flex flex-col hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-700 text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
                {trialConfig.badge}
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{trialConfig.badge}</h3>
                  <div className="flex items-baseline gap-1 text-slate-900">
                    <span className="text-3xl font-extrabold tracking-tight">{trialConfig.priceDisplay}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 min-h-[36px]">{trialConfig.description}</p>
                </div>

                <div className="space-y-2.5 mt-4 flex-1">
                  {(trialConfig.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <button
                    id="landing-btn-trial-start"
                    onClick={onGetStarted}
                    className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    {t('landingPricingCtaBtn')}
                  </button>
                </div>
              </div>
            </div>

            {/* Paid Packages (Dynamic from Storage / Admin Configuration) */}
            {plans.filter(plan => plan.id !== 'free_trial').map((plan) => {
              const billingText = plan.billingPeriod === 'monthly' ? t('pricingMonthly')
                                : plan.billingPeriod === 'yearly' ? t('pricingYearly')
                                : plan.billingPeriod === 'one_time' ? t('pricingOneTime')
                                : '';
              const planInfo = getLocalizedPlanInfo(plan);
              const isPro = plan.isUnlimited || plan.id === 'pro_unlimited';
              
              return (
                <div 
                  key={plan.id} 
                  id={`landing-plan-${plan.id}`}
                  className={`bg-white rounded-2xl border ${isPro ? 'border-slate-800 shadow-md' : 'border-slate-200/90 shadow-sm'} relative flex flex-col hover:shadow-lg transition-shadow`}
                >
                  {planInfo.badge && (
                    <div className={`absolute top-0 right-4 -translate-y-1/2 ${isPro ? 'bg-slate-900 text-teal-300' : 'bg-slate-700 text-white'} px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm`}>
                      {planInfo.badge}
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{planInfo.name}</h3>
                      <div className="flex items-baseline gap-1 text-slate-900">
                        <span className="text-3xl font-extrabold tracking-tight">{plan.price} {plan.currency}</span>
                        <span className="text-xs font-medium text-slate-500">{billingText}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 min-h-[36px]">{planInfo.description}</p>
                    </div>

                    <div className="space-y-2.5 mt-4 flex-1">
                      <div className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-800">
                          {plan.isUnlimited ? (
                            <span className="flex items-center gap-1"><InfinityIcon className="w-3.5 h-3.5 text-teal-700" /> {t('pricingUnlimited')}</span>
                          ) : (
                            `${plan.maxAnalyses} ${t('pricingQuota')}`
                          )}
                        </span>
                      </div>
                      {(planInfo.features || []).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <button
                        id={`landing-btn-select-plan-${plan.id}`}
                        onClick={onGetStarted}
                        className={`w-full py-3 px-4 ${isPro ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-white border border-slate-300 hover:border-teal-600 hover:text-teal-700 text-slate-700'} font-semibold text-sm rounded-xl transition-colors shadow-sm cursor-pointer`}
                      >
                        {t('pricingRegisterNow')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. SECTION 9: RECHTLICHER HAFTUNGSAUSSCHLUSS (DISCLAIMER) */}
      <section id="landing-disclaimer" className="py-12 bg-white border-b border-slate-200/70 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('landingDisclaimerTitle')}</span>
            </div>
            <p className="leading-relaxed">
              {t('landingDisclaimerText1')}
            </p>
            <p className="leading-relaxed">
              {t('landingDisclaimerText2')}
            </p>
          </div>
        </div>
      </section>

      {/* 10. REFINED FOOTER */}
      <footer id="landing-footer" className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-900">
            {/* Brand Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center text-white">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white tracking-wide">HomeoPraxis SaaS</span>
              </div>
              <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                {t('landingFooterBrandDesc')}
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">
                {t('landingFooterNavTitle')}
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={onGetStarted} className="hover:text-teal-400 transition-colors cursor-pointer">
                    {t('landingHeroCtaTest')}
                  </button>
                </li>
                <li>
                  <button onClick={onGoToLogin} className="hover:text-teal-400 transition-colors cursor-pointer">
                    {t('landingHeroCtaLogin')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Security */}
            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">
                {t('landingFooterLegalTitle')}
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('landingFooterPrivacy')}</span>
                </li>
                <li>
                  <span>{t('landingFooterTerms')}</span>
                </li>
                <li>
                  <span>{t('landingFooterSecurity')}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>{t('landingFooterCopyright')}</span>
            <div className="flex items-center gap-3">
              <span>{t('footerTrialBadge')}</span>
              <span>•</span>
              <span>{t('footerGdprBadge')}</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

