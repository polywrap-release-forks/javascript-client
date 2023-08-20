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

const main = async () => {
  const { uri: ethereumWalletUri } = Uri.from(
    "wrapscan.io/polywrap/ethereum-wallet@1.0"
  );
  const builder = new PolywrapClientConfigBuilder();
  builder.addBundle("sys");
  const ethereumWalletPackage = ethereumWalletPlugin({
    connections: new Connections({
      networks: {
        mainnet: new Connection({
          provider:
            "https://mainnet.infura.io/v3/f1f688077be642c190ac9b28769daecf",
        }),
      },
    }),
  });
  builder.setPackage(ethereumWalletUri, ethereumWalletPackage);
  const client = new PolywrapClient(builder.build());

  const resolverAddress = await client.invoke<String>({
    uri: "wrapscan.io/polywrap/ens@1.0.0",
    method: "getResolver",
    args: {
      registryAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
      domain: "vitalik.eth",
    },
  });

  if (!resolverAddress.ok) {
    throw Error("Error getting resolver: " + resolverAddress.error);
  }

  console.log("Resolver address: " + resolverAddress.value);

  const contentHash = await client.invoke<String>({
    uri: "wrapscan.io/polywrap/ens@1.0.0",
    method: "getContentHash",
    args: {
      resolverAddress: resolverAddress.value,
      domain: "vitalik.eth",
    },
  });

  if (!contentHash.ok) {
    throw Error("Error getting resolver: " + contentHash.error);
  }

  console.log("Content hash of vitalik.eth: " + contentHash.value);
};

main()
  .then()
  .catch((e) => {
    console.error("Error in Ethereum example: ", e);
  });
