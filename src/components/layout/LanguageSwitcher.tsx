import { Languages } from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { cn } from '../../utils/cn'

export default function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { locale, toggleLocale, t } = useI18n()
  const nextLabel = locale === 'en' ? t('language.arabic') : t('language.english')
  const ariaLabel = locale === 'en' ? t('language.switchToArabic') : t('language.switchToEnglish')

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border font-display font-bold transition-all',
        compact
          ? 'min-h-[40px] px-3 text-[12px]'
          : 'h-11 px-3.5 text-[12.5px]',
        className
      )}
      data-i18n-skip
    >
      <Languages className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2.2} />
      <span>{locale === 'en' ? 'AR' : 'EN'}</span>
      {!compact && <span className="hidden text-[11px] opacity-70 sm:inline">{nextLabel}</span>}
    </button>
  )
}
