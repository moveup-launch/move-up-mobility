export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export function scheduleVisitReminders(visits) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  visits.forEach(visit => {
    if (!visit.visit_date || !visit.visit_time || visit._pending) return;
    const visitMs = new Date(`${visit.visit_date}T${visit.visit_time}:00`).getTime();
    const delay = visitMs - 60 * 60 * 1000 - now; // 1h avant la visite
    if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return; // uniquement les 24h à venir
    setTimeout(() => {
      new Notification('Move Up — Rappel visite', {
        body: `Visite ${visit.client_name} dans 1h (${visit.visit_time.replace(':', 'h')})`,
        icon: '/icon-192.png',
        tag: `reminder-${visit.id}`,
      });
    }, delay);
  });
}

export function showSyncedNotification(clientName, isFr = true) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification('Move Up Mobility', {
    body: isFr
      ? `✅ Visite de ${clientName} synchronisée`
      : `✅ Visit for ${clientName} synced`,
    icon: '/icon-192.png',
    tag: 'sync',
  });
}
