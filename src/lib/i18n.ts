export type Locale = 'en' | 'ar'

export type Messages = Record<string, string>

export const LOCALE_STORAGE_KEY = 'eventies_locale'

const en: Messages = {
  'validation.nameRequired': 'Name is required',
  'validation.nameTooLong': 'Name is too long (100 characters maximum)',
  'validation.emailInvalid': 'Please enter a valid email address',
  'validation.phoneInvalid': 'Phone number is not valid',
  'validation.messageTooLong': 'Message is too long (2000 characters maximum)',

  'contact.tooManyRequests': 'Too many attempts. Please wait before trying again. (Remaining: {count})',
  'contact.tooManyRequestsToast': 'Too many attempts. Please wait a moment.',
  'contact.saved': 'Your request has been received. The Eventies team will follow up soon.',
  'contact.savedBanner': 'Your request has been saved. The Eventies team will follow up soon.',
  'contact.fixErrors': 'Please complete all required fields correctly.',
  'contact.rateLimited': 'You have submitted too many requests recently. Please wait before trying again.',
  'contact.rejected': 'We could not save your request because some details were not accepted. Please review and try again.',
  'contact.notSavedBanner':
    'We could not save your request in our system right now because of a connection issue. It was not saved, so we will open {channel} to help you reach us.',
  'contact.notSavedToast': 'Not saved because of a connection issue. Opening {channel} so you can contact us.',
  'channel.whatsapp': 'WhatsApp',
  'channel.email': 'email',

  'language.label': 'Language',
  'language.english': 'English',
  'language.arabic': 'Arabic',
  'language.switchToArabic': 'Switch to Arabic',
  'language.switchToEnglish': 'Switch to English',
}

const ar: Messages = {
  'validation.nameRequired': 'الاسم مطلوب',
  'validation.nameTooLong': 'الاسم طويل جدا (100 حرف كحد أقصى)',
  'validation.emailInvalid': 'يرجى إدخال بريد إلكتروني صحيح',
  'validation.phoneInvalid': 'رقم الهاتف غير صحيح',
  'validation.messageTooLong': 'الرسالة طويلة جدا (2000 حرف كحد أقصى)',

  'contact.tooManyRequests': 'عدد كبير من المحاولات. يرجى الانتظار قبل المحاولة مرة أخرى. (المتبقي: {count})',
  'contact.tooManyRequestsToast': 'عدد كبير من المحاولات. يرجى الانتظار قليلا.',
  'contact.saved': 'تم استلام طلبك. سيتواصل معك فريق Eventies قريبا.',
  'contact.savedBanner': 'تم حفظ طلبك. سيتواصل معك فريق Eventies قريبا.',
  'contact.fixErrors': 'يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.',
  'contact.rateLimited': 'أرسلت عددا كبيرا من الطلبات مؤخرا. يرجى الانتظار قليلا قبل المحاولة مرة أخرى.',
  'contact.rejected': 'تعذر حفظ طلبك لأن بعض البيانات غير مقبولة. يرجى مراجعة التفاصيل والمحاولة مرة أخرى.',
  'contact.notSavedBanner':
    'تعذر حفظ طلبك في نظامنا حاليا بسبب مشكلة في الاتصال. لم يتم حفظ الطلب، لذلك سنفتح {channel} لمساعدتك على التواصل معنا.',
  'contact.notSavedToast': 'لم يتم الحفظ بسبب مشكلة في الاتصال. جار فتح {channel} للتواصل معنا.',
  'channel.whatsapp': 'واتساب',
  'channel.email': 'البريد الإلكتروني',

  'language.label': 'اللغة',
  'language.english': 'الإنجليزية',
  'language.arabic': 'العربية',
  'language.switchToArabic': 'التبديل إلى العربية',
  'language.switchToEnglish': 'التبديل إلى الإنجليزية',
}

export const dictionaries: Record<Locale, Messages> = { en, ar }

let currentLocale: Locale = 'en'

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'ar'
}

export function getDirection(locale: Locale = currentLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function setLocale(locale: string): void {
  currentLocale = isLocale(locale) ? locale : 'en'
}

export function getLocale(): Locale {
  return currentLocale
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const dict = dictionaries[locale] || dictionaries.en
  let text =
    dict[key] ??
    (locale === 'ar' ? arPhraseMap[key] : undefined) ??
    dictionaries.en[key] ??
    key

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value))
    }
  }

  return text
}

export function t(key: string, vars?: Record<string, string | number>): string {
  return translate(currentLocale, key, vars)
}

