import re

with open('src/services/storage.ts', 'r') as f:
    content = f.read()

# Add STORAGE_KEY
if 'NAME_CHANGE_REQUESTS:' not in content:
    content = content.replace(
        "ADMIN_CREDENTIALS: 'homoeo_admin_credentials',",
        "ADMIN_CREDENTIALS: 'homoeo_admin_credentials',\n  NAME_CHANGE_REQUESTS: 'homoeo_name_change_requests',"
    )

# Add NameChangeRequest export import
if 'NameChangeRequest' not in content:
    content = content.replace(
        'PatientChild, AnamnesisQuestion } from \'../types\';',
        'PatientChild, AnamnesisQuestion, NameChangeRequest } from \'../types\';'
    )

# Add methods
if 'export function getNameChangeRequests()' not in content:
    new_methods = '''
// Name Change Requests
export function getNameChangeRequests(): NameChangeRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NAME_CHANGE_REQUESTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNameChangeRequests(requests: NameChangeRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.NAME_CHANGE_REQUESTS, JSON.stringify(requests));
  window.dispatchEvent(new Event('homoeo_name_change_requests_updated'));
}

export function addNameChangeRequest(requestData: Omit<NameChangeRequest, 'id' | 'status' | 'createdAt'>): void {
  const current = getNameChangeRequests();
  const newReq: NameChangeRequest = {
    ...requestData,
    id: 'ncr-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  saveNameChangeRequests([...current, newReq]);
}

export function updateNameChangeRequestStatus(id: string, status: 'approved' | 'rejected'): void {
  const current = getNameChangeRequests();
  const index = current.findIndex(r => r.id === id);
  if (index !== -1) {
    const req = current[index];
    req.status = status;
    req.resolvedAt = new Date().toISOString();
    
    if (status === 'approved') {
      // update therapist
      const therapists = getTherapists();
      const tIndex = therapists.findIndex(t => t.id === req.therapistId);
      if (tIndex !== -1) {
        const therapist = therapists[tIndex];
        const oldNameStr = `${therapist.vorname} ${therapist.nachname}`;
        
        therapist.vorname = req.requestedVorname;
        therapist.nachname = req.requestedNachname;
        
        if (!therapist.previousNames) therapist.previousNames = [];
        therapist.previousNames.push({
          value: oldNameStr,
          changedAt: new Date().toISOString()
        });
        
        saveTherapists(therapists);
      }
    }
    
    saveNameChangeRequests(current);
  }
}
'''
    content += new_methods

with open('src/services/storage.ts', 'w') as f:
    f.write(content)
