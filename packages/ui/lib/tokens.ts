export const TOKENS: Record<string, Record<string, { address: string; decimals: number }>> = {
  arbitrum: {
    USDC: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
    USDT: { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 6 },
    DAI: { address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', decimals: 18 },
    WBTC: { address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', decimals: 8 },
    WETH: { address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', decimals: 18 },
  },
  base: {
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    USDT: { address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', decimals: 6 },
    DAI: { address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', decimals: 18 },
    WBTC: { address: '0x0555e30da8f98308edb960aa94c0db47230d2b9c', decimals: 8 },
    WETH: { address: '0x4200000000000000000000000000000000000006', decimals: 18 },
  },
  ethereum: {
    USDC: { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
    USDT: { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6 },
    DAI: { address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18 },
    WBTC: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals: 8 },
    WETH: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18 },
  },
  gnosis: {
    USDC: { address: '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0', decimals: 6 },
    USDT: { address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6', decimals: 6 },
    WXDAI: { address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', decimals: 18 },
    WBTC: { address: '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252', decimals: 8 },
    WETH: { address: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', decimals: 18 },
  },
  optimism: {
    USDC: { address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', decimals: 6 },
    USDT: { address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', decimals: 6 },
    DAI: { address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', decimals: 18 },
    WBTC: { address: '0x68f180fcce6836688e9084f035309e29bf0a2095', decimals: 8 },
    WETH: { address: '0x4200000000000000000000000000000000000006', decimals: 18 },
  },
}
