import { SSVSDK, chains } from 'ssv-sdk'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'



const private_key: `0x${string}` = process.env.PRIVATE_KEY as `0x${string}`;

// Setup viem clients
const chain = chains.mainnet // or chains.holesky
const transport = http()

const publicClient = createPublicClient({
  chain,
  transport,
})

const account = privateKeyToAccount(private_key)
const walletClient = createWalletClient({
  account,
  chain,
  transport,
})

// Initialize SDK with viem clients
export const sdk = new SSVSDK({
  publicClient,
  walletClient,
})

console.log (sdk)