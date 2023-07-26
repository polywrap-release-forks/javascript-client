import { CoreClientConfig, Uri, UriMap } from "@polywrap/core-js";
import {
  PackageResolver,
  RecursiveResolver,
  RedirectResolver,
  StaticResolver,
} from "@polywrap/uri-resolvers-js";
import { ExtendableUriResolver } from "../build";

export function example(): CoreClientConfig {
  const redirects: RedirectResolver[] = [];
  // TODO: WrapperResolver is not exported. When that is fixed, change this type to WrapperResolver[]
  const wrappers: PackageResolver[] = [];
  const packages: PackageResolver[] = [];
  // $start: quickstart-example
  const clientConfig: CoreClientConfig = {
    interfaces: new UriMap<Uri[]>([
      [
        Uri.from("wrapscan.io/polywrap/uri-resolver@1.0"),
        [
          Uri.from("wrapscan.io/polywrap/file-system-uri-resolver@1.0.0"),
          Uri.from("wrapscan.io/polywrap/http-uri-resolver@1.0.0"),
          Uri.from("wrapscan.io/polywrap/ipfs-uri-resolver-async@1.0.0"),
          Uri.from("wrapscan.io/polywrap/wrapscan-uri-resolver@1.0.0"),
        ],
      ],
    ]),
    resolver: RecursiveResolver.from(
      [
        StaticResolver.from([
          ...redirects,
          ...wrappers,
          ...packages,
        ]),
        new ExtendableUriResolver(),
      ]
    )
  };
  // $end

  return clientConfig;
}
