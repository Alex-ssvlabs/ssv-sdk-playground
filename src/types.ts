
export type PubKey = `0x${string}`

export type DepositData = {
  pubkey: string
  withdrawal_credentials: string
  amount: number
  signature: string
  deposit_message_root: string
  deposit_data_root: string
  fork_version: string
  network_name: 'mainnet' | 'holesky' | 'hoodi'
}

export interface KeySharesPayload {
  sharesData: string;
  publicKey: string;
  operatorIds: number[];
}

export interface Operator {
  id: number;
  pubkey: string;
}

export interface KeyStore {

  crypto: {
    kfd: {
      function: string;
      params: {
        dklen: number;
        n: number;
        r: number;
        p: number;
        salt: string;
      }
      message: string
    }
  }
  checksum: {
    function: string;
    params: {};
    message: string;
  }
  cipher: {
    function: string;
    params: {iv: string};
    message: string;
  }
  description: string;
  pubkey: string;
  path: string;
  uuid: string;
  version: number
}