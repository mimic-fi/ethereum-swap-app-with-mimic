import { fp, OpType, randomEvmAddress } from '@mimicprotocol/sdk'
import { Context, EvmCallQueryMock, runTask, Swap, TokenPriceQueryMock } from '@mimicprotocol/test-ts'
import { expect } from 'chai'
import { Interface } from 'ethers'

import ERC20Abi from '../abis/ERC20.json'

const ERC20Interface = new Interface(ERC20Abi)

describe('Swap Task', () => {
  const taskDir = './build'

  const context: Context = {
    user: randomEvmAddress(),
    settlers: [
      { address: randomEvmAddress(), chainId: 1 },
      { address: randomEvmAddress(), chainId: 10 },
    ],
    timestamp: Date.now(),
  }

  const inputs = {
    sourceChainId: 1,
    destinationChainId: 10,
    tokenIn: randomEvmAddress(),
    amountIn: '7.2',
    tokenOut: randomEvmAddress(),
    slippageBps: 200, // 2%
  }

  const priceTokenIn = fp(2)
  const priceTokenOut = fp(1)
  const tokenInDecimals = 6
  const tokenOutDecimals = 18
  const amountInUsd = (fp(inputs.amountIn, tokenInDecimals) * priceTokenIn) / 10n ** BigInt(tokenInDecimals)
  const expectedAmountOut = (amountInUsd * 10n ** BigInt(tokenOutDecimals)) / priceTokenOut
  const bpsDenominator = 10_000n
  const slippageFactor = bpsDenominator - BigInt(inputs.slippageBps)
  const expectedMinAmountOut = (expectedAmountOut * slippageFactor) / bpsDenominator

  const prices: TokenPriceQueryMock[] = [
    {
      request: { token: { address: inputs.tokenIn, chainId: inputs.sourceChainId } },
      response: [priceTokenIn.toString()], // 1 USD
    },
    {
      request: { token: { address: inputs.tokenOut, chainId: inputs.destinationChainId } },
      response: [priceTokenOut.toString()], // 2 USD
    },
  ]

  const calls: EvmCallQueryMock[] = [
    // token in
    {
      request: {
        to: inputs.tokenIn,
        chainId: inputs.sourceChainId,
        fnSelector: ERC20Interface.getFunction('decimals')!.selector,
      },
      response: { value: tokenInDecimals.toString(), abiType: 'uint8' },
    },
    {
      request: {
        to: inputs.tokenIn,
        chainId: inputs.sourceChainId,
        fnSelector: ERC20Interface.getFunction('symbol')!.selector,
      },
      response: { value: 'IN', abiType: 'string' },
    },
    // token out
    {
      request: {
        to: inputs.tokenOut,
        chainId: inputs.destinationChainId,
        fnSelector: ERC20Interface.getFunction('decimals')!.selector,
      },
      response: { value: tokenOutDecimals.toString(), abiType: 'uint8' },
    },
    {
      request: {
        to: inputs.tokenOut,
        chainId: inputs.destinationChainId,
        fnSelector: ERC20Interface.getFunction('symbol')!.selector,
      },
      response: { value: 'OUT', abiType: 'string' },
    },
  ]

  it('builds a vanilla cross-chain swap with correct parameters', async () => {
    const result = await runTask(taskDir, context, { inputs, calls, prices })
    expect(result.success).to.be.true
    expect(result.timestamp).to.equal(context.timestamp)

    const intents = result.intents as Swap[]
    expect(intents).to.have.lengthOf(1)

    const intent = intents[0]
    expect(intent.op).to.equal(OpType.Swap)
    expect(intent.user).to.equal(context.user)
    expect(intent.settler).to.equal(context.settlers?.[0].address)
    expect(intent.sourceChain).to.equal(inputs.sourceChainId)
    expect(intent.destinationChain).to.equal(inputs.destinationChainId)

    // Tokens in
    expect(intent.tokensIn).to.have.lengthOf(1)
    expect(intent.tokensIn[0].token).to.equal(inputs.tokenIn)
    expect(intent.tokensIn[0].amount).to.equal(fp(inputs.amountIn, tokenInDecimals).toString())

    // Tokens out
    expect(intent.tokensOut).to.have.lengthOf(1)
    expect(intent.tokensOut[0].token).to.equal(inputs.tokenOut)
    expect(intent.tokensOut[0].minAmount).to.equal(expectedMinAmountOut.toString())
    expect(intent.tokensOut[0].recipient).to.equal(context.user)
  })
})
