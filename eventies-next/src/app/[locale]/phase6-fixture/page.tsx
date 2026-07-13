import { notFound } from 'next/navigation'
import { AdminInterior } from '@/features/admin/AdminInterior'

export default function Phase6FixturePage() {
  if (process.env.VERCEL_ENV === 'production') notFound()
  return (
    <div className="site-container py-10" data-testid="phase6-fixture">
      <AdminInterior section="products" fixture />
    </div>
  )
}
