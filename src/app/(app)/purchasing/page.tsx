
import { Suspense } from 'react';
import { PurchasingClientPage } from './purchasing-client-page';

export default function PurchasingPage() {
  return (
    // Suspense es necesario porque el componente cliente usa useSearchParams
    <Suspense fallback={<div>Cargando...</div>}>
      <PurchasingClientPage />
    </Suspense>
  );
}
