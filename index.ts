import { SSVSDK } from "ssv-sdk";
import { operators } from './mock'
import { parseEther } from 'viem'
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();  

async function main(): Promise<void> {
    

    const private_key: `0x${string}` = process.env.PRIVATE_KEY as `0x${string}`;
    const chain: 'holesky' | 'mainnet' = process.env.CHAIN as 'holesky' | 'mainnet';

    const sdk = new SSVSDK({
        chain: chain,
        private_key: private_key,
    })

    console.log(operators.keys)
    console.log(operators.ids.map((id) => Number(id)))

    const directoryPath = process.env.KEYSTORE_FILE_DIRECTORY;
    let  keystoresArray
    try {
        
        keystoresArray = await loadKeystores(directoryPath);
        console.log('Loaded keystores: Keystore Amount: ', keystoresArray.length);
    } catch (error) {
        console.error('Failed to load keystores:', error);
    }

    
    await sdk.contract.token.write
    .approve({
      args: {
        spender: sdk.core.contractAddresses.setter,
        amount: parseEther('10000'),
        },
    })
    .then((tx) => tx.wait())

    let nonce = Number(await sdk.api.getOwnerNonce({ owner: process.env.OWNER_ADDRESS}))
    console.log("Initial nonce: ", nonce)

    const chunkSize = 40; // Number of validators per transaction 
    for (let i = 0; i < keystoresArray.length; i += chunkSize) {
        const chunk = keystoresArray.slice(i, i + chunkSize);

        const keystoreValues = chunk.map(item => item.keystore);

        const keysharesPayload = await sdk.utils.generateKeyShares({
          keystore: keystoreValues,
          keystore_password: process.env.KEYSTORE_PASSWORD,
          operator_keys: operators.keys,
          operator_ids: operators.ids.map((id) => Number(id)),
          owner_address: process.env.OWNER_ADDRESS,
          nonce: nonce,
        })

        nonce = nonce + Number(chunk.length)
        console.log("New nonce: ", nonce)

        // TODO: validate keysharesPayload

        let txn_receipt
        try { 
          console.log(`Processing chunk from index ${i} to ${i + chunk.length - 1}`);
          txn_receipt = await sdk.clusters.registerValidators({ keyshares: keysharesPayload, depositAmount: parseEther('30')}).then(tx=>tx.wait())
          console.log("txn_receipt: ", txn_receipt)
        } catch (error) {
          logErrorToFile(error);
          console.log("Failed to do register: ", error)
        }
    }    
}

async function loadKeystores(directory: string): Promise<{ name: string; keystore: any }[]> {
    const keystoresArray: { name: string; keystore: any }[] = [];
  
    try {
        const files = await fs.promises.readdir(directory);
  
        for (const file of files) {
            if (file.startsWith('keystore-m') && file.endsWith('.json')) {
                const filePath = path.join(directory, file);
  
                const fileContent = await fs.promises.readFile(filePath, 'utf-8');
                const jsonContent = JSON.parse(fileContent);
                keystoresArray.push({ name: file, keystore: jsonContent });
            }
        }
  
        return keystoresArray;
    } catch (error) {
        console.error('Error loading keystores:', error);
        throw error;
    }
}

function logErrorToFile(error: unknown): void {
  const errorMessage = `Failed to do register: ${error instanceof Error ? error.message : String(error)}\n`;

  // Log the error to the console
  console.log(errorMessage);

  // Save the error message to a local file
  const filePath = './error-log.txt';
  fs.appendFile(filePath, errorMessage, (err) => {
      if (err) {
          console.error("Failed to write to file: ", err);
      } else {
          console.log(`Error saved to file: ${filePath}`);
      }
  });
}

main();