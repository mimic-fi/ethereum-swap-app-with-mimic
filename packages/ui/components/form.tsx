'use client'

import { useAccount, useConfig } from 'wagmi'
import { useState, useEffect } from 'react'
import { Config } from '@mimicprotocol/sdk'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChainSelector } from '@/components/chain-selector'
import { TokenSelector } from '@/components/token-selector'
import { ArrowDownIcon, Settings } from 'lucide-react'
import { estimate, EstimateResult } from '@/lib/estimate'
import { swap } from '@/lib/swap'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CHAINS, type Chain } from '@/lib/chains'
import { TOKENS, type Token } from '@/lib/tokens'
import { WagmiSigner } from '@/lib/wagmi-signer'
import { ToastAction } from '@/components/ui/toast'
import { useSmartAccountCheck } from '@/hooks/use-smart-account-check'
import { useTokenBalance } from '@/hooks/use-token-balance'

export function Form() {
  const [sourceChain, setSourceChain] = useState<Chain>(CHAINS.base)
  const [destinationChain, setDestinationChain] = useState<Chain>(CHAINS.base)
  const [sourceToken, setSourceToken] = useState<Token>(TOKENS.base.WETH)
  const [destinationToken, setDestinationToken] = useState<Token>(TOKENS.base.USDC)
  const [sourceAmount, setSourceAmount] = useState('')
  const [slippage, setSlippage] = useState('2.0')
  const [isLoading, setIsLoading] = useState(false)
  const [estimation, setEstimation] = useState<EstimateResult | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [estimationError, setEstimationError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const wagmiConfig = useConfig()
  const { tokenBalance, isTokenBalanceLoading } = useTokenBalance(sourceChain, sourceToken)
  const { isSmartAccount, isSmartAccountLoading } = useSmartAccountCheck(sourceChain)

  useEffect(() => {
    const tokens = TOKENS[sourceChain.key]
    const firstSymbol = Object.keys(tokens ?? {})[0]
    if (firstSymbol) setSourceToken(tokens[firstSymbol])
  }, [sourceChain])

  useEffect(() => {
    const tokens = TOKENS[destinationChain.key]
    const firstSymbol = Object.keys(tokens ?? {})[0]
    if (firstSymbol) setDestinationToken(tokens[firstSymbol])
  }, [destinationChain])

  useEffect(() => {
    const estimateAmount = async () => {
      if (!sourceAmount || !sourceToken || !destinationToken || !sourceChain || !destinationChain || !slippage) {
        setEstimation(null)
        return
      }

      const amount = Number.parseFloat(sourceAmount)
      const slippageNum = Number.parseFloat(slippage)

      if (amount <= 0 || slippageNum < 0) {
        setEstimation(null)
        return
      }

      setIsEstimating(true)
      setEstimationError(null)

      try {
        const params = {
          sourceChain,
          sourceToken,
          sourceAmount,
          destinationChain,
          destinationToken,
          slippage,
        }
        const result = await estimate(params)
        setEstimation(result)
      } catch (error) {
        console.error('Estimation error', error)
        setEstimationError(error instanceof Error ? error.message : 'Failed to estimate swap')
        setEstimation(null)
      } finally {
        setIsEstimating(false)
      }
    }

    const timeoutId = setTimeout(estimateAmount, 500)
    return () => clearTimeout(timeoutId)
  }, [sourceAmount, sourceToken, destinationToken, sourceChain, destinationChain, slippage])

  const handleSwitch = () => {
    const tempChain = sourceChain
    const tempToken = sourceToken

    setSourceChain(destinationChain)
    setDestinationChain(tempChain)
    setSourceToken(destinationToken)
    setDestinationToken(tempToken)

    setSourceAmount('')
    setEstimation(null)
  }

  const handleSwap = async () => {
    if (!sourceAmount || Number.parseFloat(sourceAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to swap',
        variant: 'destructive',
      })
      return
    }

    if (!slippage || Number.parseFloat(slippage) < 0) {
      toast({
        title: 'Invalid Slippage',
        description: 'Please enter a valid slippage percentage',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const params = {
        sourceChain,
        sourceToken,
        sourceAmount,
        destinationChain,
        destinationToken,
        slippage,
        signer: new WagmiSigner(address || '', wagmiConfig),
      }
      const config: Config = await swap(params)
      toast({
        title: 'Swap Initiated',
        description: 'Your swap has been created successfully',
        action: (
          <ToastAction
            altText="View config"
            onClick={() => window.open(`https://protocol.mimic.fi/configs/${config.sig}`, '_blank')}
          >
            View
          </ToastAction>
        ),
      })
      setSourceAmount('')
    } catch (error) {
      toast({
        title: 'Swap Failed',
        description: error instanceof Error ? error.message : 'Failed to initiate swap',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl p-6 bg-card border-border">
      <div className="space-y-6">
        {isConnected && !isSmartAccountLoading && !isSmartAccount && (
          <div className="w-full rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            This app can be used only for <span className="font-semibold">EIP-7702 delegated</span> accounts.
          </div>
        )}

        {isConnected && !isSmartAccountLoading && isSmartAccount && (
          <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            <span className="font-semibold">EIP-7702 smart account checked.</span>
          </div>
        )}

        {isConnected && isSmartAccountLoading && (
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
            Checking EIP-7702 delegation…
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <Label className="text-muted-foreground">From</Label>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="slippage-setting" className="text-sm text-muted-foreground">
                      Max slippage
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="slippage-setting"
                        type="number"
                        placeholder="0.5"
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        className="h-11 bg-secondary/50 border-border"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your transaction will revert if the price changes unfavorably by more than this percentage.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-36 shrink-0">
              <ChainSelector value={sourceChain} onChange={setSourceChain} />
            </div>
            <div className="w-36 shrink-0">
              <TokenSelector chain={sourceChain} value={sourceToken} onChange={setSourceToken} />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                type="number"
                placeholder="0.0"
                value={sourceAmount}
                onChange={(e) => setSourceAmount(e.target.value)}
                className="h-12 bg-secondary/50 border-border text-lg text-right"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-56 text-xs text-muted-foreground text-right pr-2">
              {isConnected ? (
                isTokenBalanceLoading ? (
                  'Fetching balance…'
                ) : tokenBalance ? (
                  <button
                    type="button"
                    onClick={() => setSourceAmount(tokenBalance)}
                    className="hover:text-foreground transition-colors"
                    title="Use max balance"
                  >
                    Max {tokenBalance}
                  </button>
                ) : (
                  '.'
                )
              ) : (
                '.'
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwitch}
            className="bg-secondary border-4 border-background rounded-xl p-2 -my-2 hover:bg-secondary/80 transition-colors"
            type="button"
          >
            <ArrowDownIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground">To</Label>
          <div className="flex gap-2 items-center">
            <div className="w-36 shrink-0">
              <ChainSelector value={destinationChain} onChange={setDestinationChain} />
            </div>
            <div className="w-36 shrink-0">
              <TokenSelector chain={destinationChain} value={destinationToken} onChange={setDestinationToken} />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                placeholder="0.0"
                value={
                  isEstimating
                    ? 'Estimating...'
                    : estimationError
                      ? 'Error'
                      : estimation
                        ? estimation.expectedAmountOut
                        : ''
                }
                disabled
                className="h-12 bg-secondary/50 border-border text-lg text-right"
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right pr-2">
            {estimation && !isEstimating ? `At least: ${estimation.minAmountOut} ${destinationToken.symbol}` : '.'}
          </div>
          {estimationError && <div className="text-xs text-destructive text-right pr-2">{estimationError}</div>}
        </div>

        <Button
          size="lg"
          className="w-full text-lg h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          onClick={handleSwap}
          disabled={isLoading || isEstimating || !estimation || !isConnected || !isSmartAccount}
        >
          {isLoading
            ? 'Creating Swap...'
            : isEstimating
              ? 'Estimating...'
              : !isConnected
                ? 'Connect wallet'
                : isSmartAccountLoading
                  ? 'Checking account...'
                  : !isSmartAccount
                    ? 'EIP-7702 required'
                    : 'Swap'}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Powered by{' '}
          <a
            href="https://www.mimic.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:text-violet-400 transition-colors"
          >
            Mimic
          </a>
        </div>
      </div>
    </Card>
  )
}
