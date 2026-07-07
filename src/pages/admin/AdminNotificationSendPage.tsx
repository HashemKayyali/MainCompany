import { useEffect, useMemo, useState } from 'react'
import { BellRing, CheckCircle2, Loader2, Send, Users } from 'lucide-react'
import { useDialog } from '../../contexts/DialogContext'
import { useI18n } from '../../contexts/LanguageContext'
import { useToast } from '../../contexts/ToastContext'
import { isSafeInternalTarget } from '../../lib/notification-targets'
import {
  previewNotificationAudience,
  sendCustomNotification,
  type NotificationAudience,
  type NotificationAudienceCounts,
} from '../../services/notifications.service'
import { cn } from '../../utils/cn'

const EMPTY_COUNTS: NotificationAudienceCounts = {
  clients: 0,
  admins: 0,
  superadmins: 0,
  total: 0,
}

export default function AdminNotificationSendPage() {
  const { translateText } = useI18n()
  const { toast } = useToast()
  const dialog = useDialog()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [type, setType] = useState('custom')
  const [audience, setAudience] = useState<NotificationAudience>({
    clients: false,
    admins: false,
    superadmins: false,
  })
  const [counts, setCounts] = useState<NotificationAudienceCounts>(EMPTY_COUNTS)
  const [countLoading, setCountLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const hasAudience = audience.clients || audience.admins || audience.superadmins

  useEffect(() => {
    let active = true
    const id = window.setTimeout(async () => {
      if (!hasAudience) {
        setCounts(EMPTY_COUNTS)
        return
      }
      setCountLoading(true)
      try {
        const next = await previewNotificationAudience(audience)
        if (active) setCounts(next)
      } catch (error) {
        console.warn('[AdminNotificationSendPage] count preview failed:', error)
        if (active) setCounts(EMPTY_COUNTS)
      } finally {
        if (active) setCountLoading(false)
      }
    }, 180)

    return () => {
      active = false
      window.clearTimeout(id)
    }
  }, [audience, hasAudience])

  const preview = useMemo(() => ({
    title: title.trim() || translateText('Notification title will appear here'),
    message: message.trim() || translateText('Your notification message preview will appear here.'),
  }), [message, title, translateText])

  const validate = () => {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = translateText('Title is required.')
    if (title.trim().length > 180) next.title = translateText('Title must be 180 characters or fewer.')
    if (!message.trim()) next.message = translateText('Message is required.')
    if (message.trim().length > 1000) next.message = translateText('Message must be 1000 characters or fewer.')
    if (!hasAudience) next.audience = translateText('Select at least one audience.')
    if (targetUrl.trim() && !isSafeInternalTarget(targetUrl.trim())) {
      next.targetUrl = translateText('Target URL must be a safe internal path starting with /.')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const send = async () => {
    if (!validate() || sending) return

    const approved = await dialog.confirm({
      title: 'Send notification?',
      message: `This notification will be sent to ${counts.total} recipient(s). Continue?`,
      confirmLabel: 'Send notification',
      cancelLabel: 'Cancel',
      variant: 'info',
    })
    if (!approved) return

    setSending(true)
    try {
      const result = await sendCustomNotification({
        title,
        message,
        audience,
        targetUrl: targetUrl.trim() || null,
        type,
      })
      if (!result.ok) throw new Error('Broadcast failed')

      toast(`Notification sent to ${result.recipientCount} recipient(s).`, 'success')
      setTitle('')
      setMessage('')
      setTargetUrl('')
      setType('custom')
      setAudience({ clients: false, admins: false, superadmins: false })
      setCounts(EMPTY_COUNTS)
      setErrors({})
    } catch (error) {
      console.error('[AdminNotificationSendPage] send failed:', error)
      toast('The notification could not be sent.', 'error')
    } finally {
      setSending(false)
    }
  }

  const audienceOptions: Array<{
    key: keyof NotificationAudience
    label: string
    description: string
    count: number
  }> = [
    { key: 'clients', label: 'Clients', description: 'Customer accounts only', count: counts.clients },
    { key: 'admins', label: 'Admins', description: 'Regular administrators only', count: counts.admins },
    { key: 'superadmins', label: 'Super Admins', description: 'Super Admin accounts only', count: counts.superadmins },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.55rem] font-black tracking-[-0.035em] text-[var(--admin-text)]">
            {translateText('Send Notification')}
          </h1>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-5 text-[var(--admin-text-muted)]">
            {translateText('Send an important announcement to one or more recipient groups. Each recipient gets an independent read state.')}
          </p>
        </div>
        <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4">
          <Users className="h-4 w-4 text-[var(--admin-accent)]" />
          <span className="text-[11px] font-bold text-[var(--admin-text-muted)]">{translateText('Recipients')}</span>
          <span className="min-w-8 text-end text-[17px] font-black text-[var(--admin-text)]">
            {countLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : counts.total}
          </span>
        </div>
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="rounded-[22px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:p-5">
          <div className="grid gap-5">
            <div>
              <label htmlFor="notification-title" className="mb-2 block text-[11px] font-extrabold text-[var(--admin-text)]">
                {translateText('Title')} *
              </label>
              <input
                id="notification-title"
                value={title}
                onChange={event => setTitle(event.target.value.slice(0, 180))}
                maxLength={180}
                className="admin-input"
                placeholder={translateText('Important update')}
                aria-invalid={Boolean(errors.title)}
              />
              <div className="mt-1.5 flex justify-between gap-3 text-[10px]">
                <span className="text-rose-600">{errors.title || ''}</span>
                <span className="text-[var(--admin-text-muted)]">{title.length}/180</span>
              </div>
            </div>

            <div>
              <label htmlFor="notification-message" className="mb-2 block text-[11px] font-extrabold text-[var(--admin-text)]">
                {translateText('Message')} *
              </label>
              <textarea
                id="notification-message"
                value={message}
                onChange={event => setMessage(event.target.value.slice(0, 1000))}
                maxLength={1000}
                rows={6}
                className="admin-input min-h-[150px] resize-y"
                placeholder={translateText('Write the message recipients should see...')}
                aria-invalid={Boolean(errors.message)}
              />
              <div className="mt-1.5 flex justify-between gap-3 text-[10px]">
                <span className="text-rose-600">{errors.message || ''}</span>
                <span className="text-[var(--admin-text-muted)]">{message.length}/1000</span>
              </div>
            </div>

            <fieldset>
              <legend className="mb-2 block text-[11px] font-extrabold text-[var(--admin-text)]">
                {translateText('Audience')} *
              </legend>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {audienceOptions.map(option => {
                  const checked = audience[option.key]
                  return (
                    <label
                      key={option.key}
                      className={cn(
                        'cursor-pointer rounded-2xl border p-3.5 transition',
                        checked
                          ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]'
                          : 'border-[var(--admin-border)] bg-[var(--admin-surface-2)] hover:border-[var(--admin-accent)]/50'
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={event => setAudience(current => ({
                            ...current,
                            [option.key]: event.target.checked,
                          }))}
                          className="h-4 w-4 accent-violet-600"
                        />
                        {checked && <CheckCircle2 className="h-4 w-4 text-[var(--admin-accent)]" />}
                      </span>
                      <span className="mt-3 block text-[12px] font-extrabold text-[var(--admin-text)]">
                        {translateText(option.label)}
                      </span>
                      <span className="mt-1 block text-[10px] leading-4 text-[var(--admin-text-muted)]">
                        {translateText(option.description)}
                      </span>
                      {checked && (
                        <span className="mt-2 block text-[10px] font-bold text-[var(--admin-accent)]">
                          {option.count} {translateText('recipient(s)')}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
              {errors.audience && <p className="mt-2 text-[10px] font-semibold text-rose-600">{errors.audience}</p>}
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="notification-target" className="mb-2 block text-[11px] font-extrabold text-[var(--admin-text)]">
                  {translateText('Target URL')} <span className="font-medium text-[var(--admin-text-muted)]">({translateText('optional')})</span>
                </label>
                <input
                  id="notification-target"
                  value={targetUrl}
                  onChange={event => setTargetUrl(event.target.value.slice(0, 500))}
                  maxLength={500}
                  className="admin-input"
                  dir="ltr"
                  placeholder="/products"
                  aria-invalid={Boolean(errors.targetUrl)}
                />
                {errors.targetUrl && <p className="mt-1.5 text-[10px] font-semibold text-rose-600">{errors.targetUrl}</p>}
              </div>

              <div>
                <label htmlFor="notification-type" className="mb-2 block text-[11px] font-extrabold text-[var(--admin-text)]">
                  {translateText('Category')}
                </label>
                <select
                  id="notification-type"
                  value={type}
                  onChange={event => setType(event.target.value)}
                  className="admin-input"
                >
                  <option value="custom">{translateText('General')}</option>
                  <option value="announcement">{translateText('Announcement')}</option>
                  <option value="service_update">{translateText('Service Update')}</option>
                  <option value="important_notice">{translateText('Important Notice')}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end border-t border-[var(--admin-border)] pt-4">
              <button
                type="button"
                onClick={() => void send()}
                disabled={sending}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--admin-accent)] px-5 text-[12px] font-extrabold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {translateText('Send notification')}
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-[22px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[var(--admin-accent)]" />
            <h2 className="text-[12px] font-extrabold text-[var(--admin-text)]">{translateText('Preview')}</h2>
          </div>
          <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
                <BellRing className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-extrabold text-[var(--admin-text)]" data-i18n-skip dir="auto">
                  {preview.title}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-5 text-[var(--admin-text-muted)]" data-i18n-skip dir="auto">
                  {preview.message}
                </p>
                <div className="mt-2 text-[9.5px] font-semibold text-[var(--admin-accent)]">{translateText('Just now')}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4 text-[11px] leading-5 text-[var(--admin-text-muted)]">
            <strong className="text-[var(--admin-text)]">{translateText('Delivery rule')}:</strong>{' '}
            {translateText('The database creates one recipient row per targeted account. Reading a notification never changes another recipient’s copy.')}
          </div>
        </aside>
      </div>
    </div>
  )
}
