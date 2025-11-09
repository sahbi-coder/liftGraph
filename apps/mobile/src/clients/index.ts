import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import type { Config } from '@/config';

export type FirebaseClients = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export type Clients = {
  config: Config;
  firebase: FirebaseClients;
};
