import React, { useState, useEffect } from 'react';
import { Therapist, PackagePlan } from '../types';
import { 
  getTherapists, 
  deleteTherapist, 
  resetTherapistQuota, 
  resetTherapistFeatureQuota,
  getTherapistUsageCount,
  getTariffAccessForTherapist,
  upgradeTherapistToPro,
  setActiveTherapistId,
  createTherapist,
  getPackagePlans,
  getAdminCredentials,
  getStoredAdminTab,
  setStoredAdminTab
} from '../services/storage';
import { navigateTo } from '../services/navigation';
import { useTranslation } from '../i18n/LanguageContext';
import { PackagePlansManager } from './PackagePlansManager';
import { TariffAssignModal } from './TariffAssignModal';
import { AdminTermsEditor } from './AdminTermsEditor';
import { AdminConfigEditor } from './AdminConfigEditor';
import { AdminNameChangeRequests } from './AdminNameChangeRequests';
import { AdminTokenUsage } from './AdminTokenUsage';
import { AdminStripeSettings } from './AdminStripeSettings';
import { OrganonView } from './OrganonView';
import { AdminDataImportCenter } from './AdminDataImportCenter';
import { AdminMateriaMedicaImportModule } from './AdminMateriaMedicaImportModule';
import { AdminRepertoryImportModule } from './AdminRepertoryImportModule';
import { COUNTRIES, getCountryFlag, formatCountryWithFlag } from '../data/countries';
import { getNameChangeRequests } from '../services/storage';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  RotateCcw, 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  Download, 
  Filter, 
  CheckCircle2, 
  Lock, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Layers,
  Users,
  Package,
  Infinity as InfinityIcon,
  Tag,
  Scale,
  FileText,
  Settings,
  KeyRound,
  Coins,
  CreditCard,
  Activity,
  X,
  BookOpen,
  Database
} from 'lucide-react';

interface AdminPanelProps {
  onSwitchToTherapist: (therapistId: string) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onSwitchToTherapist,
  onLogout,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'therapists' | 'packages' | 'tokens' | 'stripe' | 'terms' | 'config' | 'requests' | 'organon' | 'import_materia_medica' | 'import_repertorium'>(() => getStoredAdminTab() as any || 'therapists');

  const handleSelectTab = (tab: 'therapists' | 'packages' | 'tokens' | 'stripe' | 'terms' | 'config' | 'requests' | 'organon' | 'import_materia_medica' | 'import_repertorium') => {
    setActiveTab(tab);
    navigateTo('admin', { adminTab: tab });
  };

