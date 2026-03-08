import { createHash } from 'crypto'

export function generateCertificateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'NTH-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function generateBlockchainHash(data: {
  sender: string
  receiver: string
  message: string
  ritual: string
  timestamp: string
}): string {
  const raw = `${data.sender}|${data.receiver}|${data.message}|${data.ritual}|${data.timestamp}`
  return '0x' + createHash('sha256').update(raw).digest('hex')
}
