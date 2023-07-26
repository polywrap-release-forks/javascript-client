import { IWrapPackage } from "@polywrap/core-js";

export interface BundlePackage {
  uri: string;
  package?: IWrapPackage;
  implements?: string[];
  redirectFrom?: string[];
  env?: {
    [prop: string]: unknown;
  };
}

export interface Bundle {
  [name: string]: BundlePackage;
}
