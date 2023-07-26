/* eslint-disable */
import * as Common from "./common";

import { IWrapPackage } from "@polywrap/core-js";
import { Bundle } from "@polywrap/config-bundle-types-js";
import { ExtendableUriResolver } from "@polywrap/uri-resolver-extensions-js";

// $start: bundle-node
import { fileSystemPlugin } from "@polywrap/file-system-plugin-js";
import * as fileSystemResolver from "./embeds/file-system-resolver/wrap";

export const bundle: Bundle = {
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
// $end
