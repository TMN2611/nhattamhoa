import Database from 'better-sqlite3'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(dbPath)
    _db.pragma('journal_mode = WAL')

    _db.exec(`
      CREATE TABLE IF NOT EXISTS "Order" (
        id TEXT PRIMARY KEY,
        buyerName TEXT NOT NULL,
        recipientName TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        loveLetter TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        txHash TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
  }
  return _db
}

export interface Order {
  id: string
  buyerName: string
  recipientName: string
  phoneNumber: string
  loveLetter: string
  status: string
  txHash: string | null
  createdAt: string
}

export function createOrder(data: {
  buyerName: string
  recipientName: string
  phoneNumber: string
  loveLetter: string
}): Order {
  const db = getDb()
  const id = uuidv4()
  const stmt = db.prepare(`
    INSERT INTO "Order" (id, buyerName, recipientName, phoneNumber, loveLetter, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `)
  stmt.run(id, data.buyerName, data.recipientName, data.phoneNumber, data.loveLetter)

  return db.prepare('SELECT * FROM "Order" WHERE id = ?').get(id) as Order
}

export function getAllOrders(): Order[] {
  const db = getDb()
  return db.prepare('SELECT * FROM "Order" ORDER BY createdAt DESC').all() as Order[]
}

export function getOrderById(id: string): Order | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM "Order" WHERE id = ?').get(id) as Order | undefined
}

export function updateOrderStatus(id: string, status: string, txHash: string): Order {
  const db = getDb()
  db.prepare('UPDATE "Order" SET status = ?, txHash = ? WHERE id = ?').run(status, txHash, id)
  return db.prepare('SELECT * FROM "Order" WHERE id = ?').get(id) as Order
}

export function getOrderStats() {
  const db = getDb()
  const total = (db.prepare('SELECT COUNT(*) as count FROM "Order"').get() as any).count
  const pending = (db.prepare('SELECT COUNT(*) as count FROM "Order" WHERE status = ?').get('pending') as any).count
  const recorded = (db.prepare('SELECT COUNT(*) as count FROM "Order" WHERE status = ?').get('recorded') as any).count
  return { total, pending, recorded }
}
