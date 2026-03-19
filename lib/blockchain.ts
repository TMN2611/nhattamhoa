import { ethers } from 'ethers';

export async function checkWalletBalance() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    return { isConfigured: false, balance: null, formatted: null };
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    const formatted = ethers.formatEther(balance);
    return {
      isConfigured: true,
      balance: balance.toString(),
      formatted,
      address: wallet.address,
      hasBalance: balance > 0n,
    };
  } catch (error: any) {
    return { isConfigured: false, balance: null, formatted: null, error: error.message };
  }
}

export async function saveCertificateOnChain(
  orderId: string,
  buyerName: string,
  recipientName: string,
  message: string
) {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

  if (!rpcUrl || !privateKey || !contractAddress) {
    const err = new Error('Blockchain not configured (missing RPC URL, PRIVATE_KEY, or CONTRACT_ADDRESS)');
    err.name = 'BlockchainNotConfigured';
    throw err;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Check balance first
  const balance = await provider.getBalance(wallet.address);
  if (balance === 0n) {
    const err = new Error(`Insufficient funds in wallet ${wallet.address}. Balance: 0 MATIC`);
    err.name = 'InsufficientFunds';
    throw err;
  }

  const abi = [
    "function createCertificate(string orderId, string buyerName, string recipientName, string message) public returns (bytes32)",
    "event CertificateCreated(string orderId, string buyerName, string recipientName, bytes32 hash, uint256 timestamp)"
  ];

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  try {
    const tx = await contract.createCertificate(orderId, buyerName, recipientName, message);
    const receipt = await tx.wait();

    if (!receipt || receipt.status === 0) {
      const err = new Error('Blockchain transaction failed (reverted)');
      err.name = 'TransactionReverted';
      throw err;
    }

    return receipt.hash;
  } catch (error: any) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      const err = new Error('Insufficient MATIC in wallet to pay for transaction gas');
      err.name = 'InsufficientFunds';
      throw err;
    }
    if (error.message?.includes('exceeds balance')) {
      const err = new Error('Wallet balance too low for transaction');
      err.name = 'InsufficientFunds';
      throw err;
    }
    // Re-throw original error with better message
    const err = new Error(`Blockchain transaction failed: ${error.message}`);
    err.name = error.name || 'BlockchainError';
    throw err;
  }
}
