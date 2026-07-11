import type { LegalDocumentKey } from '@/shared/data/legal-documents'
import { legalDocuments } from '@/shared/data/legal-documents'

/** CAT-017 / SEO-004 — the ported doc's meta copy (page composes buildMetadata). */
export function legalMetaCopy(docKey: LegalDocumentKey, locale: string) {
  const copy = locale === 'ar' ? legalDocuments[docKey].ar : legalDocuments[docKey].en
  return { title: copy.metaTitle, description: copy.metaDescription }
}

/** CAT-017 — shared legal renderer (RSC). Locale picks EN/AR copy. */
export function LegalDocView({ docKey, locale }: { docKey: LegalDocumentKey; locale: string }) {
  const doc = legalDocuments[docKey]
  const copy = locale === 'ar' ? doc.ar : doc.en

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{copy.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold text-ink-900">{copy.title}</h1>
      <p className="mt-3 text-ink-600">{copy.description}</p>
      <p className="mt-2 text-sm text-ink-500">
        {copy.lastUpdatedLabel}: {copy.lastUpdated}
      </p>
      {copy.note ? <p className="mt-4 rounded-lg bg-ink-50 p-4 text-sm text-ink-600">{copy.note}</p> : null}

      <div className="mt-8 space-y-8">
        {copy.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-lg font-semibold text-ink-900">{section.heading}</h2>
            {section.body?.map((p, j) => (
              <p key={j} className="mt-2 text-ink-700">
                {p}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-2 list-inside list-disc space-y-1 text-ink-700">
                {section.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-10 border-t border-ink-100 pt-6">
        <h2 className="text-lg font-semibold text-ink-900">{copy.contactHeading}</h2>
        <p className="mt-2 text-ink-700">{copy.contactBody}</p>
      </section>
    </article>
  )
}
