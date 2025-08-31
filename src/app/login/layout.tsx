import React from 'react';

// Este es el layout específico para la ruta /login.
// Se ha simplificado para evitar anidar etiquetas <html> y <body>,
// lo que causaba el error de hidratación. Simplemente renderiza los
// componentes hijos directamente, permitiendo que la página de login
// controle su propio diseño de fondo y centrado.
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
