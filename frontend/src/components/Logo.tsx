interface LogoProps {
  className?: string
  showText?: boolean
  textSize?: string
}

export default function Logo({ className = "w-10 h-10", showText = true, textSize = "text-xl" }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`shrink-0 ${className}`}>
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="finflow-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          {/* Right loop of infinity */}
          <path 
            d="M 50 50 C 62 33 82 33 82 50 C 82 67 62 67 50 50" 
            stroke="url(#finflow-logo-grad)" 
            strokeWidth="7" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Left loop of infinity, which ascends into the F stem */}
          <path 
            d="M 50 50 C 38 67 18 67 18 50 C 18 33 34 33 34 50 L 34 20 C 34 16 42 16 48 16" 
            stroke="url(#finflow-logo-grad)" 
            strokeWidth="7" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Crossbar of the F */}
          <path 
            d="M 26 34 H 42" 
            stroke="url(#finflow-logo-grad)" 
            strokeWidth="7" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold tracking-tight text-slate-900 ${textSize}`}>
          Finflow
        </span>
      )}
    </div>
  )
}
