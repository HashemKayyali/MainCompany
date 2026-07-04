import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  PackageCheck,
  PhoneCall,
  Wrench,
  XCircle,
} from 'lucide-react'
import type { RequestType } from '../../types/commerce'
import { useI18n } from '../../contexts/LanguageContext'
import { formatRequestStatusLabel } from '../../utils/commerce'
import { cn } from '../../utils/cn'

export type JourneyStep = {
  status: string
  label: string
  caption: string
  icon: LucideIcon
}

// Canonical happy-path journeys. Terminal negative statuses (rejected,
// cancelled, lost) are rendered as a stop banner instead of a step.
const RENTAL_JOURNEY: JourneyStep[] = [
  { status: 'pending_review', label: 'Pending Review', caption: 'Request received — the team is reviewing it', icon: ClipboardList },
  { status: 'confirmed', label: 'Confirmed', caption: 'Availability and details approved', icon: CheckCircle2 },
  { status: 'in_preparation', label: 'In Preparation', caption: 'Equipment being prepared for your event', icon: Wrench },
  { status: 'completed', label: 'Completed', caption: 'Request fulfilled successfully', icon: PackageCheck },
]

const PURCHASE_JOURNEY: JourneyStep[] = [
  { status: 'pending_review', label: 'Pending Review', caption: 'Request received — the team is reviewing it', icon: ClipboardList },
  { status: 'contacted', label: 'Contacted', caption: 'Our team reached out to you', icon: PhoneCall },
  { status: 'quoted', label: 'Quoted', caption: 'Your quote was prepared and shared', icon: FileText },
  { status: 'won', label: 'Deal Closed', caption: 'Quote accepted — request complete', icon: BadgeCheck },
]

const TERMINAL_STATUSES = new Set(['rejected', 'cancelled', 'lost'])

export function getJourney(type: RequestType): JourneyStep[] {
  return type === 'rental' ? RENTAL_JOURNEY : PURCHASE_JOURNEY
}

export function isTerminalStatus(status: string) {
  return TERMINAL_STATUSES.has(status)
}

/**
 * Where the request sits on its journey. For terminal statuses, `reachedIndex`
 * is the furthest happy-path step seen in history (so the stepper can show
 * how far it got before stopping).
 */
export function getJourneyPosition(
  type: RequestType,
  status: string,
  historyStatuses: string[] = []
): { index: number; terminal: boolean } {
  const journey = getJourney(type)

  if (TERMINAL_STATUSES.has(status)) {
    let reached = 0
    for (const historyStatus of historyStatuses) {
      const stepIndex = journey.findIndex(step => step.status === historyStatus)
      if (stepIndex > reached) reached = stepIndex
    }
    return { index: reached, terminal: true }
  }

  const index = journey.findIndex(step => step.status === status)
  return { index: index === -1 ? 0 : index, terminal: false }
}

/**
 * Compact progress strip for request list cards: filled segments plus a
 * "Step 2 of 4 · Confirmed" caption, or a red stop label for terminal states.
 */
export function RequestProgressStrip({ type, status }: { type: RequestType; status: string }) {
  const { translateText } = useI18n()
  const journey = getJourney(type)
  const { index, terminal } = getJourneyPosition(type, status)
  const current = journey[index]

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        {journey.map((step, stepIndex) => (
          <span
            key={step.status}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              terminal
                ? stepIndex <= index
                  ? 'bg-rose-300'
                  : 'bg-slate-200'
                : stepIndex < index
                  ? 'bg-violet-400'
                  : stepIndex === index
                    ? status === 'completed' || status === 'won'
                      ? 'bg-emerald-400'
                      : 'bg-[linear-gradient(90deg,#7c3aed,#d946ef)]'
                    : 'bg-slate-200'
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold">
        {terminal ? (
          <>
            <XCircle size={12} className="shrink-0 text-rose-500" strokeWidth={2.5} />
            <span className="truncate text-rose-600">{translateText(formatRequestStatusLabel(status))}</span>
          </>
        ) : status === 'completed' || status === 'won' ? (
          <>
            <Check size={12} className="shrink-0 text-emerald-500" strokeWidth={3} />
            <span className="truncate text-emerald-600">{translateText(current.label)}</span>
          </>
        ) : (
          <>
            <span className="text-ink-400">
              {translateText(`Step ${index + 1} of ${journey.length}`)}
            </span>
            <span className="text-ink-300">/</span>
            <span className="truncate text-violet-700">{translateText(current.label)}</span>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Full journey tracker for the request details page: icon steps joined by a
 * progress line, with the reached date under each completed step.
 */
export function RequestJourneyTracker({
  type,
  status,
  stepDates,
}: {
  type: RequestType
  status: string
  stepDates: Record<string, string>
}) {
  const { locale, translateText } = useI18n()
  const dateLocale = locale === 'ar' ? 'ar-JO' : undefined
  const journey = getJourney(type)
  const { index, terminal } = getJourneyPosition(
    type,
    status,
    Object.keys(stepDates)
  )
  const done = status === 'completed' || status === 'won'

  return (
    <ol className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0">
      {journey.map((step, stepIndex) => {
        const reached = stepIndex <= index && (!terminal || stepIndex <= index)
        const isCurrent = !terminal && stepIndex === index
        const isPast = stepIndex < index || (done && stepIndex === index) || (terminal && stepIndex <= index)
        const Icon = step.icon
        const date = stepDates[step.status]

        return (
          <li key={step.status} className="relative flex flex-col items-center px-2 text-center">
            {/* connector */}
            {stepIndex > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute end-1/2 top-[22px] -z-0 hidden h-[3px] w-full rounded-full sm:block',
                  reached
                    ? terminal
                      ? 'bg-rose-200'
                      : 'bg-[linear-gradient(90deg,#c4b5fd,#a78bfa)]'
                    : 'bg-slate-200/80'
                )}
              />
            )}

            <span
              className={cn(
                'relative z-[1] flex h-11 w-11 items-center justify-center rounded-full ring-4 ring-white transition-colors',
                terminal && reached
                  ? 'bg-rose-100 text-rose-500'
                  : isCurrent && !done
                    ? 'bg-[linear-gradient(135deg,#7c3aed,#d946ef)] text-white shadow-[0_10px_24px_-10px_rgba(124,58,237,0.65)]'
                    : isPast
                      ? 'bg-emerald-500 text-white'
                      : reached
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-100 text-slate-400'
              )}
            >
              {isPast && !terminal ? (
                <Check size={18} strokeWidth={3} />
              ) : (
                <Icon size={18} strokeWidth={2.2} />
              )}
              {isCurrent && !done && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-[1] animate-ping rounded-full bg-violet-400/40"
                  style={{ animationDuration: '2.2s' }}
                />
              )}
            </span>

            <div
              className={cn(
                'mt-2.5 text-[12px] font-black leading-tight',
                reached ? (terminal ? 'text-rose-600' : 'text-ink-900') : 'text-slate-400'
              )}
            >
              {translateText(step.label)}
            </div>
            <div className={cn('mt-1 hidden max-w-[160px] text-[10.5px] font-medium leading-[1.5] sm:block', reached ? 'text-ink-500' : 'text-slate-300')}>
              {translateText(step.caption)}
            </div>
            {date && (
              <time className={cn('mt-1.5 text-[10px] font-bold', terminal ? 'text-rose-400' : 'text-violet-600')}>
                {new Date(date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                {' / '}
                {new Date(date).toLocaleTimeString(dateLocale, { hour: 'numeric', minute: '2-digit' })}
              </time>
            )}
          </li>
        )
      })}
    </ol>
  )
}
