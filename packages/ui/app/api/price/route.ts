import { type NextRequest, NextResponse } from 'next/server'
import { OracleTokenPrice } from '@mimicprotocol/sdk'

interface PriceRequest {
  address: string
  chainId: number
}

export async function POST(request: NextRequest) {
  let body: PriceRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.chainId) return NextResponse.json({ error: 'Missing chainId' }, { status: 400 })
  if (!body.address) return NextResponse.json({ error: 'Missing address' }, { status: 400 })

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/oracle/price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: Date.now(),
        token: {
          address: body.address,
          chainId: body.chainId,
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: text }, { status: response.status })
    }

    const data: OracleTokenPrice = await response.json()
    const price = data.result.value
    return NextResponse.json({ price })
  } catch (error) {
    console.error('Price request error', error)
    return NextResponse.json({ error: 'Failed to fetch token price' }, { status: 500 })
  }
}
