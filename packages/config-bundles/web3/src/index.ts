/* eslint-disable */
import { IWrapPackage } from "@polywrap/core-js";
import { Bundle } from "@polywrap/config-bundle-types-js";
import { ExtendableUriResolver } from "@polywrap/uri-resolver-extensions-js";

// $start: bundle
import * as Sys from "@polywrap/sys-config-bundle-js";
import * as EthProviderV1 from "@polywrap/ethereum-provider-js-v1";
import * as EthProvider from "@polywrap/ethereum-provider-js";

export const bundle: Bundle = {
  concurrent: Sys.bundle.concurrent,
  http: Sys.bundle.http,
  ipfsHttpClient: Sys.bundle.ipfsHttpClient,
  ipfsResolver: Sys.bundle.ipfsResolver,
  ethereumProviderV1: {
    uri: "plugin/ethereum-provider@1.1.0",
    package: EthProviderV1.plugin({
      connections: new EthProviderV1.Connections({
        networks: {
          mainnet: new EthProviderV1.Connection({
            provider:
              "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
          }),
          goerli: new EthProviderV1.Connection({
            provider:
              "https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
          }),
        },
      }),
    }) as IWrapPackage,
    implements: [
      "ens/wraps.eth:ethereum-provider@1.1.0",
      "ens/wraps.eth:ethereum-provider@1.0.0",
    ],
    redirectFrom: [
      "ens/wraps.eth:ethereum-provider@1.1.0",
      "ens/wraps.eth:ethereum-provider@1.0.0",
    ],
  },
  ethereumProviderV2: {
    uri: "plugin/ethereum-provider@2.0.0",
    package: EthProvider.plugin({
      connections: new EthProvider.Connections({
        networks: {
          mainnet: new EthProvider.Connection({
            provider:
              "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
          }),
          goerli: new EthProvider.Connection({
            provider:
              "https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
          }),
        },
      }),
    }) as IWrapPackage,
    implements: ["ens/wraps.eth:ethereum-provider@2.0.0"],
    redirectFrom: ["ens/wraps.eth:ethereum-provider@2.0.0"],
  },
  ensTextRecordResolver: {
    uri: "ipfs/QmXcHWtKkfrFmcczdMSXH7udsSyV3UJeoWzkaUqGBm1oYs",
    implements: [
      "ens/wraps.eth:ens-text-record-uri-resolver-ext@1.0.1",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
    ],
    redirectFrom: ["ens/wraps.eth:ens-text-record-uri-resolver-ext@1.0.1"],
  },
  ensResolver: {
    uri: "ens/wraps.eth:ens-uri-resolver-ext@1.0.1",
    implements: [ExtendableUriResolver.defaultExtInterfaceUris[0].uri],
  },
  ensIpfsContenthashResolver: {
    uri: "ens/wraps.eth:ens-ipfs-contenthash-uri-resolver-ext@1.0.1",
    implements: [ExtendableUriResolver.defaultExtInterfaceUris[0].uri],
  },
};
// $end
