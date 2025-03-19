# ssv-sdk-playground

## Clone repository and install dependencies
In order to use this project, please clone it:
```sh
git clone git@github.com:RaekwonIII/ssv-sdk-playground.git
```
or
```sh
git clone https://github.com/RaekwonIII/ssv-sdk-playground.git
```

Then install dependencies by running the command:

```sh
npm i
```

If you do not have Node.js installed, [please visit the official website](https://nodejs.org/en/download).

## Edit configuration

Make a copy of the `.env.example` file and edit it:
```sh
cp .env.example .env
```

Make sure to edit the variables so that the private key and owner address reflect your wallet.
Also, add any operator public keys you want to register, separating them with a comma:

```sh
OPERATOR_PUBKEYS=LS0tLS1CRUdJTiBS...FCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K,LS0tLS1CRUdJTiBS...FCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K,LS0tLS1CRUdJTiBS...FCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K
```

### ⚠️ Please note
Any changes done to the `.env` file will **not be** visible to anyone. This file cannot be committed (see `.gitignore`), so there is no danger of exposing private keys or keystore password.
Similarly, the values of these variables are only used during the execution of the software, they are not stored anywhere, besides the environment file itself.

## Register the operators

To register the operator pubkeys and obtain operator IDs, please launch the command:

```sh
npm run registerOperators
```

This will create a file named `operators.json` in the main folder of the repository

## Register validators

Create a keystore file for as many validators you need, using the `staking_deposit-cli`, and add the generated `keystore*.json` files to the folder you configured using the `KEYSTORES_FILE_DIRECTORY` environment variable (default: `validator_keys`).

Register validators by launching the command:
```sh
npm run registerValidators
```