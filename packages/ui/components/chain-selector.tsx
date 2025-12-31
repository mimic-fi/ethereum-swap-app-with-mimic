'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CHAIN_IDS } from '@/lib/chains'

type ChainKey = keyof typeof CHAIN_IDS

interface ChainSelectorProps {
  value: ChainKey
  onChange: (value: ChainKey) => void
}

export function ChainSelector({ value, onChange }: ChainSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ChainKey)}>
      <SelectTrigger className="w-full h-12 bg-secondary/50 border-border">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {(Object.keys(CHAIN_IDS) as ChainKey[]).map((chain) => (
          <SelectItem key={chain} value={chain}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600" />
              <span>{CHAIN_IDS[chain].name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
