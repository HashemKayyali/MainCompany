import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import ContactForm from '../components/contact/ContactForm'
import { social } from '../data/social'
export default function ContactPage() {
  const { isDark } = useTheme()
  return (<section className="pt-32 pb-24"><div className="max-w-4xl mx-auto px-6">
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10"><span className="section-label">// Get in Touch</span><h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>Book Your <span className="text-glow">Experience</span></h1></motion.div>
    <ContactForm />
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">{[{ icon: 'P', l: 'Phone', v: social.phoneFormatted, h: `tel:${social.phone}` },{ icon: 'E', l: 'Email', v: social.email, h: `mailto:${social.email}` },{ icon: 'L', l: 'Location', v: 'Amman, Jordan', h: '' }].map(c => { const W = c.h ? 'a' : 'div'; return <W key={c.l} {...(c.h ? { href: c.h } : {} as any)} className="glass p-4 flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-gradient-to-br from-prism-violet to-prism-pink flex items-center justify-center text-white text-[10px] font-bold font-mono shrink-0">{c.icon}</span><div><p className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-purple-300/70' : 'text-gray-400'}`}>{c.l}</p><p className={`text-[13px] font-medium mt-0.5 ${isDark ? 'text-purple-100' : 'text-gray-700'}`}>{c.v}</p></div></W> })}</div>
  </div></section>)
}
