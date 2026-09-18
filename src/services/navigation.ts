import { ActiveView } from '../types';
import { 
  getStoredActiveView, 
  setStoredActiveView,
  getStoredTherapistTab,
  setStoredTherapistTab,
  getStoredAdminTab,
  setStoredAdminTab,
  getActiveTherapist
} from './storage';

export interface AppNavigationState {
  app: 'homeopilot';
  index: number;
  view: ActiveView;
  therapistTab?: 'cases' | 'patients' | 'materiamedica' | 'quickintake' | 'medications' | 'documentation' | 'profile' | 'tariff' | 'repertorium';
  adminTab?: 'therapists' | 'packages' | 'tokens' | 'stripe' | 'terms' | 'config' | 'requests' | 'organon' | 'repertory' | 'import_materia_medica' | 'import_repertorium';
  modal?: string | null;
  isSentinel?: boolean;
}

export const VALID_VIEWS: ActiveView[] = ['landing', 'register', 'therapist', 'admin'];
export const VALID_THERAPIST_TABS = ['cases', 'patients', 'materiamedica', 'quickintake', 'medications', 'documentation', 'profile', 'tariff', 'repertorium'] as const;
export const VALID_ADMIN_TABS = ['therapists', 'packages', 'tokens', 'stripe', 'terms', 'config', 'requests', 'organon', 'repertory', 'import_materia_medica', 'import_repertorium'] as const;

let currentIndex = 1;
let isInitialized = false;
let isInternalNavigation = false;

/**
 * Parses window.location.hash into view, sub-tabs, and modal state
 */
export function parseHash(hash: string): {
  view: ActiveView;
  therapistTab?: 'cases' | 'patients' | 'materiamedica' | 'quickintake' | 'medications' | 'documentation' | 'profile' | 'tariff' | 'repertorium';
  adminTab?: 'therapists' | 'packages' | 'tokens' | 'stripe' | 'terms' | 'config' | 'requests' | 'organon' | 'repertory' | 'import_materia_medica' | 'import_repertorium';
  modal?: string | null;
} {
  const cleanHash = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = cleanHash.split('?');
  const segments = pathPart ? pathPart.split('/').filter(Boolean) : [];

  let modal: string | null = null;
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    modal = params.get('modal') || null;
  }

  const rawView = segments[0];
  let view: ActiveView = 'landing';
  let therapistTab: any = undefined;
  let adminTab: any = undefined;

  if (rawView === 'organon') {
    view = 'admin';
    adminTab = 'organon';
  } else if (rawView && VALID_VIEWS.includes(rawView as ActiveView)) {
    view = rawView as ActiveView;
  } else {
    view = getStoredActiveView();
  }

  if (view === 'therapist') {
    const rawTab = segments[1];
    if (rawTab && VALID_THERAPIST_TABS.includes(rawTab as any)) {
      therapistTab = rawTab;
    } else {
      therapistTab = getStoredTherapistTab();
    }
  } else if (view === 'admin') {
    const rawTab = segments[1];
    if (rawTab && VALID_ADMIN_TABS.includes(rawTab as any)) {
      adminTab = rawTab;
    } else {
      adminTab = getStoredAdminTab();
    }
  }

  return { view, therapistTab, adminTab, modal };
}

/**
 * Builds the URL hash string based on navigation state
 */
export function buildHash(
  view: ActiveView,
  therapistTab?: string,
  adminTab?: string,
  modal?: string | null
): string {
  let path = `#/${view}`;
  if (view === 'therapist' && therapistTab) {
    path += `/${therapistTab}`;
  } else if (view === 'admin' && adminTab) {
    path += `/${adminTab}`;
  }

  if (modal) {
    path += `?modal=${encodeURIComponent(modal)}`;
  }

  return path;
}

/**
 * Dispatches synchronization events across the app
 */
