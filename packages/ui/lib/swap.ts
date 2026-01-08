import { fp, Config, createExecuteOnceTrigger } from '@mimicprotocol/sdk'
import { Chain } from '@/lib/chains'
import { Token } from '@/lib/tokens'
import sdk from '@/lib/sdk'
import { WagmiSigner } from '@/lib/wagmi-signer'
import { BPS_DECIMALS, TASK_CID } from '@/lib/constants'

interface SwapParams {
  sourceChain: Chain
  sourceToken: Token
  sourceAmount: string
  destinationChain: Chain
  destinationToken: Token
  slippage: string
  signer: WagmiSigner
}

export async function swap(params: SwapParams): Promise<Config> {
  const { sourceChain, sourceToken, destinationChain, destinationToken, sourceAmount, slippage, signer } = params
  const description = `Swap ${sourceAmount} ${sourceToken.symbol} on ${sourceChain.name} for ${destinationToken.symbol} on ${destinationChain.name} with ${slippage}% slippage`
  const manifest = await sdk().tasks.getManifest(TASK_CID)
  return sdk().configs.signAndCreate(
    {
      taskCid: TASK_CID,
      version: '0.0.1',
      manifest,
      description,
      trigger: createExecuteOnceTrigger(),
      input: {
        sourceChainId: sourceChain.id,
        destinationChainId: destinationChain.id,
        tokenIn: sourceToken.address,
        amountIn: sourceAmount,
        tokenOut: destinationToken.address,
        slippageBps: fp(slippage, BPS_DECIMALS),
        recipient: signer.address,
      },
      executionFeeLimit: fp(1).toString(),
      minValidations: 1,
    },
    signer
  )
}
