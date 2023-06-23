# PolywrapClient Config Builder

A utility class for building the PolywrapClient config. 

Supports building configs using method chaining or imperatively.

## Quickstart

### Initialize

Initialize a ClientConfigBuilder using the [constructor](#constructor)

```typescript
  // start with a blank slate (typical usage)
  const builder = new ClientConfigBuilder();
```

### Configure

Add client configuration with [add](#add), or flexibly mix and match builder [configuration methods](#addwrapper) to add and remove configuration items.

```typescript
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
    .addPackage("wrap://plugin/package", httpPlugin({}))
    .removePackage("wrap://plugin/package")
    .addPackages({
      "wrap://plugin/http": httpPlugin({}),
      "wrap://plugin/filesystem": fileSystemPlugin({}),
    });
```

You can add the entire [default client configuration bundle](#bundle--defaultconfig) at once with [addDefaults](#adddefaults)

```typescript
  builder.addDefaults();
```

### Build

Finally, build a ClientConfig or CoreClientConfig to pass to the PolywrapClient constructor.

```typescript
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
```

### Example

A complete example using all or most of the available methods.

```typescript
  // init
  const builder = new ClientConfigBuilder();

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
    .addWrapper(
      "wrap://ens/wrapper.eth",
      await WasmWrapper.from(
        new Uint8Array([1, 2, 3]),
        new Uint8Array([1, 2, 3])
      )
    )
    .removeWrapper("wrap://ens/wrapper.eth")
    .addWrappers({
      "wrap://ens/wrapper.eth": await WasmWrapper.from(
        new Uint8Array([1, 2, 3]),
        new Uint8Array([1, 2, 3])
      ),
    });

  // add and remove wrap packages
  builder
    .addPackage("wrap://plugin/package", httpPlugin({}))
    .removePackage("wrap://plugin/package")
    .addPackages({
      "wrap://plugin/package": httpPlugin({}),
    });

  // add and remove Envs
  builder
    .addEnv("wrap://ens/wrapper.eth", { key: "value" })
    .removeEnv("wrap://ens/wrapper.eth")
    .addEnvs({
      "wrap://ens/wrapper.eth": { key: "value" },
    });

  // override existing Env, or add new Env if one is not registered at URI
  builder.setEnv("wrap://ens/wrapper.eth", { key: "value" });

  // add or remove registration for an implementation of an interface
  builder
    .addInterfaceImplementation(
      "wrap://ens/interface.eth",
      "wrap://ens/wrapper.eth"
    )
    .removeInterfaceImplementation(
      "wrap://ens/interface.eth",
      "wrap://ens/wrapper.eth"
    )
    .addInterfaceImplementations("wrap://ens/interface.eth", [
      "wrap://ens/wrapper.eth",
    ]);

  // add or remove URI redirects
  builder
    .addRedirect("wrap://ens/from.eth", "wrap://ens/to.eth")
    .removeRedirect("wrap://ens/from.eth")
    .addRedirects({
      "wrap://ens/from.eth": "wrap://ens/to.eth",
    });

  // add resolvers
  builder.addResolver(RecursiveResolver.from([]));
  builder.addResolvers([]);

  // build
  const clientConfig = builder.build();
```

# Reference

## ClientConfigBuilder

### Constructor
```ts
  /**
   * Instantiate a ClientConfigBuilder
   */
  constructor() 
```

### add
```ts
  /**
   * Add a partial BuilderConfig
   * This is equivalent to calling each of the plural add functions: `addEnvs`, `addWrappers`, etc.
   *
   * @param config: a partial BuilderConfig
   * @returns IClientConfigBuilder (mutated self)
   */
  add(config: Partial<BuilderConfig>): IClientConfigBuilder;
```

### addWrapper
```ts
  /**
   * Add an embedded wrapper
   *
   * @param uri: uri of wrapper
   * @param wrapper: wrapper to be added
   * @returns IClientConfigBuilder (mutated self)
   */
  addWrapper(uri: string, wrapper: Wrapper): IClientConfigBuilder;
```

### addWrappers
```ts
  /**
   * Add one or more embedded wrappers.
   * This is equivalent to calling addWrapper for each wrapper.
   *
   * @param uriWrappers: an object where keys are uris and wrappers are value
   * @returns IClientConfigBuilder (mutated self)
   */
  addWrappers(uriWrappers: Record<string, Wrapper>): IClientConfigBuilder;
```

### removeWrapper
```ts
  /**
   * Remove an embedded wrapper
   *
   * @param uri: the wrapper's URI
   * @returns IClientConfigBuilder (mutated self)
   */
  removeWrapper(uri: string): IClientConfigBuilder;
```

### addPackage
```ts
  /**
   * Add an embedded wrap package
   *
   * @param uri: uri of wrapper
   * @param wrapPackage: package to be added
   * @returns IClientConfigBuilder (mutated self)
   */
  addPackage(uri: string, wrapPackage: IWrapPackage): IClientConfigBuilder;
```

### addPackages
```ts
  /**
   * Add one or more embedded wrap packages
   * This is equivalent to calling addPackage for each package
   *
   * @param uriPackages: an object where keys are uris and packages are value
   * @returns IClientConfigBuilder (mutated self)
   */
  addPackages(uriPackages: Record<string, IWrapPackage>): IClientConfigBuilder;
```

### removePackage
```ts
  /**
   * Remove an embedded wrap package
   *
   * @param uri: the package's URI
   * @returns IClientConfigBuilder (mutated self)
   */
  removePackage(uri: string): IClientConfigBuilder;
```

### addEnv
```ts
  /**
   * Add an Env.
   * If an Env is already associated with the uri, it is modified.
   *
   * @param uri: the wrapper's URI to associate with the Env
   * @param env: an object with the env variables for the uri
   * @returns IClientConfigBuilder (mutated self)
   */
  addEnv(uri: string, env: Record<string, unknown>): IClientConfigBuilder;
```

### addEnvs
```ts
  /**
   * Add one or more Envs
   * This is equivalent to calling addEnv for each Env
   *
   * @param uriEnvs: and object where key is the uri and value is the another object with the env variables for the uri
   * @returns IClientConfigBuilder (mutated self)
   */
  addEnvs(
    uriEnvs: Record<string, Record<string, unknown>>
  ): IClientConfigBuilder;
```

### removeEnv
```ts
  /**
   * Remove an Env
   *
   * @param uri: the URI associated with the Env
   * @returns IClientConfigBuilder (mutated self)
   */
  removeEnv(uri: string): IClientConfigBuilder;
```

### setEnv
```ts
  /**
   * Add an Env.
   * If an Env is already associated with the uri, it is replaced.
   *
   * @param uri: the wrapper's URI to associate with the Env
   * @param env: an object with the environment variables for the uri
   * @returns IClientConfigBuilder (mutated self)
   */
  setEnv(uri: string, env: Record<string, unknown>): IClientConfigBuilder;
```

### addInterfaceImplementation
```ts
  /**
   * Register an implementation of a single interface
   *
   * @param interfaceUri: the URI of the interface
   * @param implementationUri: the URI of the implementation
   * @returns IClientConfigBuilder (mutated self)
   */
  addInterfaceImplementation(
    interfaceUri: string,
    implementationUri: string
  ): IClientConfigBuilder;
```

### addInterfaceImplementations
```ts
  /**
   * Register one or more implementation of a single interface
   *
   * @param interfaceUri: the URI of the interface
   * @param implementationUris: a list of URIs for the implementations
   * @returns IClientConfigBuilder (mutated self)
   */
  addInterfaceImplementations(
    interfaceUri: string,
    implementationUris: Array<string>
  ): IClientConfigBuilder;
```

### removeInterfaceImplementation
```ts
  /**
   * Remove an implementation of a single interface
   *
   * @param interfaceUri: the URI of the interface
   * @param implementationUri: the URI of the implementation
   * @returns IClientConfigBuilder (mutated self)
   */
  removeInterfaceImplementation(
    interfaceUri: string,
    implementationUri: string
  ): IClientConfigBuilder;
```

### addRedirect
```ts
  /**
   * Add a redirect from one URI to another
   *
   * @param from: the URI to redirect from
   * @param to: the URI to redirect to
   * @returns IClientConfigBuilder (mutated self)
   */
  addRedirect(from: string, to: string): IClientConfigBuilder;
```

### addRedirects
```ts
  /**
   * Add an array of URI redirects
   *
   * @param redirects: an object where key is from and value is to
   * @returns IClientConfigBuilder (mutated self)
   */
  addRedirects(redirects: Record<string, string>): IClientConfigBuilder;
```

### removeRedirect
```ts
  /**
   * Remove a URI redirect
   *
   * @param from: the URI that is being redirected
   * @returns IClientConfigBuilder (mutated self)
   */
  removeRedirect(from: string): IClientConfigBuilder;
```

### addResolver
```ts
  /**
   * Add a URI Resolver, capable of resolving a URI to a wrapper
   *
   * @remarks
   * A UriResolverLike can be any one of:
   *     IUriResolver<unknown>
   *   | IUriRedirect<string>
   *   | IUriPackage<string>
   *   | IUriWrapper<string>
   *   | UriResolverLike[];
   *
   * @param resolver: A UriResolverLike
   * @returns IClientConfigBuilder (mutated self)
   */
  addResolver(resolver: UriResolverLike): IClientConfigBuilder;
```

### addResolvers
```ts
  /**
   * Add one or more URI Resolvers, capable of resolving URIs to wrappers
   *
   * @remarks
   * A UriResolverLike can be any one of:
   *     IUriResolver<unknown>
   *   | IUriRedirect<string>
   *   | IUriPackage<string>
   *   | IUriWrapper<string>
   *   | UriResolverLike[];
   *
   * @param resolvers: A list of UriResolverLike
   * @returns IClientConfigBuilder (mutated self)
   */
  addResolvers(resolvers: UriResolverLike[]): IClientConfigBuilder;
```

### addDefaults
```ts
  /**
   * Add the default configuration bundle
   *
   * @returns IClientConfigBuilder (mutated self)
   */
  addDefaults(): IClientConfigBuilder;
```

### addBundle
```ts
  /**
   * Add a default configuration bundle
   *
   * @returns Promise<IClientConfigBuilder> (mutated self)
   */
  addBundle(bundle: BundleName): IClientConfigBuilder;
```

### build
```ts
  /**
   * Build a sanitized core client configuration that can be passed to the PolywrapClient or PolywrapCoreClient constructors
   *
   * @param options - Use a custom wrapper cache or resolver
   * @returns CoreClientConfig that results from applying all the steps in the builder pipeline
   */
  build(options?: BuildOptions): CoreClientConfig;
```

## Bundles

```ts
export type BundleName = "sys" | "web3";

```
* [sys](https://www.npmjs.com/package/@polywrap/sys-config-bundle-js)
* [web3](https://www.npmjs.com/package/@polywrap/web3-config-bundle-js)
