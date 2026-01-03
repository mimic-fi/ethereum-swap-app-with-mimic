import { fp } from '@mimicprotocol/sdk'

import { TOKENS } from '@/lib/tokens'
import { CHAIN_IDS } from '@/lib/chains'
import { BPS_DECIMALS, BPS_DENOMINATOR } from '@/lib/constants'

interface EstimateParams {
  sourceChain: string
  sourceToken: string
  sourceAmount: string
  destinationChain: string
  destinationToken: string
  slippage: string
}

export interface EstimateResult {
  minAmountOut: string
  expectedAmountOut: string
}

export async function estimate(params: EstimateParams): Promise<EstimateResult> {
  const { sourceChain, sourceToken, destinationChain, destinationToken, sourceAmount, slippage } = params

  const sourceChainId = CHAIN_IDS[sourceChain]?.id
  if (!sourceChainId) throw new Error(`Unsupported source chain ${sourceChain}`)

  const destinationChainId = CHAIN_IDS[destinationChain]?.id
  if (!destinationChainId) throw new Error(`Unsupported destination chain ${destinationChain}`)

  const tokenIn = TOKENS[sourceChain]?.[sourceToken]
  if (!tokenIn) throw new Error(`Unsupported token in ${sourceToken} on chain ${sourceChain}`)

  const tokenOut = TOKENS[destinationChain]?.[destinationToken]
  if (!tokenOut) throw new Error(`Unsupported token out ${destinationToken} on chain ${destinationChain}`)

  const amountIn = fp(sourceAmount, tokenIn.decimals)
  const slippageBps = fp(slippage, BPS_DECIMALS)

  const [priceIn, priceOut] = await Promise.all([
    fetchUsdPrice({ chainId: sourceChainId, address: tokenIn.address }),
    fetchUsdPrice({ chainId: destinationChainId, address: tokenOut.address }),
  ])

  const expectedAmountOut = (amountIn * priceIn * fp(1, tokenOut.decimals)) / (priceOut * fp(1, tokenIn.decimals))
  const slippageFactor = BPS_DENOMINATOR - slippageBps
  const minAmountOut = (expectedAmountOut * slippageFactor) / BPS_DENOMINATOR

  return {
    expectedAmountOut: toStringDecimal(expectedAmountOut, tokenOut.decimals),
    minAmountOut: toStringDecimal(minAmountOut, tokenOut.decimals),
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

function toStringDecimal(value: bigint, decimals: number, precision = 6): string {
  const isNegative = value < 0n
  const absolute = isNegative ? -value : value

  const base = 10n ** BigInt(decimals)
  const whole = absolute / base
  const fraction = absolute % base

  const decimalPart = fraction.toString().padStart(decimals, '0').slice(0, precision).replace(/0+$/, '')
  const result = decimalPart ? `${whole.toString()}.${decimalPart}` : whole.toString()
  return isNegative ? `-${result}` : result
}
