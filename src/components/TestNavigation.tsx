import React, { useState, useEffect } from 'react';
import { ActiveView, Therapist } from '../types';
import { 
  getTherapists, 
  setActiveTherapistId, 
  isAdminLoggedIn, 
  setAdminLoggedIn,
  resetAllToSampleData 
} from '../services/storage';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { 
  FlaskConical, 
  UserCheck, 
  ShieldCheck, 
  UserPlus, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Home
} from 'lucide-react';

interface TestNavigationProps {
  currentView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  activeTherapist: Therapist | null;
}

export const TestNavigation: React.FC<TestNavigationProps> = ({
  currentView,
  onViewChange,
  activeTherapist,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [therapists, setTherapists] = useState<Therapist[]>(getTherapists());
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminLoggedIn());
  const { t } = useTranslation();

  const refreshData = () => {
    setTherapists(getTherapists());
    setIsAdmin(isAdminLoggedIn());
  };

  useEffect(() => {
    window.addEventListener('homoeo_storage_updated', refreshData);
    window.addEventListener('homoeo_active_therapist_changed', refreshData);
    window.addEventListener('homoeo_admin_auth_changed', refreshData);
    return () => {
      window.removeEventListener('homoeo_storage_updated', refreshData);
      window.removeEventListener('homoeo_active_therapist_changed', refreshData);
      window.removeEventListener('homoeo_admin_auth_changed', refreshData);
    };
  }, []);

  const handleTherapistSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId === 'new') {
      onViewChange('register');
    } else {
      setActiveTherapistId(selectedId);
      onViewChange('therapist');
    }
  };

  const handleResetData = () => {
    if (window.confirm(t('testNavResetConfirm'))) {
      resetAllToSampleData();
      onViewChange('therapist');
    }
  };

  return (
    <div id="test-navigation-bar" className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/80">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{t('testNavTitle')}</span>
          </span>
          <span className="hidden sm:inline-block text-slate-400">
            {t('testNavSubtitle')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick language indicator on top testing bar */}
          <LanguageSelector variant="compact" />

          <button
            id="toggle-test-nav-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
          >
            <span>{isExpanded ? t('testNavMinimize') : t('testNavExpand')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-2.5 max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* View switcher buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              {t('testNavView')}
            </span>

            {/* 0. Landing Page */}
            <button
              id="nav-btn-landing"
              onClick={() => onViewChange('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-all cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('testNavLandingBtn')}</span>
            </button>

            {/* 1. Registrierung */}
            <button
              id="nav-btn-register"
              onClick={() => onViewChange('register')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-all cursor-pointer ${
                currentView === 'register'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('testNavRegBtn')}</span>
            </button>

            {/* 2. Therapeuten-Panel */}
            <button
              id="nav-btn-therapist"
              onClick={() => onViewChange('therapist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-all cursor-pointer ${
                currentView === 'therapist'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('testNavTherapistBtn')}</span>
            </button>

            {/* 3. Admin-Panel */}
            <button
              id="nav-btn-admin"
              onClick={() => onViewChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-slate-700 text-white shadow-xs border border-slate-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('testNavAdminBtn')} {isAdmin ? t('testNavLoggedIn') : t('testNavLocked')}</span>
            </button>
          </div>

          {/* Active Therapist Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-slate-400 text-[11px]">{t('testNavActiveTherapist')}</span>
              <select
                id="active-therapist-selector"
                value={activeTherapist ? activeTherapist.id : 'new'}
                onChange={handleTherapistSelect}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {therapists.map(tItem => (
                  <option key={tItem.id} value={tItem.id}>
                    {tItem.vorname} {tItem.nachname} ({tItem.usedAnalyses}/{tItem.maxAnalyses > 1000 ? '∞' : tItem.maxAnalyses} {t('testNavConsumed')})
                  </option>
                ))}
                <option value="new">{t('testNavNewTherapist')}</option>
              </select>
            </div>

            {/* Reset sample data */}
            <button
              id="reset-sample-data-btn"
              onClick={handleResetData}
              title={t('testNavReset')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">{t('testNavReset')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
