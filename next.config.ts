import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! ADVERTENCIA !!
    // Ignorar errores de TypeScript durante el build de producción puede ocultar problemas.
    // Asegúrate de ejecutar `npm run typecheck` localmente antes de desplegar.
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! ADVERTENCIA !!
    // Ignorar errores de ESLint durante el build de producción puede ocultar problemas.
    // Asegúrate de ejecutar `npm run lint` localmente.
    ignoreDuringBuilds: true,
  },
  env: {
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  }
};

export default nextConfig;
