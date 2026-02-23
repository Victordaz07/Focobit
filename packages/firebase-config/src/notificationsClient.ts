// Placeholder para notificaciones desde el cliente
// Las notificaciones reales se envían desde Cloud Functions
export async function sendNotificationToUserClient(
  _userId: string,
  _notification: { title: string; body: string }
): Promise<void> {
  // No-op en cliente — Cloud Functions maneja el envío real
  return
}
