const CHAINS_DICTIONARY: Record<string, { id: number; name: string }> = {
  arbitrum: { id: 42161, name: 'Arbitrum' },
  base: { id: 8453, name: 'Base' },
  optimism: { id: 10, name: 'Optimism' },
}

export type ChainKey = keyof typeof CHAINS_DICTIONARY

export type Chain = (typeof CHAINS_DICTIONARY)[ChainKey] & { key: ChainKey }

export const CHAINS = (Object.keys(CHAINS_DICTIONARY) as ChainKey[]).reduce(
  (chains, key) => {
    chains[key] = { ...CHAINS_DICTIONARY[key], key }
    return chains
  },
  {} as Record<ChainKey, Chain>
)
