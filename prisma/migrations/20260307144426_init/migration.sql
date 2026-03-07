-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerName" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "loveLetter" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "txHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
