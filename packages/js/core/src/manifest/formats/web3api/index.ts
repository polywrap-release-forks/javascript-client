/* eslint-disable @typescript-eslint/naming-convention */
/* tslint:disable */
/**
 * This file was automatically generated by scripts/manifest/index-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/index-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */

import {
  Web3ApiManifest as Web3ApiManifest0_0_1_prealpha_1
} from "./0.0.1-prealpha.1";
import {
  Web3ApiManifest as Web3ApiManifest0_0_1_prealpha_2
} from "./0.0.1-prealpha.2";

export {
  Web3ApiManifest0_0_1_prealpha_1,
  Web3ApiManifest0_0_1_prealpha_2,
};

export enum Web3ApiManifestFormats {
  "0.0.1-prealpha.1" = "0.0.1-prealpha.1",
  "0.0.1-prealpha.2" = "0.0.1-prealpha.2",
}

export type AnyWeb3ApiManifest =
  | Web3ApiManifest0_0_1_prealpha_1
  | Web3ApiManifest0_0_1_prealpha_2

export type Web3ApiManifest = Web3ApiManifest0_0_1_prealpha_2;

export const latestWeb3ApiManifestFormat = Web3ApiManifestFormats["0.0.1-prealpha.2"]

export { migrateWeb3ApiManifest } from "./migrate";
