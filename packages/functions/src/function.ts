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
    log.error(
      `Failed while trying to convert ${tokenIn} on chain ${inputs.sourceChainId} to ${tokenOut} on chain ${inputs.destinationChainId}`
    )
    return
  }

  const slippageFactor = BPS_DENOMINATOR.minus(BigInt.fromI32(inputs.slippageBps as i32))
  const minAmountOut = expectedOut.unwrap().times(slippageFactor).div(BPS_DENOMINATOR)

  // Execute swap
  log.info(
    `Swap ${amountIn} on chain ${inputs.sourceChainId} to at least ${minAmountOut} on chain ${inputs.destinationChainId}`
  )
  SwapBuilder.forChains(inputs.sourceChainId, inputs.destinationChainId)
    .addTokenInFromTokenAmount(amountIn)
    .addTokenOutFromTokenAmount(minAmountOut, environment.getContext().user)
    .build()
    .send()
}
