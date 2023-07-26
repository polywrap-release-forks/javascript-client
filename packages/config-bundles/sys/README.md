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

export interface SysCommonBundle extends Bundle {
  logger: BundlePackage;
  datetime: BundlePackage;
  concurrent: BundlePackage;
  http: BundlePackage;
  githubResolver: BundlePackage;
  httpResolver: BundlePackage;
  wrapscanResolver: BundlePackage;
  ipfsHttpClient: BundlePackage;
  ipfsResolver: BundlePackage;
}

export const bundle: SysCommonBundle = {
  logger: {
    uri: "plugin/logger@1.0.0",
    package: loggerPlugin({}) as IWrapPackage,
    implements: ["wrapscan.io/polywrap/logger@1.0"],
    redirectFrom: ["wrapscan.io/polywrap/logger@1.0"],
  },
  datetime: {
    uri: "plugin/datetime@1.0.0",
    package: dateTimePlugin({}) as IWrapPackage,
    implements: ["wrapscan.io/polywrap/datetime@1.0"],
    redirectFrom: ["wrapscan.io/polywrap/datetime@1.0"],
  },
  concurrent: {
    uri: "plugin/concurrent@1.0.0",
    package: concurrentPromisePlugin({}) as IWrapPackage,
    implements: ["wrapscan.io/polywrap/concurrent@1.0"],
    redirectFrom: ["wrapscan.io/polywrap/concurrent@1.0"],
  },
  http: {
    uri: "plugin/http@1.1.0",
    package: httpPlugin({}) as IWrapPackage,
    implements: ["wrapscan.io/polywrap/http@1.0"],
    redirectFrom: ["wrapscan.io/polywrap/http@1.0"],
  },
  githubResolver: {
    uri: "wrapscan.io/polywrap/github-uri-resolver@1.0",
    implements: [ExtendableUriResolver.defaultExtInterfaceUris[0].uri],
  },
  httpResolver: {
    uri: "embed/http-uri-resolver@1.0.0",
    package: httpResolver.wasmPackage,
    implements: [
      "wrapscan.io/polywrap/http-uri-resolver@1.0",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri
    ],
    redirectFrom: ["wrapscan.io/polywrap/http-uri-resolver@1.0"],
  },
  wrapscanResolver: {
    uri: "https://wraps.wrapscan.io/r/polywrap/wrapscan-uri-resolver@1.0",
    implements: [
      "wrapscan.io/polywrap/wrapscan-uri-resolver@1.0",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
    ],
    redirectFrom: ["wrapscan.io/polywrap/wrapscan-uri-resolver@1.0"],
  },
  ipfsHttpClient: {
    uri: "embed/ipfs-http-client@1.0.0",
    package: ipfsHttpClient.wasmPackage,
    implements: ["wrapscan.io/polywrap/ipfs-http-client@1.0"],
    redirectFrom: ["wrapscan.io/polywrap/ipfs-http-client@1.0"],
  },
  ipfsResolver: {
    uri: "embed/async-ipfs-uri-resolver@1.0.0",
    package: ipfsResolver.wasmPackage,
    implements: [
      "wrapscan.io/polywrap/async-ipfs-uri-resolver@1.0",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
    ],
    redirectFrom: ["wrapscan.io/polywrap/async-ipfs-uri-resolver@1.0"],
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

interface SysNodeBundle extends Common.SysCommonBundle {
  fileSystem: BundlePackage;
  fileSystemResolver: BundlePackage;
}

export const bundle: SysNodeBundle = {
  ...Common.bundle,
  fileSystem: {
    uri: "plugin/file-system@1.0",
    package: fileSystemPlugin({}) as IWrapPackage,
    implements: ["wrapscan.io/polywrap/file-system@1.0"],
    redirectFrom: ["wrapscan.io/polywrap/file-system@1.0"],
  },
  fileSystemResolver: {
    uri: "embed/file-system-uri-resolver@1.0.1",
    package: fileSystemResolver.wasmPackage,
    implements: [
      "wrapscan.io/polywrap/file-system-uri-resolver@1.0",
      ExtendableUriResolver.defaultExtInterfaceUris[0].uri,
    ],
    redirectFrom: ["wrapscan.io/polywrap/file-system-uri-resolver@1.0"],
  },
};
```
