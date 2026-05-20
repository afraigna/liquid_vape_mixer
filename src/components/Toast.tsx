interface Props {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: Props) {
  if (!visible) return null

  return (
    <div
      className="fixed bottom-5 left-1/2 flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-medium z-[100]"
      style={{
        transform: 'translateX(-50%)',
        background: '#2C2C2A',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,.2)',
        animation: 'toast-in 0.18s ease-out',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {message}
    </div>
  )
}
