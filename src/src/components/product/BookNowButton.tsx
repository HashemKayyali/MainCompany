import { Link } from 'react-router-dom'
import { social } from '../../data/social'
export default function BookNowButton({ productSlug }: { productSlug?: string }) {
  return <div className="flex flex-wrap gap-3"><Link to={`/contact?product=${productSlug || ''}`} className="btn-primary">Book This Product</Link><a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline">WhatsApp</a></div>
}
