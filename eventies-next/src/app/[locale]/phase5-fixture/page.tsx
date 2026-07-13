import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Bidi } from '@/components/Bidi'

export default async function Phase5FixturePage() {
  if (process.env.VERCEL_ENV === 'production') notFound()
  const [chat, notifications] = await Promise.all([
    getTranslations('chat'),
    getTranslations('notifications'),
  ])
  return (
    <div className="site-container grid gap-8 py-12 lg:grid-cols-2" data-testid="phase5-fixture">
      <section
        aria-labelledby="fixture-chat"
        className="rounded-3xl border border-violet-200 bg-white p-5"
      >
        <h1 id="fixture-chat" className="font-display text-2xl font-bold">
          {chat('title')}
        </h1>
        <div className="mt-5 space-y-3" aria-live="polite">
          <p className="me-auto max-w-[80%] rounded-2xl bg-violet-50 px-4 py-3">
            <Bidi>Can the stage be customized for حفل تخرج؟</Bidi>
          </p>
          <p className="ms-auto max-w-[80%] rounded-2xl bg-violet-700 px-4 py-3 text-white">
            <Bidi>نعم، يمكن تخصيص الألوان والمقاسات.</Bidi>
          </p>
        </div>
        <label htmlFor="fixture-message" className="mt-6 block text-sm font-semibold">
          {chat('message')}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="fixture-message"
            maxLength={4000}
            placeholder={chat('placeholder')}
            className="min-w-0 flex-1 rounded-full border border-violet-200 px-4 py-2"
          />
          <button className="rounded-full bg-violet-700 px-4 py-2 text-white">
            {chat('send')}
          </button>
        </div>
      </section>
      <section
        aria-labelledby="fixture-notifications"
        className="rounded-3xl border border-violet-200 bg-white p-5"
      >
        <h2 id="fixture-notifications" className="font-display text-2xl font-bold">
          {notifications('title')}
        </h2>
        <button className="mt-4 rounded-full border border-violet-200 px-4 py-2">
          {notifications('markAll')}
        </button>
        <div className="mt-5 rounded-2xl bg-violet-50 p-4">
          <strong>
            <Bidi>Request EVT-2026-42 updated</Bidi>
          </strong>
          <p className="mt-1 text-sm">
            <Bidi>تم تحديث حالة طلبك إلى قيد التجهيز.</Bidi>
          </p>
        </div>
        <p role="status" className="mt-5 text-sm text-ink-500">
          {notifications('emptyUnread')}
        </p>
      </section>
    </div>
  )
}
