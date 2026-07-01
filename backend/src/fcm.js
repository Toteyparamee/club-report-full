const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

function getMessagingInstance() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getMessaging();
}

async function sendPushNotification(fcmToken, title, body) {
  const messaging = getMessagingInstance();
  await messaging.send({
    token: fcmToken,
    notification: { title, body },
    webpush: {
      notification: {
        title,
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        requireInteraction: true,
      },
      fcmOptions: {
        link: 'https://club-report.vercel.app/',
      },
    },
  });
}

module.exports = { sendPushNotification };
