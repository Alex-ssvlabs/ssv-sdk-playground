import { SSVSDK, chains } from "@ssv-labs/ssv-sdk";
import { parseEther, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { hoodi } from "./hoodi.js";
import { KeyStore, Operator, PubKey } from "./types.js";

dotenv.config();

async function main(): Promise<void> {
  if (
    !process.env.OWNER_ADDRESS ||
    !process.env.KEYSTORES_FILE_DIRECTORY ||
    !process.env.KEYSTORE_PASSWORD ||
    !process.env.OPERATORS_FILEPATH
  ) {
    throw new Error("Required environment variables are not set");
  }

  const private_key: PubKey = process.env.PRIVATE_KEY as PubKey;

  // Setup viem clients
  const chain = hoodi;
  const transport = http();

  const publicClient = createPublicClient({
    chain,
    transport,
  });

  const account = privateKeyToAccount(private_key);
  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  });

  // Initialize SDK with viem clients
  const sdk = new SSVSDK({
    publicClient,
    walletClient,
  });

  let keystoresArray: KeyStore[];
  try {
    keystoresArray = await loadKeystores(process.env.KEYSTORES_FILE_DIRECTORY);
    console.log("Loaded keystores: Keystore Amount: ", keystoresArray.length);
  } catch (error) {
    console.error("Failed to load keystores:", error);
    throw error; // Exit if we can't load keystores
  }
  let pubkeys = keystoresArray.map((keystore) => `0x${keystore.pubkey}`) as `0x${string}`[]

  console.log(`List of pubkeys to remove: ${pubkeys}`)
  
  let operatorData = await getOperatorData(process.env.OPERATORS_FILEPATH);
  let clusterID =`${process.env.OWNER_ADDRESS.toLowerCase()}-${operatorData.map((operator) => operator.id).join('-')}`
  console.log(`Removing from cluster: ${clusterID}`)

  await removeValidators(pubkeys, clusterID, sdk)
}

async function loadKeystores(directory: string): Promise<any[]> {
  const keystoresArray: any[] = [];

  try {
    const files = await fs.promises.readdir(directory);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(directory, file);

        const fileContent = await fs.promises.readFile(filePath, "utf-8");
        const jsonContent = JSON.parse(fileContent);
        keystoresArray.push(jsonContent);
      }
    }

    return keystoresArray;
  } catch (error) {
    console.error("Error loading keystores:", error);
    throw error;
  }
}

async function getOperatorData(filePath:string) {
    let operatorData: Operator[] = [];

    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    operatorData = JSON.parse(fileContent);
    return operatorData
}

async function removeValidators(pubkeys: `0x${string}`[], clusterID: string, sdk: SSVSDK) {
  
  let txn_receipt;
  try {

    txn_receipt = await sdk.clusters.removeValidators({ args: {
      id: clusterID,
      publicKeys: pubkeys
    }}).then((tx) => tx.wait());
    console.log("Removed validators, tx hash:: ", txn_receipt.transactionHash);
  } catch (error) {
    logErrorToFile(error);
    console.log("Failed to register: ", error);
  }
}

async function registerValidators(keyshares: any, sdk: SSVSDK) {
  let txn_receipt;
  try {
    txn_receipt = await sdk.clusters
      .registerValidators({
        args: {
          keyshares: keyshares,
          depositAmount: parseEther("30"),
        },
      })
      .then((tx) => tx.wait());
    console.log("Registered validators, tx hash:: ", txn_receipt.transactionHash);
  } catch (error) {
    logErrorToFile(error);
    console.log("Failed to register: ", error);
  }
}

function logErrorToFile(error: unknown): void {
  const errorMessage = `Failed to do register: ${
    error instanceof Error ? error.message : String(error)
  }\n`;

  // Log the error to the console
  console.log(errorMessage);

  // Save the error message to a local file
  const filePath = "./error-log.txt";
  fs.appendFile(filePath, errorMessage, (err) => {
    if (err) {
      console.error("Failed to write to file: ", err);
    } else {
      console.log(`Error saved to file: ${filePath}`);
    }
  });
}

main();
