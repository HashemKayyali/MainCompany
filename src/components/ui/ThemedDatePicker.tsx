import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { cn } from '../../utils/cn'
import { APP_ROUTE_CHANGE_EVENT } from '../../utils/route-lifecycle'

type ThemedDatePickerProps = {
  label: string
  value: string
  min?: string
  disabled?: boolean
  onChange: (value: string) => void
}

type PickerPosition = {
  top: number
  left: number
  width: number
}

const pad2 = (value: number) => String(value).padStart(2, '0')

function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function fromISODate(value?: string) {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export default function ThemedDatePicker({
  label,
  value,
  min,
  disabled,
  onChange,
}: ThemedDatePickerProps) {
  const { locale, dir, translateText } = useI18n()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<PickerPosition>({ top: 0, left: 0, width: 336 })

  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])
  const selectedDate = useMemo(() => fromISODate(value), [value])
  const minDate = useMemo(() => fromISODate(min), [min])
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate ?? minDate ?? today))

  useEffect(() => {
    if (selectedDate) setVisibleMonth(startOfMonth(selectedDate))
  }, [selectedDate])

  const calendarLocale = locale === 'ar' ? 'ar-JO-u-nu-latn' : 'en-US'
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(calendarLocale, { month: 'long', year: 'numeric', numberingSystem: 'latn' }).format(visibleMonth),
    [calendarLocale, visibleMonth]
  )
  const selectedLabel = selectedDate
    ? new Intl.DateTimeFormat(calendarLocale, {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        numberingSystem: 'latn',
      }).format(selectedDate)
    : translateText('Select date')

  const weekdayLabels = useMemo(() => {
    const sunday = new Date(2024, 0, 7)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + index)
      return new Intl.DateTimeFormat(calendarLocale, { weekday: 'narrow' }).format(date)
    })
  }, [calendarLocale])

  const monthCells = useMemo(() => {
    const firstDayOffset = visibleMonth.getDay()
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
    const cells: Array<Date | null> = Array.from({ length: firstDayOffset }, () => null)

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [visibleMonth])

  const updatePosition = useCallback(() => {
    const anchor = buttonRef.current
    if (!anchor || typeof window === 'undefined') return

    const rect = anchor.getBoundingClientRect()
    const gap = 8
    const viewportPadding = 12
    const width = Math.min(336, window.innerWidth - viewportPadding * 2)
    const desiredLeft = dir === 'rtl' ? rect.right - width : rect.left
    const left = Math.min(
      Math.max(viewportPadding, desiredLeft),
      Math.max(viewportPadding, window.innerWidth - width - viewportPadding)
    )
    const estimatedHeight = 402
    const roomBelow = window.innerHeight - rect.bottom
    const top =
      roomBelow >= estimatedHeight + gap
        ? rect.bottom + gap
        : Math.max(viewportPadding, rect.top - estimatedHeight - gap)

    setPosition({ top, left, width })
  }, [dir])

  useEffect(() => {
    if (!open) return undefined
    updatePosition()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const handleViewportChange = () => updatePosition()

    window.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    return () => {
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener(APP_ROUTE_CHANGE_EVENT, close)
    return () => window.removeEventListener(APP_ROUTE_CHANGE_EVENT, close)
  }, [])

  const previousMonthDisabled = Boolean(
    minDate &&
      (visibleMonth.getFullYear() < minDate.getFullYear() ||
        (visibleMonth.getFullYear() === minDate.getFullYear() && visibleMonth.getMonth() <= minDate.getMonth()))
  )

  const moveMonth = (offset: number) => {
    setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  const chooseDate = (date: Date) => {
    if (minDate && date < minDate) return
    onChange(toISODate(date))
    setOpen(false)
  }

  const picker = open && typeof document !== 'undefined'
    ? createPortal(
        <>
          <button
            type="button"
            className="fixed inset-0 z-[119] cursor-default bg-transparent"
            aria-label={translateText('Close calendar')}
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={translateText('Choose date')}
            dir={dir}
            className="fixed z-[120] overflow-hidden rounded-[22px] border border-violet-200/90 bg-white shadow-[0_28px_80px_-24px_rgba(76,29,149,0.42)]"
            style={{ top: position.top, left: position.left, width: position.width }}
          >
            <div className="bg-[radial-gradient(circle_at_top_right,rgba(216,180,254,0.28),transparent_48%),linear-gradient(135deg,#ffffff,#faf7ff)] p-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={previousMonthDisabled}
                  onClick={() => moveMonth(-1)}
                  aria-label={translateText('Previous month')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-violet-200 bg-white text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={18} strokeWidth={2.3} />
                </button>
                <div className="min-w-0 text-center font-display text-[15px] font-black text-[#1a0b3d]">
                  {monthLabel}
                </div>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  aria-label={translateText('Next month')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-violet-200 bg-white text-violet-700 transition hover:bg-violet-50"
                >
                  <ChevronRight size={18} strokeWidth={2.3} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1" aria-hidden="true">
                {weekdayLabels.map((weekday, index) => (
                  <div
                    key={`${weekday}-${index}`}
                    className="flex h-8 items-center justify-center text-center text-[10.5px] font-black text-violet-500"
                  >
                    {weekday}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthCells.map((date, index) => {
                  if (!date) return <span key={`blank-${index}`} className="h-10" aria-hidden="true" />

                  const isDisabled = Boolean(minDate && date < minDate)
                  const isSelected = Boolean(selectedDate && sameDay(date, selectedDate))
                  const isToday = sameDay(date, today)
                  const dayLabel = String(date.getDate())

                  return (
                    <button
                      key={toISODate(date)}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => chooseDate(date)}
                      aria-pressed={isSelected}
                      className={cn(
                        'relative flex h-10 items-center justify-center rounded-[11px] text-center text-[12.5px] font-extrabold tabular-nums transition',
                        isSelected
                          ? 'bg-[linear-gradient(135deg,#7c3aed,#b832e8)] text-white shadow-[0_8px_20px_-10px_rgba(124,58,237,0.8)]'
                          : isToday
                            ? 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-300 hover:bg-violet-200'
                            : 'text-[#29134f] hover:bg-violet-100',
                        isDisabled && 'cursor-not-allowed text-slate-300 hover:bg-transparent'
                      )}
                    >
                      <span className="flex w-full items-center justify-center text-center" dir="ltr">
                        {dayLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-violet-100 bg-white px-4 py-3">
              <button
                type="button"
                disabled={Boolean(minDate && today < minDate)}
                onClick={() => chooseDate(today)}
                className="rounded-[11px] px-3 py-2 text-[12px] font-black text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                {translateText('Today')}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-[11px] border border-violet-200 bg-violet-50 px-3.5 py-2 text-[12px] font-black text-[#2e0a72] transition hover:bg-violet-100"
              >
                {translateText('Close')}
              </button>
            </div>
          </div>
        </>,
        document.body
      )
    : null

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#4b3a63]">
        {translateText(label)}
      </label>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setVisibleMonth(startOfMonth(selectedDate ?? minDate ?? today))
          setOpen(current => !current)
        }}
        className={cn(
          'form-field flex min-h-[54px] w-full items-center gap-3 text-start transition',
          'hover:border-violet-300 hover:bg-violet-50/35 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100',
          disabled && 'cursor-not-allowed opacity-55'
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays size={17} strokeWidth={2.2} className="shrink-0 text-[#7126e3]" />
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-[13px] font-bold',
            selectedDate ? 'text-[#1a0b3d]' : 'text-[#7c6b94]'
          )}
        >
          {selectedLabel}
        </span>
      </button>
      {picker}
    </div>
  )
}
