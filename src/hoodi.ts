import { defineChain } from 'viem'
 
export const hoodi = defineChain({
  id: 7777777,
  name: 'Hoodi',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hoodi.ethpandaops.io/'],
      webSocket: ['wss://rpc.hoodi.ethpandaops.io/'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://hoodi.cloud.blockscout.com/' },
  },
})