const arPhraseMap: Record<string, string> = {
  'Even a rough idea is enough — the more you share, the faster we can review rental, purchase, shipping, and quote scope.': 'حتى الفكرة الأولية كافية — كلما شاركت تفاصيل أكثر، تمكنا من مراجعة التأجير أو الشراء أو الشحن ونطاق عرض السعر بشكل أسرع.',
  'Explore event rentals, interactive activations, screens, booths, production support, and custom setups across Jordan — then submit a rental or purchase quote request for review.': 'استكشف تأجيرات الفعاليات والتفعيلات التفاعلية والشاشات والبوثات ودعم الإنتاج والتجهيزات المخصصة في الأردن، ثم أرسل طلب تأجير أو طلب عرض سعر للشراء للمراجعة.',
  Home: 'الرئيسية',
  'Custom Builds': 'تنفيذ مخصص',
  Customers: 'العملاء',
  Gallery: 'المعرض',
  About: 'من نحن',
  Contact: 'تواصل معنا',
  Login: 'تسجيل الدخول',
  Logout: 'تسجيل الخروج',
  Search: 'بحث',
  Profile: 'الملف الشخصي',
  'My Requests': 'طلباتي',
  'Admin Panel': 'لوحة الإدارة',
  'Request Draft': 'مسودة الطلب',
  'Rental Request Draft': 'مسودة طلب التأجير',
  'Purchase Quote Request Draft': 'مسودة طلب عرض سعر للشراء',
  Quote: '??? ???',
  Cart: 'مسودة الطلب',
  'Quote draft': 'مسودة الطلب',
  'Browse categories': 'تصفح الفئات',
  'View all categories': 'عرض كل الفئات',
  'Search categories or services...': 'ابحث في الفئات أو الخدمات...',
  'Search categories or services…': 'ابحث في الفئات أو الخدمات...',
  'No matches for': 'لا توجد نتائج لـ',
  'Press Enter to browse all services.': 'اضغط Enter لتصفح جميع الخدمات.',

  'Event Services Marketplace - Jordan': 'سوق خدمات الفعاليات - الأردن',
  'Event Services Marketplace · Jordan': 'سوق خدمات الفعاليات - الأردن',
  'Trusted across Jordan': 'موثوق في أنحاء الأردن',
  'Plan and request event services from one organized marketplace.': 'خطط واطلب خدمات الفعاليات من سوق واحد منظم.',
  'Explore event rentals, interactive activations, screens, booths, production support, and custom setups across Jordan — then send one clear request for review.':
    'استكشف تأجير الفعاليات والتجارب التفاعلية والشاشات والأجنحة ودعم الإنتاج والتنفيذ المخصص في الأردن، ثم أرسل طلبا واضحا للمراجعة.',
  'Explore Services': 'استكشف الخدمات',
  'Request a Quote': 'اطلب عرض سعر',
  Browse: 'تصفح',
  'For Clients': 'للعملاء',
  'Grow with Us': 'انم معنا',
  Games: 'ألعاب',
  'LED Screens': 'شاشات LED',
  Booths: 'أجنحة',
  Production: 'إنتاج',

  'Browse by category': 'تصفح حسب الفئة',
  'What are you planning?': 'ما نوع فعاليتك؟',
  'Explore service categories built for every kind of event. Open any category to see available services, packages, and providers.':
    'استكشف فئات الخدمات المناسبة لكل نوع من الفعاليات. افتح أي فئة لمعرفة الخدمات والباقات ومزودي الخدمات المتاحين.',
  Explore: 'استكشف',
  New: 'جديد',
  'View all services': 'عرض كل الخدمات',
  'View All Services': 'عرض كل الخدمات',
  'Popular services': 'خدمات رائجة',
  'Loved by organizers': 'يفضلها منظمو الفعاليات',
  'A selection of in-demand services from across the marketplace — ready to add to your next event request.':
    'مجموعة مختارة من الخدمات المطلوبة في السوق، جاهزة لإضافتها إلى طلب فعاليتك القادم.',
  Marketplace: 'السوق',
  'on request': 'حسب الطلب',
  'Quote Based': 'حسب المراجعة',
  'Request Based': 'حسب المراجعة',
  'Custom Pricing': 'تسعير حسب الطلب',
  'Reviewed Pricing': 'تسعير بعد المراجعة',
  'Reviewed pricing': 'تسعير بعد المراجعة',
  'Reviewed pricing available': 'التسعير متاح بعد المراجعة',
  Reviewed: 'قيد المراجعة',
  'After review': 'بعد المراجعة',
  'Per Day': 'لليوم',
  Featured: 'مميز',
  Details: 'التفاصيل',
  'Service Details': 'تفاصيل الخدمة',
  'View Service Details': 'عرض تفاصيل الخدمة',
  'Add to Rental Request': 'أضف إلى طلب التأجير',
  Added: 'تمت الإضافة',
  Remove: 'إزالة',
  'Purchase Quote Request': 'طلب عرض سعر للشراء',
  'Purchase Quote Requests': 'طلبات عرض سعر الشراء',
  'Ask About This Service': 'اسأل عن هذه الخدمة',
  Inquiry: 'استفسار',

  'How Eventies works': 'كيف يعمل Eventies',
  'From idea to event-ready reality.': 'من الفكرة إلى تجربة جاهزة للفعالية.',
  'Browse services, choose what fits your event, and submit one organized rental or purchase quote request with your date, location, quantity, and notes.': 'تصفح الخدمات، اختر ما يناسب فعاليتك، وأرسل طلب تأجير أو طلب عرض سعر للشراء بشكل منظم مع التاريخ والموقع والكمية والملاحظات.',
  'Discover Services': 'اكتشف الخدمات',
  'Browse rentals, activations, production support, screens, booths, custom builds, and eligible purchase quote options.': 'تصفح التأجيرات والتفعيلات ودعم الإنتاج والشاشات والبوثات والتنفيذات المخصصة وخيارات طلب عرض سعر الشراء المؤهلة.',
  'Build Your Request': 'أنشئ طلبك',
  'Add services, quantities, dates, and notes into one rental or purchase quote request draft.': 'أضف الخدمات والكميات والتواريخ والملاحظات إلى مسودة طلب تأجير أو طلب عرض سعر للشراء واحدة.',
  'Submit for Review': 'أرسل للمراجعة',
  'Send your request so the Eventies team can review availability, pricing, scope, delivery, shipping, and next steps.': 'أرسل طلبك ليتمكن فريق Eventies من مراجعة التوفر والتسعير والنطاق والتسليم والشحن والخطوات التالية.',

  'Featured Event Services': 'خدمات فعاليات مميزة',
  'A selected showcase of popular rentals, activations, and event-ready setups available through Eventies.':
    'عرض مختار لتأجيرات وتجارب تفاعلية وتجهيزات جاهزة للفعاليات عبر Eventies.',
  'Selected from real event setups, activations, and delivered experiences.':
    'مختارة من تجهيزات وتفعيلات وتجارب حقيقية تم تنفيذها.',
  'Browse Services': 'تصفح الخدمات',
  'Filter by category': 'تصفية حسب الفئة',
  'Service catalog': 'كتالوج الخدمات',
  'No services match this filter': 'لا توجد خدمات تطابق هذا الفلتر',
  'Try selecting a different category to see more results.': 'جرّب اختيار فئة أخرى لعرض المزيد من النتائج.',
  'Show all services': 'عرض كل الخدمات',
  'No services in this category yet': 'لا توجد خدمات في هذه الفئة بعد',
  'Browse all Eventies services while this collection is being updated.':
    'تصفح جميع خدمات Eventies بينما يتم تحديث هذه المجموعة.',

  'Rental requests and purchase quote requests are reviewed before confirmation. Availability, pricing, setup, delivery, shipping, and scope are confirmed after review.': 'تتم مراجعة طلبات التأجير وطلبات عرض سعر الشراء قبل التأكيد. يتم تأكيد التوفر والتسعير والتجهيز والتسليم والشحن ونطاق الخدمة بعد المراجعة.',
  'Save to Request Draft': 'حفظ في مسودة الطلب',
  'Review Request': 'مراجعة الطلب',
  Quantity: 'الكمية',
  'Item Note': 'ملاحظة على الخدمة',
  'Service note': 'ملاحظة على الخدمة',
  'Optional note for your sales team...': 'ملاحظة اختيارية لفريق Eventies...',
  'Optional note for the Eventies team...': 'ملاحظة اختيارية لفريق Eventies...',
  'This service is already in your draft. Adding it again will increase the quantity and keep your latest note.':
    'هذه الخدمة موجودة بالفعل في المسودة. إضافتها مرة أخرى ستزيد الكمية وتحفظ آخر ملاحظة.',

  'Rental Request Draft Summary': 'ملخص مسودة طلب التأجير',
  'Your rental request draft is empty': 'مسودة طلب التأجير فارغة',
  'Prepare Your Request': 'جهز طلبك',
  'Your selected services': 'الخدمات المختارة',
  'Request Summary': 'ملخص الطلب',
  'Submit Request': 'إرسال الطلب',
  'Continue to Submit Request': 'المتابعة لإرسال الطلب',
  'Sign In to Submit Request': 'سجل الدخول لإرسال الطلب',
  'Keep Browsing': 'متابعة التصفح',
  'Set dates to see total': 'حدد التواريخ لعرض المجموع',

  'Your request draft is empty': 'مسودة الطلب فارغة',
  'Your purchase quote request draft is empty.': 'مسودة طلب عرض سعر الشراء فارغة.',
  'Add eligible services from the catalog to prepare a purchase quote request. Drafts stay on this device until you send them.': 'أضف الخدمات المؤهلة من الكتالوج لتحضير طلب عرض سعر للشراء. تبقى المسودات محفوظة على هذا الجهاز حتى ترسلها.',
  'Add eligible services from the catalog to prepare a purchase quote request. Drafts stay on this device until you submit them.': 'أضف الخدمات المؤهلة من الكتالوج لتحضير طلب عرض سعر للشراء. تبقى المسودات محفوظة على هذا الجهاز حتى تقوم بإرسالها.',
  'Add more services': 'أضف خدمات أخرى',
  'Clear draft': 'مسح المسودة',
  'Submit Purchase Quote Request': 'إرسال طلب عرض سعر للشراء',
  'Send Request': 'إرسال الطلب',
  'Open Request Draft': 'فتح مسودة الطلب',
  'Open Rental Request Draft': 'فتح مسودة طلب التأجير',
  'Go to My Requests': 'الذهاب إلى طلباتي',
  'Track Every Request': 'تابع كل طلب',
  'All Requests': 'كل الطلبات',
  'Rental Requests': 'طلبات التأجير',
  'Track Requests': 'متابعة الطلبات',
  'No requests match this filter': 'لا توجد طلبات تطابق هذا الفلتر',
  'Add services to your request draft, submit your request, and track every update from here.':
    'أضف الخدمات إلى مسودة الطلب، وأرسل طلبك، وتابع كل تحديث من هنا.',

  'Custom interactive experiences, built for your event.':
    'تجارب تفاعلية مخصصة، مصممة لفعاليتك.',
  'Can’t find the exact service you need? Eventies can help design and build custom event experiences from scratch — software, hardware, branding, and event-ready execution.':
    'لا تجد الخدمة التي تحتاجها بالضبط؟ يمكن لـ Eventies المساعدة في تصميم وبناء تجارب فعاليات مخصصة من الصفر، تشمل البرمجيات والأجهزة والهوية والتنفيذ الجاهز للفعالية.',
  "Can't find the exact service you need? Eventies can help design and build custom event experiences from scratch — software, hardware, branding, and event-ready execution.":
    'لا تجد الخدمة التي تحتاجها بالضبط؟ يمكن لـ Eventies المساعدة في تصميم وبناء تجارب فعاليات مخصصة من الصفر، تشمل البرمجيات والأجهزة والهوية والتنفيذ الجاهز للفعالية.',
  'From idea to a real, event-ready build.': 'من الفكرة إلى تنفيذ حقيقي جاهز للفعالية.',
  'Built in Jordan and reviewed for local or international delivery.':
    'يتم التنفيذ في الأردن ومراجعته للتسليم المحلي أو الدولي.',
  'International Shipping': 'شحن دولي',
  'Built in Jordan': 'ينفذ في الأردن',
  'Worldwide shipping': 'شحن عالمي',
  'International shipping available for eligible purchase and custom-build requests': 'الشحن الدولي متاح لطلبات الشراء والتنفيذات المخصصة المؤهلة',
  'Request a Custom Build Quote': 'اطلب عرض سعر لتنفيذ مخصص',
  'Submit a custom build request. Eventies can review your idea and, when feasible, help design and build a custom interactive experience for your event, including software, hardware, branding, and setup requirements.':
    'أرسل طلب تنفيذ مخصص. يمكن لفريق Eventies مراجعة فكرتك، وعند الإمكانية، المساعدة في تصميم وبناء تجربة تفاعلية مخصصة لفعاليتك تشمل البرمجيات والأجهزة والهوية ومتطلبات الإعداد.',

  'Eventies is an organized event services marketplace that helps people discover rentals, activations, production support, custom builds, and trusted providers across Jordan.':
    'Eventies سوق منظم لخدمات الفعاليات يساعد الناس على اكتشاف التأجير والتجارب التفاعلية ودعم الإنتاج والتنفيذ المخصص ومزودي الخدمات الموثوقين في الأردن.',
  'Why are some services request-based instead of showing a fixed price?':
    'لماذا تعتمد بعض الخدمات على الطلب بدلا من عرض سعر ثابت؟',
  'Many event services depend on date, location, duration, setup needs, staffing, delivery, and availability. That is why Eventies uses a request review flow for accurate pricing and next steps.':
    'تعتمد كثير من خدمات الفعاليات على التاريخ والموقع والمدة ومتطلبات الإعداد والطاقم والتوصيل والتوفر. لذلك يستخدم Eventies مسار مراجعة الطلب لتقديم تسعير وخطوات تالية أكثر دقة.',

  'Event Requests': 'طلبات الفعاليات',
  'Email Eventies Team': 'مراسلة فريق Eventies',
  'General Inquiries': 'استفسارات عامة',
  'Support & Request Follow-up': 'الدعم ومتابعة الطلبات',
  'Providers & Partnerships': 'مزودو الخدمات والشراكات',
  'Service or category questions': 'أسئلة عن الخدمات أو الفئات',
  'Services, rentals, or custom builds you are interested in':
    'الخدمات أو التأجيرات أو التنفيذ المخصص الذي تهتم به',
  'The team aims to review inquiries within one business day. Response time may vary depending on request details, availability checks, and quote complexity.':
    'يسعى الفريق إلى مراجعة الاستفسارات خلال يوم عمل واحد. قد يختلف وقت الرد حسب تفاصيل الطلب وفحوصات التوفر وتعقيد التسعير.',

  'Real events, real setups.': 'فعاليات حقيقية، وتجهيزات حقيقية.',
  'Browse albums from Eventies activations, service setups, custom builds, and real event moments across Jordan.':
    'تصفح ألبومات من تفعيلات Eventies وتجهيزات الخدمات والتنفيذ المخصص ولحظات الفعاليات الحقيقية في الأردن.',
  'Browse Albums': 'تصفح الألبومات',
  'Plan an Event': 'خطط لفعالية',
  'No albums yet': 'لا توجد ألبومات بعد',
  'Event photo albums will appear here soon.': 'ستظهر ألبومات صور الفعاليات هنا قريبا.',
  'A curated look at brands, schools, venues, and organizations connected to Eventies activations, custom builds, and event services across Jordan and the region.':
    'نظرة مختارة على علامات تجارية ومدارس ومواقع ومنظمات مرتبطة بتفعيلات Eventies والتنفيذ المخصص وخدمات الفعاليات في الأردن والمنطقة.',

  'Plan your event request in one place.': 'خطط لطلب فعاليتك في مكان واحد.',
  'Discover trusted providers, event rentals, games, screens, activations, and production services across Jordan.':
    'اكتشف مزودي خدمات موثوقين وتأجير فعاليات وألعاب وشاشات وتفعيلات وخدمات إنتاج في الأردن.',
  'Welcome Back': 'مرحبا بعودتك',
  'Join Eventies': 'انضم إلى Eventies',
  'Sign In': 'تسجيل الدخول',
  'Sign Up': 'إنشاء حساب',
  'Create Account': 'إنشاء حساب',
  'Create a new account': 'إنشاء حساب جديد',
  'Back to sign in': 'العودة لتسجيل الدخول',
  'Back to site': 'العودة إلى الموقع',
  'Email': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'Full Name *': 'الاسم الكامل *',
  'Remember me': 'تذكرني',
  'Forgot Password': 'نسيت كلمة المرور',

  'Eventies helps clients discover event services, compare trusted providers across Jordan, and submit clear requests from one organized marketplace.':
    'يساعد Eventies العملاء على اكتشاف خدمات الفعاليات ومقارنة مزودي خدمات موثوقين في الأردن وإرسال طلبات واضحة من سوق واحد منظم.',
  'Trusted event services marketplace': 'سوق موثوق لخدمات الفعاليات',
  Company: 'الشركة',
  Support: 'الدعم',
  Legal: 'القانوني',
  General: 'عام',
  Vendors: 'المزودون',
  Privacy: 'الخصوصية',
  Terms: 'الشروط',
  Cookies: 'ملفات الارتباط',
  'Made in Jordan': 'صنع في الأردن',
  'All rights reserved.': 'جميع الحقوق محفوظة.',

  // Additional public-site Arabic copy coverage added after final QA.
  'Account menu': 'قائمة الحساب',
  'User menu': 'قائمة المستخدم',
  'Main navigation': 'التنقل الرئيسي',
  'Mobile navigation': 'قائمة الهاتف',
  'Close menu': 'إغلاق القائمة',
  'Eventies home': 'الصفحة الرئيسية لـ Eventies',
  'Search categories or services': 'البحث في الفئات أو الخدمات',
  'Browse & Request': 'تصفح واطلب',
  'Browse &amp; Request': 'تصفح واطلب',
  'Explore Custom Builds': 'استكشف التنفيذ المخصص',
  'Start a Request': 'ابدأ طلبا',

  // Home / custom-build preview
  'Custom service builds for ideas that need more than a rental': 'تنفيذ مخصص للأفكار التي تحتاج أكثر من مجرد تأجير',
  'When the event needs something built from scratch, Eventies can shape the concept, prototype it, test it, and prepare it for the venue.':
    'عندما تحتاج الفعالية إلى شيء مبني من الصفر، يمكن لـ Eventies صياغة الفكرة، وتجهيز نموذج أولي، واختباره، وتحضيره للموقع.',
  'R&D studio': 'استوديو البحث والتطوير',
  'From a rough event idea to a working custom build.': 'من فكرة أولية للفعالية إلى تنفيذ مخصص جاهز للعمل.',
  'Use this when your event needs a branded activation, interactive game, special booth, or a custom setup that must be designed, built, tested, and delivered before showtime.':
    'استخدم هذا الخيار عندما تحتاج فعاليتك إلى تفعيل بعلامتك التجارية، أو لعبة تفاعلية، أو جناح خاص، أو تجهيز مخصص يتم تصميمه وبناؤه واختباره وتسليمه قبل موعد الفعالية.',
  'Branded games': 'ألعاب بعلامة تجارية',
  'Interactive booths': 'أجنحة تفاعلية',
  'Control systems': 'أنظمة تحكم',
  'Event-ready builds': 'تنفيذ جاهز للفعاليات',
  Idea: 'فكرة',
  Prototype: 'نموذج أولي',
  Test: 'اختبار',
  Deploy: 'تشغيل',
  'Event-ready pipeline': 'مسار تنفيذ جاهز للفعالية',
  'Field tested': 'تم اختباره ميدانيا',

  // Custom Builds full page
  'Interactive Games': 'ألعاب تفاعلية',
  'Challenge, scoring & reaction games.': 'ألعاب تحدي وتسجيل نقاط وردود فعل.',
  'Booths & Activations': 'بوثات وتفعيلات',
  'Branded booths & launch stations.': 'بوثات بعلامة تجارية ومحطات إطلاق.',
  'Hardware + Software': 'هاردوير وبرمجيات',
  'Screens, sensors, lighting & scoring.': 'شاشات وحساسات وإضاءة وأنظمة تسجيل.',
  'Special Project Builds': 'تنفيذ مشاريع خاصة',
  'One-off ideas, designed & fabricated.': 'أفكار خاصة يتم تصميمها وتصنيعها.',
  Design: 'تصميم',
  Engineering: 'هندسة',
  'R&D': 'بحث وتطوير',
  Prototyping: 'نمذجة أولية',
  Fabrication: 'تصنيع',
  'Concept Design': 'تصميم الفكرة',
  'Sketches, flow, user interaction': 'مخططات، مسار تجربة، وتفاعل المستخدم',
  'Structure, electronics, controls': 'هيكل، إلكترونيات، وأنظمة تحكم',
  'R&D Testing': 'اختبار البحث والتطوير',
  'Prototype trials and validation': 'تجارب النموذج الأولي والتحقق',
  'Build, finish, pack, deploy': 'بناء، تشطيب، تغليف، وتشغيل',
  'Share the idea': 'شارك الفكرة',
  'A sketch, reference, or goal is enough.': 'رسم بسيط أو مرجع أو هدف واضح يكفي للبداية.',
  'Define scope': 'تحديد النطاق',
  'Flow, materials, tech, branding, and timeline.': 'التجربة، المواد، التقنية، الهوية، والجدول الزمني.',
  'Build & test': 'البناء والاختبار',
  'Fabricated, assembled, event-tested.': 'تصنيع وتجميع واختبار للفعالية.',
  'Deliver or ship': 'التسليم أو الشحن',
  'Local delivery or worldwide shipping.': 'تسليم محلي أو شحن عالمي.',
  'Brands & Companies': 'العلامات التجارية والشركات',
  'Campaigns, launches & engagement.': 'حملات وإطلاقات وتجارب تفاعل.',
  'Agencies & Organizers': 'الوكالات ومنظمو الفعاليات',
  'Custom activations for client work.': 'تفعيلات مخصصة لأعمال العملاء.',
  'Universities & Public': 'الجامعات والفعاليات العامة',
  'Campus & festival engagement zones.': 'مناطق تفاعل للجامعات والمهرجانات.',
  'International Clients': 'عملاء دوليون',
  'Built, packed & shipped after review.': 'يتم البناء والتغليف والشحن بعد المراجعة.',
  'Brand launch': 'إطلاق علامة تجارية',
  'Guest engagement': 'تفاعل الضيوف',
  'On-site support': 'دعم في الموقع',
  'Client activation': 'تفعيل للعميل',
  'Fast approval': 'اعتماد سريع',
  'Reusable setup': 'تجهيز قابل لإعادة الاستخدام',
  'Campus events': 'فعاليات جامعية',
  'High traffic': 'حضور كبير',
  'Easy staffing': 'تشغيل سهل للفريق',
  'Remote approval': 'اعتماد عن بعد',
  'Packed safely': 'تغليف آمن',
  'Idea description': 'وصف الفكرة',
  'Where it runs + audience': 'مكان التشغيل والجمهور',
  'Game / booth / activation': 'لعبة / جناح / تفعيل',
  'Branding requirements': 'متطلبات الهوية',
  'Screens, sensors, lights, sound': 'شاشات، حساسات، إضاءة، وصوت',
  'Size, quantity, event date': 'الحجم، الكمية، وتاريخ الفعالية',
  'Delivery or shipping destination': 'وجهة التسليم أو الشحن',
  'Reference images or sketches': 'صور مرجعية أو رسومات',
  'Build pipeline': 'مسار التنفيذ',
  'Eventies Lab': 'مختبر Eventies',
  'Builds coming soon': 'سيتم إضافة المشاريع قريبا',
  'Have a project in mind? Start the conversation.': 'لديك مشروع في ذهنك؟ ابدأ المحادثة.',
  FULLSCREEN: 'ملء الشاشة',
  'reviewed before pricing': 'تتم مراجعته قبل التسعير',
  'Who we build for': 'لمن ننفذ',
  'Built around the audience, space, and delivery.': 'يتم تصميمه حول الجمهور والمساحة وطريقة التسليم.',
  'Send Your Idea': 'أرسل فكرتك',
  'Intake checklist': 'قائمة معلومات الطلب',
  'INTL SHIPPING · COST & TIMELINE CONFIRMED AFTER SIZE / DESTINATION / CUSTOMS REVIEW':
    'شحن دولي · يتم تأكيد التكلفة والمدة بعد مراجعة الحجم والوجهة والجمارك',
  'Amman → Worldwide': 'عمّان ← إلى العالم',
  'Open a build ticket': 'افتح طلب تنفيذ',
  'Have an idea for a custom build?': 'لديك فكرة لتنفيذ مخصص؟',
  "Send a concept, sketch, or event goal and we'll review how to bring it to life.":
    'أرسل الفكرة أو الرسم أو هدف الفعالية وسنراجع كيفية تحويلها إلى تجربة حقيقية.',

  // Gallery
  'Event Gallery - Jordan': 'معرض الفعاليات - الأردن',
  'Live event work': 'أعمال فعاليات حقيقية',
  'Fresh albums': 'ألبومات جديدة',
  'Photos from real Eventies setups': 'صور من تجهيزات Eventies الحقيقية',
  Activations: 'تفعيلات',
  'Event moments': 'لحظات الفعاليات',
  Moments: 'لحظات',
  'Real events, real': 'فعاليات حقيقية، وتجهيزات',
  setups: 'حقيقية',
  Setups: 'تجهيزات',
  'Gallery albums': 'ألبومات المعرض',
  'This album has no photos yet.': 'لا يحتوي هذا الألبوم على صور بعد.',

  // Contact page
  'Get in touch - Eventies': 'تواصل مع Eventies',
  'Plan your event with the right': 'خطط لفعاليتك مع',
  'Eventies team': 'فريق Eventies',
  'Have a question about rental requests, purchase quote requests, custom builds, availability, or provider partnerships? Send the right inquiry and the Eventies team will review the details and follow up with you.': 'هل لديك سؤال عن طلبات التأجير أو طلبات عرض سعر الشراء أو التنفيذات المخصصة أو التوفر أو شراكات المزودين؟ أرسل الاستفسار المناسب وسيراجع فريق Eventies التفاصيل ويتابع معك.',
  'Email Main Team': 'مراسلة الفريق الرئيسي',
  'Contact paths': 'مسارات التواصل',
  'The first step is not just sending a message. It is sending it to the team that can review your event, support, or provider request fastest.':
    'الخطوة الأولى ليست مجرد إرسال رسالة، بل إرسالها إلى الفريق الأنسب لمراجعة طلب الفعالية أو الدعم أو المزود بأسرع طريقة.',
  'For anything that does not fit a specific team, start with the main Eventies inbox.':
    'لأي موضوع لا يندرج تحت فريق محدد، ابدأ من البريد الرئيسي لـ Eventies.',
  'Email Support': 'مراسلة الدعم',
  'For account help, request status, and platform questions.': 'لمساعدة الحساب، وحالة الطلب، وأسئلة المنصة.',
  'Contact Provider Team': 'تواصل مع فريق المزودين',
  'For service providers who want to showcase services or discuss partnership opportunities.':
    'لمزودي الخدمات الذين يريدون عرض خدماتهم أو مناقشة فرص الشراكة.',
  'General questions': 'أسئلة عامة',
  'Company inquiries': 'استفسارات الشركات',
  'New opportunities': 'فرص جديدة',
  'Request routing help': 'مساعدة في توجيه الطلب',
  'Anything unsure': 'أي موضوع غير واضح',
  'Rental requests': 'طلبات التأجير',
  'Purchase quote requests': 'طلبات عرض سعر الشراء',
  'Custom builds': 'تنفيذ مخصص',
  'Event setup questions': 'أسئلة تجهيز الفعالية',
  'Account questions': 'أسئلة الحساب',
  'Request follow-up': 'متابعة الطلب',
  'Website support': 'دعم الموقع',
  'General help': 'مساعدة عامة',
  'Profile or tracking issues': 'مشاكل الملف أو التتبع',
  'Provider onboarding': 'انضمام مزود خدمة',
  'Vendor inquiries': 'استفسارات المزودين',
  'Service listing interest': 'الرغبة في إضافة خدمة',
  'Marketplace growth': 'تطوير السوق',
  'Chat with the team': 'تحدث مع الفريق',
  Location: 'الموقع',
  'Amman, Jordan': 'عمّان، الأردن',
  Response: 'الرد',
  'Usually within 1 business day': 'عادة خلال يوم عمل واحد',
  'Send a detailed inquiry': 'أرسل استفسارا مفصلا',
  'Tell us what you are planning so we can route your message to the right team.':
    'أخبرنا بما تخطط له حتى نوجه رسالتك إلى الفريق المناسب.',
  'What should I include in my message?': 'ماذا يجب أن أضع في رسالتي؟',
  'The more details you provide, the easier it is for the team to review your request accurately.':
    'كلما زادت التفاصيل، أصبح من الأسهل على الفريق مراجعة طلبك بدقة.',
  'Event date or expected date range': 'تاريخ الفعالية أو المدة المتوقعة',
  'City and venue if available': 'المدينة والموقع إن توفر',
  'Event type and audience size': 'نوع الفعالية وحجم الجمهور',
  'Rental duration or setup time': 'مدة التأجير أو وقت التجهيز',
  'Delivery / setup notes': 'ملاحظات التسليم أو التجهيز',
  'Budget range if you want quote guidance': 'نطاق الميزانية إذا أردت توجيها للتسعير',
  'Any special requirements or custom ideas': 'أي متطلبات خاصة أو أفكار مخصصة',
  'Prefer email? Reach the main Eventies inbox directly at': 'تفضل البريد الإلكتروني؟ تواصل مباشرة مع بريد Eventies الرئيسي على',
  'After you reach out': 'بعد التواصل معنا',
  'What happens after you contact us?': 'ماذا يحدث بعد التواصل معنا؟',
  'A clear, reviewed path from your first message to confirmed next steps.':
    'مسار واضح ومراجع من رسالتك الأولى إلى الخطوات التالية المؤكدة.',
  'We review your message': 'نراجع رسالتك',
  'The team checks your inquiry type, event details, and requested services, rentals, or custom builds.':
    'يتحقق الفريق من نوع الاستفسار، وتفاصيل الفعالية، والخدمات أو التأجيرات أو التنفيذ المخصص المطلوب.',
  'We clarify requirements': 'نوضح المتطلبات',
  'If needed, we follow up for missing details like date, quantity, location, or setup needs.':
    'عند الحاجة، نتابع معك للحصول على تفاصيل ناقصة مثل التاريخ، الكمية، الموقع، أو متطلبات التجهيز.',
  'We check availability or request needs': 'نفحص التوفر أو متطلبات الطلب',
  'Rental services may require availability review, while custom builds may require pricing and scope review.':
    'قد تحتاج خدمات التأجير إلى مراجعة التوفر، بينما يحتاج التنفيذ المخصص إلى مراجعة السعر والنطاق.',
  'We confirm next steps': 'نؤكد الخطوات التالية',
  'You receive follow-up with the available options, request guidance, or provider onboarding direction.':
    'يصلك رد بالخيارات المتاحة، أو إرشاد الطلب، أو خطوات انضمام المزود.',
  'A contact inquiry is not a confirmed request.': 'الاستفسار عبر صفحة التواصل ليس طلبا مؤكدا.',
  'Final confirmation depends on availability, logistics, pricing, and team review.':
    'يعتمد التأكيد النهائي على التوفر، واللوجستيات، والتسعير، ومراجعة الفريق.',
  'Which channel to use, what to include, and what to expect after you send a message.':
    'أي قناة تستخدم، وما المعلومات المطلوبة، وما المتوقع بعد إرسال الرسالة.',
  'Ready to send your event details?': 'جاهز لإرسال تفاصيل فعاليتك؟',
  'Choose the right contact path or send one clear inquiry with your event date,': 'اختر مسار التواصل المناسب أو أرسل استفسارا واضحا يتضمن تاريخ الفعالية،',
  'location, and setup needs.': 'الموقع، واحتياجات التجهيز.',
  'Provider Inquiry': 'استفسار مزود خدمة',
  'Which email should I use?': 'أي بريد إلكتروني أستخدم؟',
  'Use info@eventiesjo.com for general questions. Use booking@eventiesjo.com for rental requests, purchase quote requests, custom builds, and event setup questions. Use support@eventiesjo.com for account help, request follow-up, or platform support. Use vendors@eventiesjo.com for providers and partnerships.': 'استخدم info@eventiesjo.com للأسئلة العامة. استخدم booking@eventiesjo.com لطلبات التأجير وطلبات عرض سعر الشراء والتنفيذات المخصصة وأسئلة تجهيز الفعاليات. استخدم support@eventiesjo.com للمساعدة بالحساب أو متابعة الطلب أو دعم المنصة. استخدم vendors@eventiesjo.com للمزوّدين والشراكات.',
  'Is sending the contact form the same as confirming a request?': 'هل إرسال نموذج التواصل يعني تأكيد الطلب؟',
  'No. Sending the form starts the review process. The Eventies team checks your event details, requested services, availability, logistics, and pricing requirements before final confirmation.':
    'لا. إرسال النموذج يبدأ عملية المراجعة. يتحقق فريق Eventies من تفاصيل الفعالية والخدمات المطلوبة والتوفر واللوجستيات ومتطلبات التسعير قبل التأكيد النهائي.',
  'What details help you respond faster?': 'ما التفاصيل التي تساعدكم على الرد أسرع؟',
  'Include your event date, city, venue, event type, expected audience size, services, rentals, or custom builds you are interested in, rental duration, and any setup notes. Clear details help the team review your request more accurately.':
    'اذكر تاريخ الفعالية، المدينة، الموقع، نوع الفعالية، حجم الجمهور المتوقع، الخدمات أو التأجيرات أو التنفيذ المخصص المطلوب، مدة التأجير، وأي ملاحظات تجهيز. التفاصيل الواضحة تساعد الفريق على مراجعة طلبك بدقة أكبر.',
  'Can I ask about a service even if I am not ready to request it?': 'هل يمكنني السؤال عن خدمة حتى لو لم أكن جاهزا لإرسال طلب؟',
  'Yes. You can ask about service details, availability, event suitability, or pricing requirements before submitting a full request.':
    'نعم. يمكنك السؤال عن تفاصيل الخدمة أو التوفر أو مدى مناسبتها للفعالية أو متطلبات التسعير قبل إرسال طلب كامل.',
  'Can I request a custom event setup?': 'هل يمكنني طلب تجهيز فعالية مخصص؟',
  'Yes. If your event needs a custom combination of rentals, services, booths, screens, games, or production support, submit a request with your event details and the team will review the available options.':
    'نعم. إذا كانت فعاليتك تحتاج مزيجا مخصصا من التأجير أو الخدمات أو الأجنحة أو الشاشات أو الألعاب أو دعم الإنتاج، أرسل طلبا بتفاصيل الفعالية وسيقوم الفريق بمراجعة الخيارات المتاحة.',
  'Why do some services need quote review?': 'لماذا تحتاج بعض الخدمات إلى مراجعة سعر؟',
  'Some services depend on event size, location, setup complexity, staffing, transport, duration, and technical requirements. Quote review helps avoid inaccurate pricing and gives you a more realistic response.':
    'تعتمد بعض الخدمات على حجم الفعالية، الموقع، تعقيد التجهيز، الطاقم، النقل، المدة، والمتطلبات التقنية. مراجعة السعر تساعد على تجنب التسعير غير الدقيق وتقديم رد أكثر واقعية.',
  'Can companies contact Eventies for activations or exhibitions?': 'هل يمكن للشركات التواصل مع Eventies للتفعيلات أو المعارض؟',
  'Yes. Companies can contact Eventies for activations, exhibition booths, branded experiences, entertainment zones, LED screens, games, and event equipment.':
    'نعم. يمكن للشركات التواصل مع Eventies للتفعيلات، أجنحة المعارض، التجارب بعلامة تجارية، مناطق الترفيه، شاشات LED، الألعاب، ومعدات الفعاليات.',
  'Can providers join Eventies?': 'هل يمكن لمزودي الخدمات الانضمام إلى Eventies؟',
  'Eventies is building a marketplace for event service providers. Providers can contact vendors@eventiesjo.com to discuss service listings, onboarding, or partnership opportunities.':
    'تعمل Eventies على بناء سوق لمزودي خدمات الفعاليات. يمكن للمزودين التواصل عبر vendors@eventiesjo.com لمناقشة إضافة الخدمات أو الانضمام أو فرص الشراكة.',
  'Do you support events outside Amman?': 'هل تدعمون الفعاليات خارج عمّان؟',
  'Eventies is based in Jordan and can review requests based on event location, provider availability, logistics, and setup requirements. Include your city and venue in the inquiry so the team can check the best next step.':
    'Eventies مقرها في الأردن ويمكنها مراجعة الطلبات حسب موقع الفعالية، توفر المزودين، اللوجستيات، ومتطلبات التجهيز. اذكر المدينة والموقع في الاستفسار حتى يحدد الفريق أفضل خطوة تالية.',
  'How fast will the team respond?': 'ما سرعة رد الفريق؟',

  // Categories / Services / gallery helpers
  'No partners match this filter': 'لا يوجد شركاء يطابقون هذا الفلتر',
  'Try selecting a different category.': 'جرّب اختيار فئة مختلفة.',
  'Clear filters': 'مسح الفلاتر',
  'Clear search': 'مسح البحث',
  'No categories match': 'لا توجد فئات تطابق',
  'Gallery highlight': 'لقطة من المعرض',
  'Submit Your Rental Request': 'إرسال طلب التأجير',
  'Pick dates': 'اختر التواريخ',
  'Checking…': 'جار التحقق…',
  'Decrease quantity': 'تقليل الكمية',
  'Increase quantity': 'زيادة الكمية',
  'Start date': 'تاريخ البداية',
  'End date': 'تاريخ النهاية',
  ITEMS: 'الخدمات',
  'Request draft services': 'خدمات مسودة الطلب',
  'Adjust quantities or remove services. Each item can carry its own note.':
    'عدّل الكميات أو أزل الخدمات. يمكن لكل خدمة أن تحتوي على ملاحظة خاصة.',
  'Contact details': 'بيانات التواصل',
  'Tell us who to contact about this request.': 'أخبرنا من نتواصل معه بخصوص هذا الطلب.',
  'Request details': 'تفاصيل الطلب',
  'Share delivery, setup, and event notes.': 'شارك ملاحظات التسليم والتجهيز والفعالية.',
  'Please complete your contact details.': 'يرجى إكمال بيانات التواصل.',
  'City and address are required.': 'المدينة والعنوان مطلوبان.',
  'One or more services are missing a valid id.': 'خدمة واحدة أو أكثر لا تحتوي على رقم صحيح.',
  'Purchase quote request submitted successfully.': 'تم إرسال طلب عرض سعر الشراء بنجاح.',
  'Could not submit purchase quote request.': 'تعذر إرسال طلب عرض سعر الشراء.',
  'Sign in to submit your purchase quote request': 'سجّل الدخول لإرسال طلب عرض سعر الشراء',
  'You need to sign in before we can submit this purchase quote request. Your selected services will stay saved on this device.': 'يجب تسجيل الدخول قبل أن نتمكن من إرسال طلب عرض سعر الشراء. ستبقى الخدمات المحددة محفوظة على هذا الجهاز.',
  'Sign in or create an account to submit this purchase quote request and track updates from My Requests later. Your request draft stays saved on this device.': 'سجّل الدخول أو أنشئ حسابًا لإرسال طلب عرض سعر الشراء ومتابعة التحديثات من طلباتي لاحقًا. تبقى مسودة الطلب محفوظة على هذا الجهاز.',
  'Back to Services': 'العودة إلى الخدمات',
  'Sign in to continue': 'سجل الدخول للمتابعة',
  'Please sign in first. Your purchase quote request draft will stay saved and you will return here right after login.': 'يرجى تسجيل الدخول أولًا. ستبقى مسودة طلب عرض سعر الشراء محفوظة وستعود إلى هنا بعد تسجيل الدخول مباشرة.',
  'Go to Login': 'الذهاب لتسجيل الدخول',
  'Review your selected services, fine-tune quantities, and send the request to the':
    'راجع الخدمات المختارة، وعدّل الكميات، وأرسل الطلب إلى',
  'Eventies team. This draft is saved locally on this device until you submit it.':
    'فريق Eventies. يتم حفظ هذه المسودة محليا على هذا الجهاز حتى إرسالها.',
  'You have no requests yet': 'ليس لديك طلبات بعد',
  'Loading request details...': 'جار تحميل تفاصيل الطلب...',
  'Rental Request Submitted': 'تم إرسال طلب التأجير',
  Created: 'تم الإنشاء',
  Security: 'الأمان',
  'Profile settings': 'إعدادات الملف الشخصي',
  'Profile unavailable': 'الملف الشخصي غير متاح',
  'Update your personal details and manage your account.': 'حدّث بياناتك الشخصية وأدر حسابك.',
  'Sign in to manage your profile details and account security.': 'سجل الدخول لإدارة بيانات ملفك وأمان حسابك.',
  'Loading profile': 'جار تحميل الملف الشخصي',
  'Fetching your latest account details.': 'جار جلب أحدث بيانات حسابك.',
  'We couldn’t load your account details right now. Try refreshing the page or head back home.':
    'تعذر تحميل بيانات حسابك حاليا. جرّب تحديث الصفحة أو العودة إلى الرئيسية.',
  'We couldn\'t load your account details right now. Try refreshing the page or head back home.':
    'تعذر تحميل بيانات حسابك حاليا. جرّب تحديث الصفحة أو العودة إلى الرئيسية.',
  'Back to home': 'العودة إلى الرئيسية',
  'Full name': 'الاسم الكامل',
  'Phone number': 'رقم الهاتف',
  'Save changes': 'حفظ التعديلات',
  'Reset password': 'إعادة تعيين كلمة المرور',
  'Enter your name before saving your profile.': 'أدخل اسمك قبل حفظ الملف الشخصي.',
  'Your profile is already up to date.': 'ملفك الشخصي محدث بالفعل.',
  'Profile updated successfully.': 'تم تحديث الملف الشخصي بنجاح.',
  'Profile updated': 'تم تحديث الملف الشخصي',
  'Add an email address to your account before requesting a password reset.': 'أضف بريدا إلكترونيا لحسابك قبل طلب إعادة تعيين كلمة المرور.',
  'Password reset email sent. Check your inbox.': 'تم إرسال بريد إعادة تعيين كلمة المرور. تحقق من بريدك.',
  'Failed to send reset email': 'تعذر إرسال بريد إعادة التعيين',
  'Verifying reset link...': 'جار التحقق من رابط إعادة التعيين...',
  'New Password': 'كلمة المرور الجديدة',
  'Confirm Password': 'تأكيد كلمة المرور',

  // Home supporting sections
  'Built for every occasion': 'مصمم لكل مناسبة',
  'Plan by event type': 'خطط حسب نوع الفعالية',
  "However you gather people, there's a way to make it memorable. Start from the kind of event you're planning.":
    'مهما كانت طريقة جمع الناس، توجد طريقة لجعل التجربة مميزة. ابدأ من نوع الفعالية التي تخطط لها.',
  'Corporate Activations': 'تفعيلات الشركات',
  'Engaging brand moments and interactive experiences for company events.': 'لحظات تفاعل وتجارب تفاعلية لفعاليات الشركات.',
  'Exhibitions & Expos': 'معارض وإكسبو',
  'Stand-out displays and production for fairs and trade shows.': 'عروض وتجهيزات إنتاجية مميزة للمعارض التجارية.',
  'University & Campus': 'الجامعات والحرم الجامعي',
  'Energetic experiences built for student audiences.': 'تجارب حيوية مصممة للجمهور الطلابي.',
  'Festivals & Public Events': 'المهرجانات والفعاليات العامة',
  'Crowd-ready displays, production, and activations at scale.': 'عروض وإنتاج وتفعيلات جاهزة للجمهور الكبير.',
  'Private Events': 'فعاليات خاصة',
  'Memorable touches for celebrations and gatherings.': 'لمسات مميزة للاحتفالات والتجمعات.',
  'Brand Launches': 'إطلاق العلامات التجارية',
  'Choose how you want to get started': 'اختر كيف تريد أن تبدأ',
  "Whether you're planning an event or offering services, Eventies keeps the next step simple.":
    'سواء كنت تخطط لفعالية أو تقدم خدمات، يجعل Eventies الخطوة التالية بسيطة.',
  'Get Started': 'ابدأ الآن',
  'List your services for free': 'أضف خدماتك مجانا',
  'Manage availability and requests': 'أدر التوفر والطلبات',
  'Receive qualified event requests': 'استقبل طلبات فعاليات مؤهلة',
  'Prepare a venue-ready custom setup': 'حضّر تجهيزا مخصصا جاهزا للموقع',
  'Prototype the interaction and flow': 'جهز نموذجا أوليا للتفاعل والمسار',
  'Share the concept and use case': 'شارك الفكرة وحالة الاستخدام',
  'Brands, schools, venues, and organizations that trust Eventies for memorable event experiences.':
    'علامات تجارية ومدارس ومواقع ومنظمات تثق بـ Eventies لتجارب فعاليات مميزة.',
  'Our Clients': 'عملاؤنا',
  'Our clients': 'عملاؤنا',
  'Our partners and customers': 'شركاؤنا وعملاؤنا',

  'View full gallery': 'عرض المعرض كاملاً',
  'Event Inspiration Gallery': 'معرض إلهام الفعاليات',
  'Explore setups, service showcases, and event ideas to shape your next experience.':
    'استكشف التجهيزات وعروض الخدمات وأفكار الفعاليات لتشكيل تجربتك القادمة.',
  'Are you an event service provider?': 'هل أنت مزوّد خدمات فعاليات؟',
  'Join as a Provider': 'انضم كمزوّد خدمات',
  'Need a custom service built for your event?': 'هل تحتاج خدمة مخصصة لفعاليتك؟',
  'Turn a special activation, game, booth, or physical-digital idea into a working event setup.':
    'حوّل تفعيلًا خاصًا أو لعبة أو بوثًا أو فكرة رقمية-مادية إلى تجهيز فعلي جاهز للفعالية.',
  'Ready when you are': 'جاهزون عندما تكون مستعدًا',
  'Plan your next event with us.': 'خطط فعاليتك القادمة معنا.',
  "Browse services, check availability, and send a single request — we'll help bring it all together.":
    'تصفح الخدمات، وتحقق من التوفر، وأرسل طلبًا واحدًا — وسنساعدك في جمع كل التفاصيل.',
  'For Providers': 'لمزوّدي الخدمات',
  'Custom Service Build': 'تنفيذ خدمة مخصصة',
  'Start a Custom Build': 'ابدأ تنفيذًا مخصصًا',
  'Filter the catalog by category, compare the available options, and open any service to request the setup that fits your event.':
    'صفِّ الكتالوج حسب الفئة، قارن الخيارات المتاحة، وافتح أي خدمة لطلب التجهيز المناسب لفعاليتك.',
  'Filter the catalog by category, compare the available options, and open any service to rent it or request a purchase quote for review.':
    'صفِّ الكتالوج حسب الفئة، وقارن الخيارات المتاحة، وافتح أي خدمة لتأجيرها أو لطلب عرض سعر للشراء للمراجعة.',
  "Who it's for": 'لمن هذا',
  'Built for events': 'مصمم للفعاليات',
  'Not a generic catalog with event items inside.': 'ليس كتالوجًا عامًا أضيفت إليه عناصر فعاليات.',
  'Eventies is shaped around rental timing, request review, local behavior, and provider coordination from the start.':
    'تم تصميم Eventies منذ البداية حول توقيت التأجير ومراجعة الطلبات وطبيعة السوق المحلي والتنسيق مع مزوّدي الخدمات.',
  'What to send us': 'ماذا ترسل لنا',
  'Venue': 'الموقع',
  'Directory': 'الدليل',
  'Find the right category': 'اعثر على الفئة المناسبة',
  'All Services': 'كل الخدمات',
  "Can't find what you need?": 'لم تجد ما تحتاجه؟',
  "Browse the full catalog or send us a request and we'll help.": 'تصفح الكتالوج الكامل أو أرسل لنا طلبًا وسنساعدك.',
  'Request a quote': 'اطلب عرض سعر',
  'A smarter way to prepare events in Jordan.': 'طريقة أذكى لتجهيز الفعاليات في الأردن.',
  'Pick the channel that matches your request so the right Eventies team sees it first.':
    'اختر قناة التواصل المناسبة لطلبك حتى يصل مباشرة إلى الفريق الصحيح في Eventies.',
  'Routing': 'توجيه',
  'Routing desk': 'مكتب توجيه الطلبات',
  'Before Eventies': 'قبل Eventies',
  'Scattered planning becomes one reviewed request.': 'التخطيط المتفرق يتحول إلى طلب واحد تتم مراجعته.',
  'Eventies connects discovery, comparison, availability, and follow-up into a cleaner path for customers and the team.':
    'يربط Eventies بين الاكتشاف والمقارنة والتوفر والمتابعة ضمن مسار أوضح للعميل والفريق.',
  'Our Work': 'أعمالنا',
  'Built, tested, event-ready': 'مصمم ومختبر وجاهز للفعالية',
  'Preview a build, switch photos, then pick the next project from the list beside it.':
    'استعرض تنفيذًا، بدّل الصور، ثم اختر المشروع التالي من القائمة الجانبية.',
  'Lab workflow': 'مسار المختبر',
  'Design / Engineer / Test': 'تصميم / هندسة / اختبار',
  'Prototype ready': 'النموذج الأولي جاهز',
  'Custom requests are reviewed before pricing. Final pricing depends on complexity, materials, timeline, branding, technology, quantity, and shipping.':
    'تتم مراجعة طلبات التنفيذ المخصص قبل التسعير. يعتمد السعر النهائي على التعقيد والمواد والمدة والهوية والتقنية والكمية والشحن.',
  'Want your brand on this wall?': 'هل تريد ظهور علامتك هنا؟',
  'Join the brands that trust Eventies for their event experiences across the region.':
    'انضم إلى العلامات التي تثق بـ Eventies لتجارب فعالياتها في المنطقة.',
  'Become a partner': 'انضم كشريك',
  'See our work': 'شاهد أعمالنا',
  'Browse Partners': 'تصفح الشركاء',
  'Trusted by leading brands and teams.': 'موثوق من علامات تجارية وفرق رائدة.',
  'Partner Network - Jordan': 'شبكة الشركاء - الأردن',
  'Corporate': 'شركات',
  'Education': 'تعليم',
  'Healthcare': 'رعاية صحية',
  'Sports': 'رياضة',
  'Events': 'فعاليات',
  'F&B': 'مطاعم ومشروبات',
  'Hospitality': 'ضيافة',
  'Retail': 'تجزئة',
  'Entertainment': 'ترفيه',
  'Telecom': 'اتصالات',
  'University': 'جامعات',
  'Schools': 'مدارس',
  'Malls': 'مولات',
  'Hospitals': 'مستشفيات',
  'Food': 'مطاعم',
  'All': 'الكل',
  'Popular': 'رائج',
  'Category Collection': 'مجموعة الفئة',
  '// Category Collection': 'مجموعة الفئة',
  'Back to all services': 'العودة إلى كل الخدمات',
  'Service count': 'عدد الخدمات',
  'service in this category': 'خدمة في هذه الفئة',
  'services in this category': 'خدمات في هذه الفئة',
  'total services': 'إجمالي الخدمات',
  'in this category': 'في هذه الفئة',
  'Service category': 'فئة الخدمة',
  'Service Catalog': 'كتالوج الخدمات',
  'Categories': 'الفئات',
  'Services': 'الخدمات',

  // FAQ / search / miscellaneous
  'Still have a question?': 'لا يزال لديك سؤال؟',
  'How does Eventies work?': 'كيف يعمل Eventies؟',
  'Browse service categories, add what you need to a single request, and send it with your event dates. Providers respond with availability and pricing, all tracked in one place.':
    'تصفح فئات الخدمات، أضف ما تحتاجه إلى طلب واحد، وأرسله مع تواريخ فعاليتك. يرد المزودون بالتوفر والتسعير مع متابعة كل شيء في مكان واحد.',
  'How do I check availability for my event date?': 'كيف أتحقق من التوفر لتاريخ فعالتي؟',
  'Add the services you want and submit a request with your event dates. Availability is reviewed for those exact dates before anything is confirmed.':
    'أضف الخدمات التي تريدها وأرسل طلبا بتواريخ الفعالية. تتم مراجعة التوفر لهذه التواريخ قبل أي تأكيد.',
  'Do you cover all of Jordan?': 'هل تغطون كل الأردن؟',
  'Yes. Our network of providers operates across Jordan, from Amman to events nationwide. Categories and coverage grow as more providers join.':
    'نعم. تعمل شبكة المزودين في مختلف مناطق الأردن، من عمّان إلى فعاليات في أنحاء المملكة. تتوسع الفئات والتغطية مع انضمام مزودين جدد.',
  "What's the difference between rentals and quotes?": 'ما الفرق بين التأجير وطلبات السعر؟',
  'Rental services can be added to your request draft with event dates. Custom services and purchase options are request-based, so the Eventies team reviews details before confirming pricing.':
    'يمكن إضافة خدمات التأجير إلى مسودة الطلب مع تواريخ الفعالية. أما الخدمات المخصصة وخيارات الشراء فهي مبنية على الطلب، لذلك يراجع فريق Eventies التفاصيل قبل تأكيد السعر.',
  'How can I list my services as a provider?': 'كيف أضيف خدماتي كمزود؟',
  'Use the provider request path, share your services, and start receiving qualified requests from event organizers. Listing is free and you manage your own availability.':
    'استخدم مسار طلب المزود، شارك خدماتك، وابدأ باستقبال طلبات مؤهلة من منظمي الفعاليات. الإضافة مجانية وأنت تدير التوفر الخاص بك.',
  'How do I get help or support?': 'كيف أحصل على المساعدة أو الدعم؟',
  'Reach our team anytime through the contact page or our support email. We can help with planning, requests, provider questions, and anything in between.':
    'تواصل مع فريقنا في أي وقت عبر صفحة التواصل أو بريد الدعم. يمكننا مساعدتك في التخطيط والطلبات وأسئلة المزودين وأي موضوع آخر.',
  'No results found': 'لا توجد نتائج',
  'Try a service name or a customer brand.': 'جرّب اسم خدمة أو اسم علامة تجارية.',
  'Close lightbox': 'إغلاق عارض الصور',
  'Next image': 'الصورة التالية',
  'Previous image': 'الصورة السابقة',
  'Close enlarged image': 'إغلاق الصورة المكبرة',
  'Enlarge image': 'تكبير الصورة',
  'Play video': 'تشغيل الفيديو',
  'Service media thumbnails': 'مصغرات وسائط الخدمة',
  'Next similar services': 'الخدمات المشابهة التالية',
  'Previous similar services': 'الخدمات المشابهة السابقة',
  'Similar services scroll row': 'صف تمرير الخدمات المشابهة',
  'the same category': 'نفس الفئة',
  'Review Pending': 'بانتظار المراجعة',
  'Insured equipment on eligible services': 'معدات مؤمنة للخدمات المؤهلة',
  'Setup and dismantling on eligible services': 'تركيب وفك للخدمات المؤهلة',
  'On-site staff confirmed after review': 'طاقم في الموقع بعد المراجعة',
  'Custom branding depends on service scope': 'الهوية المخصصة تعتمد على نطاق الخدمة',
  'Supports JPG, PNG, WebP and opens a framing step after upload': 'يدعم JPG و PNG و WebP ويفتح خطوة ضبط الإطار بعد الرفع',
  'Fill Frame': 'ملء الإطار',
  'Edge to edge': 'من الحافة إلى الحافة',
  'Fit Inside': 'احتواء داخل الإطار',
  'Show all': 'عرض الكل',
  Recenter: 'إعادة التوسيط',
  'Reset position': 'إعادة ضبط الموضع',
  Zoom: 'تكبير',
  Horizontal: 'أفقي',
  Vertical: 'عمودي',
  Background: 'الخلفية',
  'Bg Opacity': 'شفافية الخلفية',
  'Frame Tips': 'نصائح الإطار',
  Loading: 'جار التحميل',
  'Loading…': 'جار التحميل…',

  'Select an inquiry type': 'اختر نوع الاستفسار',
  'Select an event type': 'اختر نوع الفعالية',
  'General inquiry / no specific service': 'استفسار عام / بدون خدمة محددة',
  'No regions listed for this country': 'لا توجد مناطق مدرجة لهذه الدولة',
  'Address *': 'العنوان *',
  'City *': 'المدينة *',
  'Company Name': 'اسم الشركة',
  'Email *': 'البريد الإلكتروني *',
  'Event Name': 'اسم الفعالية',
  Notes: 'ملاحظات',
  'Phone *': 'الهاتف *',
  'Confirm *': 'تأكيد كلمة المرور *',
  'Password *': 'كلمة المرور *',
  'About Eventies | Event Rentals & Services Marketplace in Jordan': 'عن Eventies | سوق تأجير وخدمات الفعاليات في الأردن',
  'Learn how Eventies helps clients, organizers, companies, and providers discover rentals, activations, production support, custom builds, and trusted event services across Jordan.':
    'تعرف كيف يساعد Eventies العملاء والمنظمين والشركات والمزودين على اكتشاف التأجير والتفعيلات ودعم الإنتاج والتنفيذ المخصص وخدمات فعاليات موثوقة في الأردن.',
  'Planning an event often starts with scattered searches, Instagram pages, WhatsApp messages, referrals, and unclear availability. Eventies was created to make that process easier by turning discovery, comparison, and request submission into one organized flow.':
    'غالبا يبدأ التخطيط للفعالية ببحث مشتت بين إنستغرام وواتساب والترشيحات وتوفر غير واضح. تم إنشاء Eventies لتسهيل هذه العملية عبر تحويل الاكتشاف والمقارنة وإرسال الطلب إلى مسار واحد منظم.',
  'How requests, pricing, availability, and review work on Eventies.': 'كيف تعمل الطلبات والتسعير والتوفر والمراجعة على Eventies.',
  'Questions worth answering before you request': 'أسئلة مهمة قبل إرسال الطلب',
  'No. Sending a request means your event details are submitted for review. The Eventies team checks the selected services, dates, quantities, availability, logistics, and pricing requirements before final confirmation.':
    'لا. إرسال الطلب يعني أن تفاصيل فعاليتك أُرسلت للمراجعة. يتحقق فريق Eventies من الخدمات المختارة والتواريخ والكميات والتوفر واللوجستيات ومتطلبات التسعير قبل التأكيد النهائي.',
  'Rental availability depends on the selected dates, requested quantity, existing reservations, and available capacity. The system can help check availability, but final confirmation happens after review.':
    'يعتمد توفر التأجير على التواريخ المختارة والكمية المطلوبة والحجوزات الموجودة والسعة المتاحة. يمكن للنظام المساعدة في فحص التوفر، لكن التأكيد النهائي يتم بعد المراجعة.',
  'A rental request is usually for services or equipment needed for specific event dates and quantities. A purchase quote request is used when pricing depends on custom details, service scope, shipping, or production needs.': 'طلب التأجير يكون عادةً للخدمات أو المعدات المطلوبة لتواريخ وكميات محددة للفعالية. أما طلب عرض سعر الشراء فيُستخدم عندما يعتمد السعر على تفاصيل مخصصة أو نطاق الخدمة أو الشحن أو احتياجات الإنتاج.',
  'At this stage, Eventies focuses on discovery, request submission, availability review, and communication. Payment or deposit details can be handled after the request is reviewed and the next steps are confirmed.':
    'في هذه المرحلة يركز Eventies على الاكتشاف وإرسال الطلب ومراجعة التوفر والتواصل. يمكن معالجة تفاصيل الدفع أو العربون بعد مراجعة الطلب وتأكيد الخطوات التالية.',
  'Yes. Eventies is designed to help you build an organized request that can include multiple rentals, services, and event needs. This makes it easier to review the full setup instead of sending scattered messages.':
    'نعم. صُمم Eventies لمساعدتك على بناء طلب منظم يمكن أن يتضمن عدة تأجيرات وخدمات واحتياجات للفعالية. هذا يجعل مراجعة التجهيز الكامل أسهل بدلا من إرسال رسائل متفرقة.',
  'No. Eventies supports different event types, including corporate activations, exhibitions, university events, brand launches, private gatherings, entertainment zones, and public events.':
    'لا. يدعم Eventies أنواع فعاليات مختلفة، مثل تفعيلات الشركات، المعارض، فعاليات الجامعات، إطلاق العلامات التجارية، التجمعات الخاصة، مناطق الترفيه، والفعاليات العامة.',
  'Can service providers join Eventies?': 'هل يمكن لمزودي الخدمات الانضمام إلى Eventies؟',
  'Eventies is building a provider-focused marketplace experience. Providers who want to showcase services or discuss partnership opportunities can contact the provider team at vendors@eventiesjo.com.':
    'يبني Eventies تجربة سوق مخصصة لمزودي الخدمات. يمكن للمزودين الذين يريدون عرض خدماتهم أو مناقشة فرص الشراكة التواصل مع فريق المزودين عبر vendors@eventiesjo.com.',
  'Why is admin review needed before final confirmation?': 'لماذا نحتاج مراجعة الإدارة قبل التأكيد النهائي؟',
  'Talk to the right Eventies team': 'تحدث مع فريق Eventies المناسب',
  'Reach the channel that fits your need so we can help you faster.': 'اختر القناة المناسبة لاحتياجك حتى نساعدك بشكل أسرع.',
  'For main inbox questions, company inquiries, or help routing your message.': 'لأسئلة البريد الرئيسي أو استفسارات الشركات أو المساعدة في توجيه رسالتك.',
  'For rental requests, purchase quote requests, custom builds, and event setup questions.': 'لطلبات التأجير وطلبات عرض سعر الشراء والتنفيذات المخصصة وأسئلة تجهيز الفعاليات.',
  'For service providers, vendor onboarding, and partnership inquiries.': 'لمزودي الخدمات والانضمام والشراكات.',
  'Ask on WhatsApp': 'اسأل عبر واتساب',

  'Browse every event category.': 'تصفح كل فئات الفعاليات.',
  'Browse service categories': 'تصفح فئات الخدمات',
  'Search categories': 'ابحث في الفئات',
  'Search categories...': 'ابحث في الفئات...',
  'All categories': 'كل الفئات',
  'All services': 'كل الخدمات',
  'View Categories': 'عرض الفئات',
  'Start with the type of event service you need, then open a category to compare the available services and providers.':
    'ابدأ بنوع خدمة الفعالية التي تحتاجها، ثم افتح الفئة لمقارنة الخدمات والمزودين المتاحين.',
  'Browse every event service category on Eventies — interactive experiences, displays, production, activations and more, across Jordan.':
    'تصفح كل فئات خدمات الفعاليات على Eventies — تجارب تفاعلية، عروض، إنتاج، تفعيلات وأكثر في الأردن.',
  'The requested category could not be found.': 'تعذر العثور على الفئة المطلوبة.',
  'Category Not Found | Eventies': 'الفئة غير موجودة | Eventies',
  'Browse {categoryName} event services, rentals, and experiences in Jordan through Eventies.': 'تصفح خدمات وتأجيرات وتجارب {categoryName} للفعاليات في الأردن عبر Eventies.',

  'Complete your rental request and submit it for review.': 'أكمل طلب التأجير وأرسله للمراجعة.',
  'Could not submit rental request.': 'تعذر إرسال طلب التأجير.',
  'Rental request submitted successfully.': 'تم إرسال طلب التأجير بنجاح.',
  'Sign in to submit your rental request': 'سجل الدخول لإرسال طلب التأجير',
  'You need to sign in before we can submit this rental request. Your request draft will stay saved and you will return here after login.':
    'تحتاج إلى تسجيل الدخول قبل إرسال طلب التأجير. ستبقى مسودة الطلب محفوظة وستعود هنا بعد تسجيل الدخول.',
  'Service id is missing for': 'رقم الخدمة مفقود لـ',
  'day(s)': 'يوم/أيام',
  'Estimated total': 'المجموع التقديري',

  'Before you start a build': 'قبل أن تبدأ التنفيذ',
  'Built for the way your event moves': 'مصمم حسب طريقة حركة فعاليتك',
  'Every build is planned around the people using it, the place it runs, and the route it takes to launch.':
    'يتم التخطيط لكل تنفيذ حول الأشخاص الذين يستخدمونه، والمكان الذي يعمل فيه، والمسار المطلوب لإطلاقه.',
  'Four clear steps. Every custom request is reviewed before pricing and timeline confirmation.':
    'أربع خطوات واضحة. تتم مراجعة كل طلب مخصص قبل تأكيد السعر والمدة.',
  'From our Amman lab, builds are delivered locally and shipped worldwide after a logistics review.':
    'من مختبرنا في عمّان، يتم تسليم الأعمال محليا وشحنها عالميا بعد مراجعة لوجستية.',
  'Global reach': 'وصول عالمي',
  'Inspect Our Work': 'استعرض أعمالنا',
  'Knowledge base': 'قاعدة المعرفة',
  'Modules we design & build': 'وحدات نصممها وننفذها',
  'R&D Studio - Custom Builds': 'استوديو البحث والتطوير - تنفيذ مخصص',
  'Realistic Earth globe showing Eventies delivery and shipping reach': 'كرة أرضية تعرض نطاق التسليم والشحن لدى Eventies',
  'Custom Event Builds & Interactive Experiences | Eventies': 'تنفيذ فعاليات مخصص وتجارب تفاعلية | Eventies',
  'Eventies designs and builds custom interactive experiences, branded activations, games, software, hardware, and event-ready setups for local and international projects.':
    'تصمم Eventies وتنفذ تجارب تفاعلية مخصصة وتفعيلات بعلامات تجارية وألعابا وبرمجيات وهاردوير وتجهيزات جاهزة للفعاليات للمشاريع المحلية والدولية.',
  'Branded Activations': 'تفعيلات بعلامة تجارية',

  'Authentication is not configured': 'نظام المصادقة غير مهيأ',
  'Authentication mode': 'وضع المصادقة',
  'Check email': 'تحقق من بريدك',
  'Create your account to request rentals and plan your next event.': 'أنشئ حسابك لطلب التأجير والتخطيط لفعاليتك القادمة.',
  'Enter your email and password to access your Eventies account.': 'أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك في Eventies.',
  'Enter your password': 'أدخل كلمة المرور',
  'Event services showcase': 'عرض خدمات الفعاليات',
  'Google login failed': 'فشل تسجيل الدخول عبر Google',
  'Hide password': 'إخفاء كلمة المرور',
  'Login failed': 'فشل تسجيل الدخول',
  'Min 6 chars': '6 أحرف على الأقل',
  'Password must be at least 6 characters': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
  'Password updated successfully': 'تم تحديث كلمة المرور بنجاح',
  'Passwords do not match': 'كلمتا المرور غير متطابقتين',
  'Register failed': 'فشل إنشاء الحساب',
  'Repeat password': 'أعد كتابة كلمة المرور',
  'Show password': 'إظهار كلمة المرور',
  'Your full name': 'اسمك الكامل',
  'Email or password is incorrect. Please try again.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة. حاول مرة أخرى.',
  'An account with this email already exists. Try signing in.': 'يوجد حساب بهذا البريد مسبقا. جرّب تسجيل الدخول.',
  'Please confirm your email before signing in.': 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.',
  'Too many attempts. Please wait a moment and try again.': 'محاولات كثيرة. يرجى الانتظار قليلا ثم المحاولة مرة أخرى.',
  'Network error. Please check your connection and try again.': 'خطأ في الشبكة. تحقق من الاتصال وحاول مرة أخرى.',
  'Connecting...': 'جار الاتصال...',
  'Sign in with Google': 'تسجيل الدخول عبر Google',
  'Sign up with Google': 'إنشاء حساب عبر Google',

  'Reset Password': 'إعادة تعيين كلمة المرور',
  'Enter your email and we will send you a reset link.': 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
  'Send reset link': 'إرسال رابط إعادة التعيين',
  'Check Your Inbox': 'تحقق من بريدك',
  'Failed to send reset link': 'تعذر إرسال رابط إعادة التعيين',
  'Update Password': 'تحديث كلمة المرور',
  'At least 6 characters': '6 أحرف على الأقل',
  'Enter your new password below.': 'أدخل كلمة المرور الجديدة أدناه.',
  'Failed to update password': 'تعذر تحديث كلمة المرور',
  'Link Expired': 'انتهت صلاحية الرابط',
  'Password Updated': 'تم تحديث كلمة المرور',
  'Repeat your password': 'أعد كتابة كلمة المرور',
  'This reset link is invalid or expired': 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية',
  'You can now sign in with your new password.': 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',

  'Add an email address to use password reset.': 'أضف بريدا إلكترونيا لاستخدام إعادة تعيين كلمة المرور.',
  'Enter your full name': 'أدخل اسمك الكامل',
  'Enter your phone number': 'أدخل رقم هاتفك',
  'No email address on file': 'لا يوجد بريد إلكتروني محفوظ',
  'Save profile': 'حفظ الملف الشخصي',
  'Send password reset email': 'إرسال بريد إعادة تعيين كلمة المرور',
  'Failed to update profile': 'تعذر تحديث الملف الشخصي',

  'Send via Email': 'إرسال عبر البريد الإلكتروني',
  'Send via WhatsApp': 'إرسال عبر واتساب',
  'Event Request': 'طلب فعالية',
  'Event request:': 'طلب فعالية:',
  'Hello Eventies!': 'مرحبا Eventies!',
  'Tell us what you need, preferred date, location, expected number of guests, services, rentals, or custom builds you are interested in, and any setup notes.':
    'أخبرنا بما تحتاجه، التاريخ المفضل، الموقع، عدد الضيوف المتوقع، الخدمات أو التأجيرات أو التنفيذ المخصص المطلوب، وأي ملاحظات تجهيز.',
  'Rental request': 'طلب تأجير',
  'Purchase request': 'طلب شراء',
  'Service availability': 'توفر الخدمة',
  'Corporate event / activation': 'فعالية شركة / تفعيل',
  'Provider inquiry': 'استفسار مزود',
  'Support / request follow-up': 'دعم / متابعة طلب',
  'General question': 'سؤال عام',
  'Corporate activation': 'تفعيل شركة',
  'Exhibition / booth': 'معرض / جناح',
  'University event': 'فعالية جامعية',
  'Festival / public event': 'مهرجان / فعالية عامة',
  Other: 'أخرى',
  'Ajloun Governorate': 'محافظة عجلون',
  'Amman Governorate': 'محافظة عمّان',
  'Aqaba Governorate': 'محافظة العقبة',
  'Balqa Governorate': 'محافظة البلقاء',
  'Irbid Governorate': 'محافظة إربد',
  'Jerash Governorate': 'محافظة جرش',
  'Karak Governorate': 'محافظة الكرك',
  "Ma'an Governorate": 'محافظة معان',
  'Madaba Governorate': 'محافظة مادبا',
  'Mafraq Governorate': 'محافظة المفرق',
  'Tafilah Governorate': 'محافظة الطفيلة',
  'Zarqa Governorate': 'محافظة الزرقاء',
  optional: 'اختياري',
  or: 'أو',
  'A request is not an instant confirmation.': 'الطلب ليس تأكيدا فوريا.',
  'Eventies layer': 'طبقة Eventies',
  'Jordan events': 'فعاليات الأردن',
  'One message, right inbox.': 'رسالة واحدة، إلى الجهة المناسبة.',
  Organizes: 'ينظم',
  'control hub': 'مركز التحكم',
  'prepare events': 'تجهيز الفعاليات',

  // Extra Arabic coverage + IBM Plex Sans Arabic QA pass.
  "Service Catalog - Jordan": "كتالوج الخدمات - الأردن",
  "Service Catalog · Jordan": "كتالوج الخدمات - الأردن",
  "Explore Categories": "استكشف الفئات",
  "Discover event services and rentals for every kind of occasion.": "اكتشف خدمات وتأجيرات الفعاليات لكل أنواع المناسبات.",
  'Browse interactive games, screens, booths, production support, and event services from trusted providers across Jordan. Compare options and submit a rental or purchase quote request for review.': 'تصفح الألعاب التفاعلية والشاشات والبوثات ودعم الإنتاج وخدمات الفعاليات من مزوّدي خدمات موثوقين في الأردن. قارن الخيارات وأرسل طلب تأجير أو طلب عرض سعر للشراء للمراجعة.',
  "Discover": "اكتشف",
  "Shortlist": "اختر",
  "Request": "اطلب",
  "Review": "مراجعة",
  "Compare": "قارن",
  "Rentals": "تأجير",
  "Teams": "فرق",
  "Search pages": "البحث في الصفحات",
  "Check availability": "تحقق من التوفر",
  "Compare manually": "قارن يدويا",
  "About Eventies - Jordan": "عن Eventies - الأردن",
  "Why we built it": "لماذا بنيناه",
  "Why Eventies Exists": "لماذا يوجد Eventies",
  "Planning an event often starts with scattered searches, Instagram pages, WhatsApp messages, referrals, and unclear availability. Eventies was created to make that process easier by giving customers one place to discover event services and equipment, review details, and submit organized requests.": "غالبا يبدأ التخطيط للفعالية ببحث متفرق بين صفحات إنستغرام ورسائل واتساب والترشيحات وعدم وضوح التوفر. تم إنشاء Eventies لتسهيل هذه العملية من خلال مكان واحد لاكتشاف خدمات ومعدات الفعاليات، ومراجعة التفاصيل، وإرسال طلبات منظمة.",
  "Fragmented Search": "بحث متفرق",
  "Customers often search across different pages, contacts, and messages before finding what they need.": "غالبا يبحث العملاء بين صفحات وجهات اتصال ورسائل مختلفة قبل الوصول لما يحتاجونه.",
  "Unclear Availability": "توفر غير واضح",
  "Rental items and event equipment need date and quantity checks before confirmation.": "تحتاج خدمات التأجير ومعدات الفعاليات إلى فحص التاريخ والكمية قبل التأكيد.",
  "Hard Comparison": "مقارنة صعبة",
  "Without structured listings, it is difficult to compare options, details, and service types.": "بدون قوائم منظمة، تصبح مقارنة الخيارات والتفاصيل وأنواع الخدمات أصعب.",
  "Organized Requests": "طلبات منظمة",
  "Eventies turns scattered communication into a clearer request flow that can be reviewed and followed up.": "يحوّل Eventies التواصل المتفرق إلى مسار طلب أوضح يمكن مراجعته ومتابعته.",
  "Capabilities": "الإمكانات",
  "What You Can Do with Eventies": "ماذا يمكنك أن تفعل مع Eventies",
  "One marketplace that takes you from browsing to a reviewed, organized request.": "سوق واحد ينقلك من التصفح إلى طلب منظم تتم مراجعته.",
  "Browse Event Rentals": "تصفح تأجيرات الفعاليات",
  "Explore games, VR experiences, screens, booths, lighting, and event equipment by category.": "استكشف الألعاب وتجارب الواقع الافتراضي والشاشات والأجنحة والإضاءة ومعدات الفعاليات حسب الفئة.",
  "Compare Details": "قارن التفاصيل",
  "Review images, descriptions, pricing type, and service information before sending a request.": "راجع الصور والأوصاف ونوع التسعير ومعلومات الخدمة قبل إرسال الطلب.",
  "Request Rentals": "اطلب التأجير",
  "Add rental items, choose what your event needs, and send one organized request for review.": "أضف عناصر التأجير، واختر ما تحتاجه فعاليتك، وأرسل طلبا منظما للمراجعة.",
  "Submit Custom Requests": "أرسل طلبات مخصصة",
  'Send purchase quote requests, custom build ideas, or special setup needs for review.': 'أرسل طلبات عرض سعر الشراء أو أفكار التنفيذ المخصص أو احتياجات التجهيز الخاصة للمراجعة.',
  'Use your account to follow rental and purchase quote requests as they move through the review process.': 'استخدم حسابك لمتابعة طلبات التأجير وطلبات عرض سعر الشراء أثناء انتقالها عبر مسار المراجعة.',
  "Connect with the Team": "تواصل مع الفريق",
  "Use the right contact channel for support, event requests, or provider partnerships.": "استخدم قناة التواصل المناسبة للدعم أو طلبات الفعاليات أو شراكات المزودين.",
  "Audiences": "الفئات المستهدفة",
  "Built for different event needs": "مصمم لاحتياجات فعاليات مختلفة",
  "Whether you're planning one event or offering services, Eventies is designed around your role.": "سواء كنت تخطط لفعالية أو تقدم خدمات، تم تصميم Eventies حول دورك.",
  "Individuals": "الأفراد",
  "For private events, birthdays, gatherings, entertainment corners, and memorable experiences.": "للفعاليات الخاصة وأعياد الميلاد والتجمعات والزوايا الترفيهية والتجارب المميزة.",
  "Companies": "الشركات",
  "For activations, brand days, employee events, exhibitions, brand launches, and corporate setups.": "للتفعيلات وأيام العلامات التجارية وفعاليات الموظفين والمعارض وإطلاقات العلامات والتجهيزات المؤسسية.",
  "Organizers": "منظمو الفعاليات",
  "For teams that need to compare options, collect items into one request, and coordinate event needs.": "للفرق التي تحتاج إلى مقارنة الخيارات وجمع الخدمات في طلب واحد وتنسيق احتياجات الفعالية.",
  "For event service providers who want a more organized way to showcase services and receive qualified inquiries.": "لمزودي خدمات الفعاليات الذين يريدون طريقة أكثر تنظيما لعرض خدماتهم واستقبال طلبات مؤهلة.",
  "Process": "العملية",
  "How Eventies Works": "كيف يعمل Eventies",
  "From idea to reviewed request.": "من الفكرة إلى طلب تتم مراجعته.",
  "Browse event rentals, service categories, service details, media, and setup ideas.": "تصفح تأجيرات الفعاليات وفئات الخدمات وتفاصيلها والوسائط وأفكار التجهيز.",
  "Add useful services to your request and compare what fits your event.": "أضف الخدمات المناسبة إلى طلبك وقارن ما يلائم فعاليتك.",
  'Send a rental or purchase quote request with event details, dates, quantities, and notes.': 'أرسل طلب تأجير أو طلب عرض سعر للشراء مع تفاصيل الفعالية والتواريخ والكميات والملاحظات.',
  "The Eventies team reviews availability, logistics, request details, and next steps before final confirmation.": "يراجع فريق Eventies التوفر واللوجستيات وتفاصيل الطلب والخطوات التالية قبل التأكيد النهائي.",
  "Request flow": "مسار الطلب",
  "Reviewed flow": "مسار مراجعة",
  "The request is not an instant confirmation.": "الطلب ليس تأكيدا فوريا.",
  "It is reviewed first so availability, logistics, and pricing can be handled properly.": "تتم مراجعته أولا حتى يمكن التعامل مع التوفر واللوجستيات والتسعير بشكل صحيح.",
  "Why Eventies": "لماذا Eventies",
  "What Makes Eventies Different": "ما الذي يميز Eventies",
  "A marketplace shaped around how events are actually planned and delivered in Jordan.": "سوق مصمم حول الطريقة الفعلية لتخطيط وتنفيذ الفعاليات في الأردن.",
  "Event-Focused Marketplace": "سوق مخصص للفعاليات",
  "Eventies is built specifically around event rentals, services, equipment, and activations.": "تم بناء Eventies خصيصا حول تأجير وخدمات ومعدات وتفعيلات الفعاليات.",
  "Request-Based Workflows": "مسارات عمل مبنية على الطلب",
  "Some services can be requested as rentals, while custom services can be submitted for pricing and scope review.": "يمكن طلب بعض الخدمات كتأجير، بينما يتم إرسال الخدمات المخصصة لمراجعة التسعير والنطاق.",
  "Availability Awareness": "وعي بالتوفر",
  "Rental requests depend on dates, quantities, and active availability before confirmation.": "تعتمد طلبات التأجير على التواريخ والكميات والتوفر الفعلي قبل التأكيد.",
  "Jordan-Focused Experience": "تجربة موجهة للأردن",
  "Eventies is designed around the local event market, customer behavior, and communication needs in Jordan.": "تم تصميم Eventies حول سوق الفعاليات المحلي وسلوك العملاء واحتياجات التواصل في الأردن.",
  "Admin Review": "مراجعة الإدارة",
  "Requests are reviewed before final confirmation to reduce confusion and avoid unreliable commitments.": "تتم مراجعة الطلبات قبل التأكيد النهائي لتقليل الالتباس وتجنب الالتزامات غير الدقيقة.",
  "Provider Vision": "رؤية المزودين",
  "Eventies is building a more organized space for providers to showcase services and reach the right customers.": "يبني Eventies مساحة أكثر تنظيما للمزودين لعرض خدماتهم والوصول إلى العملاء المناسبين.",
  "Does submitting a request confirm the service?": "هل إرسال الطلب يؤكد الخدمة؟",
  "No. Sending a request means your event details are submitted for review. The Eventies team checks the selected services, dates, quantities, availability, logistics, and any pricing requirements before final confirmation.": "لا. إرسال الطلب يعني أن تفاصيل فعاليتك أُرسلت للمراجعة. يتحقق فريق Eventies من الخدمات المختارة والتواريخ والكميات والتوفر واللوجستيات وأي متطلبات تسعير قبل التأكيد النهائي.",
  'What is the difference between a rental request and a purchase quote request?': 'ما الفرق بين طلب التأجير وطلب عرض سعر الشراء؟',
  'A rental request is usually for services or equipment needed for specific event dates and quantities. A purchase quote request is used when pricing depends on custom details, service scope, setup complexity, shipping, or special event requirements.': 'طلب التأجير يكون عادةً للخدمات أو المعدات المطلوبة لتواريخ وكميات محددة للفعالية. أما طلب عرض سعر الشراء فيُستخدم عندما يعتمد السعر على تفاصيل مخصصة أو نطاق الخدمة أو تعقيد التجهيز أو الشحن أو متطلبات خاصة للفعالية.',
  "Can I request multiple services together?": "هل يمكنني طلب عدة خدمات معا؟",
  "Yes. Eventies is designed to help you build an organized request that can include multiple rentals, services, and event needs. This makes it easier to review the full setup instead of handling each item separately.": "نعم. تم تصميم Eventies لمساعدتك على بناء طلب منظم يمكن أن يشمل عدة تأجيرات وخدمات واحتياجات للفعالية. هذا يجعل مراجعة التجهيز الكامل أسهل بدلا من التعامل مع كل عنصر بشكل منفصل.",
  "How does availability checking work?": "كيف يتم فحص التوفر؟",
  "Rental availability depends on the selected dates, requested quantity, existing reservations, and available capacity. The system can help check availability, but final confirmation may still require team review to account for logistics and request details.": "يعتمد توفر التأجير على التواريخ المختارة والكمية المطلوبة والحجوزات الحالية والسعة المتاحة. يمكن للنظام المساعدة في فحص التوفر، لكن التأكيد النهائي قد يحتاج إلى مراجعة الفريق للوجستيات وتفاصيل الطلب.",
  "Events involve timing, setup requirements, delivery, availability, quantity, staffing, and sometimes custom pricing. Admin review helps make sure the request is realistic, accurate, and ready for proper follow-up before anything is confirmed.": "تشمل الفعاليات التوقيت ومتطلبات التجهيز والتسليم والتوفر والكمية والطاقم وأحيانا التسعير المخصص. تساعد مراجعة الإدارة على التأكد من أن الطلب واقعي ودقيق وجاهز للمتابعة المناسبة قبل أي تأكيد.",
  "Can Eventies help if I do not know exactly what I need?": "هل يمكن لـ Eventies مساعدتي إذا لم أكن أعرف ما أحتاجه بالضبط؟",
  "Yes. You can browse categories, explore services, and submit a request with your event idea. The team can review your request and help guide you toward suitable options.": "نعم. يمكنك تصفح الفئات واستكشاف الخدمات وإرسال طلب يتضمن فكرة فعاليتك. يمكن للفريق مراجعة طلبك وإرشادك نحو الخيارات المناسبة.",
  "Does Eventies handle online payment?": "هل يدعم Eventies الدفع الإلكتروني؟",
  "At this stage, Eventies focuses on discovery, request submission, availability review, and communication. Payment or deposit details can be handled after the request is reviewed and confirmed by the team.": "في هذه المرحلة، يركز Eventies على الاكتشاف وإرسال الطلب ومراجعة التوفر والتواصل. يمكن التعامل مع تفاصيل الدفع أو العربون بعد مراجعة الطلب وتأكيده من الفريق.",
  "Is Eventies only for private parties?": "هل Eventies مخصص للحفلات الخاصة فقط؟",
  "No. Eventies supports different event types, including corporate activations, exhibitions, university events, brand launches, private gatherings, entertainment zones, and public event setups.": "لا. يدعم Eventies أنواع فعاليات مختلفة تشمل تفعيلات الشركات والمعارض وفعاليات الجامعات وإطلاقات العلامات والتجمعات الخاصة ومناطق الترفيه والتجهيزات العامة.",
  "Can companies use Eventies for activations and exhibitions?": "هل يمكن للشركات استخدام Eventies للتفعيلات والمعارض؟",
  "Yes. Companies and organizers can use Eventies to explore booths, displays, screens, interactive experiences, and event services for activations, exhibitions, launches, and team events.": "نعم. يمكن للشركات والمنظمين استخدام Eventies لاستكشاف الأجنحة والعروض والشاشات والتجارب التفاعلية وخدمات الفعاليات للتفعيلات والمعارض والإطلاقات وفعاليات الفرق.",
  'For general questions or unsure requests, use info@eventiesjo.com. For support, use support@eventiesjo.com. For rental requests, purchase quote requests, custom builds, and event setup questions, use booking@eventiesjo.com. For providers, vendor onboarding, and partnerships, use vendors@eventiesjo.com.': 'للأسئلة العامة أو الطلبات غير الواضحة، استخدم info@eventiesjo.com. للدعم، استخدم support@eventiesjo.com. لطلبات التأجير وطلبات عرض سعر الشراء والتنفيذات المخصصة وأسئلة تجهيز الفعاليات، استخدم booking@eventiesjo.com. للمزوّدين والانضمام والشراكات، استخدم vendors@eventiesjo.com.',
  "What if I can’t find the service I need?": "ماذا لو لم أجد الخدمة التي أحتاجها؟",
  "What if I can't find the service I need?": "ماذا لو لم أجد الخدمة التي أحتاجها؟",
  "Do custom builds have fixed prices?": "هل للتنفيذ المخصص أسعار ثابتة؟",
  "No. Custom build requests are reviewed before pricing and timeline confirmation. Pricing depends on size, materials, technology, branding, complexity, quantity, and delivery or shipping.": "لا. تتم مراجعة طلبات التنفيذ المخصص قبل تأكيد السعر والجدول الزمني. يعتمد التسعير على الحجم والمواد والتقنية والهوية والتعقيد والكمية والتسليم أو الشحن.",
  "Can it include screens, sensors, lights, or scoring?": "هل يمكن أن يشمل شاشات أو حساسات أو إضاءة أو نظام نقاط؟",
  "Yes. Builds can combine structure, screens, controls, sensors, lighting, sound, or scoring systems depending on scope.": "نعم. يمكن أن يجمع التنفيذ بين الهيكل والشاشات وأنظمة التحكم والحساسات والإضاءة والصوت أو أنظمة النقاط حسب النطاق.",
  "Can you add our company branding?": "هل يمكن إضافة هوية شركتنا؟",
  "Yes. Colors, printed surfaces, graphics, signage, screens, and overall experience styling can be reviewed as part of the request.": "نعم. يمكن مراجعة الألوان والأسطح المطبوعة والرسومات واللافتات والشاشات وأسلوب التجربة بالكامل ضمن الطلب.",
  "Can you ship outside Jordan?": "هل يمكن الشحن خارج الأردن؟",
  "Yes, projects can be reviewed for international shipping based on size, weight, packaging, destination, customs, and timeline.": "نعم، يمكن مراجعة المشاريع للشحن الدولي بناء على الحجم والوزن والتغليف والوجهة والجمارك والجدول الزمني.",
  "How long does a build take?": "كم يستغرق التنفيذ؟",
  "It depends on scope. A simple customization is faster; a full game or booth needs design, fabrication, and testing. Timing is confirmed after review.": "يعتمد ذلك على النطاق. التخصيص البسيط أسرع، أما لعبة أو جناح كامل فيحتاج إلى تصميم وتصنيع واختبار. يتم تأكيد المدة بعد المراجعة.",
  "Can I rent the build instead of buying it?": "هل يمكن استئجار التنفيذ بدلا من شرائه؟",
  "Depends on the project. Some are made for purchase, others suit rental or repeated use. The team clarifies the model during review.": "يعتمد ذلك على المشروع. بعض الأعمال تُنفذ للشراء، وأخرى تناسب التأجير أو الاستخدام المتكرر. يوضح الفريق النموذج أثناء المراجعة.",
  "What happens after I send a request?": "ماذا يحدث بعد إرسال الطلب؟",
  "The team reviews the idea, asks for missing details, checks feasibility, defines scope, and follows up with the next step or pricing direction.": "يراجع الفريق الفكرة، ويطلب التفاصيل الناقصة، ويتحقق من إمكانية التنفيذ، ويحدد النطاق، ثم يتابع معك بالخطوة التالية أو اتجاه التسعير.",
  'For custom builds, ideas, and purchase quote requests, contact booking@eventiesjo.com. For supplier or production partnerships, contact vendors@eventiesjo.com.': 'للتنفيذات المخصصة والأفكار وطلبات عرض سعر الشراء، تواصل عبر booking@eventiesjo.com. ولشراكات الموردين أو الإنتاج، تواصل عبر vendors@eventiesjo.com.',
  "Local Delivery": "تسليم محلي",
  "Installed across Jordan.": "تركيب في مختلف مناطق الأردن.",
  "Regional Projects": "مشاريع إقليمية",
  "Events across the region.": "فعاليات في المنطقة.",
  "Packed & shipped worldwide.": "تغليف وشحن عالميا.",
  "Browse Eventies event albums": "تصفح ألبومات فعاليات Eventies",
  "Choose an album to view real photos from activations, setup moments, service showcases, and completed event work.": "اختر ألبوما لعرض صور حقيقية من التفعيلات ولحظات التجهيز وعروض الخدمات وأعمال الفعاليات المكتملة.",
  "Plan your event with the right Eventies team": "خطط لفعاليتك مع فريق Eventies المناسب",
  "Choose the route that matches your request": "اختر المسار المناسب لطلبك",
  "Useful questions before you contact us": "أسئلة مفيدة قبل التواصل معنا",

  // Final navbar, FAQ, and visible UI coverage.
  "Account": "الحساب",
  "My Account": "حسابي",
  "Menu": "القائمة",
  "User": "المستخدم",
  "Category": "فئة",
  "category": "فئة",
  "Service": "خدمة",
  "service": "خدمة",
  "services": "خدمات",
  "items": "عناصر",
  "Request draft": "مسودة الطلب",
  "FAQ": "الأسئلة الشائعة",
  "Questions?": "أسئلة؟",
  "Answered.": "إجابات واضحة.",
  "Everything you need to know about planning, requesting, and providing event services on Eventies.": "كل ما تحتاج معرفته عن التخطيط وإرسال الطلبات وتقديم خدمات الفعاليات على Eventies.",
  "Our team is happy to help you plan your next event.": "فريقنا جاهز لمساعدتك في التخطيط لفعاليتك القادمة.",
  "Contact us": "تواصل معنا",
  "Browse service categories, add what you need to a single request, and send it with your event dates. Providers respond with availability and pricing, all tracked from your account.": "تصفح فئات الخدمات، أضف ما تحتاجه في طلب واحد، وأرسله مع تواريخ فعاليتك. تتم مراجعة التوفر والتسعير ويمكنك متابعة كل شيء من حسابك.",
  "Rental services can be added to your request draft with event dates. Custom services and purchase options are request-based, so the Eventies team reviews details before pricing and next steps are confirmed.": "يمكن إضافة خدمات التأجير إلى مسودة الطلب مع تواريخ الفعالية. أما الخدمات المخصصة وخيارات الشراء فهي مبنية على الطلب، لذلك يراجع فريق Eventies التفاصيل قبل تأكيد التسعير والخطوات التالية.",
  "Provider": "مزود",
  "Providers": "مزودو الخدمات",
  "product": "خدمة",
  "Product": "خدمة",
  "products": "خدمات",
  "Products": "خدمات",
  "Email Eventies": "راسل Eventies",
  "Call Eventies": "اتصل بـ Eventies",
  "WhatsApp Eventies": "واتساب Eventies",
  "Amman Jordan": "عمّان، الأردن",
  "Response time": "وقت الاستجابة",
  "Partnerships": "شراكات",
  'Custom builds can be reviewed for rental, purchase, or international shipping depending on scope, size, materials, and timeline.': 'يمكن مراجعة التنفيذات المخصصة للتأجير أو الشراء أو الشحن الدولي حسب النطاق والحجم والمواد والجدول الزمني.',
  'Purchase quote request': 'طلب عرض سعر للشراء',
  'Purchase quote request draft': 'مسودة طلب عرض سعر للشراء',
  'Request a Purchase Quote': 'طلب عرض سعر للشراء',
  'Rent or Request a Quote': 'استأجر أو اطلب عرض سعر',
  'Available for rental or purchase quote': 'متاح للتأجير أو لطلب عرض سعر للشراء',
  'Submit a rental or purchase quote request': 'أرسل طلب تأجير أو طلب عرض سعر للشراء',
  'Rental and purchase quote requests are reviewed before confirmation': 'تتم مراجعة طلبات التأجير وطلبات عرض سعر الشراء قبل التأكيد',
  'Eligible services and custom builds can be quoted for purchase': 'يمكن طلب عرض سعر لشراء الخدمات والتنفيذات المخصصة المؤهلة',
  'Add this service to your purchase quote request draft. Drafts are saved locally on this device until you submit them, then they appear in My Requests.': 'أضف هذه الخدمة إلى مسودة طلب عرض سعر الشراء. تبقى المسودات محفوظة محليًا على هذا الجهاز حتى ترسلها، ثم تظهر في طلباتي.',
  'Review Purchase Quote Request': 'مراجعة طلب عرض سعر الشراء',
  'Save to Purchase Quote Draft': 'حفظ في مسودة عرض سعر الشراء',
  'Submit Rental Request': 'إرسال طلب التأجير',
  'Request pricing for eligible services, items, or custom builds you would like to purchase. The Eventies team reviews scope, availability, delivery or shipping, and final pricing before confirmation.': 'اطلب سعرًا للخدمات أو العناصر أو التنفيذات المخصصة المؤهلة التي ترغب بشرائها. يراجع فريق Eventies النطاق والتوفر والتسليم أو الشحن والسعر النهائي قبل التأكيد.',
  'Even a rough idea is enough ? the more you share, the faster we can review rental, purchase, shipping, and quote scope.': 'حتى الفكرة الأولية كافية — كلما شاركت تفاصيل أكثر، تمكنا من مراجعة التأجير أو الشراء أو الشحن ونطاق عرض السعر بشكل أسرع.',
  'For rental requests, purchase quote requests, custom builds, and event setup questions, contact booking@eventiesjo.com.': 'لطلبات التأجير وطلبات عرض سعر الشراء والتنفيذات المخصصة وأسئلة تجهيز الفعاليات، تواصل عبر booking@eventiesjo.com.',
  'Submitting this form starts a request review. The Eventies team reviews availability, pricing, scope, delivery or shipping, and next steps before confirmation.': 'إرسال هذا النموذج يبدأ مراجعة الطلب. يراجع فريق Eventies التوفر والتسعير والنطاق والتسليم أو الشحن والخطوات التالية قبل التأكيد.',
  'Track rental requests and purchase quote requests in one place.': 'تابع طلبات التأجير وطلبات عرض سعر الشراء في مكان واحد.',
  'Rental requests and purchase quote requests are tied to your account.': 'ترتبط طلبات التأجير وطلبات عرض سعر الشراء بحسابك.',
  'Review rental requests, purchase quote requests, and follow their latest status updates from one place.': 'راجع طلبات التأجير وطلبات عرض سعر الشراء وتابع آخر تحديثاتها من مكان واحد.',
  'Your purchase quote request draft is saved on this device': 'مسودة طلب عرض سعر الشراء محفوظة على هذا الجهاز',
  'Pulling your latest rental and purchase quote request activity.': 'جارٍ جلب أحدث نشاط لطلبات التأجير وطلبات عرض سعر الشراء.',
  'Try another tab to review the rest of your rental requests and purchase quote requests.': 'جرّب تبويبًا آخر لمراجعة باقي طلبات التأجير وطلبات عرض سعر الشراء.',
  'Available for purchase quote request': 'متاح لطلب عرض سعر للشراء',
  'Purchase quote request status': 'حالة طلب عرض سعر الشراء',
  'Purchase Quote Request for': 'طلب عرض سعر للشراء لـ',

  // Legal footer links and public policy pages
  'Privacy Policy': 'سياسة الخصوصية',
  'Terms of Service': 'شروط الخدمة',
  'Vendor Terms': 'شروط المزودين',
  'Refund Policy': 'سياسة الاسترداد',
  'Cookie Policy': 'سياسة ملفات الارتباط',
  'Refund & Cancellation Policy': 'سياسة الاسترداد والإلغاء',
  'Back home': 'العودة للرئيسية',
  'Related legal documents': 'مستندات قانونية أخرى',
  'Need help with a booking?': 'تحتاج مساعدة بخصوص حجز؟',
  'Vendor contact': 'التواصل مع فريق المزودين',

}