export function dispatchNavigationEvents(state: {
  view: ActiveView;
  therapistTab?: any;
  adminTab?: any;
  modal?: string | null;
}) {
  if (typeof window === 'undefined') return;

  // 1. Storage persistence
  setStoredActiveView(state.view);
  if (state.therapistTab) {
    setStoredTherapistTab(state.therapistTab);
  }
  if (state.adminTab) {
    setStoredAdminTab(state.adminTab);
  }

  // 2. Global navigation state event
  window.dispatchEvent(new CustomEvent('homoeo_navigation_state_changed', { detail: state }));

  // 3. Tab-specific events for existing component listeners
  if (state.therapistTab) {
    window.dispatchEvent(new CustomEvent('homoeo_therapist_tab_changed', { detail: state.therapistTab }));
    window.dispatchEvent(new CustomEvent('homoeo_action_set_therapist_tab', { detail: state.therapistTab }));
  }
  if (state.adminTab) {
    window.dispatchEvent(new CustomEvent('homoeo_admin_tab_changed', { detail: state.adminTab }));
    window.dispatchEvent(new CustomEvent('homoeo_action_set_admin_tab', { detail: state.adminTab }));
  }

  // 4. Modal event
  window.dispatchEvent(new CustomEvent('homoeo_action_set_modal', { detail: state.modal || null }));
}

/**
 * Initializes the history stack and sets up the sentinel anchor to prevent
 * the browser from exiting the app when the user presses "Zurück" (Back).
 */
export function initNavigation(defaultView?: ActiveView): {
  view: ActiveView;
  therapistTab?: any;
  adminTab?: any;
  modal?: string | null;
} {
  try {
    if (typeof window === 'undefined') {
      return { view: defaultView || 'landing' };
    }

    // Read initial from hash or storage
    const parsed = parseHash(window.location.hash || '');
    const initialView = parsed.view || defaultView || getStoredActiveView();
    const initialTherapistTab = parsed.therapistTab || (initialView === 'therapist' ? getStoredTherapistTab() : undefined);
    const initialAdminTab = parsed.adminTab || (initialView === 'admin' ? getStoredAdminTab() : undefined);
    const initialModal = parsed.modal;

    const targetHash = buildHash(initialView, initialTherapistTab, initialAdminTab, initialModal);

    try {
      const existingState = window.history.state as AppNavigationState | null;

      if (!existingState || existingState.app !== 'homeopilot') {
        // 1. Establish sentinel anchor at index 0 (same origin, catches root Back press)
        const sentinelState: AppNavigationState = {
          app: 'homeopilot',
          index: 0,
          isSentinel: true,
          view: initialView,
          therapistTab: initialTherapistTab,
          adminTab: initialAdminTab,
          modal: null,
        };
        window.history.replaceState(sentinelState, '', targetHash);

        // 2. Push active working state at index 1
        currentIndex = 1;
        const activeState: AppNavigationState = {
          app: 'homeopilot',
          index: 1,
          view: initialView,
          therapistTab: initialTherapistTab,
          adminTab: initialAdminTab,
          modal: initialModal,
        };
        window.history.pushState(activeState, '', targetHash);
      } else {
        currentIndex = existingState.index || 1;
      }
    } catch (histErr) {
      console.warn('[Navigation] History state API restricted in iframe:', histErr);
    }

    if (!isInitialized) {
      isInitialized = true;

      // Listen to browser popstate (Back & Forward buttons)
      window.addEventListener('popstate', (event) => {
        try {
          const state = event.state as AppNavigationState | null;

          // Check if user hit the sentinel (index <= 0) or exited app history
          if (!state || state.app !== 'homeopilot' || state.index <= 0 || state.isSentinel) {
            const currentHashParsed = parseHash(window.location.hash || '');
            const safeView = currentHashParsed.view || initialView;
            const safeTherapistTab = currentHashParsed.therapistTab || (safeView === 'therapist' ? getStoredTherapistTab() : undefined);
            const safeAdminTab = currentHashParsed.adminTab || (safeView === 'admin' ? getStoredAdminTab() : undefined);
            const safeHash = buildHash(safeView, safeTherapistTab, safeAdminTab);

            currentIndex = 1;
            const restoredState: AppNavigationState = {
              app: 'homeopilot',
              index: 1,
              view: safeView,
              therapistTab: safeTherapistTab,
              adminTab: safeAdminTab,
              modal: null,
            };
            try {
              window.history.pushState(restoredState, '', safeHash);
            } catch {}

            dispatchNavigationEvents({
              view: safeView,
              therapistTab: safeTherapistTab,
              adminTab: safeAdminTab,
              modal: null,
            });
            return;
          }

          // Normal in-app Back or Forward navigation
          currentIndex = state.index;
          isInternalNavigation = true;

          dispatchNavigationEvents({
            view: state.view,
            therapistTab: state.therapistTab,
            adminTab: state.adminTab,
            modal: state.modal || null,
          });

          isInternalNavigation = false;
        } catch (e) {
          console.warn('[Navigation] Popstate error handled:', e);
        }
      });

      // Also listen to hashchange if user manually edits URL
      window.addEventListener('hashchange', () => {
        try {
          if (isInternalNavigation) return;
          const current = parseHash(window.location.hash || '');
          navigateTo(current.view, {
            therapistTab: current.therapistTab,
            adminTab: current.adminTab,
            modal: current.modal,
            replace: true,
          });
        } catch (e) {
          console.warn('[Navigation] Hashchange error handled:', e);
        }
      });
    }

    return {
      view: initialView,
      therapistTab: initialTherapistTab,
      adminTab: initialAdminTab,
      modal: initialModal,
    };
  } catch (outerErr) {
    console.warn('[Navigation] initNavigation fallback applied:', outerErr);
    return {
      view: defaultView || 'landing'
    };
  }
}

