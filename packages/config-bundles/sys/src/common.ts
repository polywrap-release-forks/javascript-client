/* eslint-disable */
import { IWrapPackage } from "@polywrap/core-js";
import { Bundle } from "@polywrap/config-bundle-types-js";
import { ExtendableUriResolver } from "@polywrap/uri-resolver-extensions-js";

// $start: bundle
import { loggerPlugin } from "@polywrap/logger-plugin-js";
import { dateTimePlugin } from "@polywrap/datetime-plugin-js";
import { concurrentPromisePlugin } from "@polywrap/concurrent-plugin-js";
import { httpPlugin } from "@polywrap/http-plugin-js";
import * as httpResolver from "./embeds/http-resolver/wrap";
import * as ipfsHttpClient from "./embeds/ipfs-http-client/wrap";
import * as ipfsResolver from "./embeds/async-ipfs-resolver/wrap";

export const ipfsProviders: string[] = [
  "https://ipfs.wrappers.io",
  "https://ipfs.io",
];

export const bundle: Bundle = {
  logger: {
    uri: "plugin/logger@1.0.0",
    package: loggerPlugin({}) as IWrapPackage,
    implements: ["wrapscan.io/polywrap/logger@1.0", "ens/wraps.eth:logger@1.0.0"],
    redirectFrom: [
      "wrapscan.io/polywrap/logger@1.0",
      "ens/wraps.eth:logger@1.0.0",
    ],
  },
  datetime: {
    uri: "plugin/datetime@1.0.0",
    package: dateTimePlugin({}) as IWrapPackage,
    implements: [
      "wrapscan.io/polywrap/datetime@1.0",
      "ens/wraps.eth:datetime@1.0.0",
    ],
    redirectFrom: [
      "wrapscan.io/polywrap/datetime@1.0",
      "ens/wraps.eth:datetime@1.0.0",
    ],
  },
  concurrent: {
    uri: "plugin/concurrent@1.0.0",
    package: concurrentPromisePlugin({}) as IWrapPackage,
    implements: [
      "wrapscan.io/polywrap/concurrent@1.0",
      "ens/wraps.eth:concurrent@1.0.0",
    ],
    redirectFrom: [
      "wrapscan.io/polywrap/concurrent@1.0",
      "ens/wraps.eth:concurrent@1.0.0",
    ],
  },
  http: {
    uri: "plugin/http@1.1.0",
    package: httpPlugin({}) as IWrapPackage,
    implements: [
      "wrapscan.io/polywrap/http@1.0",
      "ens/wraps.eth:http@1.1.0",
      "ens/wraps.eth:http@1.0.0",
    ],
    redirectFrom: [
      "wrapscan.io/polywrap/http@1.0",
      "ens/wraps.eth:http@1.1.0",
      "ens/wraps.eth:http@1.0.0",
    ],
  },
  githubResolver: {
    uri: "wrap://ipfs/QmYPp2bQpRxR7WCoiAgWsWoiQzqxyFdqWxp1i65VW8wNv2",
    implements: [ExtendableUriResolver.defaultExtInterfaceUris[0].uri],
  },
  httpResolver: {
    uri: "embed/http-uri-resolver-ext@1.0.1",
    package: httpResolver.wasmPackage,
    implements: [
      "ens/wraps.eth:http-uri-resolver-ext@1.0.1",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
      ExtendableUriResolver.defaultExtInterfaceUris[2].uri,
    ],
    redirectFrom: ["ens/wraps.eth:http-uri-resolver-ext@1.0.1"],
  },
  wrapscanResolver: {
    uri: "https://wraps.wrapscan.io/r/polywrap/wrapscan-uri-resolver@1.0",
    implements: [
      "wrapscan.io/polywrap/wrapscan-uri-resolver@1.0",
      ExtendableUriResolver.defaultExtInterfaceUris[2].uri,
    ],
    redirectFrom: ["wrapscan.io/polywrap/wrapscan-uri-resolver@1.0"],
  },
  ipfsHttpClient: {
    uri: "embed/ipfs-http-client@1.0.0",
    package: ipfsHttpClient.wasmPackage,
    implements: [
      "wrapscan.io/polywrap/ipfs-http-client@1.0",
      "ens/wraps.eth:ipfs-http-client@1.0.0",
    ],
    redirectFrom: [
      "wrapscan.io/polywrap/ipfs-http-client@1.0",
      "ens/wraps.eth:ipfs-http-client@1.0.0",
    ],
  },
  ipfsResolver: {
    uri: "embed/async-ipfs-uri-resolver-ext@1.0.1",
    package: ipfsResolver.wasmPackage,
    implements: [
      "ens/wraps.eth:async-ipfs-uri-resolver-ext@1.0.1",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
      ExtendableUriResolver.defaultExtInterfaceUris[2].uri,
    ],
    redirectFrom: ["ens/wraps.eth:async-ipfs-uri-resolver-ext@1.0.1"],
    env: {
      provider: ipfsProviders[0],
      fallbackProviders: ipfsProviders.slice(1),
      retries: { tryResolveUri: 2, getFile: 2 },
    },
  },
};
// $end
