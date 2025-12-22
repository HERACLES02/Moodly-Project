import React from "react"

interface UserNoteTooltipProps {
  note: string
  children: React.ReactNode
}

const UserNoteTooltip = ({ note, children }: UserNoteTooltipProps) => {
  if (!note || note==="") return <>{children}</>

  return (
    <div className="group relative flex items-center">
      {children}
      
      {/* Tooltip Bubble - Positioned Right */}
      <div className="absolute left-full ml-2 z-[100] hidden group-hover:flex animate-in fade-in slide-in-from-left-1 duration-200">
        <div className="relative whitespace-nowrap px-3 py-1.5 
          !bg-black/80 !backdrop-blur-2xl border border-[var(--glass-border)] 
          rounded-xl shadow-2xl ring-1 ring-white/10">
          
          <div className="flex flex-col">
            <span className="text-[11px] text-white/90 italic font-medium">
              {note}
            </span>
          </div>

          {/* Pointy Arrow to the left */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 !bg-black/80 border-l border-b border-white/10" />
        </div>
      </div>
    </div>
  )
}

export default UserNoteTooltip