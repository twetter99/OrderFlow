
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error("Las credenciales de Firebase Admin no están configuradas en las variables de entorno.");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin SDK inicializado correctamente.");
  } catch (error: any) {
    console.error('Error en la inicialización de Firebase Admin SDK:', error.message);
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db, admin };
