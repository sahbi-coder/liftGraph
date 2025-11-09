import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

declare global {
  // eslint-disable-next-line no-var
  var liftGraphFirebaseApp: FirebaseApp | undefined;
  // eslint-disable-next-line no-var
  var liftGraphFirebaseAuth: Auth | undefined;
  // eslint-disable-next-line no-var
  var liftGraphFirebaseFirestore: Firestore | undefined;
}

type FirebaseClients = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export type Clients = {
  firebase: FirebaseClients;
};

function getFirebaseApp(): FirebaseApp {
  if (globalThis.liftGraphFirebaseApp) {
    return globalThis.liftGraphFirebaseApp;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  globalThis.liftGraphFirebaseApp = app;
  return app;
}

function getFirebaseAuth(app: FirebaseApp): Auth {
  if (globalThis.liftGraphFirebaseAuth) {
    return globalThis.liftGraphFirebaseAuth;
  }

  try {
    globalThis.liftGraphFirebaseAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    globalThis.liftGraphFirebaseAuth = getAuth(app);
  }

  return globalThis.liftGraphFirebaseAuth;
}

function getFirebaseFirestore(app: FirebaseApp): Firestore {
  if (globalThis.liftGraphFirebaseFirestore) {
    return globalThis.liftGraphFirebaseFirestore;
  }

  globalThis.liftGraphFirebaseFirestore = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  });

  return globalThis.liftGraphFirebaseFirestore;
}

export function createClients(): Clients {
  const app = getFirebaseApp();
  const auth = getFirebaseAuth(app);
  const firestore = getFirebaseFirestore(app);

  return {
    firebase: {
      app,
      auth,
      firestore,
    },
  };
}
