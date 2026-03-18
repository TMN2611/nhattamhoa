#!/usr/bin/env node
/**
 * Deploy NhatTamCertificate to Polygon (Amoy testnet or mainnet)
 *
 * Usage:
 *   node scripts/deploy-contract.js           → deploys to Amoy testnet
 *   node scripts/deploy-contract.js mainnet   → deploys to Polygon mainnet
 *
 * Required env vars (set in Replit Secrets):
 *   PRIVATE_KEY   - your wallet private key (starts with 0x)
 */

const { ethers } = require('ethers')
const fs = require('fs')
const path = require('path')

const NETWORKS = {
  amoy: {
    name: 'Polygon Amoy Testnet (FREE)',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    chainId: 80002,
    explorer: 'https://amoy.polygonscan.com',
    currency: 'MATIC (test)',
    faucet: 'https://faucet.polygon.technology/',
  },
  mainnet: {
    name: 'Polygon Mainnet (REAL)',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    explorer: 'https://polygonscan.com',
    currency: 'MATIC (real)',
    faucet: null,
  },
}

async function deploy() {
  const targetNetwork = process.argv[2] === 'mainnet' ? 'mainnet' : 'amoy'
  const network = NETWORKS[targetNetwork]

  const compiledPath = path.join(__dirname, '..', 'blockchain', 'compiled.json')
  if (!fs.existsSync(compiledPath)) {
    console.error('❌ Contract not compiled yet. Run: node scripts/compile-contract.js')
    process.exit(1)
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(compiledPath, 'utf8'))

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY environment variable not set.')
    console.error('   Set it in Replit Secrets, then restart and run again.')
    process.exit(1)
  }

  console.log(`\n📡 Connecting to ${network.name}...`)
  const provider = new ethers.JsonRpcProvider(network.rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)

  const balance = await provider.getBalance(wallet.address)
  const balanceETH = ethers.formatEther(balance)

  console.log(`   Wallet: ${wallet.address}`)
  console.log(`   Balance: ${balanceETH} ${network.currency}`)

  if (balance === 0n) {
    console.error(`\n❌ Wallet has 0 balance. You need ${network.currency} to pay gas.`)
    if (network.faucet) {
      console.error(`   Get free test MATIC at: ${network.faucet}`)
      console.error(`   Paste your wallet address: ${wallet.address}`)
    }
    process.exit(1)
  }

  if (parseFloat(balanceETH) < 0.01) {
    console.warn(`\n⚠  Low balance (${balanceETH} MATIC). Deployment may fail.`)
    console.warn('   Need at least 0.01 MATIC for gas.')
  }

  console.log(`\n🚀 Deploying NhatTamCertificate contract...`)

  const factory = new ethers.ContractFactory(abi, bytecode, wallet)
  const contract = await factory.deploy()

  console.log(`   Transaction hash: ${contract.deploymentTransaction()?.hash}`)
  console.log('   Waiting for confirmation...')

  await contract.waitForDeployment()
  const contractAddress = await contract.getAddress()

  console.log(`\n✅ CONTRACT DEPLOYED SUCCESSFULLY!`)
  console.log('========================================')
  console.log(`   Network:          ${network.name}`)
  console.log(`   Contract address: ${contractAddress}`)
  console.log(`   Explorer:         ${network.explorer}/address/${contractAddress}`)
  console.log('========================================')
  console.log('\n📋 Add these to Replit Secrets:')
  console.log(`   NEXT_PUBLIC_RPC_URL         = ${network.rpcUrl}`)
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS = ${contractAddress}`)
  console.log('')

  // Save deployment info
  const deploymentInfo = {
    network: targetNetwork,
    networkName: network.name,
    contractAddress,
    rpcUrl: network.rpcUrl,
    deployer: wallet.address,
    deployedAt: new Date().toISOString(),
    txHash: contract.deploymentTransaction()?.hash,
    explorer: `${network.explorer}/address/${contractAddress}`,
  }

  const outPath = path.join(__dirname, '..', 'blockchain', `deployment-${targetNetwork}.json`)
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2))
  console.log(`   Deployment info saved to: blockchain/deployment-${targetNetwork}.json`)
}

deploy().catch(err => {
  console.error('\n❌ Deployment failed:', err.message)
  process.exit(1)
})
