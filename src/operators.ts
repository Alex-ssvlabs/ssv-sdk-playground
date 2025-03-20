import { SSVSDK, chains } from "@ssv-labs/ssv-sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { hoodi } from "./hoodi.js";
import { Operator } from "./types";

dotenv.config();

async function main(): Promise<void> {
  if (
    !process.env.PRIVATE_KEY ||
    !process.env.OWNER_ADDRESS ||
    !process.env.OPERATOR_PUBKEYS ||
    !process.env.OPERATORS_FILEPATH
  ) {
    throw new Error("Required environment variables are not set");
  }

  const private_key: `0x${string}` = process.env.PRIVATE_KEY as `0x${string}`;

  // Setup viem clients
  const chain = hoodi;
  const transport = http();

  const publicClient = createPublicClient({
    chain,
    transport,
  });

  const account = privateKeyToAccount(private_key as `0x${string}`);
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

  const operatorPubkeys = process.env.OPERATOR_PUBKEYS.split(",");

  const operatorObjs = await registerOperators(
    operatorPubkeys,
    sdk,
    process.env.OWNER_ADDRESS as `0x${string}`
  );

  writeOperatorsToFile(operatorObjs, process.env.OPERATORS_FILEPATH);
}

async function registerOperators(
  pubkeys: string[],
  sdk: SSVSDK,
  owner_address: `0x${string}`
): Promise<Operator[]> {
  const operatorObjs: Operator[] = [];
  for (let pubkey of pubkeys) {
    console.log(`Registering operator with pubkey: ${pubkey}`);
    try {
      const register_receipt = await sdk.operators
        .registerOperator({
          args: {
            publicKey: pubkey,
            yearlyFee: 0n,
            isPrivate: true,
          },
        })
        .then((tx) => tx.wait());
      let event = register_receipt.events.find(
        (e) => e.eventName === "OperatorAdded"
      );
      const operatorID = event?.args.operatorId || 1n;
      console.log(`Successfully registered with OperatorID: ${operatorID}`);
      operatorObjs.push({ id: Number(operatorID), pubkey });
    } catch (error) {
      console.log("Failed to register: ", error);
    }
  }
  // whitelist the owner address to these registered operators
  try {
    let whitelist_receipt = await sdk.operators
      .setOperatorWhitelists({
        args: {
          operatorIds: operatorObjs.map((operator) => BigInt(operator.id)),
          whitelistAddresses: [owner_address],
        },
      })
      .then((tx) => tx.wait());
    console.log("Whitelist transaction hash: ", whitelist_receipt.transactionHash);
  } catch (error) {
    console.log("Failed to register: ", error);
  }

  return operatorObjs;
}

function writeOperatorsToFile(
  operatorsObj: Operator[],
  filePath: string
): void {
  const jsonString = JSON.stringify(operatorsObj);
  // Save the error message to a local file
  fs.appendFile(filePath, jsonString, (err) => {
    if (err) {
      console.error("Failed to write to file: ", err);
    } else {
      console.log(`Operators saved to file: ${filePath}`);
    }
  });
}

main();
