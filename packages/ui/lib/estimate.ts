import { fp } from '@mimicprotocol/sdk'

import { Token } from '@/lib/tokens'
import { Chain } from '@/lib/chains'
import { BPS_DECIMALS, BPS_DENOMINATOR } from '@/lib/constants'
import { toStringDecimal } from '@/lib/utils'

interface EstimateParams {
  sourceChain: Chain
  sourceToken: Token
  sourceAmount: string
  destinationChain: Chain
  destinationToken: Token
  slippage: string
}

export interface EstimateResult {
  minAmountOut: string
  expectedAmountOut: string
}

export async function estimate(params: EstimateParams): Promise<EstimateResult> {
  const { sourceChain, sourceToken, destinationChain, destinationToken, sourceAmount, slippage } = params

  const amountIn = fp(sourceAmount, sourceToken.decimals)
  const slippageBps = fp(slippage, BPS_DECIMALS)

  const [priceIn, priceOut] = await Promise.all([
    fetchUsdPrice({ chainId: sourceChain.id, address: sourceToken.address }),
    fetchUsdPrice({ chainId: destinationChain.id, address: destinationToken.address }),
  ])

  const amountOut = (amountIn * priceIn * fp(1, destinationToken.decimals)) / (priceOut * fp(1, sourceToken.decimals))
  const slippageFactor = BPS_DENOMINATOR - slippageBps
  const minAmountOut = (amountOut * slippageFactor) / BPS_DENOMINATOR

  return {
    expectedAmountOut: toStringDecimal(amountOut, destinationToken.decimals),
    minAmountOut: toStringDecimal(minAmountOut, destinationToken.decimals),
  }
}

async function fetchUsdPrice(params: { chainId: number; address: string }): Promise<bigint> {
  const response = await fetch('/api/price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to estimate swap')
  }

  const data = await response.json()
  return BigInt(data.price)
}
