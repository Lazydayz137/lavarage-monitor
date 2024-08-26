import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Monitoring } from '../types/monitoring';

export async function monitorAccountBalance(publicKeyString: string, tag: 'deployed' | 'liquidationGasRemain' | 'oracleGasRemain', monitor: Monitoring) {
  // Set up the connection to Solana
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

  // Convert the public key string to a PublicKey object
  const publicKey = new PublicKey(publicKeyString);

  // Function to get the current balance
  const getBalance = async () => {
    try {
      const balance = await connection.getBalance(publicKey);
      monitor.meta[tag] = balance / 1e9;
    } catch (error) {
      console.error(error);
    }
  };

  // Initial balance check
  await getBalance();

  // Set up the WebSocket listener for account changes
  connection.onAccountChange(publicKey, async (accountInfo, context) => {
    await getBalance(); // Update the balance when there is a change
  });

}
