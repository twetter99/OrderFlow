// Este es un script de Node.js para crear un usuario administrador.
// Para que funcione, necesitarías configurar un entorno de Node que pueda
// procesar módulos de TypeScript y las server actions de Next.js.
// Por ahora, este archivo sirve como una guía clara y un registro de la acción solicitada.

// DATOS DEL USUARIO A CREAR:
const adminUserData = {
  email: 'admin-emergency@orderflow.com',
  password: 'UnaContrasenaSegura123',
  name: 'Admin de Emergencia',
  phone: '000000000',
  personId: 'EMERGENCY-ADMIN', // ID para vincularlo a una persona, puede ser temporal
  permissions: [
      'dashboard', 'projects', 'inventory', 'purchasing', 'users', 'supervisores', 'settings',
      'installation-templates', 'replan', 'resource-planning', 'travel-planning', 'locations',
      'receptions', 'despatches', 'completed-orders', 'suppliers', 'supplier-invoices',
      'payments', 'project-tracking', 'reports', 'documentation', 'ai-assistant',
      'clients', 'operadores', 'technicians', 'approval-flows'
  ],
};

async function createEmergencyAdmin() {
  console.log("=====================================================================");
  console.log("                    SCRIPT DE CREACIÓN DE ADMIN                      ");
  console.log("=====================================================================");
  console.log("\nEste archivo contiene la configuración para el usuario de emergencia.");
  console.log("Para crear el usuario, se debe llamar a la función 'createUser' desde un entorno de backend con las credenciales de Firebase Admin.");
  console.log("\nUsuario a crear:");
  console.log(`  Email: ${adminUserData.email}`);
  console.log(`  Nombre: ${adminUserData.name}`);
  console.log("\nLa lógica real para la creación está en el archivo `src/app/users/actions.ts`.");
  console.log("\n¡IMPORTANTE! Una vez que hayas recuperado el acceso, elimina este archivo (`create-admin.js`).");
}

createEmergencyAdmin();
