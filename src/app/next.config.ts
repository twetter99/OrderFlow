import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Ignora los errores de TypeScript durante el build de producción.
    // Es crucial ejecutar `npm run typecheck` localmente antes de desplegar.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora los errores de ESLint durante el build de producción.
    // Es crucial ejecutar `npm run lint` localmente.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
