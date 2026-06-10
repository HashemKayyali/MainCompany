/**
 * Minimal i18n layer.
 *
 * The audience is Arabic, so Arabic is the only shipped locale today. This is
 * deliberately tiny: a flat `key -> string` dictionary per locale and a `t()`
 * lookup. It exists so user-facing copy (validation messages, toasts, inline
 * errors) lives in one place and can be translated/extended without touching
 * every call site.
 *
 * Design choices:
 * - `t()` falls back to the raw key if a translation is missing, so a forgotten
 *   key shows up visibly instead of crashing.
 * - `{placeholder}` tokens are interpolated from the optional `vars` map.
 * - Adding a second locale later is just another dictionary + `setLocale()`.
 *
 * Scope note: adoption is incremental. Validation messages and the contact
 * form's toasts/inline errors use this today; other surfaces can migrate to
 * `t()` over time.
 */

type Messages = Record<string, string>

const ar: Messages = {
  // ── Form validation ──────────────────────────────────────────────────────
  'validation.nameRequired': 'الاسم مطلوب',
  'validation.nameTooLong': 'الاسم طويل جدًا (100 حرف كحد أقصى)',
  'validation.emailInvalid': 'يرجى إدخال بريد إلكتروني صحيح',
  'validation.phoneInvalid': 'رقم الهاتف غير صحيح',
  'validation.messageTooLong': 'الرسالة طويلة جدًا (2000 حرف كحد أقصى)',

  // ── Contact form ─────────────────────────────────────────────────────────
  'contact.tooManyRequests': 'عدد كبير من المحاولات. يرجى الانتظار قبل المحاولة مجددًا. (المتبقي: {count})',
  'contact.tooManyRequestsToast': 'عدد كبير من المحاولات. يرجى الانتظار قليلًا.',
  'contact.saved': 'تم استلام طلبك! سنتواصل معك قريبًا.',
  'contact.savedBanner': 'تم حفظ طلبك. سنتواصل معك قريبًا.',
  'contact.fixErrors': 'يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.',
  'contact.rateLimited': 'لقد أرسلت عددًا كبيرًا من الطلبات مؤخرًا. يرجى الانتظار قليلًا قبل المحاولة مرة أخرى.',
  'contact.rejected': 'تعذّر حفظ طلبك لأن بعض البيانات غير مقبولة. يرجى مراجعة المدخلات والمحاولة مرة أخرى.',
  'contact.notSavedBanner':
    'تعذّر حفظ طلبك في نظامنا حاليًا (مشكلة في الاتصال). لم يتم حفظ طلبك — سنفتح {channel} حتى تتمكن من الوصول إلينا.',
  'contact.notSavedToast': 'لم يُحفظ (مشكلة في الاتصال). جارٍ فتح {channel} للتواصل معنا.',
  'channel.whatsapp': 'واتساب',
  'channel.email': 'البريد الإلكتروني',
}

const dictionaries: Record<string, Messages> = { ar }

let currentLocale = 'ar'

export function setLocale(locale: string) {
  currentLocale = locale
}

export function getLocale() {
  return currentLocale
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = dictionaries[currentLocale] || {}
  let text = dict[key] ?? key

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value))
    }
  }

  return text
}
