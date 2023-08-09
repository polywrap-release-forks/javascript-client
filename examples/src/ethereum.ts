import {
  PolywrapClient,
  PolywrapClientConfigBuilder,
} from "@polywrap/client-js";
import { Uri } from "@polywrap/core-js";
import {
  ethereumWalletPlugin,
  Connection,
  Connections,
} from "@polywrap/ethereum-wallet-js";
import { Wallet } from "ethers";

const main = async () => {
  const { uri: ethereumPluginUri } = Uri.from(
    "wrapscan.io/polywrap/ethereum-wallet@1.0"
  );
  const builder = new PolywrapClientConfigBuilder();
  builder.addBundle("sys");
  const ethereumPlugin = ethereumWalletPlugin({
    connections: new Connections({
      networks: {
        mainnet: new Connection({
          provider:
            "https://mainnet.infura.io/v3/f1f688077be642c190ac9b28769daecf",
          signer: new Wallet(
            "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"
          ),
        }),
      },
    }),
  });
  builder.setPackage(ethereumPluginUri, ethereumPlugin);
  const client = new PolywrapClient(builder.build());

  const balance = await client.invoke<String>({
    uri: "wrapscan.io/polywrap/ethers@1.0.0",
    method: "getBalance",
    args: {
      address: "0x00000000219ab540356cbb839cbe05303d7705fa",
    },
  });

  if (!balance.ok) {
    throw Error("Error getting balance: " + balance.error);
  }

  console.log("Balance in Wei: " + balance.value);

  const balanceInEth = await client.invoke<String>({
    uri: "wrapscan.io/polywrap/ethers-utils@1.0.0",
    method: "toEth",
    args: {
      wei: balance.value,
    },
  });

  if (!balanceInEth.ok) {
    throw Error("Error converting balance to ETH: " + balanceInEth.error);
  }

  console.log("Balance in Eth: " + balanceInEth.value);

  const domain = {
    name: "Ether Mail",
    version: "1",
    chainId: 1,
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  };

  // The named list of all type definitions
  const types = {
    EIP712Domain: [
      {
        type: "string",
        name: "name",
      },
      {
        type: "string",
        name: "version",
      },
      {
        type: "uint256",
        name: "chainId",
      },
      {
        type: "address",
        name: "verifyingContract",
      },
    ],
    Person: [
      { name: "name", type: "string" },
      { name: "wallet", type: "address" },
    ],
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person" },
      { name: "contents", type: "string" },
    ],
  };

  // The data to sign
  const message = {
    from: {
      name: "Cow",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  };

  console.log("Signing typed data...");
  const signedData = await client.invoke<string>({
    uri: "wrapscan.io/polywrap/ethers@1.0.0",
    method: "signTypedData",
    args: {
      payload: JSON.stringify({ domain, primaryType: "Mail", types, message }),
    },
  });

  if (!signedData.ok) {
    throw Error("Error signing data: " + signedData.error);
  }

  console.log("Signed data: " + signedData.value);
};

main()
  .then()
  .catch((e) => {
    console.error("Error in Ethereum example: ", e);
  });
