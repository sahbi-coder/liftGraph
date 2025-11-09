import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Firestore, initializeFirestore } from 'firebase/firestore';

import type { Config } from '@/config';
import type { Clients } from '@/clients';

declare global {
  // eslint-disable-next-line no-var
  var liftGraphFirebaseApp: FirebaseApp | undefined;
  // eslint-disable-next-line no-var
  var liftGraphFirebaseAuth: Auth | undefined;
  // eslint-disable-next-line no-var
  var liftGraphFirebaseFirestore: Firestore | undefined;
}

type Options = {
  asyncStorage?: typeof AsyncStorage;
};

function getFirebaseApp(config: Config): FirebaseApp {
  if (globalThis.liftGraphFirebaseApp) {
    return globalThis.liftGraphFirebaseApp;
  }

  const app = getApps().length ? getApp() : initializeApp(config.firebase);
  globalThis.liftGraphFirebaseApp = app;
  return app;
}

function getFirebaseAuth(app: FirebaseApp, asyncStorage: typeof AsyncStorage): Auth {
  if (globalThis.liftGraphFirebaseAuth) {
    return globalThis.liftGraphFirebaseAuth;
  }

  try {
    globalThis.liftGraphFirebaseAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(asyncStorage),
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

export function createClients(config: Config, options: Options = {}): Clients {
  const asyncStorage = options.asyncStorage ?? AsyncStorage;

  const app = getFirebaseApp(config);
  const auth = getFirebaseAuth(app, asyncStorage);
  const firestore = getFirebaseFirestore(app);

  return {
    config,
    firebase: {
      app,
      auth,
      firestore,
    },
  };
}
