import { SSVSDK } from "ssv-sdk";
import { createValidatorKeys } from "ssv-sdk/dist/libs/utils/methods/create-validator-keys";
console.log("SSVSDK:", SSVSDK);

const sdk = new SSVSDK({
  chain: "holesky",
  private_key: "0x_your_private_key_here",
});

// (async () => {
//   // api usage
//   const operator = await sdk.api.getOperator({ id: "844" });

//   // direct contract interaction (read)
//   const contractOperator = await sdk.contract.ssv.read.getOperatorById({
//     operatorId: 844n,
//   });

//   // direct contract interaction (write)
//   const tx = await sdk.contract.ssv.write.registerOperator({
//     args: {
//       publicKey: `0x...`,
//       fee: 10000000000n,
//       setPrivate: true,
//     },
//   });

//   // to wait for the transaction to be mined
//   await tx.wait();

//   // smart functions that will send the transaction for you
//   const { keystores } = await createValidatorKeys({
//     count: 1,
//     chain: "holesky",
//     withdrawal: `0x...`,
//     password: "123123123",
//   });

//   // 1st way to register validators -----------------------
//   const extracted = await sdk.utils.generateKeyShares({
//     keystore: JSON.stringify(keystores[0]),
//     keystore_password: "123123123",
//     operator_keys: [],
//     operator_ids: [],
//     owner_address: `0x...`,
//     nonce: 1,
//   });

//   const receipt = await sdk.clusters
//     .registerValidators({
//       keyshares: [extracted],
//     })
//     .then((tx) => tx.wait());
//   // ----------------------------------------------------------------

//   // 2nd way to register validators -----------------------
//   const shares = await sdk.utils.createShares({
//     operatorIds: [],
//     keyshares: "", // a keyshares file string or an object
//   });

//   const receipt = await sdk.clusters
//     .registerValidators({ keyshares: shares.available })
//     .then((tx) => tx.wait());
//   // ----------------------------------------------------------------
// })();
