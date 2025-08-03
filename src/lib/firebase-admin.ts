
import * as admin from 'firebase-admin';

// Comprueba si ya existe una instancia de la aplicación
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Reemplaza los escapes de nueva línea literales por secuencias de escape
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}


export const auth = admin.auth();
export const db = admin.firestore();

    