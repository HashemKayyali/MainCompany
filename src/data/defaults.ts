import type { Product, ProductPart, Category } from './products/types'
import type { Customer } from './customers'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-bikeland', name: 'Bike Land', slug: 'bike-land', icon: '🚲', description: 'Interactive bike-powered activations — LED racing, smoothie bikes, energy generation & more', image: '' },
  { id: 'cat-terminal-vr', name: 'The Terminal VR', slug: 'terminal-vr', icon: '🥽', description: 'Immersive VR gaming experiences and virtual reality activations', image: '' },
]

export const DEFAULT_PRODUCTS: Product[] = [
  { slug: 'bike-blender', name: 'Bike Blender', displayOrder: 1, badge: 'Most Popular', badgeColor: 'from-amber-400 to-orange-500', categoryTags: ['Interactive','Wellness'], categoryId: 'cat-bikeland', shortDescription: 'Pedal-powered smoothie station. Ride the bike, blend your own fresh drink live.', description: 'An interactive healthy experience where participants make their own fresh smoothies by pedaling. The faster you pedal, the faster it blends!', featured: true, heroImage: '/assets/products/bike-blender/hero.webp', gallery: ['/assets/products/bike-blender/hero.webp'], quickOptions: [{ label: 'Bikes', values: ['1','2','3','4'] }], notes: ['Requires fresh ingredients','Needs 1x power outlet per bike','Setup: ~30 min'], features: { left: ['Real blending by cycling','Fresh healthy smoothies','Branded booth & cups'], right: ['On-site staff included','Perfect for wellness events','Hygiene-first prep'] }, rentalPricePerDay: 250, currency: 'JOD' },
  { slug: 'bike-tower', name: 'Bike Tower', displayOrder: 2, badge: 'Competitive', badgeColor: 'from-prism-cyan to-blue-500', categoryTags: ['Competitive','LED'], categoryId: 'cat-bikeland', shortDescription: 'Two-player LED tower race. Pedal to light up your tower first.', description: 'A thrilling two-player race! Each rider powers up their LED Tower. First to the top wins.', featured: true, heroImage: '/assets/products/bike-tower/hero.webp', gallery: ['/assets/products/bike-tower/hero.webp'], quickOptions: [{ label: 'Bikes', values: ['2'] }], notes: ['Works in bright venues','Requires 1x outlet','Setup: ~45 min'], features: { left: ['Head-to-head competition','Custom LED columns','Fast setup'], right: ['3 difficulty levels','High impact','Real-time progress'] }, rentalPricePerDay: 350, currency: 'JOD' },
  { slug: 'bike-vr', name: 'Bike VR', displayOrder: 3, badge: 'Immersive', badgeColor: 'from-prism-pink to-rose-500', categoryTags: ['Immersive','VR'], categoryId: 'cat-terminal-vr', shortDescription: 'VR cycling through stunning digital worlds.', description: 'Immersive VR cycling combining exercise with digital adventure. Resistance syncs with the virtual world.', featured: true, heroImage: '/assets/products/bike-vr/hero.webp', gallery: ['/assets/products/bike-vr/hero.webp'], quickOptions: [{ label: 'Bikes', values: ['1','2'] }], notes: ['Requires 2x outlets','Age 10+','Staff provided'], features: { left: ['Full VR immersion','Multiple environments','Synced resistance'], right: ['Professionally supervised','Perfect for tech events','Unforgettable experience'] }, rentalPricePerDay: 400, currency: 'JOD' },
  { slug: 'bike-race', name: 'Bike Race', displayOrder: 4, badge: 'Racing', badgeColor: 'from-rose-400 to-red-500', categoryTags: ['Competitive','Fitness'], categoryId: 'cat-bikeland', shortDescription: 'Live cycling race with real-time stats on screen.', description: 'Energetic cycling game with live stats on-screen. Perfect for exhibitions and fitness events.', featured: false, heroImage: '/assets/products/bike-race/hero.webp', gallery: ['/assets/products/bike-race/hero.webp'], quickOptions: [{ label: 'Screen', values: ['32"','55"'] }], notes: ['1x outlet + screen','Indoor/outdoor','Setup: ~30 min'], features: { left: ['Live speed tracking','On-screen stats'], right: ['Great for fitness events','Easy setup'] }, rentalPricePerDay: 300, currency: 'JOD' },
  { slug: 'bike-branding', name: 'Bike Branding', displayOrder: 5, badge: 'Custom', badgeColor: 'from-teal-400 to-violet-500', categoryTags: ['Branding'], categoryId: 'cat-bikeland', shortDescription: 'Fully branded cycling experience.', description: 'Transform any product into a fully branded experience with custom wraps, booths, and cups.', featured: false, heroImage: '/assets/products/bike-branding/hero.webp', gallery: ['/assets/products/bike-branding/hero.webp'], quickOptions: [{ label: 'Level', values: ['Basic','Full','Premium'] }], notes: ['Brand assets 5 days before','Design mockup provided'], features: { left: ['Full wrapping','Custom LED'], right: ['Design approval','Pro print'] }, rentalPricePerDay: 150, currency: 'JOD' },
  { slug: 'bike-beam', name: 'Bike Beam', displayOrder: 6, badge: 'LED Show', badgeColor: 'from-amber-400 to-yellow-500', categoryTags: ['LED','Show'], categoryId: 'cat-bikeland', shortDescription: 'Pedal-powered LED beam. Harder you ride, brighter the show.', description: 'Spectacular LED beam powered by cycling. Best in dimly lit or nighttime venues.', featured: false, heroImage: '/assets/products/bike-beam/hero.webp', gallery: ['/assets/products/bike-beam/hero.webp'], quickOptions: [{ label: 'Beam', values: ['Medium','Large'] }], notes: ['Best in dim venues','1x outlet','Setup: ~45 min'], features: { left: ['Stunning LED display','Pedal-powered intensity'], right: ['Multiple color modes','Instagram-worthy'] }, rentalPricePerDay: 300, currency: 'JOD' },
]

