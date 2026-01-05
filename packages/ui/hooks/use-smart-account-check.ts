'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { getBytecode } from '@wagmi/core'
import { CHAIN_IDS } from '@/lib/chains'
import { EIP7702_PREFIX } from '@/lib/constants'

export function useSmartAccountCheck(sourceChain: string) {
  const { address, isConnected } = useAccount()
  const wagmiConfig = useConfig()

  const [isSmartAccount, setIsSmartAccount] = useState<boolean | null>(null)
  const [isSmartAccountLoading, setIsSmartAccountLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (!isConnected || !address) {
        setIsSmartAccount(null)
        setIsSmartAccountLoading(false)
        return
      }

      setIsSmartAccountLoading(true)

      try {
        const chainId = CHAIN_IDS[sourceChain]?.id
        if (!chainId) {
          if (!cancelled) setIsSmartAccount(null)
          return
        }

        const code = await getBytecode(wagmiConfig, { chainId, address })
        const delegated = !!code && code.toLowerCase().startsWith(EIP7702_PREFIX)
        if (!cancelled) setIsSmartAccount(delegated)
      } catch (err) {
        console.error('Delegation check error', err)
        if (!cancelled) setIsSmartAccount(null)
      } finally {
        if (!cancelled) setIsSmartAccountLoading(false)
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [isConnected, address, sourceChain, wagmiConfig])

  return { isSmartAccount, isSmartAccountLoading }
}
