/* eslint-disable */
import { IWrapPackage } from "@polywrap/core-js";
import { Bundle } from "@polywrap/config-bundle-types-js";
import { ExtendableUriResolver } from "@polywrap/uri-resolver-extensions-js";

// $start: bundle
import * as Sys from "@polywrap/sys-config-bundle-js";
import * as EthWallet from "@polywrap/ethereum-wallet-js";

export const bundle: Bundle = {
  concurrent: Sys.bundle.concurrent,
  http: Sys.bundle.http,
  ipfsHttpClient: Sys.bundle.ipfsHttpClient,
  ipfsResolver: Sys.bundle.ipfsResolver,
  ethereumWallet: {
    uri: "plugin/ethereum-wallet@1.0",
    package: EthWallet.plugin({
      connections: new EthWallet.Connections({
        networks: {
          mainnet: new EthWallet.Connection({
            provider:
              "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
          }),
          goerli: new EthWallet.Connection({
            provider:
              "https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
          }),
        },
      }),
    }) as IWrapPackage,
    implements: ["wrapscan.io/polywrap/ethereum-wallet@1.0"],
    redirectFrom: ["wrapscan.io/polywrap/ethereum-wallet@1.0"],
  },
  ensTextRecordResolver: {
    uri: "ipfs/QmdYoDrXPxgjSoWuSWirWYxU5BLtpGVKd3z2GXKhW2VXLh",
    implements: [
      "wrapscan.io/polywrap/ens-text-record-uri-resolver@1.0",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
    ],
    redirectFrom: ["wrapscan.io/polywrap/ens-text-record-uri-resolver@1.0"],
  },
  ensResolver: {
    uri: "wrapscan.io/polywrap/ens-uri-resolver@1.0",
    implements: [ExtendableUriResolver.defaultExtInterfaceUris[0].uri],
  },
  ensIpfsContenthashResolver: {
    uri: "wrapscan.io/polywrap/ens-ipfs-contenthash-uri-resolver@1.0",
    implements: [ExtendableUriResolver.defaultExtInterfaceUris[0].uri],
  },
};
// $end
