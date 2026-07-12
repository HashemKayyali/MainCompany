import { getTranslations } from 'next-intl/server'
import { SmartImage } from '@/components/ui/SmartImage'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from './SectionHeading'

/**
 * CAT-026 — Logo cloud (RSC). VERBATIM port of the Vite LogoCloud: two
 * infinite CSS marquee rows (forward + reverse) of client logos. Marquee is
 * pure CSS (logo-cloud-row--fwd/--rev, ported in globals.css).
 */
export type LogoItem = { name: string; slug: string; logo?: string }

function splitRows<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2)
  return [arr.slice(0, mid), arr.slice(mid)]
}

function loopItems<T>(arr: T[], min = 8): T[] {
  if (arr.length === 0) return []
  const result = [...arr]
  while (result.length < min) result.push(...arr)
  return [...result, ...result]
}

function ClientLogo({ item }: { item: LogoItem }) {
  return (
    <div className="flex h-20 w-[150px] shrink-0 items-center justify-center px-5 sm:h-24 sm:w-[180px] sm:px-7 lg:h-28 lg:w-[210px]">
      {item.logo ? (
        <div className="relative h-12 w-full sm:h-14 lg:h-16">
          <SmartImage
            media={item.logo}
            alt=""
            fill
            sizes="(max-width: 640px) 140px, 190px"
            className="object-contain opacity-95 transition-all duration-300 hover:opacity-100"
          />
        </div>
      ) : (
        <span className="text-center text-[13px] font-semibold text-ink-500">{item.name}</span>
      )}
    </div>
  )
}

export async function LogoCloud({
  locale,
  customers,
  showHeading = true,
}: {
  locale: string
  customers: LogoItem[]
  showHeading?: boolean
}) {
  if (customers.length === 0) return null
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  const [rowA, rowB] = splitRows(customers)
  const loopA = loopItems(rowA.length > 0 ? rowA : customers, 10)
  const loopB = loopItems(rowB.length > 0 ? rowB : rowA, 10)

  return (
    <section className="site-section">
      <div className="site-container-wide">
        {showHeading && (
          <SectionHeading
            eyebrow={t('logoCloud.eyebrow')}
            title={t('logoCloud.title')}
            description={t('logoCloud.description')}
            className="mb-10 sm:mb-12"
          />
        )}

        <ul className="sr-only">
          {customers.map((c) => (
            <li key={c.slug}>{c.name}</li>
          ))}
        </ul>

        <Reveal y={18} className="relative space-y-5 overflow-hidden py-2 sm:space-y-6" dir="ltr">
          <div className="logo-cloud-track overflow-hidden" dir="ltr" aria-hidden="true">
            <div className="logo-cloud-row logo-cloud-row--fwd" aria-hidden="true">
              {loopA.map((item, index) => (
                <ClientLogo key={`a-${item.slug}-${index}`} item={item} />
              ))}
            </div>
          </div>
          <div className="logo-cloud-track overflow-hidden" dir="ltr" aria-hidden="true">
            <div className="logo-cloud-row logo-cloud-row--rev" aria-hidden="true">
              {loopB.map((item, index) => (
                <ClientLogo key={`b-${item.slug}-${index}`} item={item} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
