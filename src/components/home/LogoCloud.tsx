import { useMemo } from 'react'
import type { Customer } from '../../data/customers'
import { useCustomersData } from '../../contexts/DataContext'
import FramedImage from '../ui/FramedImage'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'

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

function ClientLogo({ customer }: { customer: Customer }) {
  return (
    <div className="flex h-20 w-[150px] shrink-0 items-center justify-center px-5 sm:h-24 sm:w-[180px] sm:px-7 lg:h-28 lg:w-[210px]">
      <FramedImage
        media={customer.logo}
        alt=""
        width={320}
        height={180}
        loading="lazy"
        sizes="(max-width: 640px) 140px, 190px"
        className="max-h-12 w-auto max-w-full object-contain opacity-95 transition-all duration-300 hover:opacity-100 sm:max-h-14 lg:max-h-16"
        fallbackTransform={{ fit: 'contain' }}
      />
    </div>
  )
}

export default function LogoCloud() {
  const { customers } = useCustomersData()
  const [rowA, rowB] = useMemo(() => splitRows(customers), [customers])
  const loopA = useMemo(() => loopItems(rowA.length > 0 ? rowA : customers, 10), [customers, rowA])
  const loopB = useMemo(() => loopItems(rowB.length > 0 ? rowB : rowA, 10), [rowA, rowB])

  if (customers.length === 0) return null

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow="Our clients"
          title="Our Clients"
          description="Brands, schools, venues, and organizations that trust Eventies for memorable event experiences."
          className="mb-10 sm:mb-12"
        />

        <ul className="sr-only">
          {customers.map(customer => (
            <li key={customer.slug}>{customer.name}</li>
          ))}
        </ul>

        <Reveal y={18} className="relative space-y-5 overflow-hidden py-2 sm:space-y-6" dir="ltr">
          <div className="logo-cloud-track overflow-hidden" dir="ltr" aria-hidden="true">
            <div className="logo-cloud-row logo-cloud-row--fwd" aria-hidden="true">
              {loopA.map((customer, index) => (
                <ClientLogo key={`a-${customer.slug}-${index}`} customer={customer} />
              ))}
            </div>
          </div>

          <div className="logo-cloud-track overflow-hidden" dir="ltr" aria-hidden="true">
            <div className="logo-cloud-row logo-cloud-row--rev" aria-hidden="true">
              {loopB.map((customer, index) => (
                <ClientLogo key={`b-${customer.slug}-${index}`} customer={customer} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
