'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TOKENS } from '@/lib/tokens'

type ChainKey = keyof typeof TOKENS
type TokenKey<C extends ChainKey> = keyof (typeof TOKENS)[C]

interface TokenSelectorProps<C extends ChainKey = ChainKey> {
  chain: C
  value: TokenKey<C>
  onChange: (value: TokenKey<C>) => void
}

export function TokenSelector<C extends ChainKey>({ chain, value, onChange }: TokenSelectorProps<C>) {
  const tokens = TOKENS[chain]

  return (
    <Select value={value as string} onValueChange={(v) => onChange(v as TokenKey<C>)}>
      <SelectTrigger className="w-full h-12 bg-secondary/50 border-border">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {(Object.keys(tokens) as TokenKey<C>[]).map((symbol) => (
          <SelectItem key={symbol as string} value={symbol as string}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-purple-500" />
              <span className="font-medium">{symbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
