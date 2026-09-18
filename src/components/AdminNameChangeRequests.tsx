import React, { useState, useEffect } from 'react';
import { NameChangeRequest } from '../types';
import { getNameChangeRequests, updateNameChangeRequestStatus } from '../services/storage';
import { CheckCircle2, XCircle, Clock, User, Mail, FileText } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const AdminNameChangeRequests: React.FC = () => {
  const { t, language } = useTranslation();
  const [requests, setRequests] = useState<NameChangeRequest[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadRequests = () => {
    setRequests(getNameChangeRequests().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    loadRequests();
    window.addEventListener('homoeo_name_change_requests_updated', loadRequests);
    return () => {
      window.removeEventListener('homoeo_name_change_requests_updated', loadRequests);
    };
  }, []);

  const handleApprove = (id: string) => {
    updateNameChangeRequestStatus(id, 'approved');
    setToastMessage(t('nameChangeApproved') || 'Namensänderung freigegeben.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReject = (id: string) => {
    updateNameChangeRequestStatus(id, 'rejected');
    setToastMessage(t('nameChangeRejected') || 'Namensänderung abgelehnt.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            {t('nameChangeRequestsTitle') || 'Anträge auf Namensänderung'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('nameChangeRequestsSubtitle') || 'Hier prüfen und genehmigen Sie Namensänderungen von Therapeuten.'}
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          {toastMessage}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">{t('noNameChangeRequests') || 'Keine Anträge vorhanden'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${
                      req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {req.status === 'pending' ? (t('statusPending') || 'Ausstehend') : req.status === 'approved' ? (t('statusApproved') || 'Genehmigt') : (t('statusRejected') || 'Abgelehnt')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(req.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('previousName') || 'Bisheriger Name'}</span>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{req.oldVorname} {req.oldNachname}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">{t('requestedName') || 'Gewünschter Name'}</span>
                      <p className="text-sm font-bold text-teal-900 mt-0.5">{req.requestedVorname} {req.requestedNachname}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                        <Mail className="w-3.5 h-3.5" />
                        Account / E-Mail
                      </span>
                      <p className="text-sm text-slate-800 font-medium">{req.therapistEmail}</p>
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        {t('reason') || 'Begründung'}
                      </span>
                      <p className="text-sm text-slate-800 bg-white p-2 rounded border border-slate-200">{req.reason}</p>
                    </div>
                  </div>
                </div>

                {req.status === 'pending' && (
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('approve') || 'Genehmigen'}
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 text-sm font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('reject') || 'Ablehnen'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
