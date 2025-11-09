import type { Clients } from '@/clients';
import type { Config } from '@/config';
import type { AuthService } from '@/services/auth';
import type { FirestoreService } from '@/services/firestore';

export type Services = {
  auth: AuthService;
  firestore: FirestoreService;
};

export type Dependencies = {
  config: Config;
  clients: Clients;
  services: Services;
};
