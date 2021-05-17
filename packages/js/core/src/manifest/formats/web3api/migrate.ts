import {
  AnyWeb3ApiManifest,
  Web3ApiManifest,
  Web3ApiManifestFormats,
  latestWeb3ApiManifestFormat
} from ".";

import {
  migrate as migrate_0_0_1_prealpha_1_to_0_0_1_prealpha_2
} from "./migrators/0.0.1-prealpha.1_to_0.0.1-prealpha.2";

import { Tracer } from "@web3api/tracing";

type Migrator = {
  [key in Web3ApiManifestFormats]?: (m: AnyWeb3ApiManifest) => Web3ApiManifest;
};

export const migrators: Migrator = {
  "0.0.1-prealpha.1": migrate_0_0_1_prealpha_1_to_0_0_1_prealpha_2
};

export const migrateWeb3ApiManifest = Tracer.traceFunc(
  "core: migrateWeb3ApiManifest",
  (manifest: AnyWeb3ApiManifest, to: Web3ApiManifestFormats): Web3ApiManifest => {
    const from = manifest.format as Web3ApiManifestFormats;

    if (from === latestWeb3ApiManifestFormat) {
      return manifest as Web3ApiManifest;
    }

    if (!(from in Web3ApiManifestFormats)) {
      throw new Error(`Unrecognized Web3ApiManifestFormat "${manifest.format}"`);
    }

    const migrator = migrators[from];
    if (!migrator) {
      throw new Error(
        `Migrator from Web3ApiManifestFormat "${from}" to "${to}" is not available`
      );
    }

    return migrator(manifest);
  }
);
