export function subscribeToNotifications(
  _userId: string,
  callback: (notifications: never[]) => void
) {
  callback([])
  return () => undefined
}

export async function markNotificationAsRead() {}
