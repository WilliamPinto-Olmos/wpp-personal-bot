import admin from 'firebase-admin';
import serviceAccount from './firebase.json' with { type: 'json' };
import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp({
  credential: admin.credential.cert((serviceAccount) as admin.ServiceAccount),
  projectId: serviceAccount.project_id,
});

const customDatabase = process.env.FIRESTORE_DATABASE_NAME;

const db = customDatabase ? getFirestore(admin.app(), customDatabase) : getFirestore(admin.app());

db.settings({
    ignoreUndefinedProperties: true
})

export {db }
