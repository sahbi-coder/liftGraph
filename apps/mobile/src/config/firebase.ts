import { createClients } from '@/clients/createClients';

const { firebase } = createClients();

const auth = firebase.auth;
const db = firebase.firestore;

export { auth, db };
