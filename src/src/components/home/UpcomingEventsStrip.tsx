import { events } from '../../data/events'
export default function UpcomingEventsStrip() {
  if (events.length === 0) return null
  return <section className="py-16"><div className="max-w-7xl mx-auto px-6"><span className="section-label">Upcoming Events</span></div></section>
}
