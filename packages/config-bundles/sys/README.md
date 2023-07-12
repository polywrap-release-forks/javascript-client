# Sys Config Bundle

A collection of system-level configurations.

## Bundle

```typescript
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
    implements: ["ens/wraps.eth:logger@1.0.0"],
    redirectFrom: ["ens/wraps.eth:logger@1.0.0"],
  },
  datetime: {
    uri: "plugin/datetime@1.0.0",
    package: dateTimePlugin({}) as IWrapPackage,
    implements: ["ens/wraps.eth:datetime@1.0.0"],
    redirectFrom: ["ens/wraps.eth:datetime@1.0.0"],
  },
  concurrent: {
    uri: "plugin/concurrent@1.0.0",
    package: concurrentPromisePlugin({}) as IWrapPackage,
    implements: ["ens/wraps.eth:concurrent@1.0.0"],
    redirectFrom: ["ens/wraps.eth:concurrent@1.0.0"],
  },
  http: {
    uri: "plugin/http@1.1.0",
    package: httpPlugin({}) as IWrapPackage,
    implements: ["ens/wraps.eth:http@1.1.0", "ens/wraps.eth:http@1.0.0"],
    redirectFrom: ["ens/wraps.eth:http@1.1.0", "ens/wraps.eth:http@1.0.0"],
  },
  httpResolver: {
    uri: "embed/http-uri-resolver-ext@1.0.1",
    package: httpResolver.wasmPackage,
    implements: [
      "ens/wraps.eth:http-uri-resolver-ext@1.0.1",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
    ],
    redirectFrom: ["ens/wraps.eth:http-uri-resolver-ext@1.0.1"],
  },
  wrapscanResolver: {
    uri: "https://wraps.wrapscan.io/r/polywrap/wrapscan-uri-resolver@1.0",
    implements: [
      "wrapscan/polywrap/wrapscan-uri-resolver@1.0",
      ExtendableUriResolver.defaultExtInterfaceUris[2].uri,
    ],
    redirectFrom: ["wrapscan/polywrap/wrapscan-uri-resolver@1.0"],
  },
  ipfsHttpClient: {
    uri: "embed/ipfs-http-client@1.0.0",
    package: ipfsHttpClient.wasmPackage,
    implements: ["ens/wraps.eth:ipfs-http-client@1.0.0"],
    redirectFrom: ["ens/wraps.eth:ipfs-http-client@1.0.0"],
  },
  ipfsResolver: {
    uri: "embed/async-ipfs-uri-resolver-ext@1.0.1",
    package: ipfsResolver.wasmPackage,
    implements: [
      "ens/wraps.eth:async-ipfs-uri-resolver-ext@1.0.1",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
    ],
    redirectFrom: ["ens/wraps.eth:async-ipfs-uri-resolver-ext@1.0.1"],
    env: {
      provider: ipfsProviders[0],
      fallbackProviders: ipfsProviders.slice(1),
      retries: { tryResolveUri: 2, getFile: 2 },
    },
  },
};
```

### Node.JS

If you're using this package within Node.JS, you'll also have the following configurations:
```typescript
import { fileSystemPlugin } from "@polywrap/file-system-plugin-js";
import * as fileSystemResolver from "./embeds/file-system-resolver/wrap";

export const bundle: Bundle = {
  ...Common.bundle,
  fileSystem: {
    uri: "plugin/file-system@1.0.0",
    package: fileSystemPlugin({}) as IWrapPackage,
    implements: ["ens/wraps.eth:file-system@1.0.0"],
    redirectFrom: ["ens/wraps.eth:file-system@1.0.0"],
  },
  fileSystemResolver: {
    uri: "embed/file-system-uri-resolver-ext@1.0.1",
    package: fileSystemResolver.wasmPackage,
    implements: [
      "ens/wraps.eth:file-system-uri-resolver-ext@1.0.1",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
    ],
    redirectFrom: ["ens/wraps.eth:file-system-uri-resolver-ext@1.0.1"],
  },
};
```