function preserveOuterWhitespace(source: string, replacement: string): string {
  const match = source.match(/^(\s*)([\s\S]*?)(\s*)$/)
  if (!match) return replacement
  return `${match[1]}${replacement}${match[3]}`
}

function translateDynamicPhrase(core: string, locale: Locale): string {
  if (locale !== 'ar') return ''

  let match = core.match(/^All \((\d+)\)$/)
  if (match) return `الكل (${match[1]})`

  match = core.match(/^(.+) \((\d+)\)$/)
  if (match && arPhraseMap[match[1]]) return `${arPhraseMap[match[1]]} (${match[2]})`

  match = core.match(/^(\d+) services?$/i)
  if (match) return `${match[1]} خدمة`

  match = core.match(/^(\d+) photos?$/i)
  if (match) return `${match[1]} صورة`

  match = core.match(/^(\d+) albums?$/i)
  if (match) return `${match[1]} ألبوم`

  match = core.match(/^(\d+) items?$/i)
  if (match) return `${match[1]} عنصر`

  match = core.match(/^Item (\d+) of (\d+)$/)
  if (match) return `الخدمة ${match[1]} من ${match[2]}`

  match = core.match(/^(\d+) available$/i)
  if (match) return `${match[1]} متاحة`

  match = core.match(/^Only (\d+) available for these dates$/i)
  if (match) return `المتاح فقط ${match[1]} لهذه التواريخ`

  match = core.match(/^You have (\d+) items? in your rental request draft$/i)
  if (match) return `لديك ${match[1]} عنصر في مسودة طلب التأجير`

  match = core.match(/^No matches for [“"](.+)[”"]. Press Enter to browse all services\.?$/i)
  if (match) return `لا توجد نتائج لـ ”${match[1]}“. اضغط Enter لتصفح جميع الخدمات.`

  match = core.match(/^Reset email sent to (.+)\.$/i)
  if (match) return `تم إرسال بريد إعادة التعيين إلى ${match[1]}.`

  match = core.match(/^Remove (.+)$/i)
  if (match) return `إزالة ${match[1]}`

  match = core.match(/^Step (\d+)$/i)
  if (match) return ''

  match = core.match(/^STEP 0?(\d+)$/i)
  if (match) return ''

  match = core.match(/^(.+) Event Services in Jordan$/i)
  if (match) return `${translateVisibleText(match[1], locale)} خدمات فعاليات في الأردن`

  match = core.match(/^Browse (.+) event services, rentals, and experiences in Jordan through Eventies\.?$/i)
  if (match) return `تصفح خدمات وتأجيرات وتجارب ${translateVisibleText(match[1], locale)} للفعاليات في الأردن عبر Eventies.`

  match = core.match(/^(\d+) categories? and (\d+) services? from trusted providers\. Open any category to see what's available for your event\.?$/i)
  if (match) return `${match[1]} فئات و${match[2]} خدمة من مزوّدين موثوقين. افتح أي فئة لمعرفة المتاح لفعاليتك.`

  match = core.match(/^All \((\d+)\)$/i)
  if (match) return `الكل (${match[1]})`

  match = core.match(/^(.+) \((\d+)\)$/)
  if (match) return `${translateVisibleText(match[1], locale)} (${match[2]})`

  match = core.match(/^(\d+) service(s)?$/i)
  if (match) return `${match[1]} ${Number(match[1]) === 1 ? 'خدمة' : 'خدمات'}`

  match = core.match(/^From (.+)$/)
  if (match) return `ابتداء من ${match[1]}`

  match = core.match(/^(.+) per day$/i)
  if (match) return `${match[1]} لليوم`

  return ''
}

export function translateVisibleText(value: string, locale: Locale): string {
  if (locale === 'en') return value
  const core = value.trim().replace(/\s+/g, ' ')
  if (!core) return value

  const normalizedCore = core
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2010-\u2015]/g, match => (match === '—' ? '—' : '-'))
    .replace(/\s+/g, ' ')

  const translated: string =
    arPhraseMap[core] ??
    arPhraseMap[normalizedCore] ??
    (translateDynamicPhrase(normalizedCore, locale) || translateDynamicPhrase(core, locale))

  return translated ? preserveOuterWhitespace(value, translated) : value
}
