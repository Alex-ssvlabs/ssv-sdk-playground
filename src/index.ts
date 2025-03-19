import { SSVSDK, chains } from "@ssv-labs/ssv-sdk";
import { parseEther, createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

interface KeySharesPayload {
    sharesData: string;
    publicKey: string;
    operatorIds: number[];
}

async function main(): Promise<void> {

    if (!process.env.KEYSHARES_FILE_DIRECTORY || 
        !process.env.OWNER_ADDRESS) {
        throw new Error('Required environment variables are not set');
    }

    const private_key: `0x${string}` = process.env.PRIVATE_KEY as `0x${string}`;

    // Setup viem clients
    const chain = chains.holesky // or chains.mainnet
    const transport = http()

    const publicClient = createPublicClient({
        chain,
        transport
    })

    const account = privateKeyToAccount(private_key)
    const walletClient = createWalletClient({
        account,
        chain,
        transport,
    })

    // Initialize SDK with viem clients
    const sdk = new SSVSDK({
        publicClient,
        walletClient,
    })

    let keysharesArray = await loadKeyshares(process.env.KEYSHARES_FILE_DIRECTORY)

    await registerValidators(keysharesArray, sdk)
    
}

async function loadKeyshares(directory: string): Promise<KeySharesPayload[]> {
    let keysharesArray: KeySharesPayload[] = [];

    try {
        const files = await fs.promises.readdir(directory);

        for (const file of files) {
            if (file.startsWith('keyshares') && file.endsWith('.json')) {
                const filePath = path.join(directory, file);

                const fileContent = await fs.promises.readFile(filePath, 'utf-8');
                const jsonContent = JSON.parse(fileContent);
                
                keysharesArray = jsonContent.shares as KeySharesPayload[]
            }
        }

        return keysharesArray;
    } catch (error) {
        console.error('Error loading keystores:', error);
        throw error;
    }
}

async function registerValidators(keyshares: any, sdk: SSVSDK) {
    let txn_receipt
    try {
        txn_receipt = await sdk.clusters.registerValidators({ 
            args: { 
                keyshares: keyshares, 
                depositAmount: parseEther('30') 
            },
        }).then(tx => tx.wait())
        console.log("txn_receipt: ", txn_receipt)
    } catch (error) {
        logErrorToFile(error);
        console.log("Failed to register: ", error)
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