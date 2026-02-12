import { BigInt, environment, ERC20Token, log, SwapBuilder, TokenAmount } from '@mimicprotocol/lib-ts'

import { inputs } from './types'

const BPS_DENOMINATOR = BigInt.fromI32(10_000)

export default function main(): void {
  const slippageBps = BigInt.fromI32(inputs.slippageBps as i32)
  if (slippageBps.gt(BPS_DENOMINATOR)) throw new Error('Slippage must be between 0 and 100')

  // Tokens on source and destination chains
  const tokenIn = ERC20Token.fromAddress(inputs.tokenIn, inputs.sourceChainId)
  const tokenOut = ERC20Token.fromAddress(inputs.tokenOut, inputs.destinationChainId)

  // Apply slippage to calculate the expected minimum amount out
  const amountIn = TokenAmount.fromStringDecimal(tokenIn, inputs.amountIn)
  const expectedOut = amountIn.toTokenAmount(tokenOut)
  if (expectedOut.isError) {
    log.error(`Failed to convert ${tokenIn} on ${inputs.sourceChainId} to ${tokenOut} on ${inputs.destinationChainId}`)
    return
  }

  const minAmountOut = expectedOut.unwrap().applySlippageBps(inputs.slippageBps as i32)
  log.info(`Swap ${amountIn} on ${inputs.sourceChainId} to at least ${minAmountOut} on ${inputs.destinationChainId}`)

  // Execute swap
  SwapBuilder.forChains(inputs.sourceChainId, inputs.destinationChainId)
    .addTokenInFromTokenAmount(amountIn)
    .addTokenOutFromTokenAmount(minAmountOut, environment.getContext().user)
    .build()
    .send()
}
