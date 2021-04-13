import { EthereumPlugin } from ".";
import { SerializableTxRequest } from "./serialize";

import { PluginModule } from "@web3api/core-js";

export const mutation = (ethereum: EthereumPlugin): PluginModule => ({
  callContractMethod: async (input: {
    address: string;
    method: string;
    args: string[];
  }) => {
    return await ethereum.callContractMethod(
      input.address,
      input.method,
      input.args
    );
  },

  sendTransaction: async (input: { tx: SerializableTxRequest }) => {
    return await ethereum.sendTransaction(input.tx);
  },

  deployContract: async (input: { abi: string; bytecode: string }) => {
    return await ethereum.deployContract(input.abi, input.bytecode);
  },

  sendRPC: async (input: { method: string; params: string[] }) => {
    return await ethereum.sendRPC(input.method, input.params);
  },
});

export const query = (ethereum: EthereumPlugin): PluginModule => ({
  callView: async (input: {
    address: string;
    method: string;
    args: string[];
  }) => {
    return await ethereum.callView(input.address, input.method, input.args);
  },

  signMessage: async (input: { message: string }) => {
    return await ethereum.signMessage(input.message);
  },

  encodeParams: (input: { types: string[]; values: string[] }) => {
    return ethereum.encodeParams(input.types, input.values);
  },

  getSignerAddress: async () => {
    return await ethereum.getSigner().getAddress();
  },

  getSignerBalance: async (input: { blockTag?: number }) => {
    return (await ethereum.getSigner().getBalance(input.blockTag)).toString();
  },

  getSignerTransactionCount: async (input: { blockTag?: number }) => {
    return (
      await ethereum.getSigner().getTransactionCount(input.blockTag)
    ).toString();
  },

  getGasPrice: async () => {
    return (await ethereum.getSigner().getGasPrice()).toString();
  },

  estimateTxGas: async (input: { tx: SerializableTxRequest }) => {
    return (await ethereum.getSigner().estimateGas(input.tx)).toString();
  },

  checkAddress: async (input: { address: string }) => {
    return await ethereum.checkAddress(input.address);
  },

  toWei: async (input: { amount: string }) => {
    return await ethereum.toWei(input.amount);
  },

  fromWei: async (input: { amount: string }) => {
    return await ethereum.fromWei(input.amount);
  },

  waitForEvent: async (input: {
    address: string;
    event: string;
    args: string[];
    timeout: number;
  }) => {
    return await ethereum.waitForEvent(
      input.address,
      input.event,
      input.args,
      input.timeout
    );
  },

  estimateContractCallGas: async (input: {
    address: string;
    method: string;
    args: string[];
  }) => {
    return await ethereum.estimateContractCallGas(
      input.address,
      input.method,
      input.args
    );
  },
});
