export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  quote: string
  avatar?: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't-1',
    name: 'Sarah Al-Masri',
    role: 'Events Manager',
    company: 'City Mall',
    quote: 'Bike Land completely transformed our summer event. The LED races had guests lining up for hours — the energy was unreal.',
  },
  {
    id: 't-2',
    name: 'Ahmad Khader',
    role: 'Marketing Director',
    company: 'Umniah',
    quote: 'Professional setup, amazing crowd engagement, and our brand visibility went through the roof. Already booked for next year.',
  },
  {
    id: 't-3',
    name: 'Lina Haddad',
    role: 'Student Activities',
    company: 'PSUT',
    quote: 'The VR cycling was the highlight of our orientation week. Students couldn\'t stop talking about it. 10/10 would book again.',
  },
  {
    id: 't-4',
    name: 'Omar Rashid',
    role: 'GM',
    company: 'Rotana Hotel',
    quote: 'The smoothie bikes were a hit at our wellness weekend. Clean setup, friendly staff, and guests loved the interactive experience.',
  },
  {
    id: 't-5',
    name: 'Rania Nasser',
    role: 'Brand Manager',
    company: 'AstraZeneca',
    quote: 'We needed something unique for our corporate family day. Bike Land delivered beyond expectations — custom branding and all.',
  },
  {
    id: 't-6',
    name: 'Tariq Abu Zeid',
    role: 'Operations',
    company: 'TAJ Mall',
    quote: 'Third year working with Bike Land. They handle everything from setup to crowd management. Reliable partners.',
  },
]
