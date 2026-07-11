/**
 * Renders a JSON-LD <script>. `<` is escaped to prevent an embedded closing
 * tag breaking out of the script element (the prerender's safeJsonLd rule).
 * Server-rendered; no client cost.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
