import { sendTransactions } from "@aboutcircles/miniapp-sdk";
import type { ContractRunner } from "@aboutcircles/sdk";
import {
  createPublicClient,
  http,
  type Hash,
  type PublicClient,
  type TransactionReceipt,
} from "viem";
import { gnosis } from "viem/chains";

type Address = `0x${string}`;
type TransactionRequest = {
  to: Address;
  data: `0x${string}`;
  value?: bigint;
};

interface BatchRun {
  addTransaction(tx: TransactionRequest): void;
  run(): Promise<TransactionReceipt>;
}

const DEFAULT_RPC = "https://rpc.gnosischain.com";

function mapTransaction(tx: TransactionRequest) {
  return {
    to: tx.to,
    data: tx.data,
    value: tx.value !== undefined ? tx.value.toString() : "0",
  };
}

class MiniappBatchRun implements BatchRun {
  private readonly transactions: TransactionRequest[] = [];

  constructor(
    private readonly publicClient: PublicClient,
    private readonly runner: ContractRunner,
  ) {}

  addTransaction(tx: TransactionRequest): void {
    this.transactions.push(tx);
  }

  async run(): Promise<TransactionReceipt> {
    if (!this.runner.sendTransaction) {
      throw new Error("Contract runner does not support sendTransaction");
    }
    return this.runner.sendTransaction(this.transactions);
  }
}

export function createMiniappRunner(address: Address): ContractRunner {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? DEFAULT_RPC;
  const publicClient = createPublicClient({
    chain: gnosis,
    transport: http(rpcUrl),
  });

  const runner: ContractRunner = {
    address,
    publicClient,
    async init() {},
    estimateGas: async (tx) => {
      return publicClient.estimateGas({
        account: address,
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
    },
    call: async (tx) => {
      const result = await publicClient.call({
        account: address,
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      return result.data ?? "0x";
    },
    sendTransaction: async (txs) => {
      if (txs.length === 0) {
        throw new Error("No transactions to send");
      }
      const hashes = await sendTransactions(txs.map(mapTransaction));
      const hash = hashes[hashes.length - 1] as Hash;
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "reverted") {
        throw new Error(`Transaction reverted: ${hash}`);
      }
      return receipt;
    },
    sendBatchTransaction: () => new MiniappBatchRun(publicClient, runner),
  };

  return runner;
}
