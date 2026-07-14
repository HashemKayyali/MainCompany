import { describe, expect, it } from 'vitest'
import { legalDocuments } from '@/shared/data/legal-documents'

describe('I18N-019 legal Arabic source integrity', () => {
  it('contains real Arabic text and no common UTF-8 mojibake markers', () => {
    const arabic = JSON.stringify(
      Object.fromEntries(Object.entries(legalDocuments).map(([key, value]) => [key, value.ar]))
    )

    expect(arabic).toMatch(/[\u0600-\u06ff]/u)
    expect(arabic).not.toMatch(/(?:ط[اأإآب-ي]|ظ[اأإآب-ي]){2,}/u)
    expect(arabic).toContain('سياسة الخصوصية')
    expect(arabic).toContain('سياسة الاسترداد والإلغاء')
  })
})
