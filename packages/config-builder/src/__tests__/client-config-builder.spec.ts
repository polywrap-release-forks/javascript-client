import { PolywrapClientConfigBuilder } from "../PolywrapClientConfigBuilder";
import {
  CoreClient,
  Uri,
  IUriResolver,
  UriPackageOrWrapper,
  UriMap,
  WrapperEnv,
  IWrapPackage,
  Wrapper,
} from "@polywrap/core-js";
import { Result } from "@polywrap/result";

class MockUriResolver implements IUriResolver {
  private uri: string;

  constructor(from: string, to: string) {
    this.uri = from;
  }
  get name(): string {
    return this.uri;
  }
  tryResolveUri(
    _uri: Uri,
    _client: CoreClient
  ): Promise<Result<UriPackageOrWrapper>> {
    throw new Error("Not implemented");
  }
}

describe("Client config builder", () => {
  const emptyBuilderConfig = new PolywrapClientConfigBuilder().config;

  const testEnv1: Record<string, Record<string, unknown>> = {
    "wrap://authority/test.plugin.one": { test: "value" },
  };

  const testEnv2: Record<string, Record<string, unknown>> = {
    "wrap://authority/test.plugin.two": { test: "value" },
  };

  const testInterface1: Record<string, Set<string>> = {
    "wrap://authority/test-interface-1.polywrap": new Set([
      "wrap://authority/test1.polywrap",
    ]),
  };

  const testInterface2: Record<string, Set<string>> = {
    "wrap://authority/test-interface-2.polywrap": new Set([
      "wrap://authority/test2.polywrap",
    ]),
  };

  const testUriRedirect1 = {
    "wrap://authority/test-one.polywrap": "wrap://authority/test1.polywrap",
  };

  const testUriRedirect2 = {
    "wrap://authority/test-two.polywrap": "wrap://authority/test2.polywrap",
  };

  const testEnvs: Record<string, Record<string, unknown>> = {
    ...testEnv1,
    ...testEnv2,
  };

  const testInterfaces: Record<string, Set<string>> = {
    ...testInterface1,
    ...testInterface2,
  };

  const testUriRedirects = {
    ...testUriRedirect1,
    ...testUriRedirect2,
  };

  const testUriResolver: IUriResolver = new MockUriResolver(
    "wrap://authority/testFrom",
    "wrap://authority/testTo"
  );

  it("should build an empty partial config", () => {
    const clientConfig = new PolywrapClientConfigBuilder().build();

    expect(clientConfig.envs).toStrictEqual(new UriMap<WrapperEnv>());
    expect(clientConfig.interfaces).toStrictEqual(new UriMap<readonly Uri[]>());
  });

  it("should succesfully add config object and build", () => {
    const configObject = {
      envs: testEnvs,
      interfaces: testInterfaces,
      redirects: testUriRedirects,
      resolvers: [testUriResolver],
    };

    const builder = new PolywrapClientConfigBuilder().add(configObject);

    const clientConfig = builder.build();
    const builderConfig = builder.config;

    expect(clientConfig).toBeTruthy();
    expect(clientConfig.envs).toStrictEqual(
      new UriMap([
        [Uri.from("wrap://authority/test.plugin.one"), { test: "value" }],
        [Uri.from("wrap://authority/test.plugin.two"), { test: "value" }],
      ])
    );
    expect(clientConfig.interfaces).toStrictEqual(
      new UriMap([
        [
          Uri.from("wrap://authority/test-interface-1.polywrap"),
          [Uri.from("wrap://authority/test1.polywrap")],
        ],
        [
          Uri.from("wrap://authority/test-interface-2.polywrap"),
          [Uri.from("wrap://authority/test2.polywrap")],
        ],
      ])
    );

    expect(builderConfig).toEqual({
      ...emptyBuilderConfig,
      ...configObject,
    });
  });

  it("should succesfully add and merge two config objects and build", () => {
    const builder = new PolywrapClientConfigBuilder()
      .add({
        envs: testEnv1,
        interfaces: testInterface1,
        redirects: testUriRedirect1,
        resolvers: [testUriResolver],
      })
      .add({
        envs: testEnv2,
        interfaces: testInterface2,
        redirects: testUriRedirect2,
      });

    const clientConfig = builder.build();
    const builderConfig = builder.config;

    expect(clientConfig).toBeTruthy();
    expect(clientConfig.envs).toStrictEqual(
      new UriMap([
        [Uri.from("wrap://authority/test.plugin.one"), { test: "value" }],
        [Uri.from("wrap://authority/test.plugin.two"), { test: "value" }],
      ])
    );
    expect(clientConfig.interfaces).toStrictEqual(
      new UriMap([
        [
          Uri.from("wrap://authority/test-interface-1.polywrap"),
          [Uri.from("wrap://authority/test1.polywrap")],
        ],
        [
          Uri.from("wrap://authority/test-interface-2.polywrap"),
          [Uri.from("wrap://authority/test2.polywrap")],
        ],
      ])
    );

    expect(clientConfig.resolver).toBeTruthy();

    expect(builderConfig).toEqual({
      ...emptyBuilderConfig,
      envs: { ...testEnv1, ...testEnv2 },
      interfaces: { ...testInterface1, ...testInterface2 },
      redirects: { ...testUriRedirect1, ...testUriRedirect2 },
      resolvers: [testUriResolver],
    });
  });

  it("should successfully add the default config", async () => {
    const builder = new PolywrapClientConfigBuilder().addDefaults();
    const config = builder.config;

    expect(config).toBeTruthy();

    // Expect the default config to have the following bundles:
    // "sys", "web3"
    const expectedConfig = new PolywrapClientConfigBuilder()
      .addBundle("sys")
      .addBundle("web3").config;

    expect(JSON.stringify(config)).toBe(JSON.stringify(expectedConfig));
  });

  it("should successfully add an env", () => {
    const envUri = "wrap://authority/some-plugin.polywrap";
    const env = {
      foo: "bar",
      baz: {
        biz: "buz",
      },
    };

    const config = new PolywrapClientConfigBuilder()
      .addEnv(envUri, env)
      .build();

    expect(config.envs).toBeTruthy();
    expect(config.envs?.size).toBe(1);
    expect(config.envs?.get(Uri.from(envUri))).toEqual(env);
  });

  it("should successfully add to an existing env", () => {
    const envUri = "wrap://authority/some-plugin.polywrap";
    const env1 = {
      foo: "bar",
    };
    const env2 = {
      baz: {
        biz: "buz",
      },
    };

    const config = new PolywrapClientConfigBuilder()
      .addEnv(envUri, env1)
      .addEnv(envUri, env2)
      .build();

    const expectedEnv = { ...env1, ...env2 };

    expect(config.envs).toBeTruthy();
    expect(config.envs?.size).toBe(1);
    expect(config.envs?.get(Uri.from(envUri))).toEqual(expectedEnv);
  });

  it("should succesfully add two separate envs", () => {
    const config = new PolywrapClientConfigBuilder()
      .addEnv(Object.keys(testEnvs)[0], Object.values(testEnvs)[0])
      .addEnv(Object.keys(testEnvs)[1], Object.values(testEnvs)[1])
      .build();

    expect(config.envs).toBeTruthy();
    expect(config.envs?.size).toBe(2);

    expect(config.envs?.get(Uri.from(Object.keys(testEnvs)[0]))).toEqual(
      Object.values(testEnvs)[0]
    );
    expect(config.envs?.get(Uri.from(Object.keys(testEnvs)[0]))).toEqual(
      Object.values(testEnvs)[1]
    );
  });

  it("should remove an env", () => {
    const config = new PolywrapClientConfigBuilder()
      .addEnv(Object.keys(testEnvs)[0], Object.values(testEnvs)[0])
      .addEnv(Object.keys(testEnvs)[1], Object.values(testEnvs)[1])
      .removeEnv(Object.keys(testEnvs)[0])
      .build();

    expect(config.envs).toBeTruthy();
    expect(config.envs?.size).toBe(1);

    expect(config.envs?.get(Uri.from(Object.keys(testEnvs)[1]))).toEqual(
      Object.values(testEnvs)[1]
    );
  });

  it("should set an env", () => {
    const envUri = "wrap://authority/some.plugin";

    const env = {
      foo: "bar",
    };

    const config = new PolywrapClientConfigBuilder()
      .setEnv(envUri, env)
      .build();

    expect(config.envs).toBeTruthy();
    expect(config.envs?.size).toBe(1);

    expect(config.envs?.get(Uri.from(envUri))).toEqual(env);
  });

  it("should set an env over an existing env", () => {
    const envUri = "wrap://authority/some.plugin";

    const env1 = {
      foo: "bar",
    };
    const env2 = {
      bar: "baz",
    };

    const config = new PolywrapClientConfigBuilder()
      .addEnv(envUri, env1)
      .setEnv(envUri, env2)
      .build();

    expect(config.envs).toBeTruthy();
    expect(config.envs?.size).toBe(1);

    expect(config.envs?.get(Uri.from(envUri))).toEqual(env2);
  });

  it("should add an interface implementation for a non-existent interface", () => {
    const interfaceUri = "wrap://authority/some.interface";
    const implUri = "wrap://authority/interface.impl";

    const config = new PolywrapClientConfigBuilder()
      .addInterfaceImplementation(interfaceUri, implUri)
      .build();

    expect(config.interfaces).toBeTruthy();
    expect(config.interfaces?.size).toBe(1);

    expect(config.interfaces).toStrictEqual(
      new UriMap([[Uri.from(interfaceUri), [Uri.from(implUri)]]])
    );
  });

  it("should add an interface implementation for an interface that already exists", () => {
    const interfaceUri = "wrap://authority/some.interface";
    const implUri1 = "wrap://authority/interface.impl1";
    const implUri2 = "wrap://authority/interface.impl2";

    const config = new PolywrapClientConfigBuilder()
      .addInterfaceImplementation(interfaceUri, implUri1)
      .addInterfaceImplementation(interfaceUri, implUri2)
      .build();

    expect(config.interfaces).toBeTruthy();
    expect(config.interfaces?.size).toBe(1);

    expect(config.interfaces).toStrictEqual(
      new UriMap([
        [Uri.from(interfaceUri), [Uri.from(implUri1), Uri.from(implUri2)]],
      ])
    );
  });

  it("should add different implementations for different interfaces", () => {
    const interfaceUri1 = "wrap://authority/some.interface1";
    const interfaceUri2 = "wrap://authority/some.interface2";
    const implUri1 = "wrap://authority/interface.impl1";
    const implUri2 = "wrap://authority/interface.impl2";
    const implUri3 = "wrap://authority/interface.impl3";
    const implUri4 = "wrap://authority/interface.impl4";

    const config = new PolywrapClientConfigBuilder()
      .addInterfaceImplementation(interfaceUri1, implUri1)
      .addInterfaceImplementation(interfaceUri2, implUri2)
      .addInterfaceImplementation(interfaceUri1, implUri3)
      .addInterfaceImplementation(interfaceUri2, implUri4)
      .build();

    expect(config.interfaces).toBeTruthy();
    expect(config.interfaces?.size).toBe(2);

    expect(config.interfaces).toStrictEqual(
      new UriMap([
        [Uri.from(interfaceUri1), [Uri.from(implUri1), Uri.from(implUri3)]],
        [Uri.from(interfaceUri2), [Uri.from(implUri2), Uri.from(implUri4)]],
      ])
    );
  });

  it("should add multiple implementations for a non-existent interface", () => {
    const interfaceUri = "wrap://authority/some.interface";
    const implUri1 = "wrap://authority/interface.impl1";
    const implUri2 = "wrap://authority/interface.impl2";

    const config = new PolywrapClientConfigBuilder()
      .addInterfaceImplementations(interfaceUri, [implUri1, implUri2])
      .build();

    expect(config.interfaces).toBeTruthy();
    expect(config.interfaces?.size).toBe(1);

    expect(config.interfaces).toStrictEqual(
      new UriMap([
        [Uri.from(interfaceUri), [Uri.from(implUri1), Uri.from(implUri2)]],
      ])
    );
  });

  it("should add multiple implementations for an existing interface", () => {
    const interfaceUri = "wrap://authority/some.interface";
    const implUri1 = "wrap://authority/interface.impl1";
    const implUri2 = "wrap://authority/interface.impl2";
    const implUri3 = "wrap://authority/interface.impl3";

    const config = new PolywrapClientConfigBuilder()
      .addInterfaceImplementations(interfaceUri, [implUri1])
      .addInterfaceImplementations(interfaceUri, [implUri2, implUri3])
      .build();

    expect(config.interfaces).toBeTruthy();
    expect(config.interfaces?.size).toBe(1);

    expect(config.interfaces).toStrictEqual(
      new UriMap([
        [
          Uri.from(interfaceUri),
          [Uri.from(implUri1), Uri.from(implUri2), Uri.from(implUri3)],
        ],
      ])
    );
  });

  it("should add multiple different implementations for different interfaces", () => {
    const interfaceUri1 = "wrap://authority/some.interface1";
    const interfaceUri2 = "wrap://authority/some.interface2";
    const implUri1 = "wrap://authority/interface.impl1";
    const implUri2 = "wrap://authority/interface.impl2";
    const implUri3 = "wrap://authority/interface.impl3";
    const implUri4 = "wrap://authority/interface.impl4";
    const implUri5 = "wrap://authority/interface.impl5";
    const implUri6 = "wrap://authority/interface.impl6";

    const config = new PolywrapClientConfigBuilder()
      .addInterfaceImplementation(interfaceUri1, implUri1)
      .addInterfaceImplementation(interfaceUri2, implUri2)
      .addInterfaceImplementations(interfaceUri1, [implUri3, implUri5])
      .addInterfaceImplementations(interfaceUri2, [implUri4, implUri6])
      .build();

    expect(config.interfaces).toBeTruthy();
    expect(config.interfaces?.size).toBe(2);

    expect(config.interfaces).toStrictEqual(
      new UriMap([
        [
          Uri.from(interfaceUri1),
          [Uri.from(implUri1), Uri.from(implUri3), Uri.from(implUri5)],
        ],
        [
          Uri.from(interfaceUri2),
          [Uri.from(implUri2), Uri.from(implUri4), Uri.from(implUri6)],
        ],
      ])
    );
  });

  it("should remove an interface implementation", () => {
    const interfaceUri1 = "wrap://authority/some.interface1";
    const interfaceUri2 = "wrap://authority/some.interface2";
    const implUri1 = "wrap://authority/interface.impl1";
    const implUri2 = "wrap://authority/interface.impl2";

    const config = new PolywrapClientConfigBuilder()
      .addInterfaceImplementations(interfaceUri1, [implUri1, implUri2])
      .addInterfaceImplementations(interfaceUri2, [implUri1, implUri2])
      .removeInterfaceImplementation(interfaceUri1, implUri2)
      .build();

    expect(config.interfaces).toBeTruthy();
    expect(config.interfaces?.size).toBe(2);

    expect(config.interfaces).toStrictEqual(
      new UriMap([
        [Uri.from(interfaceUri1), [Uri.from(implUri1)]],
        [Uri.from(interfaceUri2), [Uri.from(implUri1), Uri.from(implUri2)]],
      ])
    );
  });

  it("should completely remove an interface if there are no implementations left", () => {
    const interfaceUri1 = "wrap://authority/some.interface1";
    const interfaceUri2 = "wrap://authority/some.interface2";
    const implUri1 = "wrap://authority/interface.impl1";
    const implUri2 = "wrap://authority/interface.impl2";

    const config = new PolywrapClientConfigBuilder()
      .addInterfaceImplementations(interfaceUri1, [implUri1, implUri2])
      .addInterfaceImplementations(interfaceUri2, [implUri1, implUri2])
      .removeInterfaceImplementation(interfaceUri1, implUri1)
      .removeInterfaceImplementation(interfaceUri1, implUri2)
      .build();

    expect(config.interfaces).toBeTruthy();
    expect(config.interfaces?.size).toBe(1);

    expect(config.interfaces).toStrictEqual(
      new UriMap([
        [Uri.from(interfaceUri2), [Uri.from(implUri1), Uri.from(implUri2)]],
      ])
    );
  });

  it("should add an uri redirect", () => {
    const from = "wrap://authority/from.this.ens";
    const to = "wrap://authority/to.that.ens";

    const builder = new PolywrapClientConfigBuilder().setRedirect(from, to);

    const config = builder.build();
    const builderConfig = builder.config;

    expect(config).toBeTruthy();
    expect(builderConfig).toStrictEqual({
      ...emptyBuilderConfig,
      redirects: {
        [from]: to,
      },
    });
  });

  it("should add two uri redirects with different from uris", () => {
    const from1 = "wrap://authority/from.this1.ens";
    const to1 = "wrap://authority/to.that1.ens";
    const from2 = "wrap://authority/from.this2.ens";
    const to2 = "wrap://authority/to.that2.ens";

    const builder = new PolywrapClientConfigBuilder()
      .setRedirect(from1, to1)
      .setRedirect(from2, to2);

    const config = builder.build();
    const builderConfig = builder.config;

    expect(config).toBeTruthy();
    expect(builderConfig).toStrictEqual({
      ...emptyBuilderConfig,
      redirects: {
        [from1]: to1,
        [from2]: to2,
      },
    });
  });

  it("should overwrite an existing uri redirect if from matches on add", () => {
    const from1 = "wrap://authority/from1.this.ens";
    const from2 = "wrap://authority/from2.this.ens";
    const to1 = "wrap://authority/to.that1.ens";
    const to2 = "wrap://authority/to.that2.ens";

    const builder = new PolywrapClientConfigBuilder()
      .setRedirect(from1, to1)
      .setRedirect(from2, to1)
      .setRedirect(from1, to2);

    const config = builder.build();
    const builderConfig = builder.config;

    expect(config).toBeTruthy();
    expect(builderConfig).toStrictEqual({
      ...emptyBuilderConfig,
      redirects: {
        [from1]: to2,
        [from2]: to1,
      },
    });
  });

  it("should remove an uri redirect", () => {
    const from1 = "wrap://authority/from.this1.ens";
    const to1 = "wrap://authority/to.that1.ens";
    const from2 = "wrap://authority/from.this2.ens";
    const to2 = "wrap://authority/to.that2.ens";
    const builder = new PolywrapClientConfigBuilder()
      .setRedirect(from1, to1)
      .setRedirect(from2, to2)
      .removeRedirect(from1);

    const config = builder.build();
    const builderConfig = builder.config;

    expect(config).toBeTruthy();
    expect(builderConfig).toStrictEqual({
      ...emptyBuilderConfig,
      redirects: {
        [from2]: to2,
      },
    });
  });

  it("should set uri resolver", () => {
    const uriResolver = new MockUriResolver(
      "wrap://authority/from",
      "wrap://authority/to"
    );

    const builder = new PolywrapClientConfigBuilder().addResolver(uriResolver);

    const config = builder.build();
    const builderConfig = builder.config;

    expect(config).toBeTruthy();
    expect(builderConfig.resolvers).toStrictEqual([uriResolver]);
  });

  it("should add multiple resolvers", () => {
    const uriResolver1 = new MockUriResolver(
      "wrap://authority/from1",
      "wrap://authority/to1"
    );
    const uriResolver2 = new MockUriResolver(
      "wrap://authority/from2",
      "wrap://authority/to2"
    );

    const builder = new PolywrapClientConfigBuilder()
      .addResolver(uriResolver1)
      .addResolver(uriResolver2);

    const config = builder.build();
    const builderConfig = builder.config;

    expect(config).toBeTruthy();

    expect(builderConfig.resolvers).toStrictEqual([uriResolver1, uriResolver2]);
  });

  it("should sanitize incoming URIs for envs", () => {
    const shortUri = "authority/some1.wrapper";
    const longUri = "wrap://authority/some2.wrapper";

    const builderConfig1 = new PolywrapClientConfigBuilder()
      .addEnv(shortUri, { foo: "bar" })
      .addEnv(longUri, { bar: "baz" }).config;

    expect(builderConfig1.envs).toStrictEqual({
      [Uri.from(shortUri).uri]: {
        foo: "bar",
      },
      [Uri.from(longUri).uri]: {
        bar: "baz",
      },
    });

    const builderConfig2 = new PolywrapClientConfigBuilder()
      .add(builderConfig1)
      .removeEnv(shortUri).config;

    expect(builderConfig2.envs).toStrictEqual({
      [Uri.from(longUri).uri]: {
        bar: "baz",
      },
    });
  });

  it("should sanitize incoming URIs for interface implementations", () => {
    const shortUri = "authority/some1.wrapper";
    const longUri = "wrap://authority/some2.wrapper";

    const builderConfig1 = new PolywrapClientConfigBuilder()
      .addInterfaceImplementation(shortUri, longUri)
      .addInterfaceImplementation(longUri, shortUri).config;

    expect(builderConfig1.interfaces).toStrictEqual({
      [Uri.from(shortUri).uri]: new Set([Uri.from(longUri).uri]),
      [Uri.from(longUri).uri]: new Set([Uri.from(shortUri).uri]),
    });

    const builderConfig2 = new PolywrapClientConfigBuilder()
      .add(builderConfig1)
      .removeInterfaceImplementation(shortUri, longUri).config;

    expect(builderConfig2.interfaces).toStrictEqual({
      [Uri.from(longUri).uri]: new Set([Uri.from(shortUri).uri]),
    });
  });

  it("should sanitize incoming URIs for redirects", () => {
    const shortUri = "authority/some1.wrapper";
    const longUri = "wrap://authority/some2.wrapper";

    const builderConfig1 = new PolywrapClientConfigBuilder()
      .setRedirect(shortUri, longUri)
      .setRedirect(longUri, shortUri).config;

    expect(builderConfig1.redirects).toStrictEqual({
      [Uri.from(shortUri).uri]: Uri.from(longUri).uri,
      [Uri.from(longUri).uri]: Uri.from(shortUri).uri,
    });

    const builderConfig2 = new PolywrapClientConfigBuilder()
      .add(builderConfig1)
      .removeRedirect(shortUri).config;

    expect(builderConfig2.redirects).toStrictEqual({
      [Uri.from(longUri).uri]: Uri.from(shortUri).uri,
    });
  });

  it("should add a package", () => {
    const uri = "wrap://authority/some.package";
    const pkg: IWrapPackage = {
      createWrapper: jest.fn(),
      getManifest: jest.fn(),
    };

    const builderConfig = new PolywrapClientConfigBuilder().setPackage(uri, pkg)
      .config;

    expect(builderConfig.packages).toStrictEqual({
      [uri]: pkg,
    });
  });

  it("should add multiple packages", () => {
    const uri1 = "wrap://authority/some1.package";
    const uri2 = "wrap://authority/some2.package";
    const pkg: IWrapPackage = {
      createWrapper: jest.fn(),
      getManifest: jest.fn(),
    };

    const builderConfig = new PolywrapClientConfigBuilder().setPackages({
      [uri1]: pkg,
      [uri2]: pkg,
    }).config;

    expect(builderConfig.packages).toStrictEqual({
      [uri1]: pkg,
      [uri2]: pkg,
    });
  });

  it("should remove a package", () => {
    const uri1 = "wrap://authority/some1.package";
    const uri2 = "wrap://authority/some2.package";
    const pkg: IWrapPackage = {
      createWrapper: jest.fn(),
      getManifest: jest.fn(),
    };

    const builderConfig = new PolywrapClientConfigBuilder()
      .setPackages({
        [uri1]: pkg,
        [uri2]: pkg,
      })
      .removePackage(uri1).config;

    expect(builderConfig.packages).toStrictEqual({
      [uri2]: pkg,
    });
  });

  it("should sanitize incoming URIs for packages", () => {
    const shortUri = "authority/some1.package";
    const longUri = "wrap://authority/some2.package";
    const pkg: IWrapPackage = {
      createWrapper: jest.fn(),
      getManifest: jest.fn(),
    };

    const builderConfig1 = new PolywrapClientConfigBuilder().setPackages({
      [shortUri]: pkg,
      [longUri]: pkg,
    }).config;

    expect(builderConfig1.packages).toStrictEqual({
      [Uri.from(shortUri).uri]: pkg,
      [Uri.from(longUri).uri]: pkg,
    });

    const builderConfig2 = new PolywrapClientConfigBuilder()
      .add(builderConfig1)
      .removePackage(shortUri).config;

    expect(builderConfig2.packages).toStrictEqual({
      [Uri.from(longUri).uri]: pkg,
    });
  });

  it("should add a wrapper", () => {
    const uri = "wrap://authority/some.wrapper";
    const wrapper: Wrapper = {
      getFile: jest.fn(),
      getManifest: jest.fn(),
      invoke: jest.fn(),
    };

    const builderConfig = new PolywrapClientConfigBuilder().setWrapper(
      uri,
      wrapper
    ).config;

    expect(builderConfig.wrappers).toStrictEqual({
      [uri]: wrapper,
    });
  });

  it("should add multiple wrappers", () => {
    const uri1 = "wrap://authority/some1.wrapper";
    const uri2 = "wrap://authority/some2.wrapper";

    const wrapper: Wrapper = {
      getFile: jest.fn(),
      getManifest: jest.fn(),
      invoke: jest.fn(),
    };

    const builderConfig = new PolywrapClientConfigBuilder().setWrappers({
      [uri1]: wrapper,
      [uri2]: wrapper,
    }).config;

    expect(builderConfig.wrappers).toStrictEqual({
      [uri1]: wrapper,
      [uri2]: wrapper,
    });
  });

  it("should remove a wrapper", () => {
    const uri1 = "wrap://authority/some1.wrapper";
    const uri2 = "wrap://authority/some2.wrapper";

    const wrapper: Wrapper = {
      getFile: jest.fn(),
      getManifest: jest.fn(),
      invoke: jest.fn(),
    };

    const builderConfig = new PolywrapClientConfigBuilder()
      .setWrappers({
        [uri1]: wrapper,
        [uri2]: wrapper,
      })
      .removeWrapper(uri1).config;

    expect(builderConfig.wrappers).toStrictEqual({
      [uri2]: wrapper,
    });
  });

  it("should sanitize incoming URIs for wrappers", () => {
    const shortUri = "authority/some1.wrapper";
    const longUri = "wrap://authority/some2.wrapper";
    const wrapper: Wrapper = {
      getFile: jest.fn(),
      getManifest: jest.fn(),
      invoke: jest.fn(),
    };

    const builderConfig1 = new PolywrapClientConfigBuilder().setWrappers({
      [shortUri]: wrapper,
      [longUri]: wrapper,
    }).config;

    expect(builderConfig1.wrappers).toStrictEqual({
      [Uri.from(shortUri).uri]: wrapper,
      [Uri.from(longUri).uri]: wrapper,
    });

    const builderConfig2 = new PolywrapClientConfigBuilder()
      .add(builderConfig1)
      .removeWrapper(shortUri).config;

    expect(builderConfig2.wrappers).toStrictEqual({
      [Uri.from(longUri).uri]: wrapper,
    });
  });
});
