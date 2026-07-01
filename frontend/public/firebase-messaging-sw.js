importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAphFVhNS2FtHB73gMue9PqCurE-_zLGh4',
  authDomain: 'club-report-dc038.firebaseapp.com',
  projectId: 'club-report-dc038',
  storageBucket: 'club-report-dc038.firebasestorage.app',
  messagingSenderId: '81270051850',
  appId: '1:81270051850:web:6978ca8d69afd6f5c37bf3',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    requireInteraction: true,
  });
});
