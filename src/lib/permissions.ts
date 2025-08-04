
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
  // Añadir el resto de rutas en el orden de preferencia
];

/**
 * Comprueba si un usuario tiene permiso para acceder a una ruta específica.
 * @param userPermissions - Array de strings con los permisos del usuario.
 * @param route - La ruta a comprobar (p. ej., '/dashboard').
 * @returns `true` si el usuario tiene permiso, `false` en caso contrario.
 */
export const hasPermissionForRoute = (userPermissions: string[], route: string): boolean => {
  const requiredPermission = (routePermissions as Record<string, string | null>)[route];
  
  // Si la ruta no requiere un permiso (es pública o especial), se permite el acceso.
  if (requiredPermission === null) {
    return true;
  }
  
  // Si la ruta requiere un permiso, comprobamos si el usuario lo tiene.
  return userPermissions.includes(requiredPermission);
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
