interface TopBarProps {
  onOpenHistory: () => void
}

export default function TopBar({ onOpenHistory }: TopBarProps) {
  return (
    <header className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="26" height="26" style={{ flexShrink: 0 }}>
          <rect x="12" y="3" width="8" height="2.5" rx="1.2" fill="#C8C5BC"/>
          <rect x="13.5" y="5.5" width="5" height="5" rx="0.6" fill="#B0ADA4"/>
          <path d="M13.5 10.5 L5.5 26 Q5 27.5 6.5 28 H25.5 Q27 27.5 26.5 26 L18.5 10.5 Z" fill="#E8E5DE"/>
          <path d="M7.2 24.5 Q6.2 27 6.5 28 H25.5 Q25.8 27 24.8 24.5 Z" fill="#1D9E75" opacity="0.88"/>
          <path d="M9 20.5 L7.2 24.5 H24.8 L23 20.5 Z" fill="#D4537E" opacity="0.82"/>
          <path d="M11.5 14.5 L9 20.5 H23 L20.5 14.5 Z" fill="#378ADD" opacity="0.78"/>
          <path d="M13.5 10.5 L11.5 14.5 H20.5 L18.5 10.5 Z" fill="#BA7517" opacity="0.72"/>
          <circle cx="11.5" cy="22" r="1.1" fill="#fff" opacity="0.75"/>
          <circle cx="15.5" cy="25" r="0.8" fill="#fff" opacity="0.65"/>
          <circle cx="19.5" cy="21.5" r="1.3" fill="#fff" opacity="0.70"/>
          <circle cx="13" cy="17" r="0.9" fill="#fff" opacity="0.60"/>
          <circle cx="20" cy="17" r="0.7" fill="#fff" opacity="0.55"/>
          <rect x="12" y="3" width="8" height="2.5" rx="1.2" fill="none" stroke="#9B9890" strokeWidth="0.5"/>
          <path d="M13.5 10.5 L5.5 26 Q5 27.5 6.5 28 H25.5 Q27 27.5 26.5 26 L18.5 10.5 Z" fill="none" stroke="#9B9890" strokeWidth="0.6" strokeLinejoin="round"/>
        </svg>
        <div className="font-semibold text-[14px] tracking-tight text-[#2C2C2A]">
          Liquid Vape Mixer
        </div>
      </div>

      <button
        onClick={onOpenHistory}
        className="h-[30px] px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-medium cursor-pointer transition-colors"
        style={{ border: '0.5px solid #D3D1C7', background: '#fff', color: '#56554F' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#FAF9F5')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
        aria-label="Mes recettes"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M12 7v5l3 2"/>
        </svg>
        Mes recettes
      </button>
    </header>
  )
}
