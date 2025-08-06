

export const routePermissions = {
  // ADMINISTRACIÓN
  '/dashboard': 'dashboard',
  '/clients': 'clients',
  '/operadores': 'operadores',
  '/technicians': 'technicians',
  '/supervisores': 'supervisores',
  '/users': 'users',
  '/approval-flows': 'approval-flows',
  '/settings': 'settings',
  '/reminders': 'reminders',

  // OPERACIONES
  '/projects': 'projects',
  '/installation-templates': 'installation-templates',
  '/replan': 'replan',
  
  // PLANIFICACIÓN
  '/resource-planning': 'resource-planning',
  '/travel-planning': 'travel-planning',

  // GESTIÓN DE STOCK
  '/inventory': 'inventory',
  '/locations': 'locations',
  '/receptions': 'receptions',
  '/despatches': 'despatches',

  // PROVEEDORES
  '/purchasing': 'purchasing',
  '/completed-orders': 'completed-orders',
  '/suppliers': 'suppliers',
  '/supplier-invoices': 'supplier-invoices',
  '/payments': 'payments',

  // ANÁLISIS Y CONTROL
  '/project-tracking': 'project-tracking',
  '/reports': 'reports',
  '/documentation': 'documentation',
  '/ai-assistant': 'ai-assistant',

  // Páginas especiales sin permiso directo
  '/unauthorized': null, 
  '/login': null,
  '/': null, // Permitir la raíz, que redirige
};

export const pageOrder = [
  '/dashboard',
  '/projects',
  '/inventory',
  '/purchasing',
  '/receptions',
  '/despatches',
  '/locations',
  '/suppliers',
  '/clients',
  '/users',
  '/operadores',
  '/completed-orders',
  '/installation-templates',
  '/replan',
  '/supplier-invoices',
  '/payments',
  '/reports',
  '/reminders',
  '/settings'
];

/**
 * Comprueba si un usuario tiene permiso para acceder a una ruta específica.
 * @param userPermissions - Array de strings con los permisos del usuario.
 * @param route - La ruta a comprobar (p. ej., '/dashboard').
 * @returns `true` si el usuario tiene permiso, `false` en caso contrario.
 */
export const hasPermissionForRoute = (userPermissions: string[], route: string): boolean => {
  // First, check for an exact match.
  if (route in routePermissions) {
    const requiredPermission = (routePermissions as Record<string, string | null>)[route];
    return requiredPermission === null || userPermissions.includes(requiredPermission);
  }

  // If no exact match, check for dynamic routes (e.g., /suppliers/[id])
  const routeParts = route.split('/').filter(Boolean);
  if (routeParts.length > 1) {
    // Check for parent route (e.g., /suppliers for /suppliers/some-id)
    const parentRoute = `/${routeParts[0]}`;
    if (parentRoute in routePermissions) {
       const requiredPermission = (routePermissions as Record<string, string | null>)[parentRoute];
       return requiredPermission === null || userPermissions.includes(requiredPermission);
    }
  }

  // If no specific permission is found, deny access by default for safety.
  return false;
}

/**
 * Obtiene la primera ruta a la que un usuario tiene acceso según sus permisos.
 * @param userPermissions - Array de strings con los permisos del usuario.
 * @returns La primera ruta accesible o '/unauthorized' si no tiene acceso a ninguna.
 */
export const getFirstAccessibleRoute = (userPermissions: string[]): string => {
  for (const route of pageOrder) {
    if (hasPermissionForRoute(userPermissions, route)) {
      return route;
    }
  }
  return '/unauthorized';
};
