import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  BookOpen, 
  Sparkles, 
  Settings, 
  User, 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  FileText, 
  Activity, 
  Pill, 
  Baby, 
  FileDown, 
  ShieldCheck, 
  ArrowRight, 
  Mic, 
  Lightbulb, 
  Lock, 
  Scale, 
  ListOrdered,
  Clock,
  Globe,
  PlusCircle,
  FileCheck,
  Zap,
  Radio,
  Sliders,
  Check,
  Calendar,
  Heart,
  Flame,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Shield,
  Printer
} from 'lucide-react';

interface UserManualViewProps {
  onNavigateTab?: (tab: 'cases' | 'patients' | 'materiamedica' | 'profile' | 'tariff') => void;
  onGoToAdmin?: () => void;
}

type SectionKey = 'all' | 'nav' | 'quick' | 'acute' | 'patient' | 'analysis' | 'materia' | 'settings' | 'faq';

export const UserManualView: React.FC<UserManualViewProps> = ({
  onNavigateTab,
  onGoToAdmin,
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SectionKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterMatches = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <BookOpen className="w-96 h-96 -mr-20 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5 text-teal-300" />
            <span>Homeopilot360 • {t('tabDocumentation')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            {t('manualHeroTitle')}
          </h1>
          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed mb-6">
            {t('manualHeroSubtitle')}
          </p>

          {/* Live Search */}
          <div className="relative max-w-xl">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('manualSearchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 bg-white/95 text-slate-900 placeholder:text-slate-500 rounded-2xl text-sm font-medium border border-white/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 bg-slate-200/80 px-2 py-1 rounded-lg cursor-pointer"
              >
                {t('manualClearSearch')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DOCUMENTATION LAYOUT: LEFT VERTICAL SIDEBAR + RIGHT CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT VERTICAL NAVIGATION (Senkrechte Dokumentations-Navigation) */}
        <aside className="lg:col-span-3 lg:sticky lg:top-6 space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t('tabDocumentation')}
            </div>
            {[
              { key: 'all' as SectionKey, label: t('manualFilterAll'), icon: Sparkles },
              { key: 'nav' as SectionKey, label: t('manualSecNav'), icon: Layers },
              { key: 'quick' as SectionKey, label: t('manualSecQuick'), icon: Clock },
              { key: 'acute' as SectionKey, label: t('manualSecAcute'), icon: Zap },
              { key: 'patient' as SectionKey, label: t('manualSecPatient'), icon: User },
              { key: 'analysis' as SectionKey, label: t('manualSecAnalysis'), icon: Activity },
              { key: 'materia' as SectionKey, label: t('manualSecMateria'), icon: BookOpen },
              { key: 'settings' as SectionKey, label: t('manualSecSettings'), icon: Settings },
              { key: 'faq' as SectionKey, label: t('manualSecFaq'), icon: HelpCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.key);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <main className="lg:col-span-9 space-y-8 min-w-0">
          {/* 3. SECTION: SIDEBAR & NAVIGATION STRUCTURE */}
          {(activeSection === 'all' || activeSection === 'nav') && (
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {t('manualNavTitle')}
                </h2>
                <p className="text-xs text-slate-500">{t('manualNavDesc')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Representation of Sidebar */}
            <div className="lg:col-span-5 bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  H
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Homeopilot360</div>
                  <div className="text-[10px] text-teal-400 font-medium">{t('manualPraxisEdition')}</div>
                </div>
              </div>

              {/* Section Praxis Mock */}
              <div className="mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  {t('manualNavPraxisHeading')}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-teal-700/80 text-white font-semibold text-xs border border-teal-500/40">
                    <Activity className="w-4 h-4 text-teal-300" />
                    <span>{t('tabCaseManagement')}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-medium text-xs">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{t('tabPatientDirectory')}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-medium text-xs">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>{t('tabMateriaMedica')}</span>
                  </div>
                </div>
              </div>

              {/* Section Account Mock */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  {t('manualNavBottomHeading')}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-slate-300 hover:bg-slate-800 font-medium text-xs">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('navProfile' as any)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-slate-300 hover:bg-slate-800 font-medium text-xs">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('navSettings' as any)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-teal-300 bg-teal-950/60 font-semibold text-xs border border-teal-800/60">
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    <span>{t('tabDocumentation')}</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-950/30 font-medium text-xs">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t('manualNavLogoutItem')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation List */}
            <div className="lg:col-span-7 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-teal-800 flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>{t('tabCaseManagement')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualNavCasesItem')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-teal-800 flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>{t('tabPatientDirectory')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualNavPatientsItem')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-teal-800 flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>{t('tabMateriaMedica')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualNavMateriaItem')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-teal-800 flex items-center gap-2 mb-1">
                  <Settings className="w-4 h-4 text-teal-600" />
                  <span>{t('navProfile' as any)} & {t('navSettings' as any)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualNavProfileItem')} • {t('manualNavSettingsItem')}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. SECTION: QUICK START WORKFLOW */}
      {(activeSection === 'all' || activeSection === 'quick') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {t('manualQuickTitle')}
                </h2>
                <p className="text-xs text-slate-500">{t('manualSecQuick')}</p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('cases')}
                className="px-4 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('tabCaseManagement')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 relative flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-2xs">
                  1
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {t('manualQuickStep1Title')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualQuickStep1Desc')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                <User className="w-3.5 h-3.5" />
                <span>{t('patientDataTitle')}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 relative flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-2xs">
                  2
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {t('manualQuickStep2Title')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualQuickStep2Desc')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                <Mic className="w-3.5 h-3.5" />
                <span>{t('chiefComplaint')} & {t('modalities')}</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 relative flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-2xs">
                  3
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {t('manualQuickStep3Title')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualQuickStep3Desc')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                <FileDown className="w-3.5 h-3.5" />
                <span>{t('manualStep8Pill')}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. SECTION: ACUTE INTAKE & EMERGENCY MODULE */}
      {(activeSection === 'all' || activeSection === 'acute') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {t('manualAcuteTitle')}
                </h2>
                <p className="text-xs text-slate-500">{t('manualAcuteDesc')}</p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('materiamedica')}
                className="px-4 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('tabMateriaMedica')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Visual Realistic Preview of Acute Intake Component */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/80 shadow-lg space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="font-bold text-sm text-white">{t('tabMateriaMedica')} • {t('manualSecAcute')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('manualAcuteVoiceReady')}</span>
              </div>
            </div>

            {/* Mock Acute UI Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7 space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('manualAcutePresetsHeading')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    t('manualPresetFever'),
                    t('manualPresetTrauma'),
                    t('manualPresetGastro'),
                    t('manualPresetFlu'),
                    t('manualPresetInsect'),
                    t('manualPresetShock'),
                  ].map((preset, idx) => (
                    <span
                      key={idx}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                        idx === 0
                          ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      {preset}
                    </span>
                  ))}
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                  {t('manualMockSymptomText')}
                </div>
              </div>

              {/* Match Result Mock */}
              <div className="md:col-span-5 bg-teal-950/60 p-4 rounded-xl border border-teal-700/50 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>{t('manualMatchResultTitle')}</span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/30 text-teal-200 font-bold">96% {t('manualMatchScoreLabel')}</span>
                  </div>
                  <div className="text-base font-extrabold text-white">Aconitum napellus</div>
                  <div className="text-[11px] text-teal-200/90 mt-1 leading-snug">
                    {t('manualMockKeynotes')}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-teal-800/60 flex items-center justify-between text-xs">
                  <span className="text-teal-300 font-medium">{t('manualMockAmelioration')}</span>
                  <span className="text-rose-300 font-medium">{t('manualMockAggravation')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualAcuteVoiceTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualAcuteVoiceDesc')}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualAcutePresetsTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualAcutePresetsDesc')}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualAcuteMatchingTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualAcuteMatchingDesc')}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualAcuteActionTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualAcuteActionDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. SECTION: PATIENT REGISTRATION */}
      {(activeSection === 'all' || activeSection === 'patient') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {t('manualPatientRegTitle')}
                </h2>
                <p className="text-xs text-slate-500">{t('manualPatientRegDesc')}</p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('patients')}
                className="px-4 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('tabPatientDirectory')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 mb-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">1</span>
                <span>{t('manualPatientStep1')}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                {t('manualPatientStep1Details')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 mb-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">2</span>
                <span>{t('manualPatientStep2')}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                {t('manualPatientStep2Details')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 mb-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">3</span>
                <span>{t('manualPatientStep3')}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                {t('manualPatientStep3Details')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/70">
              <div className="flex items-center gap-2.5 font-bold text-sm text-teal-950 mb-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span>{t('manualPatientStep4')}</span>
              </div>
              <p className="text-xs text-teal-900 leading-relaxed pl-7">
                {t('manualPatientStep4Details')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 7. SECTION: COMPLETE 8-STEP ANALYSIS WIZARD & REPERTORIZATION */}
      {(activeSection === 'all' || activeSection === 'analysis') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {t('manualAnalysisTitle')}
                </h2>
                <p className="text-xs text-slate-500">{t('manualAnalysisDesc')}</p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('cases')}
                className="px-4 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('newCaseBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 8-Step Visual Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { num: '1', title: t('manualAnalysisWiz1Title'), desc: t('manualAnalysisWiz1Desc'), icon: User, color: 'border-slate-200' },
              { num: '2', title: t('manualAnalysisWiz2Title'), desc: t('manualAnalysisWiz2Desc'), icon: Mic, color: 'border-slate-200' },
              { num: '3', title: t('manualAnalysisWiz3Title'), desc: t('manualAnalysisWiz3Desc'), icon: ListOrdered, color: 'border-slate-200' },
              { num: '4', title: t('manualAnalysisWiz4Title'), desc: t('manualAnalysisWiz4Desc'), icon: Scale, color: 'border-slate-200' },
              { num: '5', title: t('manualAnalysisWiz5Title'), desc: t('manualAnalysisWiz5Desc'), icon: Pill, color: 'border-slate-200' },
              { num: '6', title: t('manualAnalysisWiz6Title'), desc: t('manualAnalysisWiz6Desc'), icon: FileText, color: 'border-slate-200' },
              { num: '7', title: t('manualAnalysisWiz7Title'), desc: t('manualAnalysisWiz7Desc'), icon: Sparkles, color: 'border-teal-300 bg-teal-50/70' },
              { num: '8', title: t('manualAnalysisWiz8Title'), desc: t('manualAnalysisWiz8Desc'), icon: FileDown, color: 'border-slate-800 bg-slate-900 text-white' },
            ].map((step, idx) => {
              const Icon = step.icon;
              const isDark = step.num === '8';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${step.color} flex flex-col justify-between transition-all`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isDark ? 'bg-teal-500 text-slate-900' : 'bg-teal-700 text-white'
                      }`}>
                        {step.num}
                      </span>
                      <Icon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-700'}`} />
                    </div>
                    <h3 className={`text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. SECTION: MATERIA MEDICA & DIRECTORY */}
      {(activeSection === 'all' || activeSection === 'materia') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {t('manualMateriaTitle')}
                </h2>
                <p className="text-xs text-slate-500">{t('manualMateriaDesc')}</p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('materiamedica')}
                className="px-4 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('tabMateriaMedica')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>{t('manualMateriaLibTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('manualMateriaLibDesc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>{t('manualPatientDirTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('manualPatientDirDesc')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 9. SECTION: THERAPIST & PRACTICE SETTINGS */}
      {(activeSection === 'all' || activeSection === 'settings') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {t('manualSettingsTitle')}
                </h2>
                <p className="text-xs text-slate-500">{t('manualSettingsDesc')}</p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('profile')}
                className="px-4 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('navProfile' as any)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Setting 1: Profile */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualSettingsProfileTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualSettingsProfileDesc')}
                </p>
              </div>
            </div>

            {/* Setting 2: History */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualSettingsHistoryTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualSettingsHistoryDesc')}
                </p>
              </div>
            </div>

            {/* Setting 3: Name Change */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualSettingsNameChangeTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualSettingsNameChangeDesc')}
                </p>
              </div>
            </div>

            {/* Setting 4: Language */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualSettingsLanguageTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualSettingsLanguageDesc')}
                </p>
              </div>
            </div>

            {/* Setting 5: Tariffs */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualSettingsTariffTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualSettingsTariffDesc')}
                </p>
              </div>
            </div>

            {/* Setting 6: Password */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t('manualSettingsPasswordTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('manualSettingsPasswordDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 10. SECTION: FAQ & BEST PRACTICES */}
      {(activeSection === 'all' || activeSection === 'faq') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {t('manualFaqTitle')}
              </h2>
              <p className="text-xs text-slate-500">{t('manualSecFaq')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t('manualFaq1Q')}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                {t('manualFaq1A')}
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t('manualFaq2Q')}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                {t('manualFaq2A')}
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t('manualFaq3Q')}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                {t('manualFaq3A')}
              </p>
            </div>
          </div>
        </section>
      )}
        </main>
      </div>
    </div>
  );
};
