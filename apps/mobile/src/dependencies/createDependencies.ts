import { Clients } from '@/clients';
import { Dependencies } from '@/dependencies';
import { AuthService } from '@/services/auth';
import { FirestoreService } from '@/services/firestore';

export function createDependencies(clients: Clients): Dependencies {
  return {
    config: clients.config,
    clients,
    services: {
      auth: new AuthService(clients.firebase.auth),
      firestore: new FirestoreService(clients.firebase.firestore),
    },
  };
}