/**
 * Navigates to a view, sub-tab or modal by pushing a new history state
 */
export function navigateTo(
  view: ActiveView,
  options?: {
    therapistTab?: 'cases' | 'patients' | 'materiamedica' | 'quickintake' | 'medications' | 'documentation' | 'profile' | 'tariff' | 'repertorium';
    adminTab?: 'therapists' | 'packages' | 'tokens' | 'stripe' | 'terms' | 'config' | 'requests' | 'organon' | 'repertory' | 'import_materia_medica' | 'import_repertorium';
    modal?: string | null;
    replace?: boolean;
  }
): void {
  if (typeof window === 'undefined') return;

  const targetTherapistTab = options?.therapistTab !== undefined 
    ? options.therapistTab 
    : (view === 'therapist' ? getStoredTherapistTab() : undefined);

  const targetAdminTab = options?.adminTab !== undefined 
    ? options.adminTab 
    : (view === 'admin' ? getStoredAdminTab() : undefined);

  const targetModal = options?.modal !== undefined ? options.modal : null;

  const targetHash = buildHash(view, targetTherapistTab, targetAdminTab, targetModal);

  // Avoid redundant navigation to the exact same location
  if (window.location.hash === targetHash && !options?.replace) {
    return;
  }

  try {
    if (options?.replace) {
      const state: AppNavigationState = {
        app: 'homeopilot',
        index: currentIndex,
        view,
        therapistTab: targetTherapistTab,
        adminTab: targetAdminTab,
        modal: targetModal,
      };
      window.history.replaceState(state, '', targetHash);
    } else {
      currentIndex += 1;
      const state: AppNavigationState = {
        app: 'homeopilot',
        index: currentIndex,
        view,
        therapistTab: targetTherapistTab,
        adminTab: targetAdminTab,
        modal: targetModal,
      };
      window.history.pushState(state, '', targetHash);
    }
  } catch (err) {
    console.warn('[Navigation] History modification restricted:', err);
  }

  dispatchNavigationEvents({
    view,
    therapistTab: targetTherapistTab,
    adminTab: targetAdminTab,
    modal: targetModal,
  });
}

/**
 * Opens a modal and records it in the history state without changing views.
 */
export function openModal(modalId: string): void {
  const current = parseHash(window.location.hash);
  navigateTo(current.view, {
    therapistTab: current.therapistTab,
    adminTab: current.adminTab,
    modal: modalId,
    replace: true,
  });
}

/**
 * Closes the active modal in history safely on the current view.
 */
export function closeModal(): void {
  const current = parseHash(window.location.hash);
  navigateTo(current.view, {
    therapistTab: current.therapistTab,
    adminTab: current.adminTab,
    modal: null,
    replace: true,
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('homoeo_action_set_modal', { detail: null }));
  }
}
