'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ExternalLink, Loader2 } from 'lucide-react'
import { findExecutions, Execution } from '@/lib/executions'
import { capitalize } from '@/lib/utils'
import { useAccount } from 'wagmi'

export function History() {
  const { address, isConnected } = useAccount()
  const [swaps, setSwaps] = useState<Execution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        setError(null)

        if (!isConnected || !address) {
          setSwaps([])
          return
        }

        setIsLoading(true)
        const executions = await findExecutions(address)
        setSwaps(executions)
      } catch (error) {
        console.error('Error fetching swap history:', error)
        setError(error instanceof Error ? error.message : 'Failed to load swaps history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSwaps()
  }, [address, isConnected])

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl py-6 bg-card border-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
          <span className="ml-2 text-muted-foreground">Loading swap history...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl py-6 bg-card border-border">
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
        </div>
      </Card>
    )
  }

  if (swaps.length === 0) {
    return (
      <Card className="w-full max-w-2xl py-6 bg-card border-border">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isConnected ? 'No swaps executed yet' : 'Please connect your wallet'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl py-6 bg-card border-border">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Swaps</h2>
        <div className="space-y-3">
          {swaps.map((swap, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{swap.description}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(swap.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${swap.result === 'succeeded' ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {swap.result === 'succeeded'
                      ? '✓ Success'
                      : ['failed', 'discarded', 'expired'].includes(swap.result)
                        ? '✗ Failed'
                        : `- ${capitalize(swap.result)}`}
                  </div>
                </div>
                <a
                  href={swap.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-500 hover:text-violet-400 transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
