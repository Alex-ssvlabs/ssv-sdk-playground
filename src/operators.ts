import { SSVSDK, chains } from "@ssv-labs/ssv-sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { hoodi } from "./hoodi";

dotenv.config();

interface Operator {
  id: number;
  pubkey: string;
}

async function main(): Promise<void> {
  if (
    !process.env.PRIVATE_KEY ||
    !process.env.OPERATOR_PUBKEYS ||
    !process.env.OPERATORS_FILEPATH
  ) {
    throw new Error("Required environment variables are not set");
  }

  const private_key: `0x${string}` = process.env.PRIVATE_KEY as `0x${string}`;

  // Setup viem clients
  //   const chain = chains.holesky;
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

  const operatorObjs = await registerOperators(operatorPubkeys, sdk);

  writeOperatorsToFile(operatorObjs, process.env.OPERATORS_FILEPATH);
}

async function registerOperators(
  pubkeys: string[],
  sdk: SSVSDK
): Promise<Operator[]> {
  const operatorObjs: Operator[] = [];
  for (let pubkey of pubkeys) {
    console.log(`Registering operator with pubkey: ${pubkey}`);
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
