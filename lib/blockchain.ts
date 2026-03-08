import { ethers } from 'ethers';

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
    console.warn("Blockchain not configured. Returning simulated transaction hash.");
    const timestamp = Date.now().toString(16);
    const simHash = ethers.keccak256(
      ethers.toUtf8Bytes(`${orderId}:${buyerName}:${recipientName}:${message}:${timestamp}`)
    );
    return simHash;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const abi = [
    "function createCertificate(string orderId, string buyerName, string recipientName, string message) public returns (bytes32)",
    "event CertificateCreated(string orderId, string buyerName, string recipientName, bytes32 hash, uint256 timestamp)"
  ];

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  const tx = await contract.createCertificate(orderId, buyerName, recipientName, message);
  const receipt = await tx.wait();

  return receipt.hash;
}
