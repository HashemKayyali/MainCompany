import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Mail, Scale, ShieldCheck } from 'lucide-react'
import { useI18n } from '../contexts/LanguageContext'
import { usePageMeta } from '../hooks/usePageMeta'

type LegalDocumentKey = 'privacy' | 'terms' | 'vendorTerms' | 'refund' | 'cookies'
type LegalLocale = 'en' | 'ar'

type LegalSection = {
  heading: string
  body?: string[]
  bullets?: string[]
}

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
      note:
        'Eventies currently operates under the Eventies name. Formal company registration details may be updated here once available.',
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
      eyebrow: 'سياسة الخصوصية',
      title: 'سياسة الخصوصية',
      description:
        'توضح هذه السياسة كيف يجمع Eventies البيانات الشخصية ويستخدمها ويشاركها ويحميها عند استخدام الموقع أو إنشاء حساب أو إرسال طلب فعالية.',
      lastUpdatedLabel: 'آخر تحديث',
      lastUpdated: '1 يوليو 2026',
      note:
        'يعمل Eventies حاليًا تحت اسم Eventies. قد يتم تحديث بيانات التسجيل الرسمي للشركة في هذه الصفحة عند توفرها.',
      metaTitle: 'سياسة الخصوصية | Eventies',
      metaDescription:
        'تعرف على كيفية جمع Eventies للبيانات الشخصية واستخدامها وحمايتها للحسابات وطلبات الفعاليات والدعم والتنسيق مع المزودين.',
      contactHeading: 'التواصل معنا',
      contactBody:
        'لأي أسئلة متعلقة بالخصوصية أو طلبات الوصول أو التصحيح أو الحذف، تواصل معنا على support@eventiesjo.com.',
      sections: [
        {
          heading: '1. من نحن',
          body: [
            'Eventies منصة لخدمات الفعاليات تساعد العملاء على اكتشاف خدمات التأجير والألعاب والتجارب التفاعلية والتنفيذات المخصصة والخدمات المرتبطة بالفعاليات. يرسل العميل طلبه إلى Eventies، ويقوم فريق Eventies بتنسيق التوفر والتسعير واللوجستيات والخطوات التالية مع المزودين المسجلين ومقدمي الخدمات.',
            'تتوفر خدماتنا بشكل أساسي في الأردن، وقد تتوفر في مواقع أخرى حسب التوفر وتغطية المزودين واللوجستيات والتأكيد من Eventies.',
          ],
        },
        {
          heading: '2. المعلومات التي نجمعها',
          body: ['حسب طريقة استخدامك لـ Eventies، قد نجمع المعلومات التالية:'],
          bullets: [
            'الاسم وبيانات التواصل، بما في ذلك البريد الإلكتروني ورقم الهاتف.',
            'بيانات الحساب ومعلومات الملف الشخصي وصورة الحساب إذا أضفتها.',
            'المدينة أو العنوان أو موقع الفعالية أو تفاصيل المكان أو ملاحظات التوصيل والتركيب.',
            'تفاصيل الطلب مثل تاريخ الفعالية والخدمات المطلوبة والكميات والملاحظات وحالة الطلب وسجل الطلبات.',
            'محتوى مرتبط بالمزودين، مثل صور المنتجات أو الخدمات والأوصاف والفئات والتوفر وتفاصيل القوائم عندما يقدمها المزودون إلى Eventies.',
            'معلومات تقنية لازمة لتشغيل الموقع وحمايته، مثل بيانات الجلسة ومعلومات المتصفح أو الجهاز والسجلات الأساسية.',
          ],
        },
        {
          heading: '3. معلومات الدفع',
          body: [
            'لا يعالج Eventies حاليًا المدفوعات الإلكترونية من خلال الموقع. يستخدم الموقع لإرسال الطلبات والاستفسارات وطلبات عروض الأسعار وتفاصيل الحجز للمراجعة. إذا تم ترتيب عربون أو دفعة خارج الموقع، فسيتم توضيح طريقة الدفع والشروط المرتبطة بها بشكل منفصل من قبل Eventies.',
          ],
        },
        {
          heading: '4. كيف نستخدم المعلومات',
          bullets: [
            'إنشاء الحسابات وإدارتها وحمايتها.',
            'استلام ومراجعة وتنظيم ومتابعة طلبات التأجير وطلبات عروض سعر الشراء والتنفيذ المخصص ورسائل الدعم.',
            'التنسيق مع المزودين ومقدمي الخدمات المسجلين للتحقق من التوفر والتسعير والتوصيل والتركيب واللوجستيات.',
            'التواصل معك بخصوص طلبك أو حسابك أو مشكلة الدعم أو التحديثات المهمة المتعلقة بالخدمة.',
            'تحسين تجربة الموقع وإصلاح الأخطاء ومنع سوء الاستخدام وحماية Eventies والمستخدمين والمزودين.',
            'تلبية المتطلبات القانونية والمحاسبية والتجارية ومتطلبات حل النزاعات عند الحاجة.',
          ],
        },
        {
          heading: '5. كيف نشارك المعلومات',
          body: [
            'نحن لا نبيع بياناتك الشخصية. قد نشارك المعلومات فقط عند الحاجة لتشغيل Eventies أو تقديم الخدمات أو الالتزام بالمتطلبات اللازمة.',
          ],
          bullets: [
            'مع المزودين أو مقدمي الخدمات عند الحاجة لمراجعة التوفر أو التسعير أو التنفيذ أو التوصيل أو التركيب أو متطلبات الطلب.',
            'مع مزودي التقنية الذين يساعدوننا في استضافة الموقع أو حمايته أو تخزينه أو تشغيله والأنظمة المرتبطة به.',
            'مع المستشارين المهنيين أو الجهات القانونية أو الجهات الحكومية إذا تطلب القانون ذلك أو لحماية الحقوق أو السلامة أو الممتلكات.',
          ],
        },
        {
          heading: '6. مدة الاحتفاظ بالبيانات',
          body: [
            'نحتفظ بالبيانات الشخصية للمدة اللازمة بشكل معقول للأغراض المذكورة في هذه السياسة، بما في ذلك إدارة الحسابات وسجل الطلبات ودعم العملاء والالتزام القانوني والسجلات التجارية ومعالجة النزاعات والأمان.',
          ],
        },
        {
          heading: '7. الأمان',
          body: [
            'نستخدم إجراءات تقنية وتنظيمية معقولة لحماية البيانات الشخصية. لا يمكن ضمان أمان أي موقع أو نظام إلكتروني بشكل كامل، لذلك يجب على المستخدم أيضًا حماية بيانات تسجيل الدخول وإبلاغنا عن أي نشاط مريب.',
          ],
        },
        {
          heading: '8. اختياراتك وحقوقك',
          body: ['يمكنك التواصل مع Eventies لطلب ما يلي:'],
          bullets: [
            'تزويدك بمعلومات عن البيانات الشخصية التي نحتفظ بها عنك.',
            'تصحيح المعلومات غير الدقيقة أو غير المكتملة.',
            'حذف حسابك أو بعض بياناتك الشخصية عندما يكون ذلك ممكنًا قانونيًا وتشغيليًا.',
            'إيقاف استخدام معلوماتك لبعض الأغراض الاختيارية عند انطباق ذلك.',
          ],
        },
        {
          heading: '9. شرط العمر',
          body: [
            'Eventies مخصص للمستخدمين الذين تبلغ أعمارهم 18 سنة أو أكثر. باستخدامك للموقع أو إرسال طلب، فإنك تؤكد أن عمرك 18 سنة أو أكثر.',
          ],
        },
        {
          heading: '10. الاستخدام الدولي ومواقع الخدمة',
          body: [
            'بما أن Eventies قد يراجع طلبات داخل الأردن وخارجه، وبما أن أنظمة الموقع قد تستخدم مزودي خدمات سحابية أو تقنية، فقد تتم معالجة معلوماتك أو تخزينها في مواقع غير بلد إقامتك عندما تسمح المتطلبات المعمول بها بذلك.',
          ],
        },
        {
          heading: '11. تحديثات هذه السياسة',
          body: [
            'قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر أحدث نسخة على هذه الصفحة مع تاريخ تحديث جديد.',
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
          body: ['Eventies currently uses necessary cookies or similar storage for core website functions, including:'],
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
      eyebrow: 'سياسة ملفات الارتباط',
      title: 'سياسة ملفات الارتباط',
      description:
        'توضح هذه السياسة كيف يستخدم Eventies ملفات الارتباط والتخزين المشابه في المتصفح لتشغيل الموقع وحفظ التفضيلات ودعم الحسابات والطلبات.',
      lastUpdatedLabel: 'آخر تحديث',
      lastUpdated: '1 يوليو 2026',
      metaTitle: 'سياسة ملفات الارتباط | Eventies',
      metaDescription:
        'تعرف على كيفية استخدام Eventies لملفات الارتباط الضرورية وتخزين المتصفح للغة والجلسات ومسودات الطلبات ووظائف الموقع.',
      contactHeading: 'التواصل معنا',
      contactBody: 'لأي أسئلة بخصوص ملفات الارتباط أو الخصوصية، تواصل معنا على support@eventiesjo.com.',
      sections: [
        {
          heading: '1. ما هي ملفات الارتباط',
          body: [
            'ملفات الارتباط هي ملفات صغيرة يخزنها المتصفح. وقد تستخدم تقنيات مشابهة مثل التخزين المحلي وتخزين الجلسة لحفظ معلومات أساسية على جهازك حتى يعمل الموقع بشكل صحيح.',
          ],
        },
        {
          heading: '2. ملفات الارتباط والتخزين المستخدم حاليًا',
          body: ['يستخدم Eventies حاليًا ملفات ارتباط أو تخزين مشابه ضروري لوظائف الموقع الأساسية، ومنها:'],
          bullets: [
            'إبقاؤك مسجل الدخول والحفاظ على جلسات آمنة عند استخدام ميزات الحساب.',
            'تذكر اللغة التي اخترتها، مثل العربية أو الإنجليزية.',
            'حفظ مسودات الطلب أو اختيارات السلة أو بعض بيانات النماذج مؤقتًا على جهازك إلى أن تقوم بإرسالها أو حذفها.',
            'دعم أمان الموقع وموثوقيته والأداء الأساسي.',
          ],
        },
        {
          heading: '3. ملفات التحليلات والإعلانات',
          body: [
            'لا يستخدم Eventies حاليًا Google Analytics أو Meta Pixel أو TikTok Pixel أو Hotjar أو تتبع Google Ads أو أدوات تتبع تسويقية مشابهة على الموقع.',
            'إذا أضفنا ملفات تحليلات أو إعلانات في المستقبل، فقد نحدث هذه السياسة، وعند الحاجة سنطلب موافقتك قبل تفعيل ملفات الارتباط غير الضرورية.',
          ],
        },
        {
          heading: '4. ملفات الارتباط الضرورية',
          body: [
            'تساعد ملفات الارتباط الضرورية والتخزين المشابه على تشغيل الموقع. إذا قمت بحظرها، فقد لا تعمل بعض الميزات بشكل صحيح مثل تسجيل الدخول أو تفضيل اللغة أو المسودات المحفوظة أو نماذج الطلب أو صفحات الحساب.',
          ],
        },
        {
          heading: '5. إدارة ملفات الارتباط',
          body: [
            'يمكنك التحكم بملفات الارتباط من إعدادات المتصفح. أغلب المتصفحات تسمح بحذف ملفات الارتباط أو حظرها أو إظهار تنبيه قبل تخزينها. حظر الملفات الضرورية قد يؤثر على وظائف الموقع.',
          ],
        },
        {
          heading: '6. تحديثات هذه السياسة',
          body: [
            'قد نقوم بتحديث سياسة ملفات الارتباط إذا تغيرت ميزات الموقع أو أدوات التحليل أو طريقة استخدام ملفات الارتباط.',
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
      note:
        'Eventies is currently operated under the Eventies name. Formal company registration details may be added once available.',
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
      eyebrow: 'شروط الخدمة',
      title: 'شروط الخدمة',
      description:
        'توضح هذه الشروط قواعد استخدام Eventies وإرسال الطلبات وإنشاء الحسابات والتعامل مع Eventies لخدمات الفعاليات.',
      lastUpdatedLabel: 'آخر تحديث',
      lastUpdated: '1 يوليو 2026',
      note:
        'يعمل Eventies حاليًا تحت اسم Eventies. قد تتم إضافة بيانات التسجيل الرسمي للشركة عند توفرها.',
      metaTitle: 'شروط الخدمة | Eventies',
      metaDescription:
        'راجع شروط خدمة Eventies للحسابات وطلبات الفعاليات والتأكيد والتنسيق مع المزودين والإلغاء ومسؤوليات العميل.',
      contactHeading: 'التواصل معنا',
      contactBody: 'لأي أسئلة حول هذه الشروط، تواصل معنا على support@eventiesjo.com.',
      sections: [
        {
          heading: '1. قبول هذه الشروط',
          body: [
            'باستخدام موقع Eventies أو إنشاء حساب أو إرسال طلب أو التواصل مع Eventies بخصوص خدمة، فإنك توافق على شروط الخدمة هذه والسياسات المرتبطة بها والمنشورة على الموقع.',
          ],
        },
        {
          heading: '2. ماذا يقدم Eventies',
          body: [
            'يساعد Eventies العملاء على طلب خدمات تأجير الفعاليات والألعاب والتجارب التفاعلية والمعدات والتنفيذات المخصصة والخدمات المرتبطة بالفعاليات. يرسل العميل الطلب إلى Eventies، ويقوم Eventies بالتنسيق مع المزودين ومقدمي الخدمات المسجلين لمراجعة التوفر والتسعير واللوجستيات ومتطلبات التركيب والخطوات التالية.',
            'تكون العلاقة الظاهرة للعميل مع Eventies. وقد يستخدم Eventies مزودين ومقدمي خدمات للمساعدة في تنفيذ أو توريد أجزاء من الخدمة.',
          ],
        },
        {
          heading: '3. مواقع الخدمة',
          body: [
            'تتوفر خدمات Eventies بشكل أساسي في الأردن، وقد تتوفر في مواقع أخرى حسب التوفر وتغطية المزودين واللوجستيات والتأكيد من Eventies. إرسال طلب لموقع معين لا يعني ضمان توفر الخدمة في ذلك الموقع.',
          ],
        },
        {
          heading: '4. الأهلية',
          body: [
            'يجب أن يكون عمرك 18 سنة أو أكثر لاستخدام Eventies أو إنشاء حساب أو إرسال طلب أو الدخول في أي ترتيب حجز أو دفع مع Eventies.',
          ],
        },
        {
          heading: '5. الحسابات',
          bullets: [
            'يجب تقديم معلومات حساب وتواصل دقيقة ومحدثة.',
            'أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول.',
            'قد يقوم Eventies بتعليق أو تقييد الحسابات إذا اعتقدنا أنها تستخدم بشكل خاطئ أو تحتوي على معلومات غير دقيقة أو تسبب خطرًا على Eventies أو المستخدمين أو المزودين أو الموقع.',
          ],
        },
        {
          heading: '6. الطلبات ليست حجوزات مؤكدة',
          body: [
            'إرسال طلب تأجير أو طلب عرض سعر شراء أو استفسار تنفيذ مخصص أو نموذج تواصل لا يعني وجود حجز مؤكد. يصبح الطلب مؤكدًا فقط بعد أن يراجع Eventies التفاصيل ويتحقق من التوفر واللوجستيات ويؤكد السعر والنطاق ويبلغك بالتأكيد.',
          ],
        },
        {
          heading: '7. الأسعار والتوفر ونطاق الخدمة',
          body: [
            'قد تعتمد الأسعار والتوفر والتوصيل والتركيب والطاقم والكميات وتفاصيل المنتجات ونطاق الخدمة على التاريخ والموقع وحجم الفعالية وتفاصيل الطلب وتوفر المزودين واللوجستيات. أي سعر أو قائمة تظهر على الموقع تكون قابلة للمراجعة والتأكيد ما لم يوضح Eventies خلاف ذلك كتابة.',
          ],
        },
        {
          heading: '8. الدفع والعربون',
          body: [
            'لا يعالج Eventies حاليًا المدفوعات الإلكترونية من خلال الموقع. قد يتم إرسال تعليمات الدفع أو العربون أو الدفعات المقدمة بعد مراجعة الطلب وتأكيده. أي عربون أو دفعة مقدمة غير مستردة ما لم يوضح Eventies خلاف ذلك كتابة.',
          ],
        },
        {
          heading: '9. مسؤوليات العميل',
          bullets: [
            'تقديم معلومات دقيقة عن تاريخ الفعالية والموقع والوصول للمكان وبيانات التواصل والكمية ومتطلبات التركيب.',
            'التأكد من أن مكان الفعالية يسمح بالخدمات والمعدات والتوصيل والكهرباء والتركيب ونوع النشاط المطلوب.',
            'توفير وصول آمن ووقت تركيب مناسب وأي تصاريح أو موافقات لازمة للفعالية.',
            'استخدام المنتجات والمعدات والألعاب والخدمات بشكل مسؤول واتباع التعليمات المقدمة من Eventies أو فريق الخدمة.',
            'دفع تكلفة أي تلف أو فقدان أو نقص في العناصر أو سوء استخدام أو تنظيف زائد أو إصلاحات تسبب بها العميل أو ضيوفه أو المكان أو المشاركون في الفعالية.',
          ],
        },
        {
          heading: '10. التغييرات والإلغاء والاسترداد',
          body: [
            'توضح سياسة الاسترداد قواعد الإلغاء والاسترداد. بشكل عام، يجب طلب الإلغاء قبل موعد الفعالية بـ 72 ساعة على الأقل، وتكون العربونات أو الدفعات المقدمة غير مستردة ما لم يؤكد Eventies خلاف ذلك كتابة.',
          ],
        },
        {
          heading: '11. مشاكل الخدمة',
          body: [
            'إذا وصل منتج أو خدمة وفيها مشكلة، سيقوم Eventies بمراجعة الحالة والعمل على توفير حل مناسب، وقد يشمل ذلك الإصلاح أو الاستبدال أو ترتيب بديل أو تعديل الخدمة أو أي استجابة مناسبة أخرى حسب الحالة.',
          ],
        },
        {
          heading: '12. الاستخدامات المحظورة',
          bullets: [
            'يمنع إساءة استخدام الموقع أو تقديم معلومات غير صحيحة أو انتحال شخصية الآخرين أو التدخل في الأمان أو نسخ المحتوى آليًا دون إذن أو استخدام Eventies لأي نشاط غير قانوني أو ضار أو مسيء أو احتيالي.',
            'يمنع رفع أو إرسال محتوى ينتهك الحقوق أو يحتوي على برمجيات ضارة أو يكون مسيئًا أو غير آمن أو مضللًا أو غير قانوني.',
          ],
        },
        {
          heading: '13. محتوى الموقع والملكية الفكرية',
          body: [
            'اسم Eventies وتصميم الموقع والنصوص والوسائط والشعارات ومحتوى المنصة مملوكة لـ Eventies أو مستخدمة بإذن. لا يجوز نسخ أو إعادة إنتاج أو تعديل أو إعادة بيع أو استخدام محتوى Eventies لأغراض تجارية دون إذن مكتوب.',
          ],
        },
        {
          heading: '14. تحديد المسؤولية',
          body: [
            'إلى أقصى حد يسمح به القانون المعمول به، لا يتحمل Eventies المسؤولية عن الخسائر غير المباشرة أو العرضية أو الخاصة أو التبعية. لا يكون Eventies مسؤولًا عن التأخير أو الفشل الناتج عن معلومات غير صحيحة من العميل أو قيود المكان أو ظروف قاهرة أو مشاكل طرف ثالث أو ظروف خارجة عن السيطرة المعقولة.',
          ],
        },
        {
          heading: '15. تحديثات هذه الشروط',
          body: [
            'قد يقوم Eventies بتحديث هذه الشروط من وقت لآخر. سيتم نشر أحدث نسخة على هذه الصفحة مع تاريخ تحديث جديد. استمرارك في استخدام الموقع بعد التحديث يعني قبولك للشروط المحدثة.',
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
      contactBody: 'For vendor onboarding, listing, or partnership questions, contact vendors@eventiesjo.com.',
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
      eyebrow: 'شروط المزودين',
      title: 'شروط المزودين',
      description:
        'توضح هذه الشروط كيفية تعاون المزودين ومقدمي الخدمات المسجلين مع Eventies، وتقديم تفاصيل القوائم، ودعم طلبات العملاء التي ينسقها Eventies.',
      lastUpdatedLabel: 'آخر تحديث',
      lastUpdated: '1 يوليو 2026',
      metaTitle: 'شروط المزودين | Eventies',
      metaDescription:
        'راجع شروط مزودي Eventies للقوائم والمراجعة والدقة والتوفر والعمولة والطلبات وإجراءات الحساب.',
      contactHeading: 'التواصل مع فريق المزودين',
      contactBody: 'لأسئلة انضمام المزودين أو القوائم أو الشراكات، تواصل على vendors@eventiesjo.com.',
      sections: [
        {
          heading: '1. نطاق شروط المزودين',
          body: [
            'تنطبق شروط المزودين هذه على المزودين ومقدمي الخدمات والموردين والشركاء أو الشركات التي تعرض أو توفر خدمات فعاليات أو منتجات أو تأجير أو تنفيذ مخصص أو دعم مرتبط من خلال Eventies.',
            'قد يتم إطلاق أدوات حسابات للمزودين في المستقبل. وحتى ذلك، قد يجمع Eventies معلومات المزودين ويراجع القوائم وينسق الطلبات يدويًا أو من خلال أنظمة داخلية.',
          ],
        },
        {
          heading: '2. علاقة المزود مع Eventies',
          body: [
            'المزودون هم مقدمو خدمات أو موردون مستقلون. يقوم Eventies بتنسيق طلبات العملاء وقد يعرض خدمات المزودين من خلال موقع Eventies أو فريقه. تتم إدارة علاقة العميل والطلب من قبل Eventies ما لم يتفق Eventies بوضوح على خلاف ذلك كتابة.',
          ],
        },
        {
          heading: '3. الانضمام والمراجعة',
          bullets: [
            'قد يراجع Eventies المزودين والخدمات والمنتجات والأسعار والصور والأوصاف والجودة والتوفر والملاءمة قبل النشر أو العرض على العملاء.',
            'يحق لـ Eventies الموافقة على أي قائمة أو محتوى مزود أو رفضه أو تعديله أو إخفاؤه أو حذفه أو طلب تعديلات عليه وفق تقديره.',
            'الموافقة على مزود أو قائمة لا تضمن وجود طلبات أو مبيعات أو حجوزات أو ظهور مستقبلي.',
          ],
        },
        {
          heading: '4. دقة القوائم',
          body: [
            'يكون المزود مسؤولًا عن دقة جميع المعلومات التي يقدمها، بما في ذلك الصور والأوصاف والأسعار والأبعاد والكميات والتوفر وتفاصيل الخدمة ومتطلبات التركيب ومتطلبات السلامة وحدود التوصيل أو التركيب.',
          ],
        },
        {
          heading: '5. التسعير والعمولة والشروط التجارية',
          body: [
            'قد يفرض Eventies عمولة أو رسوم خدمة أو رسوم منصة أو رسوم قوائم أو أي رسوم تجارية متفق عليها. قد يتم تأكيد العمولة أو الترتيب التجاري المطبق بشكل منفصل بين Eventies والمزود.',
          ],
        },
        {
          heading: '6. التوفر والتعامل مع الطلبات',
          bullets: [
            'عندما يستقبل Eventies طلبًا مناسبًا، قد يتواصل مع مزود واحد أو أكثر للتحقق من التوفر والتسعير واللوجستيات وتفاصيل التنفيذ.',
            'يمكن للمزود قبول الطلب أو رفضه ما لم تنص اتفاقية مكتوبة منفصلة على خلاف ذلك.',
            'لا يطلب Eventies حاليًا من المزودين الرد خلال وقت محدد، لكن الرد السريع مفضل لأن التأخير قد يؤدي إلى تحويل الطلب لمزود آخر.',
            'يجب على المزود إبلاغ Eventies بسرعة إذا أصبح المنتج أو الخدمة غير متوفر أو تغير السعر أو لم يعد بالإمكان تقديمه كما هو موصوف.',
          ],
        },
        {
          heading: '7. جودة الخدمة والتنفيذ',
          body: [
            'يجب على المزود تقديم الخدمات بطريقة مهنية وآمنة وموثوقة وقانونية. يكون المزود مسؤولًا عن حالة المعدات وسلوك الطاقم وجاهزية التوصيل وجودة التركيب والالتزام بمتطلبات المكان والسلامة والقانون المعمول به.',
          ],
        },
        {
          heading: '8. مشاكل العملاء والمسؤولية',
          body: [
            'إذا ظهرت مشكلة في عنصر أو خدمة مقدمة من المزود، يجب على المزود التعاون مع Eventies للتحقق من المشكلة وحلها. قد يقرر Eventies الحل الظاهر للعميل، وقد يكون المزود مسؤولًا عن التكاليف الناتجة عن معلومات غير دقيقة أو عدم التنفيذ أو التأخير أو عيوب المنتجات أو التنفيذ غير الآمن أو عدم الالتزام بالمتطلبات المتفق عليها.',
          ],
        },
        {
          heading: '9. حقوق المحتوى',
          body: [
            'عند تزويد Eventies بالصور أو الفيديوهات أو النصوص أو الشعارات أو مواد القوائم، يؤكد المزود أنه يملك حق استخدامها ومشاركتها، ويمنح Eventies الإذن باستخدامها في القوائم والتسويق والتواصل مع العملاء وتشغيل المنصة.',
          ],
        },
        {
          heading: '10. حذف حساب أو قائمة المزود',
          body: [
            'يجوز لـ Eventies حذف قائمة أو رفض محتوى أو إيقاف الظهور أو تعليق مشاركة المزود أو إنهاء وصوله إذا اعتقد Eventies أن معلومات المزود غير دقيقة أو أن جودة الخدمة غير مقبولة أو أن المزود خالف هذه الشروط أو أن استمرار المشاركة يشكل خطرًا على Eventies أو العملاء أو المزودين الآخرين.',
          ],
        },
        {
          heading: '11. أدوات المزودين المستقبلية',
          body: [
            'قد يطلق Eventies لاحقًا لوحات تحكم للمزودين أو قوائم ذاتية أو أدوات طلبات أو تحليلات أو أدوات دفع أو ميزات أخرى للمزودين. قد تنطبق قواعد إضافية قبل تفعيل هذه الميزات.',
          ],
        },
        {
          heading: '12. تحديثات شروط المزودين',
          body: [
            'قد يقوم Eventies بتحديث شروط المزودين من وقت لآخر. سيتم نشر أحدث نسخة على هذه الصفحة مع تاريخ تحديث جديد.',
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
      contactBody: 'For cancellation, rescheduling, or refund questions, contact support@eventiesjo.com or booking@eventiesjo.com.',
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
      eyebrow: 'سياسة الاسترداد',
      title: 'سياسة الاسترداد والإلغاء',
      description:
        'توضح هذه السياسة مواعيد الإلغاء والعربون ومشاكل الخدمة ومسؤولية العميل عن التلف أو الفقدان.',
      lastUpdatedLabel: 'آخر تحديث',
      lastUpdated: '1 يوليو 2026',
      metaTitle: 'سياسة الاسترداد | Eventies',
      metaDescription:
        'راجع سياسة الاسترداد والإلغاء من Eventies للإلغاء قبل 72 ساعة والعربون غير المسترد ومشاكل الخدمة ومسؤولية التلف.',
      contactHeading: 'تحتاج مساعدة بخصوص حجز؟',
      contactBody: 'لأسئلة الإلغاء أو تغيير الموعد أو الاسترداد، تواصل على support@eventiesjo.com أو booking@eventiesjo.com.',
      sections: [
        {
          heading: '1. نطاق هذه السياسة',
          body: [
            'تنطبق سياسة الاسترداد والإلغاء هذه على طلبات Eventies والحجوزات والتأجيرات والخدمات والترتيبات المخصصة والأعمال المرتبطة بالفعاليات التي يؤكدها Eventies. إذا أرسل Eventies عرضًا أو اتفاقًا مكتوبًا يحتوي على شروط استرداد أو إلغاء مختلفة، فتطبق تلك الشروط على ذلك الطلب.',
          ],
        },
        {
          heading: '2. الطلبات قبل التأكيد',
          body: [
            'إرسال طلب من خلال الموقع لا ينشئ حجزًا مؤكدًا. إذا لم يتم تأكيد طلبك من Eventies ولم يتم دفع أي مبلغ، فلا توجد مسألة استرداد لأنه لا يوجد حجز مدفوع مؤكد.',
          ],
        },
        {
          heading: '3. موعد الإلغاء',
          body: [
            'يمكن للعميل طلب الإلغاء قبل موعد الفعالية المجدول بـ 72 ساعة على الأقل. قد يتم رفض طلبات الإلغاء المقدمة قبل أقل من 72 ساعة من الفعالية، وقد يبقى العميل مسؤولًا عن الرسوم المؤكدة أو تكاليف المزودين أو اللوجستيات أو التحضير أو أي مبالغ متفق عليها.',
          ],
        },
        {
          heading: '4. العربون والدفعات المقدمة',
          body: [
            'أي عربون أو دفعة مقدمة أو مبلغ حجز أو مبلغ مدفوع لتثبيت الخدمات يكون غير مسترد ما لم يؤكد Eventies خلاف ذلك بوضوح وكتابة. ينطبق ذلك حتى إذا تم طلب الإلغاء قبل موعد الفعالية بـ 72 ساعة على الأقل.',
          ],
        },
        {
          heading: '5. تغيير الموعد',
          body: [
            'تغيير الموعد يخضع لموافقة Eventies وتوفر المزود والخدمة واللوجستيات وأي تكاليف إضافية. لا يتم ضمان تغيير الموعد. قد يتم ترحيل العربون أو الدفعة المقدمة فقط إذا أكد Eventies ذلك كتابة.',
          ],
        },
        {
          heading: '6. إذا وصل المنتج أو الخدمة وفيها مشكلة',
          body: [
            'إذا وصل منتج أو خدمة وفيها مشكلة لم يتسبب بها العميل أو المكان أو الضيوف أو المشاركون في الفعالية، يتحمل Eventies مسؤولية مراجعة المشكلة ومعالجتها. حسب الحالة، قد يوفر Eventies إصلاحًا أو استبدالًا أو ترتيبًا بديلًا أو تعديلًا للخدمة أو تعديلًا جزئيًا أو حلًا معقولًا آخر.',
          ],
        },
        {
          heading: '7. التلف أو الفقدان أو سوء الاستخدام بسبب العميل',
          body: [
            'يكون العميل مسؤولًا عن أي تلف أو فقدان أو نقص في العناصر أو سوء استخدام أو تعامل غير آمن أو تنظيف زائد أو إصلاحات يتسبب بها العميل أو الضيوف أو المكان أو الطاقم أو المشاركون في الفعالية. قد يفرض Eventies على العميل تكلفة الإصلاح أو الاستبدال أو التنظيف أو العناصر المفقودة أو التوقف أو التكاليف المرتبطة.',
          ],
        },
        {
          heading: '8. الوصول للمكان والتوقيت ومعلومات العميل',
          body: [
            'قد لا تتوفر الاستردادات أو التعديلات عندما تكون مشكلة الخدمة ناتجة عن معلومات غير صحيحة من العميل أو تأخر الوصول للمكان أو منع الدخول أو غياب التصاريح أو عدم ملاءمة ظروف المكان أو قيود الكهرباء أو قيود السلامة أو تغييرات قام بها العميل أو المكان.',
          ],
        },
        {
          heading: '9. الطقس والظروف القاهرة والأحداث الخارجية',
          body: [
            'بالنسبة للطقس أو القيود الحكومية أو الطوارئ أو الظروف القاهرة أو الظروف الخارجة عن السيطرة المعقولة، قد يراجع Eventies الحالة بشكل منفصل وقد يعرض تغيير الموعد أو رصيدًا أو تعديلًا جزئيًا أو حلًا آخر وفق تقديره.',
          ],
        },
        {
          heading: '10. كيفية طلب الإلغاء أو الدعم',
          body: [
            'لطلب الإلغاء أو تغيير الموعد أو الدعم، تواصل مع Eventies بأسرع وقت ممكن واذكر اسمك ورقم الطلب إذا توفر وتاريخ الفعالية ورقم الهاتف وسبب الطلب.',
          ],
        },
      ],
    },
  },
}

const relatedDocs: { key: LegalDocumentKey; path: string }[] = [
  { key: 'privacy', path: '/privacy-policy' },
  { key: 'terms', path: '/terms' },
  { key: 'vendorTerms', path: '/vendor-terms' },
  { key: 'refund', path: '/refund-policy' },
  { key: 'cookies', path: '/cookie-policy' },
]

const documentTitleFallback: Record<LegalDocumentKey, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  vendorTerms: 'Vendor Terms',
  refund: 'Refund Policy',
  cookies: 'Cookie Policy',
}

function renderEmailLinks(text: string) {
  return text.split(/([a-z0-9._%+-]+@eventiesjo\.com)/gi).map((part, index) =>
    part.toLowerCase().endsWith('@eventiesjo.com') ? (
      <a
        key={`${part}-${index}`}
        href={`mailto:${part}`}
        className="font-bold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900"
        dir="ltr"
      >
        {part}
      </a>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  )
}

export default function LegalPage({ documentKey }: { documentKey: LegalDocumentKey }) {
  const { locale, dir } = useI18n()
  const copy = legalDocuments[documentKey][locale]
  const isRtl = dir === 'rtl'

  usePageMeta({
    title: copy.metaTitle,
    description: copy.metaDescription,
    canonical: `https://www.eventiesjo.com/${relatedDocs.find(doc => doc.key === documentKey)?.path.replace(/^\//, '') ?? ''}`,
    type: 'article',
  })

  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <div className="bg-white/70" dir={dir}>
      <section className="site-section pt-8 sm:pt-12 lg:pt-14">
        <div className="site-container">
          <div className="section-shell overflow-hidden px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-violet-700 shadow-[0_12px_28px_-22px_rgba(89,23,196,0.55)] transition hover:border-violet-300 hover:text-violet-950"
                >
                  <BackIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {locale === 'ar' ? 'العودة للرئيسية' : 'Back home'}
                </Link>

                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/85 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">
                  <Scale className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {copy.eyebrow}
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.045em] text-ink-950 sm:text-5xl lg:text-6xl">
                  {copy.title}
                </h1>
                <p className="mt-5 max-w-3xl text-[15px] leading-8 text-ink-700/78 sm:text-base sm:leading-8">
                  {copy.description}
                </p>
              </div>

              <aside className="w-full rounded-[28px] border border-violet-100/90 bg-white/82 p-5 shadow-[0_24px_70px_-46px_rgba(89,23,196,0.42)] lg:max-w-xs">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <CalendarDays className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-500/90">
                      {copy.lastUpdatedLabel}
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-ink-900">{copy.lastUpdated}</p>
                  </div>
                </div>
                {copy.note ? (
                  <p className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/75 px-4 py-3 text-[12.5px] leading-7 text-amber-900/85">
                    {copy.note}
                  </p>
                ) : null}
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section pt-0">
        <div className="site-container">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <article className="space-y-5">
              {copy.sections.map(section => (
                <section
                  key={section.heading}
                  className="rounded-[28px] border border-violet-100/90 bg-white/88 p-5 shadow-[0_24px_70px_-50px_rgba(89,23,196,0.35)] sm:p-7"
                >
                  <h2 className="text-xl font-black tracking-[-0.025em] text-ink-950 sm:text-2xl">
                    {section.heading}
                  </h2>

                  {section.body?.length ? (
                    <div className="mt-4 space-y-3 text-[14px] leading-8 text-ink-700/82 sm:text-[15px] sm:leading-8">
                      {section.body.map(paragraph => (
                        <p key={paragraph}>{renderEmailLinks(paragraph)}</p>
                      ))}
                    </div>
                  ) : null}

                  {section.bullets?.length ? (
                    <ul className="mt-4 space-y-3 text-[14px] leading-8 text-ink-700/82 sm:text-[15px] sm:leading-8">
                      {section.bullets.map(item => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden="true" />
                          <span>{renderEmailLinks(item)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </article>

            <aside className="space-y-5 lg:sticky lg:top-[calc(var(--app-navbar-height)+1.5rem)]">
              <div className="rounded-[28px] border border-violet-100/90 bg-white/88 p-5 shadow-[0_24px_70px_-50px_rgba(89,23,196,0.35)]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <h2 className="mt-4 text-lg font-black text-ink-950">
                  {locale === 'ar' ? 'مستندات قانونية أخرى' : 'Related legal documents'}
                </h2>
                <div className="mt-4 space-y-2">
                  {relatedDocs.map(doc => {
                    const label = legalDocuments[doc.key]?.[locale]?.title ?? documentTitleFallback[doc.key]
                    const active = doc.key === documentKey
                    return (
                      <Link
                        key={doc.key}
                        to={doc.path}
                        className={`block rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                          active
                            ? 'border-violet-300 bg-violet-100 text-violet-950'
                            : 'border-violet-100 bg-white/72 text-ink-700/78 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-900'
                        }`}
                      >
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-violet-100/90 bg-white/88 p-5 shadow-[0_24px_70px_-50px_rgba(89,23,196,0.35)]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Mail className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <h2 className="mt-4 text-lg font-black text-ink-950">{copy.contactHeading}</h2>
                <p className="mt-3 text-[13.5px] leading-7 text-ink-700/80">{renderEmailLinks(copy.contactBody)}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
