import { ethers } from "ethers";

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return null;
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0] || null;
};

export const logToBlockchain = async (recipientAddress, message) => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return null;
  }

  if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
    throw new Error("Valid recipient wallet address is required");
  }

  await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  if (message) {
    console.log("Blockchain log message:", message);
  }

  const tx = await signer.sendTransaction({
    to: recipientAddress,
    value: ethers.parseEther("0.00001"),
    maxFeePerGas: ethers.parseUnits("30", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
  });

  await tx.wait();

  return tx.hash;
};
