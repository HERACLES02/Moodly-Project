"use client"
import React from "react"
import * as Popover from "@radix-ui/react-popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"

interface UserProfileDialogProps {
  user: {
    anonymousName: string
    avatar_img_path: string
    note: string
    userId: string
  }
  children: React.ReactNode
}

const UserProfileDialog = ({ user, children }: UserProfileDialogProps) => {
  const hasNote = user.note && user.note.trim() !== ""

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="relative cursor-pointer shrink-0">
          {children}

          {/* Note Indicator - Bottom Left & Off-centered */}
          {hasNote && (
            <div className="absolute -bottom-1 -left-1.5 size-3.5 bg-[var(--accent)] rounded-full border-2 border-[var(--background)] flex items-center justify-center z-10 shadow-sm">
              <MessageSquare className="size-2 text-white fill-current" />
            </div>
          )}
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="left"
          align="start"
          sideOffset={15}
          className="z-[100] w-64 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Increased rounding to rounded-2xl to match Revamped UserPage cards */}
          <div className="bg-[var(--card-surface)] border border-[var(--glass-border)] rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
            {/* Header Area */}
            <div className="p-5 border-b border-[var(--glass-border)] bg-white/5 flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="size-12 border-2 border-[var(--accent)] shadow-sm">
                  <AvatarImage
                    src={user.avatar_img_path}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-[var(--accent)]/10 text-[var(--accent)]">
                    👤
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-col min-w-0">
                <h1 className="text-sm font-black theme-text-contrast truncate leading-tight tracking-tight uppercase">
                  {user.anonymousName}
                </h1>
              </div>
            </div>

            {/* Notes Section */}
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent)] opacity-60">
                    Personal Note
                  </span>
                </div>

                {/* Internal box rounding updated to xl for nested aesthetic */}
                <div className="bg-[var(--background)]/40 border border-[var(--glass-border)] rounded-xl p-3 shadow-inner">
                  <p className="text-xs theme-text-contrast leading-relaxed italic opacity-90">
                    {hasNote ? `"${user.note}"` : "No note shared."}
                  </p>
                </div>
              </div>

              {/* Stat-style decorative divider */}
              <div className="flex items-center gap-3 py-1 px-2">
                <div className="h-[1px] flex-1 bg-[var(--glass-border)] opacity-50" />
                <div className="size-1 rounded-full bg-[var(--accent)] opacity-30" />
                <div className="h-[1px] flex-1 bg-[var(--glass-border)] opacity-50" />
              </div>
            </div>

            {/* Arrow */}
            <Popover.Arrow
              className="fill-[var(--card-surface)]"
              width={14}
              height={7}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default UserProfileDialog