  useEffect(() => {
    setStoredAdminTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleAdminTabChange = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      if (tab && ['therapists', 'packages', 'tokens', 'stripe', 'terms', 'config', 'requests', 'organon', 'import_materia_medica', 'import_repertorium'].includes(tab)) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('homoeo_action_set_admin_tab', handleAdminTabChange);
    return () => window.removeEventListener('homoeo_action_set_admin_tab', handleAdminTabChange);
  }, []);
  const [therapists, setTherapists] = useState<Therapist[]>(getTherapists());
  const [packages, setPackages] = useState<PackagePlan[]>(getPackagePlans());
  const [adminCreds, setAdminCreds] = useState(getAdminCredentials());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTarif, setFilterTarif] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'limit_reached'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingNameChanges, setPendingNameChanges] = useState(0);

  // Tariff Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTherapistForTariff, setSelectedTherapistForTariff] = useState<Therapist | null>(null);
  const [resetQuotaConfirmTarget, setResetQuotaConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  // New therapist modal in admin
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTherapistData, setNewTherapistData] = useState({
    vorname: '',
    nachname: '',
    praxisName: '',
    adresse: '',
    land: 'Deutschland',
    email: '',
    telefon: '',
    initialPackageId: 'free_trial',
  });

  const refreshList = () => {
    setTherapists(getTherapists());
    setPackages(getPackagePlans());
    setAdminCreds(getAdminCredentials());
    setPendingNameChanges(getNameChangeRequests().filter(r => r.status === 'pending').length);
  };


  useEffect(() => {
    refreshList();
    window.addEventListener('homoeo_storage_updated', refreshList);
    window.addEventListener('homoeo_packages_updated', refreshList);
    window.addEventListener('homoeo_admin_credentials_changed', refreshList);
    window.addEventListener('homoeo_name_change_requests_updated', refreshList);
    return () => {
      window.removeEventListener('homoeo_storage_updated', refreshList);
      window.removeEventListener('homoeo_packages_updated', refreshList);
      window.removeEventListener('homoeo_admin_credentials_changed', refreshList);
      window.removeEventListener('homoeo_name_change_requests_updated', refreshList);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePromptResetQuota = (id: string, name: string) => {
    setResetQuotaConfirmTarget({ id, name });
  };

  const handleConfirmResetQuota = () => {
    if (!resetQuotaConfirmTarget) return;
    const { id, name } = resetQuotaConfirmTarget;
    resetTherapistQuota(id);
    refreshList();
    showToast(t('adminResetQuotaSuccess', { name }));
    setResetQuotaConfirmTarget(null);
  };

  const handleOpenAssignTariff = (therapist: Therapist) => {
    setSelectedTherapistForTariff(therapist);
    setIsAssignModalOpen(true);
  };

  const handleTariffAssigned = (updatedTherapist: Therapist) => {
    refreshList();
    showToast(`Tarif "${updatedTherapist.tarifLabel}" für ${updatedTherapist.vorname} ${updatedTherapist.nachname} erfolgreich aktiviert`);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(t('adminConfirmDelete', { name }))) {
      deleteTherapist(id);
      showToast(`Therapeut ${name} wurde gelöscht`);
    }
  };

  const handleLoginAsTherapist = (id: string) => {
    setActiveTherapistId(id);
    onSwitchToTherapist(id);
  };

  const handleCreateNewTherapist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTherapistData.vorname || !newTherapistData.nachname || !newTherapistData.email) {
      alert('Bitte füllen Sie mindestens Vorname, Nachname und E-Mail aus.');
      return;
    }

    const created = createTherapist({
      vorname: newTherapistData.vorname.trim(),
      nachname: newTherapistData.nachname.trim(),
      praxisName: newTherapistData.praxisName.trim() || undefined,
      adresse: newTherapistData.adresse.trim() || 'Praxisanschrift',
      land: newTherapistData.land,
      email: newTherapistData.email.trim().toLowerCase(),
      telefon: newTherapistData.telefon.trim() || '+49 000 000000',
      initialPackageId: newTherapistData.initialPackageId,
    });

    setIsAddModalOpen(false);
    setNewTherapistData({
      vorname: '',
      nachname: '',
      praxisName: '',
      adresse: '',
      land: 'Deutschland',
      email: '',
      telefon: '',
      initialPackageId: 'free_trial',
    });
    showToast(`Therapeut ${created.vorname} ${created.nachname} erfolgreich mit Tarif "${created.tarifLabel}" angelegt`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Vorname', 'Nachname', 'Praxis', 'E-Mail', 'Telefon', 'Adresse', 'Land', 'Tarif', 'Tarifpreis (€)', 'Analysen verbraucht', 'Max Analysen', 'Status', 'Registriert Am'];
    const rows = therapists.map(th => [
      th.id,
      `"${th.vorname}"`,
      `"${th.nachname}"`,
      `"${th.praxisName || ''}"`,
      `"${th.email}"`,
      `"${th.telefon}"`,
      `"${th.adresse}"`,
      `"${th.land}"`,
      `"${th.tarifLabel}"`,
      th.tarifPrice ?? 0,
      th.usedAnalyses,
      th.isUnlimited || th.tarif === 'pro_unlimited' ? 'Unbegrenzt' : th.maxAnalyses,
      `"${th.status}"`,
      `"${th.registeredAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `therapeuten-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered therapists
  const filteredTherapists = therapists.filter(th => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      th.vorname.toLowerCase().includes(query) ||
      th.nachname.toLowerCase().includes(query) ||
      th.email.toLowerCase().includes(query) ||
      th.adresse.toLowerCase().includes(query) ||
      th.land.toLowerCase().includes(query) ||
      (th.praxisName && th.praxisName.toLowerCase().includes(query));

    const matchesTarif = filterTarif === 'all' || th.tarif === filterTarif || th.tarifId === filterTarif;
    const isUnlimited = th.isUnlimited || th.tarif === 'pro_unlimited' || th.maxAnalyses >= 900000;
    const isLimitReached = !isUnlimited && th.usedAnalyses >= th.maxAnalyses;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'limit_reached' ? isLimitReached : !isLimitReached);

    return matchesSearch && matchesTarif && matchesStatus;
  });

  // Key stats
  const totalCount = therapists.length;
  const limitReachedCount = therapists.filter(th => (!th.isUnlimited && th.tarif !== 'pro_unlimited' && th.maxAnalyses < 900000) && th.usedAnalyses >= th.maxAnalyses).length;
  const proCount = therapists.filter(th => th.isUnlimited || th.tarif === 'pro_unlimited' || th.maxAnalyses >= 900000).length;
  const totalAnalyses = therapists.reduce((acc, th) => acc + th.usedAnalyses, 0);


  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)] bg-slate-50 w-full">
      {/* Toast */}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar (Sticky on desktop, bottom-aligned with viewport) */}
      <div className="w-full md:w-64 bg-slate-100 border-r border-slate-200 flex flex-col flex-shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:max-h-[calc(100vh-4rem)] md:self-start z-20 shadow-xs">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-8 px-2">
            <ShieldCheck className="w-6 h-6 text-slate-800" />
            <span className="font-bold text-lg text-slate-800">{t('adminPanelBadge')}</span>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={() => handleSelectTab('therapists')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'therapists'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>{t('adminNavTherapists')}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === 'therapists' ? 'bg-teal-500 text-slate-950' : 'bg-slate-200 text-slate-600'
              }`}>
                {therapists.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('packages')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>{t('adminNavPackages')}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === 'packages' ? 'bg-teal-500 text-slate-950' : 'bg-slate-200 text-slate-600'
              }`}>
                {packages.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('tokens')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'tokens'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Coins className="w-4 h-4 text-teal-400" />
                <span>{t('adminNavTokens')}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                activeTab === 'tokens' ? 'bg-teal-500 text-slate-950' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Live
              </span>
            </button>

            <button
              id="admin-nav-stripe"
              onClick={() => handleSelectTab('stripe')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'stripe'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-violet-400" />
                <span>{t('adminStripeTab')}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                activeTab === 'stripe' ? 'bg-violet-500 text-white' : 'bg-violet-100 text-violet-800'
              }`}>
                Stripe
              </span>
            </button>
            
            <button
              onClick={() => handleSelectTab('requests')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-teal-50 text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-4 h-4" />
                <span>{t('adminNavNameChange')}</span>
              </div>
              {pendingNameChanges > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === 'requests' ? 'bg-teal-500 text-slate-950' : 'bg-teal-100 text-teal-700'
                }`}>
                  {pendingNameChanges}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSelectTab('terms')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Scale className="w-4 h-4" />
                <span>{t('adminNavTerms')}</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('config')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <KeyRound className="w-4 h-4" />
                <span>{t('adminNavConfig')}</span>
              </div>
            </button>

            <button
              id="admin-nav-organon"
              onClick={() => handleSelectTab('organon')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'organon'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>{t('adminNavOrganon')}</span>
              </div>
            </button>

            {/* Import Menu Section */}
            <div className="pt-2 pb-1">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-teal-500" />
                <span>Import</span>
              </div>
              <div className="pl-3 mt-1 space-y-1 border-l-2 border-slate-200 ml-3">
                <button
                  id="admin-nav-import-materia-medica"
                  onClick={() => handleSelectTab('import_materia_medica')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'import_materia_medica'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-teal-400" />
                  <span>Materia Medica</span>
                </button>
                <button
                  id="admin-nav-import-repertorium"
                  onClick={() => handleSelectTab('import_repertorium')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'import_repertorium'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Repertorium</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin Footer */}
        <div className="p-4 border-t border-slate-200 space-y-1 bg-slate-100 mt-auto shrink-0">
          <button 
            type="button"
            onClick={onLogout}
            className="w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('adminBtnLogout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
      {/* Admin Header */}
      {activeTab !== 'organon' && (
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 border border-slate-800 shadow-md mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded">
                  {t('adminPanelBadge')}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {adminCreds.email}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                {t('adminPanelTitle')}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="admin-btn-add-therapist"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('adminBtnAddTherapist')}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('adminBtnExportCSV')}</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-700 hover:border-rose-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('adminBtnLogout')}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('adminStatRegistered')}</div>
            <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('adminStatAnalysesTotal')}</div>
            <div className="text-2xl font-bold text-teal-400 mt-1">{totalAnalyses}</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('adminStatLimitReached')}</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{limitReachedCount}</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Flatrate / Pro-Nutzer</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{proCount}</div>
          </div>
        </div>
      </div>
      )}



      {/* Tab 4: Admin Credentials & System Configuration */}
      {activeTab === 'config' && (
        <AdminConfigEditor onShowToast={showToast} />
      )}

      {activeTab === 'organon' && (
        <OrganonView />
      )}

      {activeTab === 'import_materia_medica' && (
        <AdminMateriaMedicaImportModule />
      )}

      {activeTab === 'import_repertorium' && (
        <AdminRepertoryImportModule />
      )}

      {/* Tab: Name Change Requests */}
      {activeTab === 'requests' && (<AdminNameChangeRequests />)}

      {/* Tab 3: Terms & Conditions (AGB) Editor */}
      {activeTab === 'terms' && (
        <AdminTermsEditor />
      )}

      {/* Tab: Token Usage & Live Billing */}
      {activeTab === 'tokens' && (
        <AdminTokenUsage />
      )}

      {/* Tab: Stripe Payments & Webhook Config */}
      {activeTab === 'stripe' && (
        <AdminStripeSettings />
      )}

      {/* Tab 2: Packages & Tariffs Configurator */}
      {activeTab === 'packages' && (
        <PackagePlansManager />
      )}

      {/* Tab 1: Therapists Table Card */}
      {activeTab === 'therapists' && (
        <div className="card overflow-hidden">
          {/* Table Filters & Search */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md flex items-center">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  id="admin-search-input"
                  type="text"
                  placeholder={t('adminSearchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('adminFilterTariff')}</span>
                <select
                  value={filterTarif}
                  onChange={(e) => setFilterTarif(e.target.value)}
                  className="text-xs font-semibold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">{t('adminFilterAllTariffs')}</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.price} €)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                <span>{t('adminFilterStatus')}</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-xs font-semibold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">{t('adminFilterAllStatuses')}</option>
                  <option value="active">{t('adminFilterActive')}</option>
                  <option value="limit_reached">{t('adminFilterLimit')}</option>
                </select>
              </div>


            </div>
          </div>

          {/* REQUIRED TABLE */}
          <div className="overflow-x-auto">
            <table id="admin-therapists-table" className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{t('adminTableColTherapist')}</th>
                  <th className="py-3.5 px-4">{t('adminTableColContact')}</th>
                  <th className="py-3.5 px-4">{t('regAddress')} & {t('regCountry')}</th>
                  <th className="py-3.5 px-4">{t('assignedTariffAndPrice') || 'Zugewiesener Tarif & Preis'}</th>
                  <th className="py-3.5 px-4">{t('adminTableColUsage')}</th>
                  <th className="py-3.5 px-4">{t('adminTableColRegistered')}</th>
                  <th className="py-3.5 px-4 text-right">{t('adminTableColActions')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTherapists.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      {t('noCasesFound')}
                    </td>
                  </tr>
                ) : (
                  filteredTherapists.map((th) => {
                    const isUnlimited = th.isUnlimited || th.tarif === 'pro_unlimited' || th.maxAnalyses >= 900000;
                    const isLimitReached = !isUnlimited && th.usedAnalyses >= th.maxAnalyses;
                    const planPrice = th.tarifPrice ?? (th.tarif === 'pro_unlimited' ? 149 : 0);
                    const isTestTariff = th.tarif === 'free_trial' || th.tarifId === 'free_trial' || th.tarifPeriod === 'free' || (th.tarifLabel && th.tarifLabel.toLowerCase().includes('test'));

                    return (
                      <tr key={th.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name & Praxis */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900 text-sm">
                            {th.vorname} {th.nachname}
                          </div>
                          {th.praxisName ? (
                            <div className="text-[11px] text-slate-500 font-medium">{th.praxisName}</div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic">Praxis für Homöopathie</div>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">ID: {th.id}</span>
                        </td>

                        {/* Kontaktdaten (E-Mail & Telefon) */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a href={`mailto:${th.email}`} className="hover:underline hover:text-teal-700">
                              {th.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{th.telefon}</span>
                          </div>
                        </td>

                        {/* Adresse & Land */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <div>{th.adresse}</div>
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                <span>{getCountryFlag(th.land)}</span>
                                <span>{th.land}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tarif mit Tarifwechsel-Button */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <button
                              onClick={() => handleOpenAssignTariff(th)}
                              title="Tarif für diesen Nutzer ändern"
                              className="group text-left inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:border-teal-500 bg-white border-slate-300 text-slate-800"
                            >
                              {isUnlimited ? (
                                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                              ) : (
                                <Package className="w-3 h-3 text-teal-600 shrink-0" />
                              )}
                              <span className="group-hover:text-teal-700">{th.tarifLabel || th.tarif}</span>
                              <Tag className="w-3 h-3 text-slate-400 group-hover:text-teal-600 ml-0.5" />
                            </button>

                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                              <span className="font-bold text-slate-800">{planPrice} €</span>
                              <span>•</span>
                              <span>{isUnlimited ? 'Flatrate' : `${th.maxAnalyses} Analysen`}</span>
                            </div>
                          </div>
                        </td>

                        {/* Verbrauchte Analysen */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 font-mono text-xs">
                              {th.usedAnalyses} {isUnlimited ? '(Unbegrenzt)' : `${t('quotaOf')} ${th.maxAnalyses}`}
                            </span>
                            {isLimitReached && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                                <Lock className="w-3 h-3" />
                                <span>{t('testNavLocked')}</span>
                              </span>
                            )}
                          </div>

                          {/* Visual bar */}
                          {!isUnlimited && (
                            <div className="w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${isLimitReached ? 'bg-rose-500' : 'bg-teal-600'}`}
                                style={{ width: `${Math.min(100, (th.usedAnalyses / th.maxAnalyses) * 100)}%` }}
                              />
                            </div>
                          )}
                        </td>

                        {/* Registriert */}
                        <td className="py-4 px-4 text-slate-500 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(th.registeredAt).toLocaleDateString([], {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Assign / Change Tariff */}
                            <button
                              onClick={() => handleOpenAssignTariff(th)}
                              title="Tarif & Paket zuweisen"
                              className="p-1.5 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Layers className="w-4 h-4" />
                            </button>

                            {/* Reset quota - nur bei Test-Tarif */}
                            {isTestTariff && (
                              <button
                                onClick={() => handlePromptResetQuota(th.id, `${th.vorname} ${th.nachname}`)}
                                title={t('adminBtnResetQuota')}
                                className="p-1.5 text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}

                            {/* Login as this therapist */}
                            <button
                              onClick={() => handleLoginAsTherapist(th.id)}
                              title={t('adminBtnOpenAsTherapist')}
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(th.id, `${th.vorname} ${th.nachname}`)}
                              title={t('adminBtnDelete')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Assign Tariff to Therapist */}
      {isAssignModalOpen && selectedTherapistForTariff && (
        <TariffAssignModal
          therapist={selectedTherapistForTariff}
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedTherapistForTariff(null);
          }}
          onAssigned={handleTariffAssigned}
        />
      )}

      {/* Modal: Add Therapist manually */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-400" />
                <span>{t('adminModalNewTherapist')}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTherapist} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('regFirstName')} *</label>
                  <input
                    type="text"
                    required
                    value={newTherapistData.vorname}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, vorname: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 h-[38px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('regLastName')} *</label>
                  <input
                    type="text"
                    required
                    value={newTherapistData.nachname}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, nachname: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 h-[38px]"
                  />
                </div>
              </div>

              {/* Start-Tarif / Paket auswählen */}
              <div>
                <label className="block text-[11px] font-bold text-teal-800 uppercase mb-1">
                  Start-Tarif / Paket für diesen Therapeuten *
                </label>
                <select
                  value={newTherapistData.initialPackageId}
                  onChange={(e) => setNewTherapistData({ ...newTherapistData, initialPackageId: e.target.value })}
                  className="w-full px-3 py-2 border border-teal-400 bg-teal-50/40 rounded-md focus:outline-none focus:border-teal-600 font-semibold text-slate-900 h-[38px]"
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price} € ({p.isUnlimited ? 'Flatrate Unbegrenzt' : `${p.maxAnalyses} Analysen`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('regPraxisName')}</label>
                <input
                  type="text"
                  placeholder="z.B. Praxis für Klassische Homöopathie"
                  value={newTherapistData.praxisName}
                  onChange={(e) => setNewTherapistData({ ...newTherapistData, praxisName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 h-[38px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('regEmail')} *</label>
                  <input
                    type="email"
                    required
                    value={newTherapistData.email}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 h-[38px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('regPhone')}</label>
                  <input
                    type="tel"
                    value={newTherapistData.telefon}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, telefon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('regAddress')}</label>
                  <input
                    type="text"
                    placeholder="Musterstr. 1, 12345 Stadt"
                    value={newTherapistData.adresse}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, adresse: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 h-[38px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">{t('regCountry')}</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 pointer-events-none text-sm">
                      {getCountryFlag(newTherapistData.land)}
                    </div>
                    <select
                      value={newTherapistData.land}
                      onChange={(e) => setNewTherapistData(prev => ({ ...prev, land: e.target.value }))}
                      className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-teal-600 h-[38px] text-xs font-medium"
                    >
                      <optgroup label="DACH & Deutschsprachiger Raum">
                        {COUNTRIES.filter(c => c.group === 'DACH').map(c => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name} {c.dialCode ? `(${c.dialCode})` : ''}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label="Europa">
                        {COUNTRIES.filter(c => c.group === 'Europa').map(c => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name} {c.dialCode ? `(${c.dialCode})` : ''}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label="Weltweit & International">
                        {COUNTRIES.filter(c => c.group === 'Weltweit').map(c => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name} {c.dialCode ? `(${c.dialCode})` : ''}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label="Sonstige">
                        {COUNTRIES.filter(c => c.group === 'Sonstige').map(c => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {t('adminModalCancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold cursor-pointer shadow-xs"
                >
                  {t('adminModalCreateBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bestätigung Zähler zurücksetzen */}
      {resetQuotaConfirmTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {t('adminResetModalTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {t('adminResetModalConfirmMsg', { name: resetQuotaConfirmTarget.name })}
              </p>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setResetQuotaConfirmTarget(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('adminResetModalCancelBtn')}
              </button>

              <button
                type="button"
                onClick={handleConfirmResetQuota}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('adminResetModalConfirmBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};