export const DEFAULT_PARTS: ProductPart[] = [
  { id: 'part-1', productSlug: 'bike-blender', name: 'Blender Jar', description: 'BPA-free 1.5L jar with blade', price: 25, currency: 'JOD', image: '', inStock: true },
  { id: 'part-2', productSlug: 'bike-blender', name: 'Pedal Set', description: 'Heavy-duty aluminum pedals', price: 15, currency: 'JOD', image: '', inStock: true },
  { id: 'part-3', productSlug: 'bike-blender', name: 'Drive Belt', description: 'Replacement drive belt', price: 8, currency: 'JOD', image: '', inStock: true },
  { id: 'part-4', productSlug: 'bike-tower', name: 'LED Strip Module', description: '1m addressable LED strip', price: 35, currency: 'JOD', image: '', inStock: true },
  { id: 'part-5', productSlug: 'bike-tower', name: 'Speed Sensor', description: 'Magnetic speed sensor', price: 20, currency: 'JOD', image: '', inStock: true },
  { id: 'part-6', productSlug: 'bike-vr', name: 'VR Mount', description: 'Adjustable headset mount', price: 30, currency: 'JOD', image: '', inStock: true },
  { id: 'part-7', productSlug: 'bike-race', name: 'HDMI Cable 5m', description: 'HDMI 2.1 cable', price: 12, currency: 'JOD', image: '', inStock: true },
  { id: 'part-8', productSlug: 'bike-beam', name: 'LED Controller', description: 'RGB LED controller', price: 45, currency: 'JOD', image: '', inStock: false },
]

export const DEFAULT_CUSTOMERS: Customer[] = [
  { name: 'AMAZON', slug: 'amazon', logo: '/assets/customers/amazon/logo.webp', category: 'Corporate' },
  { name: 'Amman Academy', slug: 'amman-academy', logo: '/assets/customers/amman-academy/logo.webp', category: 'Education' },
  { name: 'Arab Bank', slug: 'arab-bank', logo: '/assets/customers/arab-bank/logo.webp', category: 'Corporate' },
  { name: 'AstraZeneca', slug: 'astrazeneca', logo: '/assets/customers/astrazeneca/logo.webp', category: 'Corporate' },
  { name: 'Abdali Hospital', slug: 'abdali-hospital', logo: '/assets/customers/abdali-hospital/logo.webp', category: 'Healthcare' },
  { name: 'Basketball', slug: 'basketball', logo: '/assets/customers/basketball/logo.webp', category: 'Sports' },
  { name: 'Birthdays', slug: 'birthdays', logo: '/assets/customers/birthdays/logo.webp', category: 'Events' },
  { name: 'Delmonte', slug: 'delmonte', logo: '/assets/customers/delmonte/logo.webp', category: 'Corporate' },
  { name: 'JU', slug: 'ju', logo: '/assets/customers/ju/logo.webp', category: 'Education' },
  { name: 'MR.BURRITOS', slug: 'mr-burritos', logo: '/assets/customers/mr-burritos/logo.webp', category: 'F&B' },
  { name: 'PROTEINAK', slug: 'proteinak', logo: '/assets/customers/proteinak/logo.webp', category: 'F&B' },
  { name: 'PSUT', slug: 'psut', logo: '/assets/customers/psut/logo.webp', category: 'Education' },
  { name: 'RIA', slug: 'ria', logo: '/assets/customers/ria/logo.webp', category: 'Corporate' },
  { name: 'Rotana Hotel', slug: 'rotana-hotel', logo: '/assets/customers/rotana-hotel/logo.webp', category: 'Hospitality' },
  { name: 'Saray Aqaba', slug: 'saray-aqaba', logo: '/assets/customers/saray-aqaba/logo.webp', category: 'Hospitality' },
  { name: 'SNA', slug: 'sna', logo: '/assets/customers/sna/logo.webp', category: 'Corporate' },
  { name: 'TAJ MALL', slug: 'taj-mall', logo: '/assets/customers/taj-mall/logo.webp', category: 'Retail' },
  { name: 'TRAX', slug: 'trax', logo: '/assets/customers/trax/logo.webp', category: 'Entertainment' },
  { name: 'Umniah', slug: 'umniah', logo: '/assets/customers/umniah/logo.webp', category: 'Telecom' },
  { name: 'ZAIN', slug: 'zain', logo: '/assets/customers/zain/logo.webp', category: 'Telecom' },
]
