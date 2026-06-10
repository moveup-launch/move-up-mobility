const VISITS_KEY = 'moveup_offline_visits';

export function getOfflineVisits() {
  try { return JSON.parse(localStorage.getItem(VISITS_KEY) || '[]'); }
  catch { return []; }
}

export function addOfflineVisit(data) {
  const all = getOfflineVisits();
  const visit = {
    ...data,
    _offlineId: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    _pending: true,
  };
  localStorage.setItem(VISITS_KEY, JSON.stringify([...all, visit]));
  return visit;
}

export function removeOfflineVisit(offlineId) {
  localStorage.setItem(
    VISITS_KEY,
    JSON.stringify(getOfflineVisits().filter(v => v._offlineId !== offlineId))
  );
}
