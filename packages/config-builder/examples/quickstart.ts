import { PolywrapClientConfigBuilder } from "../build";

// eslint-disable-next-line import/no-extraneous-dependencies
import { WasmWrapper } from "@polywrap/wasm-js";
import { httpPlugin } from "@polywrap/http-plugin-js";
import {
  RecursiveResolver,
  ResolutionResultCache,
} from "@polywrap/uri-resolvers-js";
import { fileSystemPlugin } from "@polywrap/file-system-plugin-js";
import { CoreClientConfig, IWrapPackage } from "@polywrap/core-js";

export function initialize(): PolywrapClientConfigBuilder {
  // $start: quickstart-initialize
  // start with a blank slate (typical usage)
  const builder = new PolywrapClientConfigBuilder();
  // $end

  return builder;
}

export function configure(): PolywrapClientConfigBuilder {
  const builder = new PolywrapClientConfigBuilder();

  // $start: quickstart-configure
  // add multiple items to the configuration using the catch-all `add` method
  builder.add({
    envs: {},
    interfaces: {},
    redirects: {},
    wrappers: {},
    packages: {},
    resolvers: [],
  });

  // add or remove items by chaining method calls
  builder
    .setPackage("wrap://plugin/package", httpPlugin({}) as IWrapPackage)
    .removePackage("wrap://plugin/package")
    .setPackages({
      "wrap://plugin/http": httpPlugin({}) as IWrapPackage,
      "wrap://plugin/filesystem": fileSystemPlugin({}) as IWrapPackage,
    });
  // $end

  // $start: quickstart-addDefaults
  builder.addDefaults();
  // $end

  return builder;
}

export function build(): PolywrapClientConfigBuilder | CoreClientConfig {
  const builder = new PolywrapClientConfigBuilder();

  // $start: quickstart-build
  // accepted by either the PolywrapClient or the PolywrapCoreClient
  let coreClientConfig = builder.build();

  // build with a custom cache
  coreClientConfig = builder.build({
    resolutionResultCache: new ResolutionResultCache(),
  });

  // or build with a custom resolver
  coreClientConfig = builder.build({
    resolver: RecursiveResolver.from([]),
  });
  // $end

  return builder ?? coreClientConfig;
}

export async function example(): Promise<CoreClientConfig> {
  // $start: quickstart-example
  // init
  const builder = new PolywrapClientConfigBuilder();

  // add the default bundle first to override its entries later
  builder.addDefaults();

  // add many config items at once
  builder.add({
    envs: {},
    interfaces: {},
    redirects: {},
    wrappers: {},
    packages: {},
    resolvers: [],
  });

  // add and remove wrappers
  builder
    .setWrapper(
      "wrap://authority/wrapper",
      await WasmWrapper.from(
        new Uint8Array([1, 2, 3]),
        new Uint8Array([1, 2, 3])
      )
    )
    .removeWrapper("wrap://authority/wrapper")
    .setWrappers({
      "wrap://authority/wrapper": await WasmWrapper.from(
        new Uint8Array([1, 2, 3]),
        new Uint8Array([1, 2, 3])
      ),
    });

  // add and remove wrap packages
  builder
    .setPackage("wrap://plugin/package", httpPlugin({}) as IWrapPackage)
    .removePackage("wrap://plugin/package")
    .setPackages({
      "wrap://plugin/package": httpPlugin({}) as IWrapPackage,
    });

  // add and remove Envs
  builder
    .addEnv("wrap://authority/wrapper", { key: "value" })
    .removeEnv("wrap://authority/wrapper")
    .addEnvs({
      "wrap://authority/wrapper": { key: "value" },
    });

  // override existing Env, or add new Env if one is not registered at URI
  builder.setEnv("wrap://authority/wrapper", { key: "value" });

  // add or remove registration for an implementation of an interface
  builder
    .addInterfaceImplementation(
      "wrap://authority/interface",
      "wrap://authority/wrapper"
    )
    .removeInterfaceImplementation(
      "wrap://authority/interface",
      "wrap://authority/wrapper"
    )
    .addInterfaceImplementations("wrap://authority/interface", [
      "wrap://authority/wrapper",
    ]);

  // add or remove URI redirects
  builder
    .setRedirect("wrap://authority/from", "wrap://authority/to")
    .removeRedirect("wrap://authority/from")
    .setRedirects({
      "wrap://authority/from": "wrap://authority/to",
    });

  // add resolvers
  builder.addResolver(RecursiveResolver.from([]));
  builder.addResolvers([]);

  // build
  const clientConfig = builder.build();
  // $end

  return clientConfig;
}
