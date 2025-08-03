
import * as admin from 'firebase-admin';

// Define una función para obtener la app de Firebase Admin, inicializándola solo si es necesario.
const getFirebaseAdminApp = () => {
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
            // Si la inicialización falla, los siguientes servicios no estarán disponibles.
        }
    }
    // Devuelve la app por defecto, que ahora sabemos que está inicializada.
    return admin.app();
};

// Exporta funciones getter para los servicios.
// Estas funciones se aseguran de que la app esté inicializada antes de devolver el servicio.
export const getFirebaseAuth = () => {
    const app = getFirebaseAdminApp();
    return admin.auth(app);
};

export const getFirestore = () => {
    const app = getFirebaseAdminApp();
    return admin.firestore(app);
};

// Se exporta el namespace de admin para poder usar tipos como `admin.firestore.FieldValue`
export { admin };
