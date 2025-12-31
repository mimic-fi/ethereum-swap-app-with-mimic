import { fp, TriggerType } from '@mimicprotocol/sdk'
import { CHAIN_IDS } from '@/lib/chains'
import { TOKENS } from '@/lib/tokens'
import sdk from '@/lib/sdk'
import { WagmiSigner } from '@/lib/wagmi-signer'

interface SwapParams {
  sourceChain: string
  sourceToken: string
  sourceAmount: string
  destinationChain: string
  destinationToken: string
  slippage: string
  signer: WagmiSigner
}

const BPS_DECIMALS = 2
const TASK_EXECUTION_DELTA_MINUTES = 5
const TASK_CID = process.env.NEXT_PUBLIC_SWAP_TASK_CID!

export async function swap(params: SwapParams) {
  const { sourceChain, sourceToken, destinationChain, destinationToken, sourceAmount, slippage, signer } = params

  const sourceChainId = CHAIN_IDS[sourceChain]?.id
  const sourceChainName = CHAIN_IDS[sourceChain]?.name
  if (!sourceChainId) throw new Error(`Unsupported source chain ${sourceChain}`)

  const destinationChainId = CHAIN_IDS[destinationChain]?.id
  const destinationChainName = CHAIN_IDS[destinationChain]?.name
  if (!destinationChainId) throw new Error(`Unsupported destination chain ${destinationChain}`)

  const tokenIn = TOKENS[sourceChain]?.[sourceToken]
  if (!tokenIn) throw new Error(`Unsupported token in ${sourceToken} on chain ${sourceChain}`)

  const tokenOut = TOKENS[destinationChain]?.[destinationToken]
  if (!tokenOut) throw new Error(`Unsupported token out ${destinationToken} on chain ${destinationChain}`)

  const cron = `${new Date().getMinutes()} * * * *`
  const delta = `${TASK_EXECUTION_DELTA_MINUTES}m`
  const endDate = Date.now() + (TASK_EXECUTION_DELTA_MINUTES + 1) * 60 * 1000
  const description = `Swap ${sourceAmount} ${sourceToken} on ${sourceChainName} for ${destinationToken} on ${destinationChainName} with ${slippage}% slippage`
  const manifest = await sdk().tasks.getManifest(TASK_CID)

  return sdk().configs.signAndCreate(
    {
      taskCid: TASK_CID,
      description,
      trigger: {
        type: TriggerType.Cron,
        schedule: cron,
        delta,
        endDate,
      },
      input: {
        sourceChainId: sourceChainId,
        destinationChainId: destinationChainId,
        tokenIn: tokenIn.address,
        amountIn: sourceAmount,
        tokenOut: tokenOut.address,
        slippageBps: fp(slippage, BPS_DECIMALS),
        recipient: signer.address,
      },
      version: '0.0.1',
      manifest,
      signer: signer.address,
      executionFeeLimit: fp(1).toString(),
      minValidations: 1,
    },
    signer
  )
}
