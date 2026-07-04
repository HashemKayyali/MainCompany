import { useTheme } from '../../contexts/ThemeContext'

export default function ProductFeatures({ features }: { features: { left: string[]; right: string[] } }) {
  const { isDark } = useTheme()

  return (
    <div dir="ltr" className="product-data-ltr-row grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {[...features.left, ...features.right].map((feature, index) => (
        <div key={index} className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-prism-violet/15">
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-prism-violet"
            >
              <path d="M2.5 6.5l2.5 2.5 4.5-5" />
            </svg>
          </div>
          <span
            dir="ltr"
            lang="en"
            className={`product-data-ltr text-sm leading-relaxed ${isDark ? 'text-cyan-200/90' : 'text-gray-600'}`}
          >
            {feature}
          </span>
        </div>
      ))}
    </div>
  )
}
