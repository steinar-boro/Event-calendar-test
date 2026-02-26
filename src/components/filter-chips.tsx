"use client"

import { cn } from "@/lib/utils"

type Option = { value: string; label: string }

type FilterChipsProps = {
  label: string
  options: Option[]
  selected: string
  onSelect: (value: string) => void
}

export function FilterChips({ label, options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground tracking-wide">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected === option.value
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/40"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
