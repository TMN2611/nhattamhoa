#!/usr/bin/env node
/**
 * Compile the NhatTamCertificate Solidity contract
 * Outputs ABI and bytecode to blockchain/compiled.json
 */

const solc = require('solc')
const fs = require('fs')
const path = require('path')

const contractPath = path.join(__dirname, '..', 'contracts', 'NhatTamCertificate.sol')
const outputPath = path.join(__dirname, '..', 'blockchain', 'compiled.json')

const source = fs.readFileSync(contractPath, 'utf8')

const input = {
  language: 'Solidity',
  sources: {
    'NhatTamCertificate.sol': { content: source },
  },
  settings: {
    outputSelection: {
      '*': { '*': ['abi', 'evm.bytecode'] },
    },
    optimizer: { enabled: true, runs: 200 },
  },
}

console.log('Compiling NhatTamCertificate.sol ...')
const output = JSON.parse(solc.compile(JSON.stringify(input)))

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error')
  if (errors.length > 0) {
    console.error('Compilation errors:')
    errors.forEach(e => console.error(e.formattedMessage))
    process.exit(1)
  }
  output.errors.forEach(e => console.warn(e.formattedMessage))
}

const contract = output.contracts['NhatTamCertificate.sol']['NhatTamCertificate']

const compiled = {
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
  compiledAt: new Date().toISOString(),
}

fs.writeFileSync(outputPath, JSON.stringify(compiled, null, 2))
console.log('✓ Compiled successfully → blockchain/compiled.json')
console.log(`  ABI functions: ${contract.abi.filter(x => x.type === 'function').map(x => x.name).join(', ')}`)
console.log(`  Bytecode size: ${Math.round(contract.evm.bytecode.object.length / 2)} bytes`)
