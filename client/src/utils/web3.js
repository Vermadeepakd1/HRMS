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

export const logToBlockchain = async () => {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return null;
  }

  await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const tx = await signer.sendTransaction({
    to: await signer.getAddress(),
    value: ethers.parseEther("0.00001"),
  });

  await tx.wait();

  return tx.hash;
};
