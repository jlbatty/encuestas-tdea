import * as admin from 'firebase-admin';
import * as serviceAccount from '../encuestatdea-baeff-firebase-adminsdk-fbsvc-11c5af7468.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

async function seedAdmin() {
  await db.collection('admins').doc('admin-principal').set({
    nombre: 'Administrador TdeA',
    email: 'admin@tdea.edu.co',
    password: 'admin123',
    activo: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('✅ Admin creado en Firestore');
  process.exit(0);
}

seedAdmin().catch(err => { console.error('❌', err); process.exit(1); });
