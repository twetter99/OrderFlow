
import dynamic from 'next/dynamic'

const PurchasingClientPage = dynamic(
  () => import('@/components/purchasing/purchasing-client-page').then((mod) => mod.PurchasingClientPage),
  { ssr: false }
)

export default function PurchasingPage() {
    return <PurchasingClientPage />;
}
