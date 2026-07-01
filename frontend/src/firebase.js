import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyAphFVhNS2FtHB73gMue9PqCurE-_zLGh4',
  authDomain: 'club-report-dc038.firebaseapp.com',
  projectId: 'club-report-dc038',
  storageBucket: 'club-report-dc038.firebasestorage.app',
  messagingSenderId: '81270051850',
  appId: '1:81270051850:web:6978ca8d69afd6f5c37bf3',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function requestFcmToken() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  let swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (!swReg) {
    swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
  }

  const token = await getToken(messaging, {
    vapidKey: 'BKgfExEpymgI2yKGtvq1hScBIRslawAvGKu7C3U7IWdNgTJ3XYUDcG6RRQ-ImZj7mFd7CG54SNzW1wdKhyg9DYY',
    serviceWorkerRegistration: swReg,
  });
  return token;
}

export { messaging, onMessage };
