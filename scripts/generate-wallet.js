#!/usr/bin/env node
/**
 * Generate a new Ethereum wallet for contract deployment.
 * KEEP THE PRIVATE KEY SECRET — never commit it to git.
 */

const { ethers } = require('ethers')

const wallet = ethers.Wallet.createRandom()

console.log('\n========================================')
console.log('  NEW DEPLOYMENT WALLET GENERATED')
console.log('========================================')
console.log(`  Address:     ${wallet.address}`)
console.log(`  Private Key: ${wallet.privateKey}`)
console.log('========================================')
console.log('\n⚠  IMPORTANT:')
console.log('  1. Save the private key securely')
console.log('  2. Set PRIVATE_KEY in Replit Secrets')
console.log('  3. Fund the address with MATIC (Polygon) or test MATIC')
console.log('\nTo get FREE test MATIC (Polygon Amoy testnet):')
console.log('  → https://faucet.polygon.technology/')
console.log('  → Paste your address above and request 0.5 MATIC')
console.log('\nTo get real MATIC for mainnet (~$1-2 is enough for 1000+ certificates):')
console.log('  → Buy on any exchange (Binance, Coinbase, etc.)')
console.log('  → Send to your address above on Polygon network')
console.log('')
