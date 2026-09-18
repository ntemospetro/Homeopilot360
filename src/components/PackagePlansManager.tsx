import React, { useState, useEffect } from 'react';
import { RegistrationTrialConfigEditor } from "./RegistrationTrialConfigEditor";
import { PackagePlan, TariffBillingPeriod, TariffPagePermissions, TariffFeatureLimits } from '../types';
import { 
  getPackagePlans, 
  createPackagePlan, 
  updatePackagePlan, 
  deletePackagePlan,
  getTherapists
} from '../services/storage';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  Package, 
  Plus, 
  Sparkles, 
  Check, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Users, 
  Layers, 
  Infinity as InfinityIcon,
  FileCheck,
  Sliders,
  X,
  Star,
  AlertCircle,
  CreditCard,
  Coins,
  Mic,
  Lock,
  Unlock,
  ShieldAlert,
  FileText,
  BookOpen,
  Pill,
  LayoutDashboard,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface PackagePlansManagerProps {
  onAssignTariffToTherapist?: (planId: string) => void;
}

export const PackagePlansManager: React.FC<PackagePlansManagerProps> = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PackagePlan[]>(getPackagePlans());
  const [therapists, setTherapists] = useState(getTherapists());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PackagePlan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'trial' | 'packages'>('trial');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: 49,
    currency: '€',
    billingPeriod: 'monthly' as TariffBillingPeriod,
    maxAnalyses: 50,
    isUnlimited: false,
    badge: '',
    description: '',
    featuresText: '',
    isDefault: false,
    isActive: true,
    initialBookingAmount: 20,
    lowBalanceThreshold: 5,
    maxVoiceMainComplaintSeconds: 180,
    maxVoiceQuestionAnswerSeconds: 60,
    allowVoiceQuestionAnswer: true,
    pagePermissions: {
      dashboard: true,
      patients: true,
      cases: true,
      quickIntake: true,
      materiaMedica: true,
      repertorium: true,
      medications: true,
      documentation: true,
      pdfExport: true,
    } as TariffPagePermissions,
    featureLimits: {
      unlimitedAll: false,
      maxPatients: 100,
      unlimitedPatients: false,
      maxCases: 100,
      unlimitedCases: false,
      maxAnalysesPerCase: 1,
      unlimitedAnalysesPerCase: false,
      maxMedsPerCase: 20,
      unlimitedMedsPerCase: false,
      maxMedsPerResearch: 4,
      unlimitedMedsPerResearch: false,
      maxMedResearch: 50,
      unlimitedMedResearch: false,
      maxMateriaMedicaSearch: 100,
      unlimitedMateriaMedicaSearch: false,
      maxRepertoriumSearch: 100,
      unlimitedRepertoriumSearch: false,
      maxRepertoriumSymptoms: 20,
      unlimitedRepertoriumSymptoms: false,
      maxQuickIntake: 50,
      unlimitedQuickIntake: false,
      maxQuickIntakeSymptoms: 15,
      unlimitedQuickIntakeSymptoms: false,
      maxRiskAnalyses: 30,
      unlimitedRiskAnalyses: false,
      maxReports: 25,
      unlimitedReports: false,
      maxAiRequests: 100,
      unlimitedAiRequests: false,
    } as TariffFeatureLimits,
    hiddenPages: {} as Record<string, boolean>,
  });

  const refreshData = () => {
    setPlans(getPackagePlans());
    setTherapists(getTherapists());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('homoeo_packages_updated', refreshData);
    window.addEventListener('homoeo_storage_updated', refreshData);
    return () => {
      window.removeEventListener('homoeo_packages_updated', refreshData);
      window.removeEventListener('homoeo_storage_updated', refreshData);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: 29,
      currency: '€',
      billingPeriod: 'monthly',
      maxAnalyses: 25,
      isUnlimited: false,
      badge: 'Praxis-Tarif',
      description: 'Flexibles Analysepaket für den Praxisalltag.',
      featuresText: '25 Vollanalysen inklusive\nPrioritäre Repertorisation\nPDF-Fallexport',
      isDefault: false,
      isActive: true,
      initialBookingAmount: 20,
      lowBalanceThreshold: 5,
      maxVoiceMainComplaintSeconds: 180,
      maxVoiceQuestionAnswerSeconds: 60,
      allowVoiceQuestionAnswer: true,
      pagePermissions: {
        dashboard: true,
        patients: true,
        cases: true,
        quickIntake: true,
        materiaMedica: true,
        repertorium: true,
        medications: true,
        documentation: true,
        pdfExport: true,
      },
      featureLimits: {
        unlimitedAll: false,
        maxPatients: 100,
        unlimitedPatients: false,
        maxCases: 25,
        unlimitedCases: false,
        maxAnalysesPerCase: 1,
        unlimitedAnalysesPerCase: false,
        maxMedsPerCase: 20,
        unlimitedMedsPerCase: false,
        maxMedsPerResearch: 4,
        unlimitedMedsPerResearch: false,
        maxMedResearch: 50,
        unlimitedMedResearch: false,
        maxMateriaMedicaSearch: 100,
        unlimitedMateriaMedicaSearch: false,
        maxRepertoriumSearch: 100,
        unlimitedRepertoriumSearch: false,
        maxRepertoriumSymptoms: 20,
        unlimitedRepertoriumSymptoms: false,
        maxQuickIntake: 50,
        unlimitedQuickIntake: false,
        maxQuickIntakeSymptoms: 15,
        unlimitedQuickIntakeSymptoms: false,
        maxRiskAnalyses: 30,
        unlimitedRiskAnalyses: false,
        maxReports: 25,
        unlimitedReports: false,
        maxAiRequests: 100,
        unlimitedAiRequests: false,
      },
      hiddenPages: {},
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: PackagePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      currency: plan.currency || '€',
      billingPeriod: plan.billingPeriod,
      maxAnalyses: plan.isUnlimited ? 50 : plan.maxAnalyses,
      isUnlimited: plan.isUnlimited,
      badge: plan.badge || '',
      description: plan.description || '',
      featuresText: (plan.features || []).join('\n'),
      isDefault: plan.isDefault || false,
      isActive: plan.isActive,
      initialBookingAmount: plan.initialBookingAmount !== undefined ? plan.initialBookingAmount : 20,
      lowBalanceThreshold: plan.lowBalanceThreshold !== undefined ? plan.lowBalanceThreshold : 5,
      maxVoiceMainComplaintSeconds: plan.maxVoiceMainComplaintSeconds !== undefined ? plan.maxVoiceMainComplaintSeconds : 180,
      maxVoiceQuestionAnswerSeconds: plan.maxVoiceQuestionAnswerSeconds !== undefined ? plan.maxVoiceQuestionAnswerSeconds : 60,
      allowVoiceQuestionAnswer: plan.allowVoiceQuestionAnswer !== undefined ? plan.allowVoiceQuestionAnswer : true,
      pagePermissions: {
        dashboard: plan.pagePermissions?.dashboard ?? true,
        patients: plan.pagePermissions?.patients ?? true,
        cases: plan.pagePermissions?.cases ?? true,
        quickIntake: plan.pagePermissions?.quickIntake ?? plan.pagePermissions?.quickintake ?? true,
        quickintake: plan.pagePermissions?.quickIntake ?? plan.pagePermissions?.quickintake ?? true,
        materiaMedica: plan.pagePermissions?.materiaMedica ?? plan.pagePermissions?.materiamedica ?? true,
        materiamedica: plan.pagePermissions?.materiaMedica ?? plan.pagePermissions?.materiamedica ?? true,
        repertorium: plan.pagePermissions?.repertorium ?? true,
        medications: plan.pagePermissions?.medications ?? true,
        documentation: plan.pagePermissions?.documentation ?? true,
        pdfExport: plan.pagePermissions?.pdfExport ?? true,
      },
      featureLimits: {
        unlimitedAll: plan.featureLimits?.unlimitedAll ?? false,
        maxPatients: plan.featureLimits?.maxPatients ?? 100,
        unlimitedPatients: plan.featureLimits?.unlimitedPatients ?? false,
        maxCases: plan.featureLimits?.maxCases ?? plan.featureLimits?.maxAnalyses ?? (plan.isUnlimited ? 999999 : plan.maxAnalyses),
        unlimitedCases: plan.featureLimits?.unlimitedCases ?? plan.featureLimits?.unlimitedAnalyses ?? plan.isUnlimited ?? false,
        maxAnalysesPerCase: plan.featureLimits?.maxAnalysesPerCase ?? 1,
        unlimitedAnalysesPerCase: plan.featureLimits?.unlimitedAnalysesPerCase ?? false,
        maxMedsPerCase: plan.featureLimits?.maxMedsPerCase ?? 20,
        unlimitedMedsPerCase: plan.featureLimits?.unlimitedMedsPerCase ?? false,
        maxMedsPerResearch: plan.featureLimits?.maxMedsPerResearch ?? 4,
        unlimitedMedsPerResearch: plan.featureLimits?.unlimitedMedsPerResearch ?? false,
        maxMedResearch: plan.featureLimits?.maxMedResearch ?? 50,
        unlimitedMedResearch: plan.featureLimits?.unlimitedMedResearch ?? false,
        maxMateriaMedicaSearch: plan.featureLimits?.maxMateriaMedicaSearch ?? 100,
        unlimitedMateriaMedicaSearch: plan.featureLimits?.unlimitedMateriaMedicaSearch ?? false,
        maxRepertoriumSearch: plan.featureLimits?.maxRepertoriumSearch ?? 100,
        unlimitedRepertoriumSearch: plan.featureLimits?.unlimitedRepertoriumSearch ?? false,
        maxRepertoriumSymptoms: plan.featureLimits?.maxRepertoriumSymptoms ?? 20,
        unlimitedRepertoriumSymptoms: plan.featureLimits?.unlimitedRepertoriumSymptoms ?? false,
        maxQuickIntake: plan.featureLimits?.maxQuickIntake ?? 50,
        unlimitedQuickIntake: plan.featureLimits?.unlimitedQuickIntake ?? false,
        maxQuickIntakeSymptoms: plan.featureLimits?.maxQuickIntakeSymptoms ?? 15,
        unlimitedQuickIntakeSymptoms: plan.featureLimits?.unlimitedQuickIntakeSymptoms ?? false,
        maxRiskAnalyses: plan.featureLimits?.maxRiskAnalyses ?? 30,
        unlimitedRiskAnalyses: plan.featureLimits?.unlimitedRiskAnalyses ?? false,
        maxReports: plan.featureLimits?.maxReports ?? 25,
        unlimitedReports: plan.featureLimits?.unlimitedReports ?? false,
        maxAiRequests: plan.featureLimits?.maxAiRequests ?? 100,
        unlimitedAiRequests: plan.featureLimits?.unlimitedAiRequests ?? false,
      },
      hiddenPages: plan.hiddenPages || {},
    });
    setIsModalOpen(true);
  };

  const handleDeletePlan = (plan: PackagePlan) => {
    const assignedCount = therapists.filter(th => th.tarif === plan.id || th.tarifId === plan.id).length;
    if (assignedCount > 0) {
      if (!window.confirm(`Warnung: Aktuell nutzen ${assignedCount} Therapeut(en) dieses Paket (${plan.name}). Möchten Sie das Paket wirklich löschen?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Paket "${plan.name}" wirklich löschen?`)) {
        return;
      }
    }

    const success = deletePackagePlan(plan.id);
    if (success) {
      showToast(`Paket "${plan.name}" erfolgreich gelöscht`);
    } else {
      alert('Das letzte verbleibende Paket kann nicht gelöscht werden.');
    }
  };

  const handleSetDefault = (planId: string, planName: string) => {
    updatePackagePlan(planId, { isDefault: true });
    showToast(`"${planName}" als Standard-Tarif für Neuanmeldungen gesetzt`);
  };

  const handleToggleActive = (plan: PackagePlan) => {
    const nextActive = plan.isActive === false ? true : false;
    updatePackagePlan(plan.id, { isActive: nextActive });
    showToast(
      nextActive
        ? t('adminTariffToggledActive')
        : t('adminTariffToggledInactive')
    );
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Bitte geben Sie einen Paketnamen ein.');
      return;
    }

    const features = formData.featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const priceNum = Math.max(0, Number(formData.price) || 0);
    const maxAnalysesNum = formData.isUnlimited ? 999999 : Math.max(1, Number(formData.maxAnalyses) || 1);
    const initialBookingAmountNum = Math.max(0, Number(formData.initialBookingAmount) || 0);
    const lowBalanceThresholdNum = Math.max(0, Number(formData.lowBalanceThreshold) || 0);
    const maxVoiceMainComplaintSecondsNum = Math.max(5, Number(formData.maxVoiceMainComplaintSeconds) || 60);
    const maxVoiceQuestionAnswerSecondsNum = formData.allowVoiceQuestionAnswer 
      ? Math.max(0, Number(formData.maxVoiceQuestionAnswerSeconds) || 30) 
      : 0;

    const sanitizedFeatureLimits = {
      unlimitedAll: formData.featureLimits.unlimitedAll,
      maxPatients: formData.featureLimits.unlimitedPatients ? -1 : Math.max(0, Number(formData.featureLimits.maxPatients) ?? 0),
      unlimitedPatients: formData.featureLimits.unlimitedPatients,
      maxCases: formData.featureLimits.unlimitedCases ? -1 : Math.max(0, Number(formData.featureLimits.maxCases) ?? 0),
      unlimitedCases: formData.featureLimits.unlimitedCases,
      maxAnalysesPerCase: formData.featureLimits.unlimitedAnalysesPerCase ? -1 : Math.max(0, Number(formData.featureLimits.maxAnalysesPerCase) ?? 0),
      unlimitedAnalysesPerCase: formData.featureLimits.unlimitedAnalysesPerCase,
      maxMedsPerCase: formData.featureLimits.unlimitedMedsPerCase ? -1 : Math.max(0, Number(formData.featureLimits.maxMedsPerCase) ?? 0),
      unlimitedMedsPerCase: formData.featureLimits.unlimitedMedsPerCase,
      maxMedsPerResearch: formData.featureLimits.unlimitedMedsPerResearch ? -1 : Math.max(0, Number(formData.featureLimits.maxMedsPerResearch) ?? 0),
      unlimitedMedsPerResearch: formData.featureLimits.unlimitedMedsPerResearch,
      maxMedResearch: formData.featureLimits.unlimitedMedResearch ? -1 : Math.max(0, Number(formData.featureLimits.maxMedResearch) ?? 0),
      unlimitedMedResearch: formData.featureLimits.unlimitedMedResearch,
      maxMateriaMedicaSearch: formData.featureLimits.unlimitedMateriaMedicaSearch ? -1 : Math.max(0, Number(formData.featureLimits.maxMateriaMedicaSearch) ?? 0),
      unlimitedMateriaMedicaSearch: formData.featureLimits.unlimitedMateriaMedicaSearch,
      maxRepertoriumSearch: formData.featureLimits.unlimitedRepertoriumSearch ? -1 : Math.max(0, Number(formData.featureLimits.maxRepertoriumSearch) ?? 0),
      unlimitedRepertoriumSearch: formData.featureLimits.unlimitedRepertoriumSearch,
      maxRepertoriumSymptoms: formData.featureLimits.unlimitedRepertoriumSymptoms ? -1 : Math.max(0, Number(formData.featureLimits.maxRepertoriumSymptoms) ?? 0),
      unlimitedRepertoriumSymptoms: formData.featureLimits.unlimitedRepertoriumSymptoms,
      maxQuickIntake: formData.featureLimits.unlimitedQuickIntake ? -1 : Math.max(0, Number(formData.featureLimits.maxQuickIntake) ?? 0),
      unlimitedQuickIntake: formData.featureLimits.unlimitedQuickIntake,
      maxQuickIntakeSymptoms: formData.featureLimits.unlimitedQuickIntakeSymptoms ? -1 : Math.max(0, Number(formData.featureLimits.maxQuickIntakeSymptoms) ?? 0),
      unlimitedQuickIntakeSymptoms: formData.featureLimits.unlimitedQuickIntakeSymptoms,
      maxRiskAnalyses: formData.featureLimits.unlimitedRiskAnalyses ? -1 : Math.max(0, Number(formData.featureLimits.maxRiskAnalyses) ?? 0),
      unlimitedRiskAnalyses: formData.featureLimits.unlimitedRiskAnalyses,
      maxReports: formData.featureLimits.unlimitedReports ? -1 : Math.max(0, Number(formData.featureLimits.maxReports) ?? 0),
      unlimitedReports: formData.featureLimits.unlimitedReports,
      maxAiRequests: formData.featureLimits.unlimitedAiRequests ? -1 : Math.max(0, Number(formData.featureLimits.maxAiRequests) ?? 0),
      unlimitedAiRequests: formData.featureLimits.unlimitedAiRequests,
      
      // Für Rückwärtskompatibilität
      maxAnalyses: formData.featureLimits.unlimitedCases ? -1 : Math.max(0, Number(formData.featureLimits.maxCases) ?? 0),
      unlimitedAnalyses: formData.featureLimits.unlimitedCases,
    };

    const sanitizedPagePermissions = {
      ...formData.pagePermissions,
      quickintake: formData.pagePermissions.quickIntake ?? (formData.pagePermissions as any).quickintake ?? true,
      quickIntake: formData.pagePermissions.quickIntake ?? (formData.pagePermissions as any).quickintake ?? true,
      materiamedica: formData.pagePermissions.materiaMedica ?? (formData.pagePermissions as any).materiamedica ?? true,
      materiaMedica: formData.pagePermissions.materiaMedica ?? (formData.pagePermissions as any).materiamedica ?? true,
    };

    if (editingPlan) {
      // Update
      updatePackagePlan(editingPlan.id, {
        name: formData.name.trim(),
        price: priceNum,
        currency: formData.currency,
        billingPeriod: formData.billingPeriod,
        maxAnalyses: maxAnalysesNum,
        isUnlimited: formData.isUnlimited,
        badge: formData.badge.trim() || undefined,
        description: formData.description.trim() || undefined,
        features,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        initialBookingAmount: initialBookingAmountNum,
        lowBalanceThreshold: lowBalanceThresholdNum,
        maxVoiceMainComplaintSeconds: maxVoiceMainComplaintSecondsNum,
        maxVoiceQuestionAnswerSeconds: maxVoiceQuestionAnswerSecondsNum,
        allowVoiceQuestionAnswer: formData.allowVoiceQuestionAnswer,
        pagePermissions: sanitizedPagePermissions,
        featureLimits: sanitizedFeatureLimits,
        hiddenPages: formData.hiddenPages || {},
      });
      showToast(`Paket "${formData.name}" erfolgreich aktualisiert`);
    } else {
      // Create
      createPackagePlan({
        name: formData.name.trim(),
        price: priceNum,
        currency: formData.currency,
        billingPeriod: formData.billingPeriod,
        maxAnalyses: maxAnalysesNum,
        isUnlimited: formData.isUnlimited,
        badge: formData.badge.trim() || undefined,
        description: formData.description.trim() || undefined,
        features,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        initialBookingAmount: initialBookingAmountNum,
        lowBalanceThreshold: lowBalanceThresholdNum,
        maxVoiceMainComplaintSeconds: maxVoiceMainComplaintSecondsNum,
        maxVoiceQuestionAnswerSeconds: maxVoiceQuestionAnswerSecondsNum,
        allowVoiceQuestionAnswer: formData.allowVoiceQuestionAnswer,
        pagePermissions: sanitizedPagePermissions,
        featureLimits: sanitizedFeatureLimits,
        hiddenPages: formData.hiddenPages || {},
      });
      showToast(`Neues Paket "${formData.name}" erfolgreich erstellt`);
    }

    setIsModalOpen(false);
  };

  const getBillingPeriodLabel = (period: TariffBillingPeriod, price: number) => {
    if (price === 0 || period === 'free') return t('pricingStartFree');
    switch (period) {
      case 'one_time':
        return t('pricingOneTime');
      case 'monthly':
        return t('pricingMonthly');
      case 'yearly':
        return t('pricingYearly');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white border-0 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Tarif- & Paket-Konfigurator
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                {plans.length} Pakete aktiv
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Konfigurieren Sie den Registrierungs-Testtarif und stellen Sie maßgeschneiderte Praxis-Tarife für Therapeuten bereit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="admin-btn-create-package"
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('adminBtnCreatePackage')}</span>
          </button>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/90">
        <button
          type="button"
          id="btn-subtab-reg-trial"
          onClick={() => setActiveSection('trial')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'trial'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Registrierungs-Testtarif (Live-Texte & Übersetzungen)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
            activeSection === 'trial' ? 'bg-teal-800 text-teal-100' : 'bg-teal-100 text-teal-800'
          }`}>
            Live
          </span>
        </button>

        <button
          type="button"
          id="btn-subtab-packages-list"
          onClick={() => setActiveSection('packages')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'packages'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-teal-600" />
          <span>Zusatzpakete & Flatrates ({plans.length})</span>
        </button>
      </div>

      {/* 1. Registration Trial Configurator Section */}
      {activeSection === 'trial' && (
        <div className="space-y-3">
          <RegistrationTrialConfigEditor 
            onSaved={() => showToast('Testtarif-Konfiguration erfolgreich aktualisiert!')} 
          />
        </div>
      )}

      {/* 2. Paid / Custom Packages Section */}
      {activeSection === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Zusatz- & Praxis-Pakete für Therapeuten ({plans.length})
              </h3>
            </div>
          </div>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => {
          const assignedTherapists = therapists.filter(
            th => th.tarif === plan.id || th.tarifId === plan.id
          );
          const isFlatrate = plan.isUnlimited || plan.maxAnalyses >= 900000;
          const isPlanActive = plan.isActive !== false;

          return (
            <div
              key={plan.id}
              className={`card flex flex-col justify-between p-5 relative transition-all border ${
                !isPlanActive
                  ? 'border-slate-300 bg-slate-50/75 opacity-80 border-dashed'
                  : plan.isDefault
                  ? 'border-teal-500 shadow-md ring-1 ring-teal-500/20 bg-teal-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Badges row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Active / Inactive Status Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    title={isPlanActive ? t('adminTariffDeactivateTooltip') : t('adminTariffActivateTooltip')}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all border ${
                      isPlanActive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 shadow-2xs'
                        : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlanActive ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                    <span>{isPlanActive ? t('adminTariffActive') : t('adminTariffInactive')}</span>
                  </button>

                  {plan.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                      <span>{plan.badge}</span>
                    </span>
                  )}
                  {plan.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                      <span>{t('adminDefaultTariffBadge')}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(plan)}
                    title={t('editSection')}
                    className="p-1 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {plans.length > 1 && (
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      title={t('btnDelete')}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {plan.name}
                  </h3>
                  {!isPlanActive && (
                    <span className="text-[10px] font-medium text-slate-500 italic">
                      ({t('adminTariffInactive')})
                    </span>
                  )}
                </div>
                
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {plan.price === 0 ? '0 €' : `${plan.price} ${plan.currency || '€'}`}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {getBillingPeriodLabel(plan.billingPeriod, plan.price)}
                  </span>
                </div>

                {/* Analysis Quota Box */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                  {isFlatrate ? (
                    <>
                      <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <InfinityIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900">{t('adminUnlimitedAnalyses')}</div>
                        <div className="text-[10px] text-slate-500">{t('adminFlatrateNoLimit')}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900">
                          {t('tariffAnalysesIncluded', { count: plan.maxAnalyses })}
                        </div>
                        <div className="text-[10px] text-slate-500">{t('adminQuotaPerTherapist')}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Token Balance & Threshold info */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-violet-50/80 text-violet-900 border border-violet-200/70">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Coins className="w-3.5 h-3.5 text-violet-600" />
                    <span>Start: <strong className="font-mono font-bold">{plan.initialBookingAmount !== undefined ? plan.initialBookingAmount : 20} €</strong></span>
                  </span>
                  <span className="text-[10px] text-violet-700 font-medium">
                    Alarm: &lt; <strong className="font-mono font-bold">{plan.lowBalanceThreshold !== undefined ? plan.lowBalanceThreshold : 5} €</strong>
                  </span>
                </div>

                {/* Voice Limits Info */}
                <div className="mt-2 p-2 rounded-lg bg-emerald-50/70 text-emerald-950 border border-emerald-200/70 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-emerald-800 font-medium">
                      <Mic className="w-3 h-3 text-emerald-600" />
                      <span>{t('adminVoiceMainComplaintLimitLabel') || 'Hauptbeschwerde'}:</span>
                    </span>
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-900 font-bold text-[10px]">
                      {plan.maxVoiceMainComplaintSeconds ?? 180}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium pl-4">
                      {t('adminVoiceQuestionAnswerLimitLabel') || 'Fragen-Antworten'}:
                    </span>
                    {plan.allowVoiceQuestionAnswer !== false ? (
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-bold text-[10px]">
                        {plan.maxVoiceQuestionAnswerSeconds ?? 60}s
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                        {t('adminVoiceNotPermitted') || 'Nicht zulässig'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tariff Permissions & Quotas Summary Badge */}
                <div className="mt-2 p-2 rounded-lg bg-slate-100/80 border border-slate-200/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>{t('tariffSummaryTitle')}:</span>
                    </span>
                    {(() => {
                      const perms = plan.pagePermissions;
                      if (!perms) {
                        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{t('tariffAllPagesUnlocked')}</span>;
                      }
                      const pages = ['dashboard', 'patients', 'cases', 'quickIntake', 'materiaMedica', 'repertorium', 'medications', 'documentation', 'pdfExport'] as const;
                      const unlockedCount = pages.filter(p => perms[p] !== false).length;
                      return (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          unlockedCount === pages.length 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {unlockedCount === pages.length 
                            ? t('tariffAllPagesUnlocked') 
                            : t('tariffAllowedPagesCount', { count: unlockedCount })}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Quota Highlights */}
                  <div className="flex flex-wrap gap-1 pt-1 text-[9px] font-medium">
                    {plan.featureLimits?.unlimitedAll ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-bold flex items-center gap-0.5">
                        <InfinityIcon className="w-2.5 h-2.5" />
                        {t('tariffUnlimitedAllLabel')}
                      </span>
                    ) : (
                      <>
                        <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          Pat: {plan.featureLimits?.unlimitedPatients ? '∞' : (plan.featureLimits?.maxPatients ?? 100)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          Meds: {plan.featureLimits?.unlimitedMedsPerCase ? '∞' : (plan.featureLimits?.maxMedsPerCase ?? 20)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          Risiko: {plan.featureLimits?.unlimitedRiskAnalyses ? '∞' : (plan.featureLimits?.maxRiskAnalyses ?? 30)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          PDFs: {plan.featureLimits?.unlimitedReports ? '∞' : (plan.featureLimits?.maxReports ?? 25)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {plan.description}
                  </p>
                )}

                {/* Features List */}
                {plan.features && plan.features.length > 0 && (
                  <ul className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Card Footer: Usage count, Active toggle & Default toggle */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong className="text-slate-800">{assignedTherapists.length}</strong> {t('adminNavTherapists')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    className={`text-[11px] font-semibold transition-colors cursor-pointer hover:underline ${
                      isPlanActive
                        ? 'text-amber-700 hover:text-amber-900'
                        : 'text-emerald-700 hover:text-emerald-900 font-bold'
                    }`}
                  >
                    {isPlanActive ? t('adminTariffDeactivateBtn') : t('adminTariffActivateBtn')}
                  </button>

                  {!plan.isDefault && (
                    <button
                      onClick={() => handleSetDefault(plan.id, plan.name)}
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold hover:underline cursor-pointer"
                    >
                      {t('adminTariffSetDefault')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      )}

      {/* MODAL: Create / Edit Package Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs my-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-teal-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white tracking-tight truncate">
                    {editingPlan ? 'Paket bearbeiten' : 'Neues Paket zusammenstellen'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    Definieren Sie Tarifpreis, Seitenfreigaben, Nutzungslimits und Konditionen.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePlan} className="p-4 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto overflow-x-hidden">
              {/* Paketname */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Paketname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Praxis-Flatrate, 25er Block, Starter..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 text-xs font-semibold text-slate-900 h-[38px]"
                />
              </div>

              {/* Price & Billing Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Tarifpreis (€) *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={(formData.price as any) === '' ? '' : formData.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, price: val === '' ? '' : Number(val) } as any);
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 font-mono text-sm font-bold text-slate-900 h-[38px]"
                    />
                    <span className="text-slate-500 font-bold px-1.5">€</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Abrechnungszeitraum
                  </label>
                  <select
                    value={formData.billingPeriod}
                    onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value as TariffBillingPeriod })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-teal-600 font-medium text-slate-800 h-[38px]"
                  >
                    <option value="free">Kostenlos (0 €)</option>
                    <option value="one_time">Einmalig (Prepaid-Block)</option>
                    <option value="monthly">Monatlich (Abo)</option>
                    <option value="yearly">Jährlich</option>
                  </select>
                </div>
              </div>

              {/* Analysis Quota */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Analysen-Anzahl / Kontingent
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isUnlimited}
                      onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                      <InfinityIcon className="w-3.5 h-3.5 text-teal-600" />
                      Unbegrenzt (Flatrate)
                    </span>
                  </label>
                </div>

                {!formData.isUnlimited ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={(formData.maxAnalyses as any) === '' ? '' : formData.maxAnalyses}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, maxAnalyses: val === '' ? '' : Math.max(1, Number(val)) } as any);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md bg-white font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-600 h-[38px]"
                      />
                      <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                        Analysen pro Nutzer
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Der Nutzer wird nach Erreichen dieses Limits automatisch gesperrt, bis er ein Upgrade erhält.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-teal-700 bg-teal-50 p-2 rounded border border-teal-200">
                    Therapeuten mit diesem Tarif können unbegrenzt viele Patienten aufnehmen und analysieren.
                  </p>
                )}
              </div>

              {/* Stripe Initial Booking & Threshold Alarm */}
              <div className="p-3.5 bg-violet-50/70 rounded-lg border border-violet-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-700" />
                  <span className="text-[11px] font-bold text-violet-900 uppercase">
                    Stripe & Token-Guthaben
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t('adminPackageInitialBooking')}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={(formData.initialBookingAmount as any) === '' ? '' : (formData.initialBookingAmount ?? 20)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, initialBookingAmount: val === '' ? '' : Math.max(0, Number(val)) } as any);
                        }}
                        className="flex-1 px-3 py-2 border border-violet-200 rounded-md bg-white font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-600 h-[38px]"
                      />
                      <span className="text-slate-500 font-bold px-1">€</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {t('adminPackageInitialBookingHelp')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t('adminPackageThreshold')}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={(formData.lowBalanceThreshold as any) === '' ? '' : (formData.lowBalanceThreshold ?? 5)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, lowBalanceThreshold: val === '' ? '' : Math.max(0, Number(val)) } as any);
                        }}
                        className="flex-1 px-3 py-2 border border-violet-200 rounded-md bg-white font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-600 h-[38px]"
                      />
                      <span className="text-slate-500 font-bold px-1">€</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {t('adminPackageThresholdHelp')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badge & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Badge / Label (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Beliebt, Empfohlen, Aktion"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 text-xs text-slate-900 h-[38px]"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {t('adminTariffActiveCheckbox')}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Standard für Neuregistrierungen
                    </span>
                  </label>
                </div>
              </div>

              {/* Voice Recording Limits Section */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-700" />
                  <span className="text-[11px] font-bold text-emerald-900 uppercase">
                    {t('adminVoiceLimitsTitle') || 'Sprachaufnahme & Diktat-Limits (Voice-Felder)'}
                  </span>
                </div>

                {/* Hauptbeschwerde Max Time */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      {t('adminVoiceMainComplaintLimitField') || 'Hauptbeschwerde: Max. Aufnahmezeit (Sekunden)'}
                    </label>
                    <span className="text-[10px] text-emerald-800 font-mono font-bold">
                      {(Number(formData.maxVoiceMainComplaintSeconds) || 0)}s ({Math.floor((Number(formData.maxVoiceMainComplaintSeconds) || 0) / 60)}m {(Number(formData.maxVoiceMainComplaintSeconds) || 0) % 60}s)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="3600"
                      step="5"
                      value={(formData.maxVoiceMainComplaintSeconds as any) === '' ? '' : formData.maxVoiceMainComplaintSeconds}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, maxVoiceMainComplaintSeconds: val === '' ? '' : Math.max(5, Number(val)) } as any);
                      }}
                      className="w-24 shrink-0 min-w-0 px-3 py-1.5 border border-emerald-300 rounded-md bg-white font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 h-[36px]"
                    />
                    {/* Quick pick buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      {[30, 60, 120, 180, 300, 600].map(sec => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setFormData({ ...formData, maxVoiceMainComplaintSeconds: sec })}
                          className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                            formData.maxVoiceMainComplaintSeconds === sec
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {t('adminVoiceMainComplaintLimitDesc') || 'Gilt für die ausführliche Hauptbeschwerde und Spontanberichte.'}
                  </p>
                </div>

                {/* Frage-Antworten: Erlauben & Max Time */}
                <div className="pt-2.5 border-t border-emerald-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      {t('adminVoiceQuestionAnswerAllowedLabel') || 'Spracheingabe bei Fragen zulässig'}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.allowVoiceQuestionAnswer}
                        onChange={(e) => setFormData({ ...formData, allowVoiceQuestionAnswer: e.target.checked })}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-xs font-bold ${formData.allowVoiceQuestionAnswer ? 'text-emerald-800' : 'text-slate-500'}`}>
                        {formData.allowVoiceQuestionAnswer ? t('adminVoiceQuestionAnswerAllowedLabel') : t('adminVoiceNotPermitted')}
                      </span>
                    </label>
                  </div>

                  {formData.allowVoiceQuestionAnswer ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-slate-600">
                          {t('adminVoiceQuestionAnswerLimitField') || 'Fragen: Max. Aufnahmezeit (Sekunden)'}
                        </label>
                        <span className="text-[10px] text-emerald-800 font-mono font-bold">
                          {(Number(formData.maxVoiceQuestionAnswerSeconds) || 0)}s
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min="5"
                          max="1800"
                          step="5"
                          value={(formData.maxVoiceQuestionAnswerSeconds as any) === '' ? '' : formData.maxVoiceQuestionAnswerSeconds}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, maxVoiceQuestionAnswerSeconds: val === '' ? '' : Math.max(5, Number(val)) } as any);
                          }}
                          className="w-24 shrink-0 min-w-0 px-3 py-1.5 border border-emerald-300 rounded-md bg-white font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 h-[36px]"
                        />
                        {/* Quick pick buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          {[15, 30, 45, 60, 90, 120].map(sec => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => setFormData({ ...formData, maxVoiceQuestionAnswerSeconds: sec })}
                              className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                                formData.maxVoiceQuestionAnswerSeconds === sec
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {t('adminVoiceQuestionAnswerLimitDesc') || 'Gilt für Antworten in Anamnese-Fragebögen und gezielten Nachfragen.'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-800">
                      {t('adminVoiceQuestionAnswerDisabledNotice') || 'In diesem Tarif ist die Spracheingabe bei Fragen gesperrt (z. B. für den kostenlosen Test-Tarif). Nutzer sehen einen Hinweis und können auf einen höheren Tarif upgraden.'}
                    </div>
                  )}
                </div>
              </div>

              {/* 1. SEITENFREIGABE & FUNKTIONSSPERRE */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {t('tariffPagePermissionsTitle')}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {t('tariffPagePermissionsDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        pagePermissions: {
                          dashboard: true,
                          patients: true,
                          cases: true,
                          quickIntake: true,
                          quickintake: true,
                          materiaMedica: true,
                          materiamedica: true,
                          repertorium: true,
                          medications: true,
                          documentation: true,
                          pdfExport: true,
                        }
                      })}
                      className="text-[10px] text-indigo-700 font-semibold hover:underline cursor-pointer px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                    >
                      {t('tariffUnlockAllBtn')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {[
                    { key: 'dashboard' as const, label: t('navHome' as any), icon: LayoutDashboard },
                    { key: 'patients' as const, label: t('tariffPagePatientsLabel'), icon: Users },
                    { key: 'cases' as const, label: t('tariffPageCasesLabel'), icon: FileText },
                    { key: 'quickIntake' as const, label: t('tariffPageQuickIntakeLabel'), icon: Sparkles },
                    { key: 'materiaMedica' as const, label: t('tariffPageMateriaMedicaLabel'), icon: BookOpen },
                    { key: 'repertorium' as const, label: t('tariffPageRepertoriumLabel'), icon: Layers },
                    { key: 'medications' as const, label: t('tariffPageMedicationsLabel'), icon: Pill },
                    { key: 'documentation' as const, label: t('tariffPageDocumentationLabel'), icon: FileCheck },
                    { key: 'pdfExport' as const, label: t('tariffPagePdfExportLabel'), icon: Download },
                  ].map(page => {
                    const IconComp = page.icon;
                    const isAllowed = formData.pagePermissions[page.key] ?? true;
                    const isHidden = formData.hiddenPages && (formData.hiddenPages[page.key] === true || formData.hiddenPages[page.key.toLowerCase()] === true);
                    return (
                      <div
                        key={page.key}
                        className={`p-2.5 rounded-lg border text-xs transition-all bg-white flex flex-col justify-between gap-2 min-w-0 ${
                          isAllowed
                            ? 'border-emerald-200 shadow-2xs'
                            : 'bg-rose-50/40 border-rose-200 text-rose-900'
                        }`}
                      >
                        {/* Upper row: Icon, Page Name and Unlocked/Locked toggle */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <span className="flex items-center gap-2 font-semibold min-w-0">
                            <IconComp className={`w-4 h-4 shrink-0 ${isAllowed ? 'text-teal-600' : 'text-rose-500'}`} />
                            <span className={`truncate text-xs ${isAllowed ? 'text-slate-800' : 'text-rose-950 font-semibold'}`} title={page.label}>
                              {page.label}
                            </span>
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isAllowed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-100 text-rose-700 border border-rose-200'
                            }`}>
                              {isAllowed ? t('tariffPageUnlockedBadge') : t('tariffPageLockedBadge')}
                            </span>
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const updatedPerms = {
                                  ...formData.pagePermissions,
                                  [page.key]: checked,
                                };
                                if (page.key === 'quickIntake') {
                                  (updatedPerms as any).quickintake = checked;
                                }
                                if (page.key === 'materiaMedica') {
                                  (updatedPerms as any).materiamedica = checked;
                                }
                                setFormData({
                                  ...formData,
                                  pagePermissions: updatedPerms
                                });
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          </label>
                        </div>

                        {/* Lower row: Sidebar visibility toggle */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                          <span className="text-slate-500 font-medium">
                            {t('adminVisibilityLabel')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextHidden = !isHidden;
                              const updatedHidden = {
                                ...formData.hiddenPages,
                                [page.key]: nextHidden,
                                [page.key.toLowerCase()]: nextHidden,
                              };
                              setFormData({
                                ...formData,
                                hiddenPages: updatedHidden,
                              });
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer text-[10px] font-bold select-none truncate max-w-[200px] ${
                              isHidden
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={isHidden ? t('tariffPageHideInNavigation') : t('tariffPageShowInNavigation')}
                          >
                            {isHidden ? (
                              <>
                                <EyeOff className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate">{t('tariffPageHideInNavigation')}</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 text-teal-600 shrink-0" />
                                <span className="truncate">{t('tariffPageShowInNavigation')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. INDIVIDUELLE NUTZUNGSKONTINGENTE PRO NUTZER */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {t('tariffFeatureLimitsTitle')}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {t('tariffFeatureLimitsDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CHECKBUTTON OHNE BEGRENZUNG FUER ALLE */}
                <div className="p-3 bg-amber-500/10 border border-amber-300/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <InfinityIcon className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-950 truncate">
                        {t('tariffUnlimitedAllLabel')}
                      </div>
                      <div className="text-[10px] text-amber-800 line-clamp-1">
                        {t('tariffUnlimitedAllHelp')}
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 self-end sm:self-auto">
                    <input
                      type="checkbox"
                      checked={formData.featureLimits.unlimitedAll}
                      onChange={(e) => setFormData({
                        ...formData,
                        featureLimits: {
                          ...formData.featureLimits,
                          unlimitedAll: e.target.checked
                        }
                      })}
                      className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-900">
                      {t('tariffLimitUnlimitedBadge')}
                    </span>
                  </label>
                </div>

                {/* Einzelne Kontingente (nur aktiv wenn nicht unlimitedAll) */}
                {!formData.featureLimits.unlimitedAll && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      {
                        key: 'Patients' as const,
                        label: t('tariffLimitPatientsLabel'),
                        val: formData.featureLimits.maxPatients ?? 100,
                        unlim: formData.featureLimits.unlimitedPatients ?? false,
                        defVal: 100,
                      },
                      {
                        key: 'Cases' as const,
                        label: t('tariffLimitCasesLabel'),
                        val: formData.featureLimits.maxCases ?? 100,
                        unlim: formData.featureLimits.unlimitedCases ?? false,
                        defVal: 100,
                      },
                      {
                        key: 'AnalysesPerCase' as const,
                        label: t('tariffLimitAnalysesPerCaseLabel'),
                        val: formData.featureLimits.maxAnalysesPerCase ?? 1,
                        unlim: formData.featureLimits.unlimitedAnalysesPerCase ?? false,
                        defVal: 1,
                      },
                      {
                        key: 'MedsPerCase' as const,
                        label: t('tariffLimitMedsPerCaseLabel'),
                        val: formData.featureLimits.maxMedsPerCase ?? 20,
                        unlim: formData.featureLimits.unlimitedMedsPerCase ?? false,
                        defVal: 20,
                      },
                      {
                        key: 'MedsPerResearch' as const,
                        label: t('tariffLimitMedsPerResearchLabel'),
                        val: formData.featureLimits.maxMedsPerResearch ?? 4,
                        unlim: formData.featureLimits.unlimitedMedsPerResearch ?? false,
                        defVal: 4,
                      },
                      {
                        key: 'MedResearch' as const,
                        label: t('tariffLimitMedResearchLabel'),
                        val: formData.featureLimits.maxMedResearch ?? 50,
                        unlim: formData.featureLimits.unlimitedMedResearch ?? false,
                        defVal: 50,
                      },
                      {
                        key: 'MateriaMedicaSearch' as const,
                        label: t('tariffLimitMateriaMedicaSearchLabel'),
                        val: formData.featureLimits.maxMateriaMedicaSearch ?? 100,
                        unlim: formData.featureLimits.unlimitedMateriaMedicaSearch ?? false,
                        defVal: 100,
                      },
                      {
                        key: 'RepertoriumSearch' as const,
                        label: t('tariffLimitRepertoriumSearchLabel'),
                        val: formData.featureLimits.maxRepertoriumSearch ?? 100,
                        unlim: formData.featureLimits.unlimitedRepertoriumSearch ?? false,
                        defVal: 100,
                      },
                      {
                        key: 'RepertoriumSymptoms' as const,
                        label: t('tariffLimitRepertoriumSymptomsLabel'),
                        val: formData.featureLimits.maxRepertoriumSymptoms ?? 20,
                        unlim: formData.featureLimits.unlimitedRepertoriumSymptoms ?? false,
                        defVal: 20,
                      },
                      {
                        key: 'QuickIntake' as const,
                        label: t('tariffLimitQuickIntakeLabel'),
                        val: formData.featureLimits.maxQuickIntake ?? 50,
                        unlim: formData.featureLimits.unlimitedQuickIntake ?? false,
                        defVal: 50,
                      },
                      {
                        key: 'QuickIntakeSymptoms' as const,
                        label: t('tariffLimitQuickIntakeSymptomsLabel'),
                        val: formData.featureLimits.maxQuickIntakeSymptoms ?? 15,
                        unlim: formData.featureLimits.unlimitedQuickIntakeSymptoms ?? false,
                        defVal: 15,
                      },
                      {
                        key: 'RiskAnalyses' as const,
                        label: t('tariffLimitRiskAnalysesLabel'),
                        val: formData.featureLimits.maxRiskAnalyses ?? 30,
                        unlim: formData.featureLimits.unlimitedRiskAnalyses ?? false,
                        defVal: 30,
                      },
                      {
                        key: 'Reports' as const,
                        label: t('tariffLimitReportsLabel'),
                        val: formData.featureLimits.maxReports ?? 25,
                        unlim: formData.featureLimits.unlimitedReports ?? false,
                        defVal: 25,
                      },
                      {
                        key: 'AiRequests' as const,
                        label: t('tariffLimitAiRequestsLabel'),
                        val: formData.featureLimits.maxAiRequests ?? 100,
                        unlim: formData.featureLimits.unlimitedAiRequests ?? false,
                        defVal: 100,
                      },
                    ].map(item => {
                      const valKey = `max${item.key}` as keyof TariffFeatureLimits;
                      const unlimKey = `unlimited${item.key}` as keyof TariffFeatureLimits;
                      return (
                        <div key={item.key} className="p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs space-y-2 min-w-0">
                          <div className="flex items-center justify-between gap-1.5 min-w-0">
                            <span className="text-[11px] font-semibold text-slate-800 truncate" title={item.label}>
                              {item.label}
                            </span>
                            <label className="flex items-center gap-1 cursor-pointer select-none shrink-0" title={t('tariffLimitUnlimitedBadge')}>
                              <input
                                type="checkbox"
                                checked={item.unlim}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  featureLimits: {
                                    ...formData.featureLimits,
                                    [unlimKey]: e.target.checked
                                  }
                                })}
                                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-teal-700">∞</span>
                            </label>
                          </div>
                          {item.unlim ? (
                            <div className="px-2 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[10px] flex items-center gap-1 w-full">
                              <InfinityIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate">{t('tariffLimitUnlimitedBadge')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="number"
                                min="0"
                                max="100000"
                                value={(item.val as any) === '' ? '' : item.val}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData({
                                    ...formData,
                                    featureLimits: {
                                      ...formData.featureLimits,
                                      [valKey]: val === '' ? '' : Math.max(0, Number(val))
                                    }
                                  } as any);
                                }}
                                className="w-20 min-w-0 shrink-0 px-2 py-1 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:border-teal-600 h-[30px]"
                              />
                              <span className="text-[10px] text-slate-500 font-medium truncate">
                                {t('tariffLimitCustomValue')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Kurzbeschreibung
                </label>
                <textarea
                  rows={2}
                  placeholder="Erklären Sie den Zweck dieses Pakets..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 text-xs text-slate-900 resize-none"
                />
              </div>

              {/* Feature Points */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Leistungsmerkmale (ein Punkt pro Zeile)
                </label>
                <textarea
                  rows={3}
                  placeholder="z.B.&#10;50 Vollanalysen monatlich&#10;Prioritäts-Repertorisation&#10;Persönlicher Support"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 text-xs font-mono text-slate-900"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-md transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPlan ? (t('saveChanges') || 'Änderungen speichern') : (t('createPackage') || 'Paket anlegen')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
