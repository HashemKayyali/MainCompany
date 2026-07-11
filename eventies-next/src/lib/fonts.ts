import { Alexandria, Sora, IBM_Plex_Sans_Arabic } from 'next/font/google'

/**
 * FOUND-026 decision — next/font/google for the three Google families the
 * Vite app loads today (Alexandria/Sora weights 400–800; IBM Plex Sans
 * Arabic 300–700). Files self-host at build; `display: swap` + automatic
 * size-adjust removes the FOUT class the baseline shows. Zodiak (Fontshare)
 * remains a CSS import until its files are vendored (P2 asset task).
 */
export const alexandria = Alexandria({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-alexandria',
  display: 'swap',
})

export const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plex-arabic',
  display: 'swap',
})
