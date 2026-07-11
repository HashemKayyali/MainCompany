/* Ported verbatim from Vite src/pages/LegalPage.tsx (DATA-007 / I18N-019: repo-resident bilingual legal content). Framework-free data. */

export type LegalDocumentKey = 'privacy' | 'terms' | 'vendorTerms' | 'refund' | 'cookies'
type LegalLocale = 'en' | 'ar'
type LegalSection = { heading: string; body?: string[]; bullets?: string[] }
type LegalDocumentCopy = {
  eyebrow: string
  title: string
  description: string
  lastUpdatedLabel: string
  lastUpdated: string
  note?: string
  sections: LegalSection[]
  contactHeading: string
  contactBody: string
  metaTitle: string
  metaDescription: string
}
type LegalDocument = Record<LegalLocale, LegalDocumentCopy>

export const legalDocuments: Record<LegalDocumentKey, LegalDocument> = {
  privacy: {
    en: {
      eyebrow: 'Privacy Policy',
      title: 'Privacy Policy',
      description:
        'This Privacy Policy explains how Eventies collects, uses, shares, and protects personal information when you use our website, create an account, or submit an event request.',
      lastUpdatedLabel: 'Last updated',
      lastUpdated: 'July 1, 2026',
      note: 'Eventies currently operates under the Eventies name. Formal company registration details may be updated here once available.',
      metaTitle: 'Privacy Policy | Eventies',
      metaDescription:
        'Read how Eventies collects, uses, shares, and protects personal information for accounts, event requests, support, and vendor coordination.',
      contactHeading: 'Contact us',
      contactBody:
        'For privacy questions, access requests, correction requests, or deletion requests, contact us at support@eventiesjo.com.',
      sections: [
        {
          heading: '1. Who we are',
          body: [
            'Eventies is an event services platform that helps clients discover event rentals, games, activations, custom setups, and related services. Clients submit requests to Eventies, and Eventies coordinates availability, pricing, logistics, and next steps with registered vendors and service providers.',
            'Our services are primarily available in Jordan and may be available in other locations subject to availability, vendor coverage, logistics, and confirmation by Eventies.',
          ],
        },
        {
          heading: '2. Information we collect',
          body: ['Depending on how you use Eventies, we may collect the following information:'],
          bullets: [
            'Name and contact details, including email address and phone number.',
            'Account details, profile information, and profile image if you choose to add one.',
            'City, address, event location, venue details, and delivery/setup notes.',
            'Request details such as event date, services requested, quantities, notes, status, and request history.',
            'Vendor-related content, including product/service images, descriptions, categories, availability, and listing details when vendors provide them to Eventies.',
            'Technical information needed to run and secure the website, such as session data, browser/device information, and basic logs.',
          ],
        },
        {
          heading: '3. Payment information',
          body: [
            'Eventies does not currently process online payments through the website. The website is used to submit requests, quote inquiries, and booking details for review. If deposits or payments are arranged outside the website, the payment method and related terms will be communicated separately by Eventies.',
          ],
        },
        {
          heading: '4. How we use information',
          bullets: [
            'Create, manage, and secure user accounts.',
            'Receive, review, organize, and follow up on rental requests, purchase quote requests, custom build inquiries, and support messages.',
            'Coordinate with registered vendors and service providers to check availability, pricing, delivery, setup, and logistics.',
            'Contact you about your request, account, support issue, or important service updates.',
            'Improve the website experience, fix bugs, prevent misuse, and protect Eventies, users, and vendors.',
            'Meet legal, accounting, business, and dispute-resolution requirements where applicable.',
          ],
        },
        {
          heading: '5. How we share information',
          body: [
            'We do not sell your personal information. We may share information only when needed to operate Eventies, provide services, or comply with requirements.',
          ],
          bullets: [
            'With vendors or service providers when needed to review availability, pricing, execution, delivery, setup, or request requirements.',
            'With technology providers that help us host, secure, store, or operate the website and related systems.',
            'With professional advisers, legal authorities, or government bodies when required by law or needed to protect rights, safety, or property.',
          ],
        },
        {
          heading: '6. Data retention',
          body: [
            'We keep personal information only for as long as reasonably needed for the purposes described in this policy, including account management, request history, customer support, legal compliance, business records, dispute handling, and security.',
          ],
        },
        {
          heading: '7. Security',
          body: [
            'We use reasonable technical and organizational measures to protect personal information. No website or online system can be guaranteed to be completely secure, so users should also protect their account login details and notify us about suspicious activity.',
          ],
        },
        {
          heading: '8. Your choices and rights',
          body: ['You may contact Eventies to request that we:'],
          bullets: [
            'Provide information about personal data we hold about you.',
            'Correct inaccurate or incomplete information.',
            'Delete your account or certain personal information where legally and operationally possible.',
            'Stop using your information for certain optional purposes, where applicable.',
          ],
        },
        {
          heading: '9. Age requirement',
          body: [
            'Eventies is intended for users who are at least 18 years old. By using the website or submitting a request, you confirm that you are 18 or older.',
          ],
        },
        {
          heading: '10. International use and service locations',
          body: [
            'Because Eventies may review requests inside and outside Jordan, and because website systems may use cloud or technology providers, your information may be processed or stored in locations other than your country of residence where permitted by applicable requirements.',
          ],
        },
        {
          heading: '11. Updates to this policy',
          body: [
            'We may update this Privacy Policy from time to time. The latest version will be posted on this page with an updated date.',
          ],
        },
      ],
    },
    ar: {
      eyebrow: 'ط³ظٹط§ط³ط© ط§ظ„ط®طµظˆطµظٹط©',
      title: 'ط³ظٹط§ط³ط© ط§ظ„ط®طµظˆطµظٹط©',
      description:
        'طھظˆط¶ط­ ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط© ظƒظٹظپ ظٹط¬ظ…ط¹ Eventies ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط´ط®طµظٹط© ظˆظٹط³طھط®ط¯ظ…ظ‡ط§ ظˆظٹط´ط§ط±ظƒظ‡ط§ ظˆظٹط­ظ…ظٹظ‡ط§ ط¹ظ†ط¯ ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…ظˆظ‚ط¹ ط£ظˆ ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨ ط£ظˆ ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ ظپط¹ط§ظ„ظٹط©.',
      lastUpdatedLabel: 'ط¢ط®ط± طھط­ط¯ظٹط«',
      lastUpdated: '1 ظٹظˆظ„ظٹظˆ 2026',
      note: 'ظٹط¹ظ…ظ„ Eventies ط­ط§ظ„ظٹظ‹ط§ طھط­طھ ط§ط³ظ… Eventies. ظ‚ط¯ ظٹطھظ… طھط­ط¯ظٹط« ط¨ظٹط§ظ†ط§طھ ط§ظ„طھط³ط¬ظٹظ„ ط§ظ„ط±ط³ظ…ظٹ ظ„ظ„ط´ط±ظƒط© ظپظٹ ظ‡ط°ظ‡ ط§ظ„طµظپط­ط© ط¹ظ†ط¯ طھظˆظپط±ظ‡ط§.',
      metaTitle: 'ط³ظٹط§ط³ط© ط§ظ„ط®طµظˆطµظٹط© | Eventies',
      metaDescription:
        'طھط¹ط±ظپ ط¹ظ„ظ‰ ظƒظٹظپظٹط© ط¬ظ…ط¹ Eventies ظ„ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط´ط®طµظٹط© ظˆط§ط³طھط®ط¯ط§ظ…ظ‡ط§ ظˆط­ظ…ط§ظٹطھظ‡ط§ ظ„ظ„ط­ط³ط§ط¨ط§طھ ظˆط·ظ„ط¨ط§طھ ط§ظ„ظپط¹ط§ظ„ظٹط§طھ ظˆط§ظ„ط¯ط¹ظ… ظˆط§ظ„طھظ†ط³ظٹظ‚ ظ…ط¹ ط§ظ„ظ…ط²ظˆط¯ظٹظ†.',
      contactHeading: 'ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظ†ط§',
      contactBody:
        'ظ„ط£ظٹ ط£ط³ط¦ظ„ط© ظ…طھط¹ظ„ظ‚ط© ط¨ط§ظ„ط®طµظˆطµظٹط© ط£ظˆ ط·ظ„ط¨ط§طھ ط§ظ„ظˆطµظˆظ„ ط£ظˆ ط§ظ„طھطµط­ظٹط­ ط£ظˆ ط§ظ„ط­ط°ظپطŒ طھظˆط§طµظ„ ظ…ط¹ظ†ط§ ط¹ظ„ظ‰ support@eventiesjo.com.',
      sections: [
        {
          heading: '1. ظ…ظ† ظ†ط­ظ†',
          body: [
            'Eventies ظ…ظ†طµط© ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظپط¹ط§ظ„ظٹط§طھ طھط³ط§ط¹ط¯ ط§ظ„ط¹ظ…ظ„ط§ط، ط¹ظ„ظ‰ ط§ظƒطھط´ط§ظپ ط®ط¯ظ…ط§طھ ط§ظ„طھط£ط¬ظٹط± ظˆط§ظ„ط£ظ„ط¹ط§ط¨ ظˆط§ظ„طھط¬ط§ط±ط¨ ط§ظ„طھظپط§ط¹ظ„ظٹط© ظˆط§ظ„طھظ†ظپظٹط°ط§طھ ط§ظ„ظ…ط®طµطµط© ظˆط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط±طھط¨ط·ط© ط¨ط§ظ„ظپط¹ط§ظ„ظٹط§طھ. ظٹط±ط³ظ„ ط§ظ„ط¹ظ…ظٹظ„ ط·ظ„ط¨ظ‡ ط¥ظ„ظ‰ EventiesطŒ ظˆظٹظ‚ظˆظ… ظپط±ظٹظ‚ Eventies ط¨طھظ†ط³ظٹظ‚ ط§ظ„طھظˆظپط± ظˆط§ظ„طھط³ط¹ظٹط± ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ ظˆط§ظ„ط®ط·ظˆط§طھ ط§ظ„طھط§ظ„ظٹط© ظ…ط¹ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ط§ظ„ظ…ط³ط¬ظ„ظٹظ† ظˆظ…ظ‚ط¯ظ…ظٹ ط§ظ„ط®ط¯ظ…ط§طھ.',
            'طھطھظˆظپط± ط®ط¯ظ…ط§طھظ†ط§ ط¨ط´ظƒظ„ ط£ط³ط§ط³ظٹ ظپظٹ ط§ظ„ط£ط±ط¯ظ†طŒ ظˆظ‚ط¯ طھطھظˆظپط± ظپظٹ ظ…ظˆط§ظ‚ط¹ ط£ط®ط±ظ‰ ط­ط³ط¨ ط§ظ„طھظˆظپط± ظˆطھط؛ط·ظٹط© ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ ظˆط§ظ„طھط£ظƒظٹط¯ ظ…ظ† Eventies.',
          ],
        },
        {
          heading: '2. ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„طھظٹ ظ†ط¬ظ…ط¹ظ‡ط§',
          body: [
            'ط­ط³ط¨ ط·ط±ظٹظ‚ط© ط§ط³طھط®ط¯ط§ظ…ظƒ ظ„ظ€ EventiesطŒ ظ‚ط¯ ظ†ط¬ظ…ط¹ ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„طھط§ظ„ظٹط©:',
          ],
          bullets: [
            'ط§ظ„ط§ط³ظ… ظˆط¨ظٹط§ظ†ط§طھ ط§ظ„طھظˆط§طµظ„طŒ ط¨ظ…ط§ ظپظٹ ط°ظ„ظƒ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظˆط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ.',
            'ط¨ظٹط§ظ†ط§طھ ط§ظ„ط­ط³ط§ط¨ ظˆظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ظ…ظ„ظپ ط§ظ„ط´ط®طµظٹ ظˆطµظˆط±ط© ط§ظ„ط­ط³ط§ط¨ ط¥ط°ط§ ط£ط¶ظپطھظ‡ط§.',
            'ط§ظ„ظ…ط¯ظٹظ†ط© ط£ظˆ ط§ظ„ط¹ظ†ظˆط§ظ† ط£ظˆ ظ…ظˆظ‚ط¹ ط§ظ„ظپط¹ط§ظ„ظٹط© ط£ظˆ طھظپط§طµظٹظ„ ط§ظ„ظ…ظƒط§ظ† ط£ظˆ ظ…ظ„ط§ط­ط¸ط§طھ ط§ظ„طھظˆطµظٹظ„ ظˆط§ظ„طھط±ظƒظٹط¨.',
            'طھظپط§طµظٹظ„ ط§ظ„ط·ظ„ط¨ ظ…ط«ظ„ طھط§ط±ظٹط® ط§ظ„ظپط¹ط§ظ„ظٹط© ظˆط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط·ظ„ظˆط¨ط© ظˆط§ظ„ظƒظ…ظٹط§طھ ظˆط§ظ„ظ…ظ„ط§ط­ط¸ط§طھ ظˆط­ط§ظ„ط© ط§ظ„ط·ظ„ط¨ ظˆط³ط¬ظ„ ط§ظ„ط·ظ„ط¨ط§طھ.',
            'ظ…ط­طھظˆظ‰ ظ…ط±طھط¨ط· ط¨ط§ظ„ظ…ط²ظˆط¯ظٹظ†طŒ ظ…ط«ظ„ طµظˆط± ط§ظ„ظ…ظ†طھط¬ط§طھ ط£ظˆ ط§ظ„ط®ط¯ظ…ط§طھ ظˆط§ظ„ط£ظˆطµط§ظپ ظˆط§ظ„ظپط¦ط§طھ ظˆط§ظ„طھظˆظپط± ظˆطھظپط§طµظٹظ„ ط§ظ„ظ‚ظˆط§ط¦ظ… ط¹ظ†ط¯ظ…ط§ ظٹظ‚ط¯ظ…ظ‡ط§ ط§ظ„ظ…ط²ظˆط¯ظˆظ† ط¥ظ„ظ‰ Eventies.',
            'ظ…ط¹ظ„ظˆظ…ط§طھ طھظ‚ظ†ظٹط© ظ„ط§ط²ظ…ط© ظ„طھط´ط؛ظٹظ„ ط§ظ„ظ…ظˆظ‚ط¹ ظˆط­ظ…ط§ظٹطھظ‡طŒ ظ…ط«ظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¬ظ„ط³ط© ظˆظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ظ…طھطµظپط­ ط£ظˆ ط§ظ„ط¬ظ‡ط§ط² ظˆط§ظ„ط³ط¬ظ„ط§طھ ط§ظ„ط£ط³ط§ط³ظٹط©.',
          ],
        },
        {
          heading: '3. ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط¯ظپط¹',
          body: [
            'ظ„ط§ ظٹط¹ط§ظ„ط¬ Eventies ط­ط§ظ„ظٹظ‹ط§ ط§ظ„ظ…ط¯ظپظˆط¹ط§طھ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ظ…ظˆظ‚ط¹. ظٹط³طھط®ط¯ظ… ط§ظ„ظ…ظˆظ‚ط¹ ظ„ط¥ط±ط³ط§ظ„ ط§ظ„ط·ظ„ط¨ط§طھ ظˆط§ظ„ط§ط³طھظپط³ط§ط±ط§طھ ظˆط·ظ„ط¨ط§طھ ط¹ط±ظˆط¶ ط§ظ„ط£ط³ط¹ط§ط± ظˆطھظپط§طµظٹظ„ ط§ظ„ط­ط¬ط² ظ„ظ„ظ…ط±ط§ط¬ط¹ط©. ط¥ط°ط§ طھظ… طھط±طھظٹط¨ ط¹ط±ط¨ظˆظ† ط£ظˆ ط¯ظپط¹ط© ط®ط§ط±ط¬ ط§ظ„ظ…ظˆظ‚ط¹طŒ ظپط³ظٹطھظ… طھظˆط¶ظٹط­ ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹ ظˆط§ظ„ط´ط±ظˆط· ط§ظ„ظ…ط±طھط¨ط·ط© ط¨ظ‡ط§ ط¨ط´ظƒظ„ ظ…ظ†ظپطµظ„ ظ…ظ† ظ‚ط¨ظ„ Eventies.',
          ],
        },
        {
          heading: '4. ظƒظٹظپ ظ†ط³طھط®ط¯ظ… ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ',
          bullets: [
            'ط¥ظ†ط´ط§ط، ط§ظ„ط­ط³ط§ط¨ط§طھ ظˆط¥ط¯ط§ط±طھظ‡ط§ ظˆط­ظ…ط§ظٹطھظ‡ط§.',
            'ط§ط³طھظ„ط§ظ… ظˆظ…ط±ط§ط¬ط¹ط© ظˆطھظ†ط¸ظٹظ… ظˆظ…طھط§ط¨ط¹ط© ط·ظ„ط¨ط§طھ ط§ظ„طھط£ط¬ظٹط± ظˆط·ظ„ط¨ط§طھ ط¹ط±ظˆط¶ ط³ط¹ط± ط§ظ„ط´ط±ط§ط، ظˆط§ظ„طھظ†ظپظٹط° ط§ظ„ظ…ط®طµطµ ظˆط±ط³ط§ط¦ظ„ ط§ظ„ط¯ط¹ظ….',
            'ط§ظ„طھظ†ط³ظٹظ‚ ظ…ط¹ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆظ…ظ‚ط¯ظ…ظٹ ط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط³ط¬ظ„ظٹظ† ظ„ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„طھظˆظپط± ظˆط§ظ„طھط³ط¹ظٹط± ظˆط§ظ„طھظˆطµظٹظ„ ظˆط§ظ„طھط±ظƒظٹط¨ ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ.',
            'ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظƒ ط¨ط®طµظˆطµ ط·ظ„ط¨ظƒ ط£ظˆ ط­ط³ط§ط¨ظƒ ط£ظˆ ظ…ط´ظƒظ„ط© ط§ظ„ط¯ط¹ظ… ط£ظˆ ط§ظ„طھط­ط¯ظٹط«ط§طھ ط§ظ„ظ…ظ‡ظ…ط© ط§ظ„ظ…طھط¹ظ„ظ‚ط© ط¨ط§ظ„ط®ط¯ظ…ط©.',
            'طھط­ط³ظٹظ† طھط¬ط±ط¨ط© ط§ظ„ظ…ظˆظ‚ط¹ ظˆط¥طµظ„ط§ط­ ط§ظ„ط£ط®ط·ط§ط، ظˆظ…ظ†ط¹ ط³ظˆط، ط§ظ„ط§ط³طھط®ط¯ط§ظ… ظˆط­ظ…ط§ظٹط© Eventies ظˆط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ† ظˆط§ظ„ظ…ط²ظˆط¯ظٹظ†.',
            'طھظ„ط¨ظٹط© ط§ظ„ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ظ‚ط§ظ†ظˆظ†ظٹط© ظˆط§ظ„ظ…ط­ط§ط³ط¨ظٹط© ظˆط§ظ„طھط¬ط§ط±ظٹط© ظˆظ…طھط·ظ„ط¨ط§طھ ط­ظ„ ط§ظ„ظ†ط²ط§ط¹ط§طھ ط¹ظ†ط¯ ط§ظ„ط­ط§ط¬ط©.',
          ],
        },
        {
          heading: '5. ظƒظٹظپ ظ†ط´ط§ط±ظƒ ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ',
          body: [
            'ظ†ط­ظ† ظ„ط§ ظ†ط¨ظٹط¹ ط¨ظٹط§ظ†ط§طھظƒ ط§ظ„ط´ط®طµظٹط©. ظ‚ط¯ ظ†ط´ط§ط±ظƒ ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ظپظ‚ط· ط¹ظ†ط¯ ط§ظ„ط­ط§ط¬ط© ظ„طھط´ط؛ظٹظ„ Eventies ط£ظˆ طھظ‚ط¯ظٹظ… ط§ظ„ط®ط¯ظ…ط§طھ ط£ظˆ ط§ظ„ط§ظ„طھط²ط§ظ… ط¨ط§ظ„ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ظ„ط§ط²ظ…ط©.',
          ],
          bullets: [
            'ظ…ط¹ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ط£ظˆ ظ…ظ‚ط¯ظ…ظٹ ط§ظ„ط®ط¯ظ…ط§طھ ط¹ظ†ط¯ ط§ظ„ط­ط§ط¬ط© ظ„ظ…ط±ط§ط¬ط¹ط© ط§ظ„طھظˆظپط± ط£ظˆ ط§ظ„طھط³ط¹ظٹط± ط£ظˆ ط§ظ„طھظ†ظپظٹط° ط£ظˆ ط§ظ„طھظˆطµظٹظ„ ط£ظˆ ط§ظ„طھط±ظƒظٹط¨ ط£ظˆ ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ط·ظ„ط¨.',
            'ظ…ط¹ ظ…ط²ظˆط¯ظٹ ط§ظ„طھظ‚ظ†ظٹط© ط§ظ„ط°ظٹظ† ظٹط³ط§ط¹ط¯ظˆظ†ظ†ط§ ظپظٹ ط§ط³طھط¶ط§ظپط© ط§ظ„ظ…ظˆظ‚ط¹ ط£ظˆ ط­ظ…ط§ظٹطھظ‡ ط£ظˆ طھط®ط²ظٹظ†ظ‡ ط£ظˆ طھط´ط؛ظٹظ„ظ‡ ظˆط§ظ„ط£ظ†ط¸ظ…ط© ط§ظ„ظ…ط±طھط¨ط·ط© ط¨ظ‡.',
            'ظ…ط¹ ط§ظ„ظ…ط³طھط´ط§ط±ظٹظ† ط§ظ„ظ…ظ‡ظ†ظٹظٹظ† ط£ظˆ ط§ظ„ط¬ظ‡ط§طھ ط§ظ„ظ‚ط§ظ†ظˆظ†ظٹط© ط£ظˆ ط§ظ„ط¬ظ‡ط§طھ ط§ظ„ط­ظƒظˆظ…ظٹط© ط¥ط°ط§ طھط·ظ„ط¨ ط§ظ„ظ‚ط§ظ†ظˆظ† ط°ظ„ظƒ ط£ظˆ ظ„ط­ظ…ط§ظٹط© ط§ظ„ط­ظ‚ظˆظ‚ ط£ظˆ ط§ظ„ط³ظ„ط§ظ…ط© ط£ظˆ ط§ظ„ظ…ظ…طھظ„ظƒط§طھ.',
          ],
        },
        {
          heading: '6. ظ…ط¯ط© ط§ظ„ط§ط­طھظپط§ط¸ ط¨ط§ظ„ط¨ظٹط§ظ†ط§طھ',
          body: [
            'ظ†ط­طھظپط¸ ط¨ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط´ط®طµظٹط© ظ„ظ„ظ…ط¯ط© ط§ظ„ظ„ط§ط²ظ…ط© ط¨ط´ظƒظ„ ظ…ط¹ظ‚ظˆظ„ ظ„ظ„ط£ط؛ط±ط§ط¶ ط§ظ„ظ…ط°ظƒظˆط±ط© ظپظٹ ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط©طŒ ط¨ظ…ط§ ظپظٹ ط°ظ„ظƒ ط¥ط¯ط§ط±ط© ط§ظ„ط­ط³ط§ط¨ط§طھ ظˆط³ط¬ظ„ ط§ظ„ط·ظ„ط¨ط§طھ ظˆط¯ط¹ظ… ط§ظ„ط¹ظ…ظ„ط§ط، ظˆط§ظ„ط§ظ„طھط²ط§ظ… ط§ظ„ظ‚ط§ظ†ظˆظ†ظٹ ظˆط§ظ„ط³ط¬ظ„ط§طھ ط§ظ„طھط¬ط§ط±ظٹط© ظˆظ…ط¹ط§ظ„ط¬ط© ط§ظ„ظ†ط²ط§ط¹ط§طھ ظˆط§ظ„ط£ظ…ط§ظ†.',
          ],
        },
        {
          heading: '7. ط§ظ„ط£ظ…ط§ظ†',
          body: [
            'ظ†ط³طھط®ط¯ظ… ط¥ط¬ط±ط§ط،ط§طھ طھظ‚ظ†ظٹط© ظˆطھظ†ط¸ظٹظ…ظٹط© ظ…ط¹ظ‚ظˆظ„ط© ظ„ط­ظ…ط§ظٹط© ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط´ط®طµظٹط©. ظ„ط§ ظٹظ…ظƒظ† ط¶ظ…ط§ظ† ط£ظ…ط§ظ† ط£ظٹ ظ…ظˆظ‚ط¹ ط£ظˆ ظ†ط¸ط§ظ… ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط¨ط´ظƒظ„ ظƒط§ظ…ظ„طŒ ظ„ط°ظ„ظƒ ظٹط¬ط¨ ط¹ظ„ظ‰ ط§ظ„ظ…ط³طھط®ط¯ظ… ط£ظٹط¶ظ‹ط§ ط­ظ…ط§ظٹط© ط¨ظٹط§ظ†ط§طھ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ظˆط¥ط¨ظ„ط§ط؛ظ†ط§ ط¹ظ† ط£ظٹ ظ†ط´ط§ط· ظ…ط±ظٹط¨.',
          ],
        },
        {
          heading: '8. ط§ط®طھظٹط§ط±ط§طھظƒ ظˆط­ظ‚ظˆظ‚ظƒ',
          body: ['ظٹظ…ظƒظ†ظƒ ط§ظ„طھظˆط§طµظ„ ظ…ط¹ Eventies ظ„ط·ظ„ط¨ ظ…ط§ ظٹظ„ظٹ:'],
          bullets: [
            'طھط²ظˆظٹط¯ظƒ ط¨ظ…ط¹ظ„ظˆظ…ط§طھ ط¹ظ† ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط´ط®طµظٹط© ط§ظ„طھظٹ ظ†ط­طھظپط¸ ط¨ظ‡ط§ ط¹ظ†ظƒ.',
            'طھطµط­ظٹط­ ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط؛ظٹط± ط§ظ„ط¯ظ‚ظٹظ‚ط© ط£ظˆ ط؛ظٹط± ط§ظ„ظ…ظƒطھظ…ظ„ط©.',
            'ط­ط°ظپ ط­ط³ط§ط¨ظƒ ط£ظˆ ط¨ط¹ط¶ ط¨ظٹط§ظ†ط§طھظƒ ط§ظ„ط´ط®طµظٹط© ط¹ظ†ط¯ظ…ط§ ظٹظƒظˆظ† ط°ظ„ظƒ ظ…ظ…ظƒظ†ظ‹ط§ ظ‚ط§ظ†ظˆظ†ظٹظ‹ط§ ظˆطھط´ط؛ظٹظ„ظٹظ‹ط§.',
            'ط¥ظٹظ‚ط§ظپ ط§ط³طھط®ط¯ط§ظ… ظ…ط¹ظ„ظˆظ…ط§طھظƒ ظ„ط¨ط¹ط¶ ط§ظ„ط£ط؛ط±ط§ط¶ ط§ظ„ط§ط®طھظٹط§ط±ظٹط© ط¹ظ†ط¯ ط§ظ†ط·ط¨ط§ظ‚ ط°ظ„ظƒ.',
          ],
        },
        {
          heading: '9. ط´ط±ط· ط§ظ„ط¹ظ…ط±',
          body: [
            'Eventies ظ…ط®طµطµ ظ„ظ„ظ…ط³طھط®ط¯ظ…ظٹظ† ط§ظ„ط°ظٹظ† طھط¨ظ„ط؛ ط£ط¹ظ…ط§ط±ظ‡ظ… 18 ط³ظ†ط© ط£ظˆ ط£ظƒط«ط±. ط¨ط§ط³طھط®ط¯ط§ظ…ظƒ ظ„ظ„ظ…ظˆظ‚ط¹ ط£ظˆ ط¥ط±ط³ط§ظ„ ط·ظ„ط¨طŒ ظپط¥ظ†ظƒ طھط¤ظƒط¯ ط£ظ† ط¹ظ…ط±ظƒ 18 ط³ظ†ط© ط£ظˆ ط£ظƒط«ط±.',
          ],
        },
        {
          heading: '10. ط§ظ„ط§ط³طھط®ط¯ط§ظ… ط§ظ„ط¯ظˆظ„ظٹ ظˆظ…ظˆط§ظ‚ط¹ ط§ظ„ط®ط¯ظ…ط©',
          body: [
            'ط¨ظ…ط§ ط£ظ† Eventies ظ‚ط¯ ظٹط±ط§ط¬ط¹ ط·ظ„ط¨ط§طھ ط¯ط§ط®ظ„ ط§ظ„ط£ط±ط¯ظ† ظˆط®ط§ط±ط¬ظ‡طŒ ظˆط¨ظ…ط§ ط£ظ† ط£ظ†ط¸ظ…ط© ط§ظ„ظ…ظˆظ‚ط¹ ظ‚ط¯ طھط³طھط®ط¯ظ… ظ…ط²ظˆط¯ظٹ ط®ط¯ظ…ط§طھ ط³ط­ط§ط¨ظٹط© ط£ظˆ طھظ‚ظ†ظٹط©طŒ ظپظ‚ط¯ طھطھظ… ظ…ط¹ط§ظ„ط¬ط© ظ…ط¹ظ„ظˆظ…ط§طھظƒ ط£ظˆ طھط®ط²ظٹظ†ظ‡ط§ ظپظٹ ظ…ظˆط§ظ‚ط¹ ط؛ظٹط± ط¨ظ„ط¯ ط¥ظ‚ط§ظ…طھظƒ ط¹ظ†ط¯ظ…ط§ طھط³ظ…ط­ ط§ظ„ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ظ…ط¹ظ…ظˆظ„ ط¨ظ‡ط§ ط¨ط°ظ„ظƒ.',
          ],
        },
        {
          heading: '11. طھط­ط¯ظٹط«ط§طھ ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط©',
          body: [
            'ظ‚ط¯ ظ†ظ‚ظˆظ… ط¨طھط­ط¯ظٹط« ط³ظٹط§ط³ط© ط§ظ„ط®طµظˆطµظٹط© ظ…ظ† ظˆظ‚طھ ظ„ط¢ط®ط±. ط³ظٹطھظ… ظ†ط´ط± ط£ط­ط¯ط« ظ†ط³ط®ط© ط¹ظ„ظ‰ ظ‡ط°ظ‡ ط§ظ„طµظپط­ط© ظ…ط¹ طھط§ط±ظٹط® طھط­ط¯ظٹط« ط¬ط¯ظٹط¯.',
          ],
        },
      ],
    },
  },
  cookies: {
    en: {
      eyebrow: 'Cookie Policy',
      title: 'Cookie Policy',
      description:
        'This Cookie Policy explains how Eventies uses cookies and similar browser storage to run the website, remember preferences, and support account or request features.',
      lastUpdatedLabel: 'Last updated',
      lastUpdated: 'July 1, 2026',
      metaTitle: 'Cookie Policy | Eventies',
      metaDescription:
        'Learn how Eventies uses necessary cookies and browser storage for language, sessions, request drafts, and website functionality.',
      contactHeading: 'Contact us',
      contactBody: 'For cookie or privacy questions, contact support@eventiesjo.com.',
      sections: [
        {
          heading: '1. What cookies are',
          body: [
            'Cookies are small files stored by your browser. Similar technologies, such as local storage and session storage, can also save basic information on your device so the website can work correctly.',
          ],
        },
        {
          heading: '2. Cookies and storage we use now',
          body: [
            'Eventies currently uses necessary cookies or similar storage for core website functions, including:',
          ],
          bullets: [
            'Keeping you signed in and maintaining secure sessions when account features are used.',
            'Remembering your selected language preference, such as English or Arabic.',
            'Saving request drafts, cart-related selections, or temporary form details on your device until you submit or clear them.',
            'Supporting website security, reliability, and basic performance.',
          ],
        },
        {
          heading: '3. Analytics and advertising cookies',
          body: [
            'Eventies does not currently use Google Analytics, Meta Pixel, TikTok Pixel, Hotjar, Google Ads tracking, or similar marketing tracking tools on the website.',
            'If we add analytics or advertising cookies in the future, we may update this Cookie Policy and, where required, ask for your consent before enabling non-essential cookies.',
          ],
        },
        {
          heading: '4. Necessary cookies',
          body: [
            'Necessary cookies and similar storage help the website operate. If you block them, some features such as login, language preference, saved drafts, request forms, or account pages may not work correctly.',
          ],
        },
        {
          heading: '5. Managing cookies',
          body: [
            'You can control cookies through your browser settings. Most browsers allow you to delete cookies, block cookies, or receive a warning before cookies are stored. Blocking necessary cookies may affect website functionality.',
          ],
        },
        {
          heading: '6. Updates to this policy',
          body: [
            'We may update this Cookie Policy if our website features, analytics tools, or cookie practices change.',
          ],
        },
      ],
    },
    ar: {
      eyebrow: 'ط³ظٹط§ط³ط© ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط·',
      title: 'ط³ظٹط§ط³ط© ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط·',
      description:
        'طھظˆط¶ط­ ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط© ظƒظٹظپ ظٹط³طھط®ط¯ظ… Eventies ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ظˆط§ظ„طھط®ط²ظٹظ† ط§ظ„ظ…ط´ط§ط¨ظ‡ ظپظٹ ط§ظ„ظ…طھطµظپط­ ظ„طھط´ط؛ظٹظ„ ط§ظ„ظ…ظˆظ‚ط¹ ظˆط­ظپط¸ ط§ظ„طھظپط¶ظٹظ„ط§طھ ظˆط¯ط¹ظ… ط§ظ„ط­ط³ط§ط¨ط§طھ ظˆط§ظ„ط·ظ„ط¨ط§طھ.',
      lastUpdatedLabel: 'ط¢ط®ط± طھط­ط¯ظٹط«',
      lastUpdated: '1 ظٹظˆظ„ظٹظˆ 2026',
      metaTitle: 'ط³ظٹط§ط³ط© ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· | Eventies',
      metaDescription:
        'طھط¹ط±ظپ ط¹ظ„ظ‰ ظƒظٹظپظٹط© ط§ط³طھط®ط¯ط§ظ… Eventies ظ„ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ط§ظ„ط¶ط±ظˆط±ظٹط© ظˆطھط®ط²ظٹظ† ط§ظ„ظ…طھطµظپط­ ظ„ظ„ط؛ط© ظˆط§ظ„ط¬ظ„ط³ط§طھ ظˆظ…ط³ظˆط¯ط§طھ ط§ظ„ط·ظ„ط¨ط§طھ ظˆظˆط¸ط§ط¦ظپ ط§ظ„ظ…ظˆظ‚ط¹.',
      contactHeading: 'ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظ†ط§',
      contactBody:
        'ظ„ط£ظٹ ط£ط³ط¦ظ„ط© ط¨ط®طµظˆطµ ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ط£ظˆ ط§ظ„ط®طµظˆطµظٹط©طŒ طھظˆط§طµظ„ ظ…ط¹ظ†ط§ ط¹ظ„ظ‰ support@eventiesjo.com.',
      sections: [
        {
          heading: '1. ظ…ط§ ظ‡ظٹ ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط·',
          body: [
            'ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ظ‡ظٹ ظ…ظ„ظپط§طھ طµط؛ظٹط±ط© ظٹط®ط²ظ†ظ‡ط§ ط§ظ„ظ…طھطµظپط­. ظˆظ‚ط¯ طھط³طھط®ط¯ظ… طھظ‚ظ†ظٹط§طھ ظ…ط´ط§ط¨ظ‡ط© ظ…ط«ظ„ ط§ظ„طھط®ط²ظٹظ† ط§ظ„ظ…ط­ظ„ظٹ ظˆطھط®ط²ظٹظ† ط§ظ„ط¬ظ„ط³ط© ظ„ط­ظپط¸ ظ…ط¹ظ„ظˆظ…ط§طھ ط£ط³ط§ط³ظٹط© ط¹ظ„ظ‰ ط¬ظ‡ط§ط²ظƒ ط­طھظ‰ ظٹط¹ظ…ظ„ ط§ظ„ظ…ظˆظ‚ط¹ ط¨ط´ظƒظ„ طµط­ظٹط­.',
          ],
        },
        {
          heading: '2. ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ظˆط§ظ„طھط®ط²ظٹظ† ط§ظ„ظ…ط³طھط®ط¯ظ… ط­ط§ظ„ظٹظ‹ط§',
          body: [
            'ظٹط³طھط®ط¯ظ… Eventies ط­ط§ظ„ظٹظ‹ط§ ظ…ظ„ظپط§طھ ط§ط±طھط¨ط§ط· ط£ظˆ طھط®ط²ظٹظ† ظ…ط´ط§ط¨ظ‡ ط¶ط±ظˆط±ظٹ ظ„ظˆط¸ط§ط¦ظپ ط§ظ„ظ…ظˆظ‚ط¹ ط§ظ„ط£ط³ط§ط³ظٹط©طŒ ظˆظ…ظ†ظ‡ط§:',
          ],
          bullets: [
            'ط¥ط¨ظ‚ط§ط¤ظƒ ظ…ط³ط¬ظ„ ط§ظ„ط¯ط®ظˆظ„ ظˆط§ظ„ط­ظپط§ط¸ ط¹ظ„ظ‰ ط¬ظ„ط³ط§طھ ط¢ظ…ظ†ط© ط¹ظ†ط¯ ط§ط³طھط®ط¯ط§ظ… ظ…ظٹط²ط§طھ ط§ظ„ط­ط³ط§ط¨.',
            'طھط°ظƒط± ط§ظ„ظ„ط؛ط© ط§ظ„طھظٹ ط§ط®طھط±طھظ‡ط§طŒ ظ…ط«ظ„ ط§ظ„ط¹ط±ط¨ظٹط© ط£ظˆ ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©.',
            'ط­ظپط¸ ظ…ط³ظˆط¯ط§طھ ط§ظ„ط·ظ„ط¨ ط£ظˆ ط§ط®طھظٹط§ط±ط§طھ ط§ظ„ط³ظ„ط© ط£ظˆ ط¨ط¹ط¶ ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ†ظ…ط§ط°ط¬ ظ…ط¤ظ‚طھظ‹ط§ ط¹ظ„ظ‰ ط¬ظ‡ط§ط²ظƒ ط¥ظ„ظ‰ ط£ظ† طھظ‚ظˆظ… ط¨ط¥ط±ط³ط§ظ„ظ‡ط§ ط£ظˆ ط­ط°ظپظ‡ط§.',
            'ط¯ط¹ظ… ط£ظ…ط§ظ† ط§ظ„ظ…ظˆظ‚ط¹ ظˆظ…ظˆط«ظˆظ‚ظٹطھظ‡ ظˆط§ظ„ط£ط¯ط§ط، ط§ظ„ط£ط³ط§ط³ظٹ.',
          ],
        },
        {
          heading: '3. ظ…ظ„ظپط§طھ ط§ظ„طھط­ظ„ظٹظ„ط§طھ ظˆط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ',
          body: [
            'ظ„ط§ ظٹط³طھط®ط¯ظ… Eventies ط­ط§ظ„ظٹظ‹ط§ Google Analytics ط£ظˆ Meta Pixel ط£ظˆ TikTok Pixel ط£ظˆ Hotjar ط£ظˆ طھطھط¨ط¹ Google Ads ط£ظˆ ط£ط¯ظˆط§طھ طھطھط¨ط¹ طھط³ظˆظٹظ‚ظٹط© ظ…ط´ط§ط¨ظ‡ط© ط¹ظ„ظ‰ ط§ظ„ظ…ظˆظ‚ط¹.',
            'ط¥ط°ط§ ط£ط¶ظپظ†ط§ ظ…ظ„ظپط§طھ طھط­ظ„ظٹظ„ط§طھ ط£ظˆ ط¥ط¹ظ„ط§ظ†ط§طھ ظپظٹ ط§ظ„ظ…ط³طھظ‚ط¨ظ„طŒ ظپظ‚ط¯ ظ†ط­ط¯ط« ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط©طŒ ظˆط¹ظ†ط¯ ط§ظ„ط­ط§ط¬ط© ط³ظ†ط·ظ„ط¨ ظ…ظˆط§ظپظ‚طھظƒ ظ‚ط¨ظ„ طھظپط¹ظٹظ„ ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ط؛ظٹط± ط§ظ„ط¶ط±ظˆط±ظٹط©.',
          ],
        },
        {
          heading: '4. ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ط§ظ„ط¶ط±ظˆط±ظٹط©',
          body: [
            'طھط³ط§ط¹ط¯ ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ط§ظ„ط¶ط±ظˆط±ظٹط© ظˆط§ظ„طھط®ط²ظٹظ† ط§ظ„ظ…ط´ط§ط¨ظ‡ ط¹ظ„ظ‰ طھط´ط؛ظٹظ„ ط§ظ„ظ…ظˆظ‚ط¹. ط¥ط°ط§ ظ‚ظ…طھ ط¨ط­ط¸ط±ظ‡ط§طŒ ظپظ‚ط¯ ظ„ط§ طھط¹ظ…ظ„ ط¨ط¹ط¶ ط§ظ„ظ…ظٹط²ط§طھ ط¨ط´ظƒظ„ طµط­ظٹط­ ظ…ط«ظ„ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط£ظˆ طھظپط¶ظٹظ„ ط§ظ„ظ„ط؛ط© ط£ظˆ ط§ظ„ظ…ط³ظˆط¯ط§طھ ط§ظ„ظ…ط­ظپظˆط¸ط© ط£ظˆ ظ†ظ…ط§ط°ط¬ ط§ظ„ط·ظ„ط¨ ط£ظˆ طµظپط­ط§طھ ط§ظ„ط­ط³ط§ط¨.',
          ],
        },
        {
          heading: '5. ط¥ط¯ط§ط±ط© ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط·',
          body: [
            'ظٹظ…ظƒظ†ظƒ ط§ظ„طھط­ظƒظ… ط¨ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ظ…ظ† ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ظ…طھطµظپط­. ط£ط؛ظ„ط¨ ط§ظ„ظ…طھطµظپط­ط§طھ طھط³ظ…ط­ ط¨ط­ط°ظپ ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ط£ظˆ ط­ط¸ط±ظ‡ط§ ط£ظˆ ط¥ط¸ظ‡ط§ط± طھظ†ط¨ظٹظ‡ ظ‚ط¨ظ„ طھط®ط²ظٹظ†ظ‡ط§. ط­ط¸ط± ط§ظ„ظ…ظ„ظپط§طھ ط§ظ„ط¶ط±ظˆط±ظٹط© ظ‚ط¯ ظٹط¤ط«ط± ط¹ظ„ظ‰ ظˆط¸ط§ط¦ظپ ط§ظ„ظ…ظˆظ‚ط¹.',
          ],
        },
        {
          heading: '6. طھط­ط¯ظٹط«ط§طھ ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط©',
          body: [
            'ظ‚ط¯ ظ†ظ‚ظˆظ… ط¨طھط­ط¯ظٹط« ط³ظٹط§ط³ط© ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط· ط¥ط°ط§ طھط؛ظٹط±طھ ظ…ظٹط²ط§طھ ط§ظ„ظ…ظˆظ‚ط¹ ط£ظˆ ط£ط¯ظˆط§طھ ط§ظ„طھط­ظ„ظٹظ„ ط£ظˆ ط·ط±ظٹظ‚ط© ط§ط³طھط®ط¯ط§ظ… ظ…ظ„ظپط§طھ ط§ظ„ط§ط±طھط¨ط§ط·.',
          ],
        },
      ],
    },
  },
  terms: {
    en: {
      eyebrow: 'Terms of Service',
      title: 'Terms of Service',
      description:
        'These Terms explain the rules for using Eventies, submitting requests, creating accounts, and working with Eventies for event services.',
      lastUpdatedLabel: 'Last updated',
      lastUpdated: 'July 1, 2026',
      note: 'Eventies is currently operated under the Eventies name. Formal company registration details may be added once available.',
      metaTitle: 'Terms of Service | Eventies',
      metaDescription:
        'Review Eventies Terms of Service for accounts, event requests, confirmation, vendor coordination, cancellations, and customer responsibilities.',
      contactHeading: 'Contact us',
      contactBody: 'For questions about these Terms, contact support@eventiesjo.com.',
      sections: [
        {
          heading: '1. Acceptance of these Terms',
          body: [
            'By accessing the Eventies website, creating an account, submitting a request, or communicating with Eventies about a service, you agree to these Terms of Service and the related policies referenced on the website.',
          ],
        },
        {
          heading: '2. What Eventies does',
          body: [
            'Eventies helps clients request event rentals, games, activations, equipment, custom setups, and related event services. The client submits the request to Eventies, and Eventies coordinates with registered vendors and service providers to review availability, pricing, logistics, setup requirements, and next steps.',
            'The customer-facing relationship is with Eventies. Vendors and service providers may be used by Eventies to help execute or supply parts of the service.',
          ],
        },
        {
          heading: '3. Service locations',
          body: [
            'Eventies services are primarily available in Jordan and may be available in other locations subject to availability, vendor coverage, logistics, and confirmation by Eventies. Submitting a request for a location does not guarantee that service is available there.',
          ],
        },
        {
          heading: '4. Eligibility',
          body: [
            'You must be at least 18 years old to use Eventies, create an account, submit a request, or enter into a booking or payment arrangement with Eventies.',
          ],
        },
        {
          heading: '5. Accounts',
          bullets: [
            'You must provide accurate and up-to-date account and contact information.',
            'You are responsible for keeping your login details secure.',
            'Eventies may suspend or restrict accounts if we believe they are being misused, contain inaccurate information, or create risk for Eventies, users, vendors, or the website.',
          ],
        },
        {
          heading: '6. Requests are not confirmed bookings',
          body: [
            'Submitting a rental request, purchase quote request, custom build inquiry, or contact form does not create a confirmed booking. A request becomes confirmed only after Eventies reviews the details, checks availability and logistics, confirms pricing and scope, and communicates confirmation to you.',
          ],
        },
        {
          heading: '7. Pricing, availability, and scope',
          body: [
            'Prices, availability, delivery, setup, staffing, quantities, product details, and service scope may depend on date, location, event size, request details, vendor availability, and logistics. Any price or listing shown on the website is subject to review and confirmation unless Eventies clearly states otherwise in writing.',
          ],
        },
        {
          heading: '8. Payment and deposits',
          body: [
            'Eventies does not currently process online payments through the website. Payment, deposit, or advance-payment instructions may be communicated after request review and confirmation. Any deposit or advance payment is non-refundable unless Eventies states otherwise in writing.',
          ],
        },
        {
          heading: '9. Customer responsibilities',
          bullets: [
            'Provide accurate event date, location, venue access, contact, quantity, and setup information.',
            'Make sure the venue allows the requested services, equipment, delivery, electricity, installation, and activity type.',
            'Provide safe access, reasonable setup time, and any permits or approvals needed for the event.',
            'Use products, equipment, games, and services responsibly and follow instructions provided by Eventies or the service team.',
            'Pay for damage, loss, missing items, misuse, excessive cleaning, or repairs caused by you, your guests, venue, or event participants.',
          ],
        },
        {
          heading: '10. Changes, cancellation, and refunds',
          body: [
            'Cancellations and refund rules are explained in the Refund Policy. In general, cancellation requests must be made at least 72 hours before the event, and deposits or advance payments are non-refundable unless Eventies confirms otherwise in writing.',
          ],
        },
        {
          heading: '11. Service issues',
          body: [
            'If a product or service arrives with a problem, Eventies will review the issue and work to provide a reasonable solution, which may include repair, replacement, alternative arrangement, service adjustment, or another suitable response depending on the situation.',
          ],
        },
        {
          heading: '12. Prohibited use',
          bullets: [
            'Do not misuse the website, submit false information, impersonate others, interfere with security, scrape content without permission, or use Eventies for unlawful, harmful, abusive, or fraudulent activity.',
            'Do not upload or send content that violates rights, contains malicious code, or is offensive, unsafe, misleading, or illegal.',
          ],
        },
        {
          heading: '13. Website content and intellectual property',
          body: [
            'The Eventies name, website design, text, media, logos, and platform content are owned by Eventies or used with permission. You may not copy, reproduce, modify, resell, or use Eventies content for commercial purposes without written permission.',
          ],
        },
        {
          heading: '14. Limitation of liability',
          body: [
            'To the maximum extent allowed by applicable law, Eventies is not liable for indirect, incidental, special, or consequential losses. Eventies is not responsible for delays or failures caused by incorrect customer information, venue restrictions, force majeure events, third-party issues, or circumstances outside reasonable control.',
          ],
        },
        {
          heading: '15. Updates to these Terms',
          body: [
            'Eventies may update these Terms from time to time. The latest version will be posted on this page with an updated date. Continued use of the website after updates means you accept the updated Terms.',
          ],
        },
      ],
    },
    ar: {
      eyebrow: 'ط´ط±ظˆط· ط§ظ„ط®ط¯ظ…ط©',
      title: 'ط´ط±ظˆط· ط§ظ„ط®ط¯ظ…ط©',
      description:
        'طھظˆط¶ط­ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط· ظ‚ظˆط§ط¹ط¯ ط§ط³طھط®ط¯ط§ظ… Eventies ظˆط¥ط±ط³ط§ظ„ ط§ظ„ط·ظ„ط¨ط§طھ ظˆط¥ظ†ط´ط§ط، ط§ظ„ط­ط³ط§ط¨ط§طھ ظˆط§ظ„طھط¹ط§ظ…ظ„ ظ…ط¹ Eventies ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظپط¹ط§ظ„ظٹط§طھ.',
      lastUpdatedLabel: 'ط¢ط®ط± طھط­ط¯ظٹط«',
      lastUpdated: '1 ظٹظˆظ„ظٹظˆ 2026',
      note: 'ظٹط¹ظ…ظ„ Eventies ط­ط§ظ„ظٹظ‹ط§ طھط­طھ ط§ط³ظ… Eventies. ظ‚ط¯ طھطھظ… ط¥ط¶ط§ظپط© ط¨ظٹط§ظ†ط§طھ ط§ظ„طھط³ط¬ظٹظ„ ط§ظ„ط±ط³ظ…ظٹ ظ„ظ„ط´ط±ظƒط© ط¹ظ†ط¯ طھظˆظپط±ظ‡ط§.',
      metaTitle: 'ط´ط±ظˆط· ط§ظ„ط®ط¯ظ…ط© | Eventies',
      metaDescription:
        'ط±ط§ط¬ط¹ ط´ط±ظˆط· ط®ط¯ظ…ط© Eventies ظ„ظ„ط­ط³ط§ط¨ط§طھ ظˆط·ظ„ط¨ط§طھ ط§ظ„ظپط¹ط§ظ„ظٹط§طھ ظˆط§ظ„طھط£ظƒظٹط¯ ظˆط§ظ„طھظ†ط³ظٹظ‚ ظ…ط¹ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆط§ظ„ط¥ظ„ط؛ط§ط، ظˆظ…ط³ط¤ظˆظ„ظٹط§طھ ط§ظ„ط¹ظ…ظٹظ„.',
      contactHeading: 'ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظ†ط§',
      contactBody:
        'ظ„ط£ظٹ ط£ط³ط¦ظ„ط© ط­ظˆظ„ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط·طŒ طھظˆط§طµظ„ ظ…ط¹ظ†ط§ ط¹ظ„ظ‰ support@eventiesjo.com.',
      sections: [
        {
          heading: '1. ظ‚ط¨ظˆظ„ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط·',
          body: [
            'ط¨ط§ط³طھط®ط¯ط§ظ… ظ…ظˆظ‚ط¹ Eventies ط£ظˆ ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨ ط£ظˆ ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ ط£ظˆ ط§ظ„طھظˆط§طµظ„ ظ…ط¹ Eventies ط¨ط®طµظˆطµ ط®ط¯ظ…ط©طŒ ظپط¥ظ†ظƒ طھظˆط§ظپظ‚ ط¹ظ„ظ‰ ط´ط±ظˆط· ط§ظ„ط®ط¯ظ…ط© ظ‡ط°ظ‡ ظˆط§ظ„ط³ظٹط§ط³ط§طھ ط§ظ„ظ…ط±طھط¨ط·ط© ط¨ظ‡ط§ ظˆط§ظ„ظ…ظ†ط´ظˆط±ط© ط¹ظ„ظ‰ ط§ظ„ظ…ظˆظ‚ط¹.',
          ],
        },
        {
          heading: '2. ظ…ط§ط°ط§ ظٹظ‚ط¯ظ… Eventies',
          body: [
            'ظٹط³ط§ط¹ط¯ Eventies ط§ظ„ط¹ظ…ظ„ط§ط، ط¹ظ„ظ‰ ط·ظ„ط¨ ط®ط¯ظ…ط§طھ طھط£ط¬ظٹط± ط§ظ„ظپط¹ط§ظ„ظٹط§طھ ظˆط§ظ„ط£ظ„ط¹ط§ط¨ ظˆط§ظ„طھط¬ط§ط±ط¨ ط§ظ„طھظپط§ط¹ظ„ظٹط© ظˆط§ظ„ظ…ط¹ط¯ط§طھ ظˆط§ظ„طھظ†ظپظٹط°ط§طھ ط§ظ„ظ…ط®طµطµط© ظˆط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط±طھط¨ط·ط© ط¨ط§ظ„ظپط¹ط§ظ„ظٹط§طھ. ظٹط±ط³ظ„ ط§ظ„ط¹ظ…ظٹظ„ ط§ظ„ط·ظ„ط¨ ط¥ظ„ظ‰ EventiesطŒ ظˆظٹظ‚ظˆظ… Eventies ط¨ط§ظ„طھظ†ط³ظٹظ‚ ظ…ط¹ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆظ…ظ‚ط¯ظ…ظٹ ط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط³ط¬ظ„ظٹظ† ظ„ظ…ط±ط§ط¬ط¹ط© ط§ظ„طھظˆظپط± ظˆط§ظ„طھط³ط¹ظٹط± ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ ظˆظ…طھط·ظ„ط¨ط§طھ ط§ظ„طھط±ظƒظٹط¨ ظˆط§ظ„ط®ط·ظˆط§طھ ط§ظ„طھط§ظ„ظٹط©.',
            'طھظƒظˆظ† ط§ظ„ط¹ظ„ط§ظ‚ط© ط§ظ„ط¸ط§ظ‡ط±ط© ظ„ظ„ط¹ظ…ظٹظ„ ظ…ط¹ Eventies. ظˆظ‚ط¯ ظٹط³طھط®ط¯ظ… Eventies ظ…ط²ظˆط¯ظٹظ† ظˆظ…ظ‚ط¯ظ…ظٹ ط®ط¯ظ…ط§طھ ظ„ظ„ظ…ط³ط§ط¹ط¯ط© ظپظٹ طھظ†ظپظٹط° ط£ظˆ طھظˆط±ظٹط¯ ط£ط¬ط²ط§ط، ظ…ظ† ط§ظ„ط®ط¯ظ…ط©.',
          ],
        },
        {
          heading: '3. ظ…ظˆط§ظ‚ط¹ ط§ظ„ط®ط¯ظ…ط©',
          body: [
            'طھطھظˆظپط± ط®ط¯ظ…ط§طھ Eventies ط¨ط´ظƒظ„ ط£ط³ط§ط³ظٹ ظپظٹ ط§ظ„ط£ط±ط¯ظ†طŒ ظˆظ‚ط¯ طھطھظˆظپط± ظپظٹ ظ…ظˆط§ظ‚ط¹ ط£ط®ط±ظ‰ ط­ط³ط¨ ط§ظ„طھظˆظپط± ظˆطھط؛ط·ظٹط© ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ ظˆط§ظ„طھط£ظƒظٹط¯ ظ…ظ† Eventies. ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ ظ„ظ…ظˆظ‚ط¹ ظ…ط¹ظٹظ† ظ„ط§ ظٹط¹ظ†ظٹ ط¶ظ…ط§ظ† طھظˆظپط± ط§ظ„ط®ط¯ظ…ط© ظپظٹ ط°ظ„ظƒ ط§ظ„ظ…ظˆظ‚ط¹.',
          ],
        },
        {
          heading: '4. ط§ظ„ط£ظ‡ظ„ظٹط©',
          body: [
            'ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¹ظ…ط±ظƒ 18 ط³ظ†ط© ط£ظˆ ط£ظƒط«ط± ظ„ط§ط³طھط®ط¯ط§ظ… Eventies ط£ظˆ ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨ ط£ظˆ ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ ط£ظˆ ط§ظ„ط¯ط®ظˆظ„ ظپظٹ ط£ظٹ طھط±طھظٹط¨ ط­ط¬ط² ط£ظˆ ط¯ظپط¹ ظ…ط¹ Eventies.',
          ],
        },
        {
          heading: '5. ط§ظ„ط­ط³ط§ط¨ط§طھ',
          bullets: [
            'ظٹط¬ط¨ طھظ‚ط¯ظٹظ… ظ…ط¹ظ„ظˆظ…ط§طھ ط­ط³ط§ط¨ ظˆطھظˆط§طµظ„ ط¯ظ‚ظٹظ‚ط© ظˆظ…ط­ط¯ط«ط©.',
            'ط£ظ†طھ ظ…ط³ط¤ظˆظ„ ط¹ظ† ط§ظ„ط­ظپط§ط¸ ط¹ظ„ظ‰ ط³ط±ظٹط© ط¨ظٹط§ظ†ط§طھ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„.',
            'ظ‚ط¯ ظٹظ‚ظˆظ… Eventies ط¨طھط¹ظ„ظٹظ‚ ط£ظˆ طھظ‚ظٹظٹط¯ ط§ظ„ط­ط³ط§ط¨ط§طھ ط¥ط°ط§ ط§ط¹طھظ‚ط¯ظ†ط§ ط£ظ†ظ‡ط§ طھط³طھط®ط¯ظ… ط¨ط´ظƒظ„ ط®ط§ط·ط¦ ط£ظˆ طھط­طھظˆظٹ ط¹ظ„ظ‰ ظ…ط¹ظ„ظˆظ…ط§طھ ط؛ظٹط± ط¯ظ‚ظٹظ‚ط© ط£ظˆ طھط³ط¨ط¨ ط®ط·ط±ظ‹ط§ ط¹ظ„ظ‰ Eventies ط£ظˆ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ† ط£ظˆ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ط£ظˆ ط§ظ„ظ…ظˆظ‚ط¹.',
          ],
        },
        {
          heading: '6. ط§ظ„ط·ظ„ط¨ط§طھ ظ„ظٹط³طھ ط­ط¬ظˆط²ط§طھ ظ…ط¤ظƒط¯ط©',
          body: [
            'ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ طھط£ط¬ظٹط± ط£ظˆ ط·ظ„ط¨ ط¹ط±ط¶ ط³ط¹ط± ط´ط±ط§ط، ط£ظˆ ط§ط³طھظپط³ط§ط± طھظ†ظپظٹط° ظ…ط®طµطµ ط£ظˆ ظ†ظ…ظˆط°ط¬ طھظˆط§طµظ„ ظ„ط§ ظٹط¹ظ†ظٹ ظˆط¬ظˆط¯ ط­ط¬ط² ظ…ط¤ظƒط¯. ظٹطµط¨ط­ ط§ظ„ط·ظ„ط¨ ظ…ط¤ظƒط¯ظ‹ط§ ظپظ‚ط· ط¨ط¹ط¯ ط£ظ† ظٹط±ط§ط¬ط¹ Eventies ط§ظ„طھظپط§طµظٹظ„ ظˆظٹطھط­ظ‚ظ‚ ظ…ظ† ط§ظ„طھظˆظپط± ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ ظˆظٹط¤ظƒط¯ ط§ظ„ط³ط¹ط± ظˆط§ظ„ظ†ط·ط§ظ‚ ظˆظٹط¨ظ„ط؛ظƒ ط¨ط§ظ„طھط£ظƒظٹط¯.',
          ],
        },
        {
          heading: '7. ط§ظ„ط£ط³ط¹ط§ط± ظˆط§ظ„طھظˆظپط± ظˆظ†ط·ط§ظ‚ ط§ظ„ط®ط¯ظ…ط©',
          body: [
            'ظ‚ط¯ طھط¹طھظ…ط¯ ط§ظ„ط£ط³ط¹ط§ط± ظˆط§ظ„طھظˆظپط± ظˆط§ظ„طھظˆطµظٹظ„ ظˆط§ظ„طھط±ظƒظٹط¨ ظˆط§ظ„ط·ط§ظ‚ظ… ظˆط§ظ„ظƒظ…ظٹط§طھ ظˆطھظپط§طµظٹظ„ ط§ظ„ظ…ظ†طھط¬ط§طھ ظˆظ†ط·ط§ظ‚ ط§ظ„ط®ط¯ظ…ط© ط¹ظ„ظ‰ ط§ظ„طھط§ط±ظٹط® ظˆط§ظ„ظ…ظˆظ‚ط¹ ظˆط­ط¬ظ… ط§ظ„ظپط¹ط§ظ„ظٹط© ظˆطھظپط§طµظٹظ„ ط§ظ„ط·ظ„ط¨ ظˆطھظˆظپط± ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ. ط£ظٹ ط³ط¹ط± ط£ظˆ ظ‚ط§ط¦ظ…ط© طھط¸ظ‡ط± ط¹ظ„ظ‰ ط§ظ„ظ…ظˆظ‚ط¹ طھظƒظˆظ† ظ‚ط§ط¨ظ„ط© ظ„ظ„ظ…ط±ط§ط¬ط¹ط© ظˆط§ظ„طھط£ظƒظٹط¯ ظ…ط§ ظ„ظ… ظٹظˆط¶ط­ Eventies ط®ظ„ط§ظپ ط°ظ„ظƒ ظƒطھط§ط¨ط©.',
          ],
        },
        {
          heading: '8. ط§ظ„ط¯ظپط¹ ظˆط§ظ„ط¹ط±ط¨ظˆظ†',
          body: [
            'ظ„ط§ ظٹط¹ط§ظ„ط¬ Eventies ط­ط§ظ„ظٹظ‹ط§ ط§ظ„ظ…ط¯ظپظˆط¹ط§طھ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ظ…ظˆظ‚ط¹. ظ‚ط¯ ظٹطھظ… ط¥ط±ط³ط§ظ„ طھط¹ظ„ظٹظ…ط§طھ ط§ظ„ط¯ظپط¹ ط£ظˆ ط§ظ„ط¹ط±ط¨ظˆظ† ط£ظˆ ط§ظ„ط¯ظپط¹ط§طھ ط§ظ„ظ…ظ‚ط¯ظ…ط© ط¨ط¹ط¯ ظ…ط±ط§ط¬ط¹ط© ط§ظ„ط·ظ„ط¨ ظˆطھط£ظƒظٹط¯ظ‡. ط£ظٹ ط¹ط±ط¨ظˆظ† ط£ظˆ ط¯ظپط¹ط© ظ…ظ‚ط¯ظ…ط© ط؛ظٹط± ظ…ط³طھط±ط¯ط© ظ…ط§ ظ„ظ… ظٹظˆط¶ط­ Eventies ط®ظ„ط§ظپ ط°ظ„ظƒ ظƒطھط§ط¨ط©.',
          ],
        },
        {
          heading: '9. ظ…ط³ط¤ظˆظ„ظٹط§طھ ط§ظ„ط¹ظ…ظٹظ„',
          bullets: [
            'طھظ‚ط¯ظٹظ… ظ…ط¹ظ„ظˆظ…ط§طھ ط¯ظ‚ظٹظ‚ط© ط¹ظ† طھط§ط±ظٹط® ط§ظ„ظپط¹ط§ظ„ظٹط© ظˆط§ظ„ظ…ظˆظ‚ط¹ ظˆط§ظ„ظˆطµظˆظ„ ظ„ظ„ظ…ظƒط§ظ† ظˆط¨ظٹط§ظ†ط§طھ ط§ظ„طھظˆط§طµظ„ ظˆط§ظ„ظƒظ…ظٹط© ظˆظ…طھط·ظ„ط¨ط§طھ ط§ظ„طھط±ظƒظٹط¨.',
            'ط§ظ„طھط£ظƒط¯ ظ…ظ† ط£ظ† ظ…ظƒط§ظ† ط§ظ„ظپط¹ط§ظ„ظٹط© ظٹط³ظ…ط­ ط¨ط§ظ„ط®ط¯ظ…ط§طھ ظˆط§ظ„ظ…ط¹ط¯ط§طھ ظˆط§ظ„طھظˆطµظٹظ„ ظˆط§ظ„ظƒظ‡ط±ط¨ط§ط، ظˆط§ظ„طھط±ظƒظٹط¨ ظˆظ†ظˆط¹ ط§ظ„ظ†ط´ط§ط· ط§ظ„ظ…ط·ظ„ظˆط¨.',
            'طھظˆظپظٹط± ظˆطµظˆظ„ ط¢ظ…ظ† ظˆظˆظ‚طھ طھط±ظƒظٹط¨ ظ…ظ†ط§ط³ط¨ ظˆط£ظٹ طھطµط§ط±ظٹط­ ط£ظˆ ظ…ظˆط§ظپظ‚ط§طھ ظ„ط§ط²ظ…ط© ظ„ظ„ظپط¹ط§ظ„ظٹط©.',
            'ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…ظ†طھط¬ط§طھ ظˆط§ظ„ظ…ط¹ط¯ط§طھ ظˆط§ظ„ط£ظ„ط¹ط§ط¨ ظˆط§ظ„ط®ط¯ظ…ط§طھ ط¨ط´ظƒظ„ ظ…ط³ط¤ظˆظ„ ظˆط§طھط¨ط§ط¹ ط§ظ„طھط¹ظ„ظٹظ…ط§طھ ط§ظ„ظ…ظ‚ط¯ظ…ط© ظ…ظ† Eventies ط£ظˆ ظپط±ظٹظ‚ ط§ظ„ط®ط¯ظ…ط©.',
            'ط¯ظپط¹ طھظƒظ„ظپط© ط£ظٹ طھظ„ظپ ط£ظˆ ظپظ‚ط¯ط§ظ† ط£ظˆ ظ†ظ‚طµ ظپظٹ ط§ظ„ط¹ظ†ط§طµط± ط£ظˆ ط³ظˆط، ط§ط³طھط®ط¯ط§ظ… ط£ظˆ طھظ†ط¸ظٹظپ ط²ط§ط¦ط¯ ط£ظˆ ط¥طµظ„ط§ط­ط§طھ طھط³ط¨ط¨ ط¨ظ‡ط§ ط§ظ„ط¹ظ…ظٹظ„ ط£ظˆ ط¶ظٹظˆظپظ‡ ط£ظˆ ط§ظ„ظ…ظƒط§ظ† ط£ظˆ ط§ظ„ظ…ط´ط§ط±ظƒظˆظ† ظپظٹ ط§ظ„ظپط¹ط§ظ„ظٹط©.',
          ],
        },
        {
          heading: '10. ط§ظ„طھط؛ظٹظٹط±ط§طھ ظˆط§ظ„ط¥ظ„ط؛ط§ط، ظˆط§ظ„ط§ط³طھط±ط¯ط§ط¯',
          body: [
            'طھظˆط¶ط­ ط³ظٹط§ط³ط© ط§ظ„ط§ط³طھط±ط¯ط§ط¯ ظ‚ظˆط§ط¹ط¯ ط§ظ„ط¥ظ„ط؛ط§ط، ظˆط§ظ„ط§ط³طھط±ط¯ط§ط¯. ط¨ط´ظƒظ„ ط¹ط§ظ…طŒ ظٹط¬ط¨ ط·ظ„ط¨ ط§ظ„ط¥ظ„ط؛ط§ط، ظ‚ط¨ظ„ ظ…ظˆط¹ط¯ ط§ظ„ظپط¹ط§ظ„ظٹط© ط¨ظ€ 72 ط³ط§ط¹ط© ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„طŒ ظˆطھظƒظˆظ† ط§ظ„ط¹ط±ط¨ظˆظ†ط§طھ ط£ظˆ ط§ظ„ط¯ظپط¹ط§طھ ط§ظ„ظ…ظ‚ط¯ظ…ط© ط؛ظٹط± ظ…ط³طھط±ط¯ط© ظ…ط§ ظ„ظ… ظٹط¤ظƒط¯ Eventies ط®ظ„ط§ظپ ط°ظ„ظƒ ظƒطھط§ط¨ط©.',
          ],
        },
        {
          heading: '11. ظ…ط´ط§ظƒظ„ ط§ظ„ط®ط¯ظ…ط©',
          body: [
            'ط¥ط°ط§ ظˆطµظ„ ظ…ظ†طھط¬ ط£ظˆ ط®ط¯ظ…ط© ظˆظپظٹظ‡ط§ ظ…ط´ظƒظ„ط©طŒ ط³ظٹظ‚ظˆظ… Eventies ط¨ظ…ط±ط§ط¬ط¹ط© ط§ظ„ط­ط§ظ„ط© ظˆط§ظ„ط¹ظ…ظ„ ط¹ظ„ظ‰ طھظˆظپظٹط± ط­ظ„ ظ…ظ†ط§ط³ط¨طŒ ظˆظ‚ط¯ ظٹط´ظ…ظ„ ط°ظ„ظƒ ط§ظ„ط¥طµظ„ط§ط­ ط£ظˆ ط§ظ„ط§ط³طھط¨ط¯ط§ظ„ ط£ظˆ طھط±طھظٹط¨ ط¨ط¯ظٹظ„ ط£ظˆ طھط¹ط¯ظٹظ„ ط§ظ„ط®ط¯ظ…ط© ط£ظˆ ط£ظٹ ط§ط³طھط¬ط§ط¨ط© ظ…ظ†ط§ط³ط¨ط© ط£ط®ط±ظ‰ ط­ط³ط¨ ط§ظ„ط­ط§ظ„ط©.',
          ],
        },
        {
          heading: '12. ط§ظ„ط§ط³طھط®ط¯ط§ظ…ط§طھ ط§ظ„ظ…ط­ط¸ظˆط±ط©',
          bullets: [
            'ظٹظ…ظ†ط¹ ط¥ط³ط§ط،ط© ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…ظˆظ‚ط¹ ط£ظˆ طھظ‚ط¯ظٹظ… ظ…ط¹ظ„ظˆظ…ط§طھ ط؛ظٹط± طµط­ظٹط­ط© ط£ظˆ ط§ظ†طھط­ط§ظ„ ط´ط®طµظٹط© ط§ظ„ط¢ط®ط±ظٹظ† ط£ظˆ ط§ظ„طھط¯ط®ظ„ ظپظٹ ط§ظ„ط£ظ…ط§ظ† ط£ظˆ ظ†ط³ط® ط§ظ„ظ…ط­طھظˆظ‰ ط¢ظ„ظٹظ‹ط§ ط¯ظˆظ† ط¥ط°ظ† ط£ظˆ ط§ط³طھط®ط¯ط§ظ… Eventies ظ„ط£ظٹ ظ†ط´ط§ط· ط؛ظٹط± ظ‚ط§ظ†ظˆظ†ظٹ ط£ظˆ ط¶ط§ط± ط£ظˆ ظ…ط³ظٹط، ط£ظˆ ط§ط­طھظٹط§ظ„ظٹ.',
            'ظٹظ…ظ†ط¹ ط±ظپط¹ ط£ظˆ ط¥ط±ط³ط§ظ„ ظ…ط­طھظˆظ‰ ظٹظ†طھظ‡ظƒ ط§ظ„ط­ظ‚ظˆظ‚ ط£ظˆ ظٹط­طھظˆظٹ ط¹ظ„ظ‰ ط¨ط±ظ…ط¬ظٹط§طھ ط¶ط§ط±ط© ط£ظˆ ظٹظƒظˆظ† ظ…ط³ظٹط¦ظ‹ط§ ط£ظˆ ط؛ظٹط± ط¢ظ…ظ† ط£ظˆ ظ…ط¶ظ„ظ„ظ‹ط§ ط£ظˆ ط؛ظٹط± ظ‚ط§ظ†ظˆظ†ظٹ.',
          ],
        },
        {
          heading: '13. ظ…ط­طھظˆظ‰ ط§ظ„ظ…ظˆظ‚ط¹ ظˆط§ظ„ظ…ظ„ظƒظٹط© ط§ظ„ظپظƒط±ظٹط©',
          body: [
            'ط§ط³ظ… Eventies ظˆطھطµظ…ظٹظ… ط§ظ„ظ…ظˆظ‚ط¹ ظˆط§ظ„ظ†طµظˆطµ ظˆط§ظ„ظˆط³ط§ط¦ط· ظˆط§ظ„ط´ط¹ط§ط±ط§طھ ظˆظ…ط­طھظˆظ‰ ط§ظ„ظ…ظ†طµط© ظ…ظ…ظ„ظˆظƒط© ظ„ظ€ Eventies ط£ظˆ ظ…ط³طھط®ط¯ظ…ط© ط¨ط¥ط°ظ†. ظ„ط§ ظٹط¬ظˆط² ظ†ط³ط® ط£ظˆ ط¥ط¹ط§ط¯ط© ط¥ظ†طھط§ط¬ ط£ظˆ طھط¹ط¯ظٹظ„ ط£ظˆ ط¥ط¹ط§ط¯ط© ط¨ظٹط¹ ط£ظˆ ط§ط³طھط®ط¯ط§ظ… ظ…ط­طھظˆظ‰ Eventies ظ„ط£ط؛ط±ط§ط¶ طھط¬ط§ط±ظٹط© ط¯ظˆظ† ط¥ط°ظ† ظ…ظƒطھظˆط¨.',
          ],
        },
        {
          heading: '14. طھط­ط¯ظٹط¯ ط§ظ„ظ…ط³ط¤ظˆظ„ظٹط©',
          body: [
            'ط¥ظ„ظ‰ ط£ظ‚طµظ‰ ط­ط¯ ظٹط³ظ…ط­ ط¨ظ‡ ط§ظ„ظ‚ط§ظ†ظˆظ† ط§ظ„ظ…ط¹ظ…ظˆظ„ ط¨ظ‡طŒ ظ„ط§ ظٹطھط­ظ…ظ„ Eventies ط§ظ„ظ…ط³ط¤ظˆظ„ظٹط© ط¹ظ† ط§ظ„ط®ط³ط§ط¦ط± ط؛ظٹط± ط§ظ„ظ…ط¨ط§ط´ط±ط© ط£ظˆ ط§ظ„ط¹ط±ط¶ظٹط© ط£ظˆ ط§ظ„ط®ط§طµط© ط£ظˆ ط§ظ„طھط¨ط¹ظٹط©. ظ„ط§ ظٹظƒظˆظ† Eventies ظ…ط³ط¤ظˆظ„ظ‹ط§ ط¹ظ† ط§ظ„طھط£ط®ظٹط± ط£ظˆ ط§ظ„ظپط´ظ„ ط§ظ„ظ†ط§طھط¬ ط¹ظ† ظ…ط¹ظ„ظˆظ…ط§طھ ط؛ظٹط± طµط­ظٹط­ط© ظ…ظ† ط§ظ„ط¹ظ…ظٹظ„ ط£ظˆ ظ‚ظٹظˆط¯ ط§ظ„ظ…ظƒط§ظ† ط£ظˆ ط¸ط±ظˆظپ ظ‚ط§ظ‡ط±ط© ط£ظˆ ظ…ط´ط§ظƒظ„ ط·ط±ظپ ط«ط§ظ„ط« ط£ظˆ ط¸ط±ظˆظپ ط®ط§ط±ط¬ط© ط¹ظ† ط§ظ„ط³ظٹط·ط±ط© ط§ظ„ظ…ط¹ظ‚ظˆظ„ط©.',
          ],
        },
        {
          heading: '15. طھط­ط¯ظٹط«ط§طھ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط·',
          body: [
            'ظ‚ط¯ ظٹظ‚ظˆظ… Eventies ط¨طھط­ط¯ظٹط« ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط· ظ…ظ† ظˆظ‚طھ ظ„ط¢ط®ط±. ط³ظٹطھظ… ظ†ط´ط± ط£ط­ط¯ط« ظ†ط³ط®ط© ط¹ظ„ظ‰ ظ‡ط°ظ‡ ط§ظ„طµظپط­ط© ظ…ط¹ طھط§ط±ظٹط® طھط­ط¯ظٹط« ط¬ط¯ظٹط¯. ط§ط³طھظ…ط±ط§ط±ظƒ ظپظٹ ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…ظˆظ‚ط¹ ط¨ط¹ط¯ ط§ظ„طھط­ط¯ظٹط« ظٹط¹ظ†ظٹ ظ‚ط¨ظˆظ„ظƒ ظ„ظ„ط´ط±ظˆط· ط§ظ„ظ…ط­ط¯ط«ط©.',
          ],
        },
      ],
    },
  },
  vendorTerms: {
    en: {
      eyebrow: 'Vendor Terms',
      title: 'Vendor Terms',
      description:
        'These Vendor Terms explain how registered vendors and service providers may work with Eventies, submit listing details, and support customer requests coordinated by Eventies.',
      lastUpdatedLabel: 'Last updated',
      lastUpdated: 'July 1, 2026',
      metaTitle: 'Vendor Terms | Eventies',
      metaDescription:
        'Read Eventies Vendor Terms for vendor listings, review, accuracy, availability, commission, requests, and account actions.',
      contactHeading: 'Vendor contact',
      contactBody:
        'For vendor onboarding, listing, or partnership questions, contact vendors@eventiesjo.com.',
      sections: [
        {
          heading: '1. Scope of these Vendor Terms',
          body: [
            'These Vendor Terms apply to vendors, service providers, suppliers, partners, or businesses that list or provide event services, products, rentals, custom builds, or related support through Eventies.',
            'Vendor account tools may be introduced in the future. Until then, Eventies may collect vendor information, review listings, and coordinate requests manually or through internal systems.',
          ],
        },
        {
          heading: '2. Vendor relationship with Eventies',
          body: [
            'Vendors are independent service providers or suppliers. Eventies coordinates customer requests and may present vendor services through the Eventies website or team. The customer relationship and request management are handled by Eventies unless Eventies clearly agrees otherwise in writing.',
          ],
        },
        {
          heading: '3. Onboarding and review',
          bullets: [
            'Eventies may review vendors, services, products, pricing, images, descriptions, quality, availability, and suitability before publishing or offering them to customers.',
            'Eventies may approve, reject, edit, hide, remove, or request changes to any listing or vendor content at its discretion.',
            'Approval of a vendor or listing does not guarantee future requests, sales, bookings, or visibility.',
          ],
        },
        {
          heading: '4. Accuracy of listings',
          body: [
            'Vendors are responsible for the accuracy of all information they provide, including images, descriptions, prices, dimensions, quantities, availability, service details, setup requirements, safety requirements, and delivery or installation limitations.',
          ],
        },
        {
          heading: '5. Pricing, commission, and commercial terms',
          body: [
            'Eventies may charge commission, service fees, platform fees, listing fees, or other agreed commercial fees. The applicable commission or business arrangement may be confirmed separately between Eventies and the vendor.',
          ],
        },
        {
          heading: '6. Availability and request handling',
          bullets: [
            'When Eventies receives a relevant request, Eventies may contact one or more vendors to check availability, pricing, logistics, and execution details.',
            'A vendor may accept or reject a request unless a separate written agreement states otherwise.',
            'Eventies does not currently require vendors to respond within a specific time, but timely responses are encouraged because delays may cause the request to move to another provider.',
            'Vendors must promptly tell Eventies if a listed product or service becomes unavailable, changes price, or cannot be delivered as described.',
          ],
        },
        {
          heading: '7. Service quality and execution',
          body: [
            'Vendors must provide services in a professional, safe, reliable, and lawful manner. Vendors are responsible for equipment condition, staff conduct, delivery readiness, installation quality, and following applicable venue, safety, and legal requirements.',
          ],
        },
        {
          heading: '8. Customer issues and responsibility',
          body: [
            'If a vendor-provided item or service has a problem, the vendor must cooperate with Eventies to investigate and resolve the issue. Eventies may decide the customer-facing solution, and the vendor may be responsible for costs caused by inaccurate information, non-performance, late delivery, defective items, unsafe execution, or failure to meet agreed requirements.',
          ],
        },
        {
          heading: '9. Content rights',
          body: [
            'By providing images, videos, text, logos, or listing materials to Eventies, the vendor confirms that it has the right to use and share that content and grants Eventies permission to use it for listings, marketing, customer communication, and platform operations.',
          ],
        },
        {
          heading: '10. Vendor account or listing removal',
          body: [
            'Eventies may remove a listing, reject content, pause visibility, suspend vendor participation, or terminate vendor access if Eventies believes the vendor information is inaccurate, the service quality is not acceptable, the vendor violates these Terms, or continued participation creates risk for Eventies, customers, or other vendors.',
          ],
        },
        {
          heading: '11. Future vendor tools',
          body: [
            'Eventies may later introduce vendor dashboards, self-service listings, request tools, analytics, payment tools, or other vendor features. Additional rules may apply before those features are enabled.',
          ],
        },
        {
          heading: '12. Updates to these Vendor Terms',
          body: [
            'Eventies may update these Vendor Terms from time to time. The latest version will be posted on this page with an updated date.',
          ],
        },
      ],
    },
    ar: {
      eyebrow: 'ط´ط±ظˆط· ط§ظ„ظ…ط²ظˆط¯ظٹظ†',
      title: 'ط´ط±ظˆط· ط§ظ„ظ…ط²ظˆط¯ظٹظ†',
      description:
        'طھظˆط¶ط­ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط· ظƒظٹظپظٹط© طھط¹ط§ظˆظ† ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆظ…ظ‚ط¯ظ…ظٹ ط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط³ط¬ظ„ظٹظ† ظ…ط¹ EventiesطŒ ظˆطھظ‚ط¯ظٹظ… طھظپط§طµظٹظ„ ط§ظ„ظ‚ظˆط§ط¦ظ…طŒ ظˆط¯ط¹ظ… ط·ظ„ط¨ط§طھ ط§ظ„ط¹ظ…ظ„ط§ط، ط§ظ„طھظٹ ظٹظ†ط³ظ‚ظ‡ط§ Eventies.',
      lastUpdatedLabel: 'ط¢ط®ط± طھط­ط¯ظٹط«',
      lastUpdated: '1 ظٹظˆظ„ظٹظˆ 2026',
      metaTitle: 'ط´ط±ظˆط· ط§ظ„ظ…ط²ظˆط¯ظٹظ† | Eventies',
      metaDescription:
        'ط±ط§ط¬ط¹ ط´ط±ظˆط· ظ…ط²ظˆط¯ظٹ Eventies ظ„ظ„ظ‚ظˆط§ط¦ظ… ظˆط§ظ„ظ…ط±ط§ط¬ط¹ط© ظˆط§ظ„ط¯ظ‚ط© ظˆط§ظ„طھظˆظپط± ظˆط§ظ„ط¹ظ…ظˆظ„ط© ظˆط§ظ„ط·ظ„ط¨ط§طھ ظˆط¥ط¬ط±ط§ط،ط§طھ ط§ظ„ط­ط³ط§ط¨.',
      contactHeading: 'ط§ظ„طھظˆط§طµظ„ ظ…ط¹ ظپط±ظٹظ‚ ط§ظ„ظ…ط²ظˆط¯ظٹظ†',
      contactBody:
        'ظ„ط£ط³ط¦ظ„ط© ط§ظ†ط¶ظ…ط§ظ… ط§ظ„ظ…ط²ظˆط¯ظٹظ† ط£ظˆ ط§ظ„ظ‚ظˆط§ط¦ظ… ط£ظˆ ط§ظ„ط´ط±ط§ظƒط§طھطŒ طھظˆط§طµظ„ ط¹ظ„ظ‰ vendors@eventiesjo.com.',
      sections: [
        {
          heading: '1. ظ†ط·ط§ظ‚ ط´ط±ظˆط· ط§ظ„ظ…ط²ظˆط¯ظٹظ†',
          body: [
            'طھظ†ط·ط¨ظ‚ ط´ط±ظˆط· ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظ‡ط°ظ‡ ط¹ظ„ظ‰ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆظ…ظ‚ط¯ظ…ظٹ ط§ظ„ط®ط¯ظ…ط§طھ ظˆط§ظ„ظ…ظˆط±ط¯ظٹظ† ظˆط§ظ„ط´ط±ظƒط§ط، ط£ظˆ ط§ظ„ط´ط±ظƒط§طھ ط§ظ„طھظٹ طھط¹ط±ط¶ ط£ظˆ طھظˆظپط± ط®ط¯ظ…ط§طھ ظپط¹ط§ظ„ظٹط§طھ ط£ظˆ ظ…ظ†طھط¬ط§طھ ط£ظˆ طھط£ط¬ظٹط± ط£ظˆ طھظ†ظپظٹط° ظ…ط®طµطµ ط£ظˆ ط¯ط¹ظ… ظ…ط±طھط¨ط· ظ…ظ† ط®ظ„ط§ظ„ Eventies.',
            'ظ‚ط¯ ظٹطھظ… ط¥ط·ظ„ط§ظ‚ ط£ط¯ظˆط§طھ ط­ط³ط§ط¨ط§طھ ظ„ظ„ظ…ط²ظˆط¯ظٹظ† ظپظٹ ط§ظ„ظ…ط³طھظ‚ط¨ظ„. ظˆط­طھظ‰ ط°ظ„ظƒطŒ ظ‚ط¯ ظٹط¬ظ…ط¹ Eventies ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆظٹط±ط§ط¬ط¹ ط§ظ„ظ‚ظˆط§ط¦ظ… ظˆظٹظ†ط³ظ‚ ط§ظ„ط·ظ„ط¨ط§طھ ظٹط¯ظˆظٹظ‹ط§ ط£ظˆ ظ…ظ† ط®ظ„ط§ظ„ ط£ظ†ط¸ظ…ط© ط¯ط§ط®ظ„ظٹط©.',
          ],
        },
        {
          heading: '2. ط¹ظ„ط§ظ‚ط© ط§ظ„ظ…ط²ظˆط¯ ظ…ط¹ Eventies',
          body: [
            'ط§ظ„ظ…ط²ظˆط¯ظˆظ† ظ‡ظ… ظ…ظ‚ط¯ظ…ظˆ ط®ط¯ظ…ط§طھ ط£ظˆ ظ…ظˆط±ط¯ظˆظ† ظ…ط³طھظ‚ظ„ظˆظ†. ظٹظ‚ظˆظ… Eventies ط¨طھظ†ط³ظٹظ‚ ط·ظ„ط¨ط§طھ ط§ظ„ط¹ظ…ظ„ط§ط، ظˆظ‚ط¯ ظٹط¹ط±ط¶ ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظ…ظ† ط®ظ„ط§ظ„ ظ…ظˆظ‚ط¹ Eventies ط£ظˆ ظپط±ظٹظ‚ظ‡. طھطھظ… ط¥ط¯ط§ط±ط© ط¹ظ„ط§ظ‚ط© ط§ظ„ط¹ظ…ظٹظ„ ظˆط§ظ„ط·ظ„ط¨ ظ…ظ† ظ‚ط¨ظ„ Eventies ظ…ط§ ظ„ظ… ظٹطھظپظ‚ Eventies ط¨ظˆط¶ظˆط­ ط¹ظ„ظ‰ ط®ظ„ط§ظپ ط°ظ„ظƒ ظƒطھط§ط¨ط©.',
          ],
        },
        {
          heading: '3. ط§ظ„ط§ظ†ط¶ظ…ط§ظ… ظˆط§ظ„ظ…ط±ط§ط¬ط¹ط©',
          bullets: [
            'ظ‚ط¯ ظٹط±ط§ط¬ط¹ Eventies ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظˆط§ظ„ط®ط¯ظ…ط§طھ ظˆط§ظ„ظ…ظ†طھط¬ط§طھ ظˆط§ظ„ط£ط³ط¹ط§ط± ظˆط§ظ„طµظˆط± ظˆط§ظ„ط£ظˆطµط§ظپ ظˆط§ظ„ط¬ظˆط¯ط© ظˆط§ظ„طھظˆظپط± ظˆط§ظ„ظ…ظ„ط§ط،ظ…ط© ظ‚ط¨ظ„ ط§ظ„ظ†ط´ط± ط£ظˆ ط§ظ„ط¹ط±ط¶ ط¹ظ„ظ‰ ط§ظ„ط¹ظ…ظ„ط§ط،.',
            'ظٹط­ظ‚ ظ„ظ€ Eventies ط§ظ„ظ…ظˆط§ظپظ‚ط© ط¹ظ„ظ‰ ط£ظٹ ظ‚ط§ط¦ظ…ط© ط£ظˆ ظ…ط­طھظˆظ‰ ظ…ط²ظˆط¯ ط£ظˆ ط±ظپط¶ظ‡ ط£ظˆ طھط¹ط¯ظٹظ„ظ‡ ط£ظˆ ط¥ط®ظپط§ط¤ظ‡ ط£ظˆ ط­ط°ظپظ‡ ط£ظˆ ط·ظ„ط¨ طھط¹ط¯ظٹظ„ط§طھ ط¹ظ„ظٹظ‡ ظˆظپظ‚ طھظ‚ط¯ظٹط±ظ‡.',
            'ط§ظ„ظ…ظˆط§ظپظ‚ط© ط¹ظ„ظ‰ ظ…ط²ظˆط¯ ط£ظˆ ظ‚ط§ط¦ظ…ط© ظ„ط§ طھط¶ظ…ظ† ظˆط¬ظˆط¯ ط·ظ„ط¨ط§طھ ط£ظˆ ظ…ط¨ظٹط¹ط§طھ ط£ظˆ ط­ط¬ظˆط²ط§طھ ط£ظˆ ط¸ظ‡ظˆط± ظ…ط³طھظ‚ط¨ظ„ظٹ.',
          ],
        },
        {
          heading: '4. ط¯ظ‚ط© ط§ظ„ظ‚ظˆط§ط¦ظ…',
          body: [
            'ظٹظƒظˆظ† ط§ظ„ظ…ط²ظˆط¯ ظ…ط³ط¤ظˆظ„ظ‹ط§ ط¹ظ† ط¯ظ‚ط© ط¬ظ…ظٹط¹ ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„طھظٹ ظٹظ‚ط¯ظ…ظ‡ط§طŒ ط¨ظ…ط§ ظپظٹ ط°ظ„ظƒ ط§ظ„طµظˆط± ظˆط§ظ„ط£ظˆطµط§ظپ ظˆط§ظ„ط£ط³ط¹ط§ط± ظˆط§ظ„ط£ط¨ط¹ط§ط¯ ظˆط§ظ„ظƒظ…ظٹط§طھ ظˆط§ظ„طھظˆظپط± ظˆطھظپط§طµظٹظ„ ط§ظ„ط®ط¯ظ…ط© ظˆظ…طھط·ظ„ط¨ط§طھ ط§ظ„طھط±ظƒظٹط¨ ظˆظ…طھط·ظ„ط¨ط§طھ ط§ظ„ط³ظ„ط§ظ…ط© ظˆط­ط¯ظˆط¯ ط§ظ„طھظˆطµظٹظ„ ط£ظˆ ط§ظ„طھط±ظƒظٹط¨.',
          ],
        },
        {
          heading: '5. ط§ظ„طھط³ط¹ظٹط± ظˆط§ظ„ط¹ظ…ظˆظ„ط© ظˆط§ظ„ط´ط±ظˆط· ط§ظ„طھط¬ط§ط±ظٹط©',
          body: [
            'ظ‚ط¯ ظٹظپط±ط¶ Eventies ط¹ظ…ظˆظ„ط© ط£ظˆ ط±ط³ظˆظ… ط®ط¯ظ…ط© ط£ظˆ ط±ط³ظˆظ… ظ…ظ†طµط© ط£ظˆ ط±ط³ظˆظ… ظ‚ظˆط§ط¦ظ… ط£ظˆ ط£ظٹ ط±ط³ظˆظ… طھط¬ط§ط±ظٹط© ظ…طھظپظ‚ ط¹ظ„ظٹظ‡ط§. ظ‚ط¯ ظٹطھظ… طھط£ظƒظٹط¯ ط§ظ„ط¹ظ…ظˆظ„ط© ط£ظˆ ط§ظ„طھط±طھظٹط¨ ط§ظ„طھط¬ط§ط±ظٹ ط§ظ„ظ…ط·ط¨ظ‚ ط¨ط´ظƒظ„ ظ…ظ†ظپطµظ„ ط¨ظٹظ† Eventies ظˆط§ظ„ظ…ط²ظˆط¯.',
          ],
        },
        {
          heading: '6. ط§ظ„طھظˆظپط± ظˆط§ظ„طھط¹ط§ظ…ظ„ ظ…ط¹ ط§ظ„ط·ظ„ط¨ط§طھ',
          bullets: [
            'ط¹ظ†ط¯ظ…ط§ ظٹط³طھظ‚ط¨ظ„ Eventies ط·ظ„ط¨ظ‹ط§ ظ…ظ†ط§ط³ط¨ظ‹ط§طŒ ظ‚ط¯ ظٹطھظˆط§طµظ„ ظ…ط¹ ظ…ط²ظˆط¯ ظˆط§ط­ط¯ ط£ظˆ ط£ظƒط«ط± ظ„ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„طھظˆظپط± ظˆط§ظ„طھط³ط¹ظٹط± ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ ظˆطھظپط§طµظٹظ„ ط§ظ„طھظ†ظپظٹط°.',
            'ظٹظ…ظƒظ† ظ„ظ„ظ…ط²ظˆط¯ ظ‚ط¨ظˆظ„ ط§ظ„ط·ظ„ط¨ ط£ظˆ ط±ظپط¶ظ‡ ظ…ط§ ظ„ظ… طھظ†طµ ط§طھظپط§ظ‚ظٹط© ظ…ظƒطھظˆط¨ط© ظ…ظ†ظپطµظ„ط© ط¹ظ„ظ‰ ط®ظ„ط§ظپ ط°ظ„ظƒ.',
            'ظ„ط§ ظٹط·ظ„ط¨ Eventies ط­ط§ظ„ظٹظ‹ط§ ظ…ظ† ط§ظ„ظ…ط²ظˆط¯ظٹظ† ط§ظ„ط±ط¯ ط®ظ„ط§ظ„ ظˆظ‚طھ ظ…ط­ط¯ط¯طŒ ظ„ظƒظ† ط§ظ„ط±ط¯ ط§ظ„ط³ط±ظٹط¹ ظ…ظپط¶ظ„ ظ„ط£ظ† ط§ظ„طھط£ط®ظٹط± ظ‚ط¯ ظٹط¤ط¯ظٹ ط¥ظ„ظ‰ طھط­ظˆظٹظ„ ط§ظ„ط·ظ„ط¨ ظ„ظ…ط²ظˆط¯ ط¢ط®ط±.',
            'ظٹط¬ط¨ ط¹ظ„ظ‰ ط§ظ„ظ…ط²ظˆط¯ ط¥ط¨ظ„ط§ط؛ Eventies ط¨ط³ط±ط¹ط© ط¥ط°ط§ ط£طµط¨ط­ ط§ظ„ظ…ظ†طھط¬ ط£ظˆ ط§ظ„ط®ط¯ظ…ط© ط؛ظٹط± ظ…طھظˆظپط± ط£ظˆ طھط؛ظٹط± ط§ظ„ط³ط¹ط± ط£ظˆ ظ„ظ… ظٹط¹ط¯ ط¨ط§ظ„ط¥ظ…ظƒط§ظ† طھظ‚ط¯ظٹظ…ظ‡ ظƒظ…ط§ ظ‡ظˆ ظ…ظˆطµظˆظپ.',
          ],
        },
        {
          heading: '7. ط¬ظˆط¯ط© ط§ظ„ط®ط¯ظ…ط© ظˆط§ظ„طھظ†ظپظٹط°',
          body: [
            'ظٹط¬ط¨ ط¹ظ„ظ‰ ط§ظ„ظ…ط²ظˆط¯ طھظ‚ط¯ظٹظ… ط§ظ„ط®ط¯ظ…ط§طھ ط¨ط·ط±ظٹظ‚ط© ظ…ظ‡ظ†ظٹط© ظˆط¢ظ…ظ†ط© ظˆظ…ظˆط«ظˆظ‚ط© ظˆظ‚ط§ظ†ظˆظ†ظٹط©. ظٹظƒظˆظ† ط§ظ„ظ…ط²ظˆط¯ ظ…ط³ط¤ظˆظ„ظ‹ط§ ط¹ظ† ط­ط§ظ„ط© ط§ظ„ظ…ط¹ط¯ط§طھ ظˆط³ظ„ظˆظƒ ط§ظ„ط·ط§ظ‚ظ… ظˆط¬ط§ظ‡ط²ظٹط© ط§ظ„طھظˆطµظٹظ„ ظˆط¬ظˆط¯ط© ط§ظ„طھط±ظƒظٹط¨ ظˆط§ظ„ط§ظ„طھط²ط§ظ… ط¨ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ظ…ظƒط§ظ† ظˆط§ظ„ط³ظ„ط§ظ…ط© ظˆط§ظ„ظ‚ط§ظ†ظˆظ† ط§ظ„ظ…ط¹ظ…ظˆظ„ ط¨ظ‡.',
          ],
        },
        {
          heading: '8. ظ…ط´ط§ظƒظ„ ط§ظ„ط¹ظ…ظ„ط§ط، ظˆط§ظ„ظ…ط³ط¤ظˆظ„ظٹط©',
          body: [
            'ط¥ط°ط§ ط¸ظ‡ط±طھ ظ…ط´ظƒظ„ط© ظپظٹ ط¹ظ†طµط± ط£ظˆ ط®ط¯ظ…ط© ظ…ظ‚ط¯ظ…ط© ظ…ظ† ط§ظ„ظ…ط²ظˆط¯طŒ ظٹط¬ط¨ ط¹ظ„ظ‰ ط§ظ„ظ…ط²ظˆط¯ ط§ظ„طھط¹ط§ظˆظ† ظ…ط¹ Eventies ظ„ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ظ…ط´ظƒظ„ط© ظˆط­ظ„ظ‡ط§. ظ‚ط¯ ظٹظ‚ط±ط± Eventies ط§ظ„ط­ظ„ ط§ظ„ط¸ط§ظ‡ط± ظ„ظ„ط¹ظ…ظٹظ„طŒ ظˆظ‚ط¯ ظٹظƒظˆظ† ط§ظ„ظ…ط²ظˆط¯ ظ…ط³ط¤ظˆظ„ظ‹ط§ ط¹ظ† ط§ظ„طھظƒط§ظ„ظٹظپ ط§ظ„ظ†ط§طھط¬ط© ط¹ظ† ظ…ط¹ظ„ظˆظ…ط§طھ ط؛ظٹط± ط¯ظ‚ظٹظ‚ط© ط£ظˆ ط¹ط¯ظ… ط§ظ„طھظ†ظپظٹط° ط£ظˆ ط§ظ„طھط£ط®ظٹط± ط£ظˆ ط¹ظٹظˆط¨ ط§ظ„ظ…ظ†طھط¬ط§طھ ط£ظˆ ط§ظ„طھظ†ظپظٹط° ط؛ظٹط± ط§ظ„ط¢ظ…ظ† ط£ظˆ ط¹ط¯ظ… ط§ظ„ط§ظ„طھط²ط§ظ… ط¨ط§ظ„ظ…طھط·ظ„ط¨ط§طھ ط§ظ„ظ…طھظپظ‚ ط¹ظ„ظٹظ‡ط§.',
          ],
        },
        {
          heading: '9. ط­ظ‚ظˆظ‚ ط§ظ„ظ…ط­طھظˆظ‰',
          body: [
            'ط¹ظ†ط¯ طھط²ظˆظٹط¯ Eventies ط¨ط§ظ„طµظˆط± ط£ظˆ ط§ظ„ظپظٹط¯ظٹظˆظ‡ط§طھ ط£ظˆ ط§ظ„ظ†طµظˆطµ ط£ظˆ ط§ظ„ط´ط¹ط§ط±ط§طھ ط£ظˆ ظ…ظˆط§ط¯ ط§ظ„ظ‚ظˆط§ط¦ظ…طŒ ظٹط¤ظƒط¯ ط§ظ„ظ…ط²ظˆط¯ ط£ظ†ظ‡ ظٹظ…ظ„ظƒ ط­ظ‚ ط§ط³طھط®ط¯ط§ظ…ظ‡ط§ ظˆظ…ط´ط§ط±ظƒطھظ‡ط§طŒ ظˆظٹظ…ظ†ط­ Eventies ط§ظ„ط¥ط°ظ† ط¨ط§ط³طھط®ط¯ط§ظ…ظ‡ط§ ظپظٹ ط§ظ„ظ‚ظˆط§ط¦ظ… ظˆط§ظ„طھط³ظˆظٹظ‚ ظˆط§ظ„طھظˆط§طµظ„ ظ…ط¹ ط§ظ„ط¹ظ…ظ„ط§ط، ظˆطھط´ط؛ظٹظ„ ط§ظ„ظ…ظ†طµط©.',
          ],
        },
        {
          heading: '10. ط­ط°ظپ ط­ط³ط§ط¨ ط£ظˆ ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…ط²ظˆط¯',
          body: [
            'ظٹط¬ظˆط² ظ„ظ€ Eventies ط­ط°ظپ ظ‚ط§ط¦ظ…ط© ط£ظˆ ط±ظپط¶ ظ…ط­طھظˆظ‰ ط£ظˆ ط¥ظٹظ‚ط§ظپ ط§ظ„ط¸ظ‡ظˆط± ط£ظˆ طھط¹ظ„ظٹظ‚ ظ…ط´ط§ط±ظƒط© ط§ظ„ظ…ط²ظˆط¯ ط£ظˆ ط¥ظ†ظ‡ط§ط، ظˆطµظˆظ„ظ‡ ط¥ط°ط§ ط§ط¹طھظ‚ط¯ Eventies ط£ظ† ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ظ…ط²ظˆط¯ ط؛ظٹط± ط¯ظ‚ظٹظ‚ط© ط£ظˆ ط£ظ† ط¬ظˆط¯ط© ط§ظ„ط®ط¯ظ…ط© ط؛ظٹط± ظ…ظ‚ط¨ظˆظ„ط© ط£ظˆ ط£ظ† ط§ظ„ظ…ط²ظˆط¯ ط®ط§ظ„ظپ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط· ط£ظˆ ط£ظ† ط§ط³طھظ…ط±ط§ط± ط§ظ„ظ…ط´ط§ط±ظƒط© ظٹط´ظƒظ„ ط®ط·ط±ظ‹ط§ ط¹ظ„ظ‰ Eventies ط£ظˆ ط§ظ„ط¹ظ…ظ„ط§ط، ط£ظˆ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ط§ظ„ط¢ط®ط±ظٹظ†.',
          ],
        },
        {
          heading: '11. ط£ط¯ظˆط§طھ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ط§ظ„ظ…ط³طھظ‚ط¨ظ„ظٹط©',
          body: [
            'ظ‚ط¯ ظٹط·ظ„ظ‚ Eventies ظ„ط§ط­ظ‚ظ‹ط§ ظ„ظˆط­ط§طھ طھط­ظƒظ… ظ„ظ„ظ…ط²ظˆط¯ظٹظ† ط£ظˆ ظ‚ظˆط§ط¦ظ… ط°ط§طھظٹط© ط£ظˆ ط£ط¯ظˆط§طھ ط·ظ„ط¨ط§طھ ط£ظˆ طھط­ظ„ظٹظ„ط§طھ ط£ظˆ ط£ط¯ظˆط§طھ ط¯ظپط¹ ط£ظˆ ظ…ظٹط²ط§طھ ط£ط®ط±ظ‰ ظ„ظ„ظ…ط²ظˆط¯ظٹظ†. ظ‚ط¯ طھظ†ط·ط¨ظ‚ ظ‚ظˆط§ط¹ط¯ ط¥ط¶ط§ظپظٹط© ظ‚ط¨ظ„ طھظپط¹ظٹظ„ ظ‡ط°ظ‡ ط§ظ„ظ…ظٹط²ط§طھ.',
          ],
        },
        {
          heading: '12. طھط­ط¯ظٹط«ط§طھ ط´ط±ظˆط· ط§ظ„ظ…ط²ظˆط¯ظٹظ†',
          body: [
            'ظ‚ط¯ ظٹظ‚ظˆظ… Eventies ط¨طھط­ط¯ظٹط« ط´ط±ظˆط· ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظ…ظ† ظˆظ‚طھ ظ„ط¢ط®ط±. ط³ظٹطھظ… ظ†ط´ط± ط£ط­ط¯ط« ظ†ط³ط®ط© ط¹ظ„ظ‰ ظ‡ط°ظ‡ ط§ظ„طµظپط­ط© ظ…ط¹ طھط§ط±ظٹط® طھط­ط¯ظٹط« ط¬ط¯ظٹط¯.',
          ],
        },
      ],
    },
  },
  refund: {
    en: {
      eyebrow: 'Refund Policy',
      title: 'Refund & Cancellation Policy',
      description:
        'This policy explains cancellation timing, deposits, service issues, and customer responsibility for damage or loss.',
      lastUpdatedLabel: 'Last updated',
      lastUpdated: 'July 1, 2026',
      metaTitle: 'Refund Policy | Eventies',
      metaDescription:
        'Read Eventies Refund and Cancellation Policy for 72-hour cancellations, non-refundable deposits, service issues, and damage responsibility.',
      contactHeading: 'Need help with a booking?',
      contactBody:
        'For cancellation, rescheduling, or refund questions, contact support@eventiesjo.com or booking@eventiesjo.com.',
      sections: [
        {
          heading: '1. Scope of this policy',
          body: [
            'This Refund & Cancellation Policy applies to Eventies requests, bookings, rentals, services, custom arrangements, and event-related work confirmed by Eventies. If Eventies sends a written offer or agreement with different refund or cancellation terms, that written offer or agreement will apply to that request.',
          ],
        },
        {
          heading: '2. Requests before confirmation',
          body: [
            'Submitting a request through the website does not create a confirmed booking. If your request has not been confirmed by Eventies and no payment has been made, there is no refund issue because no confirmed paid booking exists.',
          ],
        },
        {
          heading: '3. Cancellation deadline',
          body: [
            'A customer may request cancellation at least 72 hours before the scheduled event time. Cancellation requests made less than 72 hours before the event may be rejected, and the customer may remain responsible for confirmed charges, vendor costs, logistics costs, preparation costs, or other agreed amounts.',
          ],
        },
        {
          heading: '4. Deposits and advance payments',
          body: [
            'Any deposit, advance payment, booking retainer, or amount paid to reserve services is non-refundable unless Eventies clearly confirms otherwise in writing. This applies even when cancellation is requested at least 72 hours before the event.',
          ],
        },
        {
          heading: '5. Rescheduling',
          body: [
            'Rescheduling is subject to Eventies approval, vendor availability, service availability, logistics, and any extra costs. A reschedule is not guaranteed. Deposits or advance payments may be carried forward only if Eventies confirms this in writing.',
          ],
        },
        {
          heading: '6. If a product or service arrives with a problem',
          body: [
            'If a product or service arrives with a problem that was not caused by the customer, venue, guests, or event participants, Eventies will take responsibility for reviewing and addressing the issue. Depending on the situation, Eventies may provide repair, replacement, an alternative arrangement, service adjustment, partial adjustment, or another reasonable solution.',
          ],
        },
        {
          heading: '7. Customer-caused damage, loss, or misuse',
          body: [
            'The customer is responsible for damage, loss, missing items, misuse, unsafe handling, excessive cleaning, or repairs caused by the customer, guests, venue, staff, or event participants. Eventies may charge the customer for repair, replacement, cleaning, lost items, downtime, or related costs.',
          ],
        },
        {
          heading: '8. Venue access, timing, and customer information',
          body: [
            'Refunds or adjustments may not be available when a service issue is caused by incorrect customer information, late venue access, denied entry, missing permits, unsuitable venue conditions, electricity limitations, safety restrictions, or changes made by the customer or venue.',
          ],
        },
        {
          heading: '9. Weather, force majeure, and outside events',
          body: [
            'For weather, government restrictions, emergencies, force majeure events, or circumstances outside reasonable control, Eventies may review the situation case by case and may offer rescheduling, credit, partial adjustment, or another solution at its discretion.',
          ],
        },
        {
          heading: '10. How to request cancellation or support',
          body: [
            'To request cancellation, rescheduling, or support, contact Eventies as soon as possible and include your name, request number if available, event date, phone number, and reason for the request.',
          ],
        },
      ],
    },
    ar: {
      eyebrow: 'ط³ظٹط§ط³ط© ط§ظ„ط§ط³طھط±ط¯ط§ط¯',
      title: 'ط³ظٹط§ط³ط© ط§ظ„ط§ط³طھط±ط¯ط§ط¯ ظˆط§ظ„ط¥ظ„ط؛ط§ط،',
      description:
        'طھظˆط¶ط­ ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط© ظ…ظˆط§ط¹ظٹط¯ ط§ظ„ط¥ظ„ط؛ط§ط، ظˆط§ظ„ط¹ط±ط¨ظˆظ† ظˆظ…ط´ط§ظƒظ„ ط§ظ„ط®ط¯ظ…ط© ظˆظ…ط³ط¤ظˆظ„ظٹط© ط§ظ„ط¹ظ…ظٹظ„ ط¹ظ† ط§ظ„طھظ„ظپ ط£ظˆ ط§ظ„ظپظ‚ط¯ط§ظ†.',
      lastUpdatedLabel: 'ط¢ط®ط± طھط­ط¯ظٹط«',
      lastUpdated: '1 ظٹظˆظ„ظٹظˆ 2026',
      metaTitle: 'ط³ظٹط§ط³ط© ط§ظ„ط§ط³طھط±ط¯ط§ط¯ | Eventies',
      metaDescription:
        'ط±ط§ط¬ط¹ ط³ظٹط§ط³ط© ط§ظ„ط§ط³طھط±ط¯ط§ط¯ ظˆط§ظ„ط¥ظ„ط؛ط§ط، ظ…ظ† Eventies ظ„ظ„ط¥ظ„ط؛ط§ط، ظ‚ط¨ظ„ 72 ط³ط§ط¹ط© ظˆط§ظ„ط¹ط±ط¨ظˆظ† ط؛ظٹط± ط§ظ„ظ…ط³طھط±ط¯ ظˆظ…ط´ط§ظƒظ„ ط§ظ„ط®ط¯ظ…ط© ظˆظ…ط³ط¤ظˆظ„ظٹط© ط§ظ„طھظ„ظپ.',
      contactHeading: 'طھط­طھط§ط¬ ظ…ط³ط§ط¹ط¯ط© ط¨ط®طµظˆطµ ط­ط¬ط²طں',
      contactBody:
        'ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط¥ظ„ط؛ط§ط، ط£ظˆ طھط؛ظٹظٹط± ط§ظ„ظ…ظˆط¹ط¯ ط£ظˆ ط§ظ„ط§ط³طھط±ط¯ط§ط¯طŒ طھظˆط§طµظ„ ط¹ظ„ظ‰ support@eventiesjo.com ط£ظˆ booking@eventiesjo.com.',
      sections: [
        {
          heading: '1. ظ†ط·ط§ظ‚ ظ‡ط°ظ‡ ط§ظ„ط³ظٹط§ط³ط©',
          body: [
            'طھظ†ط·ط¨ظ‚ ط³ظٹط§ط³ط© ط§ظ„ط§ط³طھط±ط¯ط§ط¯ ظˆط§ظ„ط¥ظ„ط؛ط§ط، ظ‡ط°ظ‡ ط¹ظ„ظ‰ ط·ظ„ط¨ط§طھ Eventies ظˆط§ظ„ط­ط¬ظˆط²ط§طھ ظˆط§ظ„طھط£ط¬ظٹط±ط§طھ ظˆط§ظ„ط®ط¯ظ…ط§طھ ظˆط§ظ„طھط±طھظٹط¨ط§طھ ط§ظ„ظ…ط®طµطµط© ظˆط§ظ„ط£ط¹ظ…ط§ظ„ ط§ظ„ظ…ط±طھط¨ط·ط© ط¨ط§ظ„ظپط¹ط§ظ„ظٹط§طھ ط§ظ„طھظٹ ظٹط¤ظƒط¯ظ‡ط§ Eventies. ط¥ط°ط§ ط£ط±ط³ظ„ Eventies ط¹ط±ط¶ظ‹ط§ ط£ظˆ ط§طھظپط§ظ‚ظ‹ط§ ظ…ظƒطھظˆط¨ظ‹ط§ ظٹط­طھظˆظٹ ط¹ظ„ظ‰ ط´ط±ظˆط· ط§ط³طھط±ط¯ط§ط¯ ط£ظˆ ط¥ظ„ط؛ط§ط، ظ…ط®طھظ„ظپط©طŒ ظپطھط·ط¨ظ‚ طھظ„ظƒ ط§ظ„ط´ط±ظˆط· ط¹ظ„ظ‰ ط°ظ„ظƒ ط§ظ„ط·ظ„ط¨.',
          ],
        },
        {
          heading: '2. ط§ظ„ط·ظ„ط¨ط§طھ ظ‚ط¨ظ„ ط§ظ„طھط£ظƒظٹط¯',
          body: [
            'ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„ظ…ظˆظ‚ط¹ ظ„ط§ ظٹظ†ط´ط¦ ط­ط¬ط²ظ‹ط§ ظ…ط¤ظƒط¯ظ‹ط§. ط¥ط°ط§ ظ„ظ… ظٹطھظ… طھط£ظƒظٹط¯ ط·ظ„ط¨ظƒ ظ…ظ† Eventies ظˆظ„ظ… ظٹطھظ… ط¯ظپط¹ ط£ظٹ ظ…ط¨ظ„ط؛طŒ ظپظ„ط§ طھظˆط¬ط¯ ظ…ط³ط£ظ„ط© ط§ط³طھط±ط¯ط§ط¯ ظ„ط£ظ†ظ‡ ظ„ط§ ظٹظˆط¬ط¯ ط­ط¬ط² ظ…ط¯ظپظˆط¹ ظ…ط¤ظƒط¯.',
          ],
        },
        {
          heading: '3. ظ…ظˆط¹ط¯ ط§ظ„ط¥ظ„ط؛ط§ط،',
          body: [
            'ظٹظ…ظƒظ† ظ„ظ„ط¹ظ…ظٹظ„ ط·ظ„ط¨ ط§ظ„ط¥ظ„ط؛ط§ط، ظ‚ط¨ظ„ ظ…ظˆط¹ط¯ ط§ظ„ظپط¹ط§ظ„ظٹط© ط§ظ„ظ…ط¬ط¯ظˆظ„ ط¨ظ€ 72 ط³ط§ط¹ط© ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„. ظ‚ط¯ ظٹطھظ… ط±ظپط¶ ط·ظ„ط¨ط§طھ ط§ظ„ط¥ظ„ط؛ط§ط، ط§ظ„ظ…ظ‚ط¯ظ…ط© ظ‚ط¨ظ„ ط£ظ‚ظ„ ظ…ظ† 72 ط³ط§ط¹ط© ظ…ظ† ط§ظ„ظپط¹ط§ظ„ظٹط©طŒ ظˆظ‚ط¯ ظٹط¨ظ‚ظ‰ ط§ظ„ط¹ظ…ظٹظ„ ظ…ط³ط¤ظˆظ„ظ‹ط§ ط¹ظ† ط§ظ„ط±ط³ظˆظ… ط§ظ„ظ…ط¤ظƒط¯ط© ط£ظˆ طھظƒط§ظ„ظٹظپ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ط£ظˆ ط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ ط£ظˆ ط§ظ„طھط­ط¶ظٹط± ط£ظˆ ط£ظٹ ظ…ط¨ط§ظ„ط؛ ظ…طھظپظ‚ ط¹ظ„ظٹظ‡ط§.',
          ],
        },
        {
          heading: '4. ط§ظ„ط¹ط±ط¨ظˆظ† ظˆط§ظ„ط¯ظپط¹ط§طھ ط§ظ„ظ…ظ‚ط¯ظ…ط©',
          body: [
            'ط£ظٹ ط¹ط±ط¨ظˆظ† ط£ظˆ ط¯ظپط¹ط© ظ…ظ‚ط¯ظ…ط© ط£ظˆ ظ…ط¨ظ„ط؛ ط­ط¬ط² ط£ظˆ ظ…ط¨ظ„ط؛ ظ…ط¯ظپظˆط¹ ظ„طھط«ط¨ظٹطھ ط§ظ„ط®ط¯ظ…ط§طھ ظٹظƒظˆظ† ط؛ظٹط± ظ…ط³طھط±ط¯ ظ…ط§ ظ„ظ… ظٹط¤ظƒط¯ Eventies ط®ظ„ط§ظپ ط°ظ„ظƒ ط¨ظˆط¶ظˆط­ ظˆظƒطھط§ط¨ط©. ظٹظ†ط·ط¨ظ‚ ط°ظ„ظƒ ط­طھظ‰ ط¥ط°ط§ طھظ… ط·ظ„ط¨ ط§ظ„ط¥ظ„ط؛ط§ط، ظ‚ط¨ظ„ ظ…ظˆط¹ط¯ ط§ظ„ظپط¹ط§ظ„ظٹط© ط¨ظ€ 72 ط³ط§ط¹ط© ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„.',
          ],
        },
        {
          heading: '5. طھط؛ظٹظٹط± ط§ظ„ظ…ظˆط¹ط¯',
          body: [
            'طھط؛ظٹظٹط± ط§ظ„ظ…ظˆط¹ط¯ ظٹط®ط¶ط¹ ظ„ظ…ظˆط§ظپظ‚ط© Eventies ظˆطھظˆظپط± ط§ظ„ظ…ط²ظˆط¯ ظˆط§ظ„ط®ط¯ظ…ط© ظˆط§ظ„ظ„ظˆط¬ط³طھظٹط§طھ ظˆط£ظٹ طھظƒط§ظ„ظٹظپ ط¥ط¶ط§ظپظٹط©. ظ„ط§ ظٹطھظ… ط¶ظ…ط§ظ† طھط؛ظٹظٹط± ط§ظ„ظ…ظˆط¹ط¯. ظ‚ط¯ ظٹطھظ… طھط±ط­ظٹظ„ ط§ظ„ط¹ط±ط¨ظˆظ† ط£ظˆ ط§ظ„ط¯ظپط¹ط© ط§ظ„ظ…ظ‚ط¯ظ…ط© ظپظ‚ط· ط¥ط°ط§ ط£ظƒط¯ Eventies ط°ظ„ظƒ ظƒطھط§ط¨ط©.',
          ],
        },
        {
          heading: '6. ط¥ط°ط§ ظˆطµظ„ ط§ظ„ظ…ظ†طھط¬ ط£ظˆ ط§ظ„ط®ط¯ظ…ط© ظˆظپظٹظ‡ط§ ظ…ط´ظƒظ„ط©',
          body: [
            'ط¥ط°ط§ ظˆطµظ„ ظ…ظ†طھط¬ ط£ظˆ ط®ط¯ظ…ط© ظˆظپظٹظ‡ط§ ظ…ط´ظƒظ„ط© ظ„ظ… ظٹطھط³ط¨ط¨ ط¨ظ‡ط§ ط§ظ„ط¹ظ…ظٹظ„ ط£ظˆ ط§ظ„ظ…ظƒط§ظ† ط£ظˆ ط§ظ„ط¶ظٹظˆظپ ط£ظˆ ط§ظ„ظ…ط´ط§ط±ظƒظˆظ† ظپظٹ ط§ظ„ظپط¹ط§ظ„ظٹط©طŒ ظٹطھط­ظ…ظ„ Eventies ظ…ط³ط¤ظˆظ„ظٹط© ظ…ط±ط§ط¬ط¹ط© ط§ظ„ظ…ط´ظƒظ„ط© ظˆظ…ط¹ط§ظ„ط¬طھظ‡ط§. ط­ط³ط¨ ط§ظ„ط­ط§ظ„ط©طŒ ظ‚ط¯ ظٹظˆظپط± Eventies ط¥طµظ„ط§ط­ظ‹ط§ ط£ظˆ ط§ط³طھط¨ط¯ط§ظ„ظ‹ط§ ط£ظˆ طھط±طھظٹط¨ظ‹ط§ ط¨ط¯ظٹظ„ظ‹ط§ ط£ظˆ طھط¹ط¯ظٹظ„ظ‹ط§ ظ„ظ„ط®ط¯ظ…ط© ط£ظˆ طھط¹ط¯ظٹظ„ظ‹ط§ ط¬ط²ط¦ظٹظ‹ط§ ط£ظˆ ط­ظ„ظ‹ط§ ظ…ط¹ظ‚ظˆظ„ظ‹ط§ ط¢ط®ط±.',
          ],
        },
        {
          heading:
            '7. ط§ظ„طھظ„ظپ ط£ظˆ ط§ظ„ظپظ‚ط¯ط§ظ† ط£ظˆ ط³ظˆط، ط§ظ„ط§ط³طھط®ط¯ط§ظ… ط¨ط³ط¨ط¨ ط§ظ„ط¹ظ…ظٹظ„',
          body: [
            'ظٹظƒظˆظ† ط§ظ„ط¹ظ…ظٹظ„ ظ…ط³ط¤ظˆظ„ظ‹ط§ ط¹ظ† ط£ظٹ طھظ„ظپ ط£ظˆ ظپظ‚ط¯ط§ظ† ط£ظˆ ظ†ظ‚طµ ظپظٹ ط§ظ„ط¹ظ†ط§طµط± ط£ظˆ ط³ظˆط، ط§ط³طھط®ط¯ط§ظ… ط£ظˆ طھط¹ط§ظ…ظ„ ط؛ظٹط± ط¢ظ…ظ† ط£ظˆ طھظ†ط¸ظٹظپ ط²ط§ط¦ط¯ ط£ظˆ ط¥طµظ„ط§ط­ط§طھ ظٹطھط³ط¨ط¨ ط¨ظ‡ط§ ط§ظ„ط¹ظ…ظٹظ„ ط£ظˆ ط§ظ„ط¶ظٹظˆظپ ط£ظˆ ط§ظ„ظ…ظƒط§ظ† ط£ظˆ ط§ظ„ط·ط§ظ‚ظ… ط£ظˆ ط§ظ„ظ…ط´ط§ط±ظƒظˆظ† ظپظٹ ط§ظ„ظپط¹ط§ظ„ظٹط©. ظ‚ط¯ ظٹظپط±ط¶ Eventies ط¹ظ„ظ‰ ط§ظ„ط¹ظ…ظٹظ„ طھظƒظ„ظپط© ط§ظ„ط¥طµظ„ط§ط­ ط£ظˆ ط§ظ„ط§ط³طھط¨ط¯ط§ظ„ ط£ظˆ ط§ظ„طھظ†ط¸ظٹظپ ط£ظˆ ط§ظ„ط¹ظ†ط§طµط± ط§ظ„ظ…ظپظ‚ظˆط¯ط© ط£ظˆ ط§ظ„طھظˆظ‚ظپ ط£ظˆ ط§ظ„طھظƒط§ظ„ظٹظپ ط§ظ„ظ…ط±طھط¨ط·ط©.',
          ],
        },
        {
          heading: '8. ط§ظ„ظˆطµظˆظ„ ظ„ظ„ظ…ظƒط§ظ† ظˆط§ظ„طھظˆظ‚ظٹطھ ظˆظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط¹ظ…ظٹظ„',
          body: [
            'ظ‚ط¯ ظ„ط§ طھطھظˆظپط± ط§ظ„ط§ط³طھط±ط¯ط§ط¯ط§طھ ط£ظˆ ط§ظ„طھط¹ط¯ظٹظ„ط§طھ ط¹ظ†ط¯ظ…ط§ طھظƒظˆظ† ظ…ط´ظƒظ„ط© ط§ظ„ط®ط¯ظ…ط© ظ†ط§طھط¬ط© ط¹ظ† ظ…ط¹ظ„ظˆظ…ط§طھ ط؛ظٹط± طµط­ظٹط­ط© ظ…ظ† ط§ظ„ط¹ظ…ظٹظ„ ط£ظˆ طھط£ط®ط± ط§ظ„ظˆطµظˆظ„ ظ„ظ„ظ…ظƒط§ظ† ط£ظˆ ظ…ظ†ط¹ ط§ظ„ط¯ط®ظˆظ„ ط£ظˆ ط؛ظٹط§ط¨ ط§ظ„طھطµط§ط±ظٹط­ ط£ظˆ ط¹ط¯ظ… ظ…ظ„ط§ط،ظ…ط© ط¸ط±ظˆظپ ط§ظ„ظ…ظƒط§ظ† ط£ظˆ ظ‚ظٹظˆط¯ ط§ظ„ظƒظ‡ط±ط¨ط§ط، ط£ظˆ ظ‚ظٹظˆط¯ ط§ظ„ط³ظ„ط§ظ…ط© ط£ظˆ طھط؛ظٹظٹط±ط§طھ ظ‚ط§ظ… ط¨ظ‡ط§ ط§ظ„ط¹ظ…ظٹظ„ ط£ظˆ ط§ظ„ظ…ظƒط§ظ†.',
          ],
        },
        {
          heading: '9. ط§ظ„ط·ظ‚ط³ ظˆط§ظ„ط¸ط±ظˆظپ ط§ظ„ظ‚ط§ظ‡ط±ط© ظˆط§ظ„ط£ط­ط¯ط§ط« ط§ظ„ط®ط§ط±ط¬ظٹط©',
          body: [
            'ط¨ط§ظ„ظ†ط³ط¨ط© ظ„ظ„ط·ظ‚ط³ ط£ظˆ ط§ظ„ظ‚ظٹظˆط¯ ط§ظ„ط­ظƒظˆظ…ظٹط© ط£ظˆ ط§ظ„ط·ظˆط§ط±ط¦ ط£ظˆ ط§ظ„ط¸ط±ظˆظپ ط§ظ„ظ‚ط§ظ‡ط±ط© ط£ظˆ ط§ظ„ط¸ط±ظˆظپ ط§ظ„ط®ط§ط±ط¬ط© ط¹ظ† ط§ظ„ط³ظٹط·ط±ط© ط§ظ„ظ…ط¹ظ‚ظˆظ„ط©طŒ ظ‚ط¯ ظٹط±ط§ط¬ط¹ Eventies ط§ظ„ط­ط§ظ„ط© ط¨ط´ظƒظ„ ظ…ظ†ظپطµظ„ ظˆظ‚ط¯ ظٹط¹ط±ط¶ طھط؛ظٹظٹط± ط§ظ„ظ…ظˆط¹ط¯ ط£ظˆ ط±طµظٹط¯ظ‹ط§ ط£ظˆ طھط¹ط¯ظٹظ„ظ‹ط§ ط¬ط²ط¦ظٹظ‹ط§ ط£ظˆ ط­ظ„ظ‹ط§ ط¢ط®ط± ظˆظپظ‚ طھظ‚ط¯ظٹط±ظ‡.',
          ],
        },
        {
          heading: '10. ظƒظٹظپظٹط© ط·ظ„ط¨ ط§ظ„ط¥ظ„ط؛ط§ط، ط£ظˆ ط§ظ„ط¯ط¹ظ…',
          body: [
            'ظ„ط·ظ„ط¨ ط§ظ„ط¥ظ„ط؛ط§ط، ط£ظˆ طھط؛ظٹظٹط± ط§ظ„ظ…ظˆط¹ط¯ ط£ظˆ ط§ظ„ط¯ط¹ظ…طŒ طھظˆط§طµظ„ ظ…ط¹ Eventies ط¨ط£ط³ط±ط¹ ظˆظ‚طھ ظ…ظ…ظƒظ† ظˆط§ط°ظƒط± ط§ط³ظ…ظƒ ظˆط±ظ‚ظ… ط§ظ„ط·ظ„ط¨ ط¥ط°ط§ طھظˆظپط± ظˆطھط§ط±ظٹط® ط§ظ„ظپط¹ط§ظ„ظٹط© ظˆط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظˆط³ط¨ط¨ ط§ظ„ط·ظ„ط¨.',
          ],
        },
      ],
    },
  },
}
