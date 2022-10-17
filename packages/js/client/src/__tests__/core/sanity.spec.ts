import { coreInterfaceUris } from "@polywrap/core-js";
import {
  buildUriResolver, LegacyPluginsResolver, LegacyRedirectsResolver,
  PackageToWrapperCacheResolver,
  RecursiveResolver,
  WrapperCache
} from "@polywrap/uri-resolvers-js";
import { PolywrapClient, Uri } from "../..";
import {ClientConfigBuilder, defaultIpfsProviders, defaultWrappers} from "@polywrap/client-config-builder-js";
import { ExtendableUriResolver } from "@polywrap/uri-resolver-extensions-js";
import { fileSystemResolverPlugin } from "@polywrap/fs-resolver-plugin-js";
import { fileSystemPlugin } from "@polywrap/fs-plugin-js";
import {
  buildWrapper,
  ensAddresses,
  initTestEnvironment,
  providers,
  runCLI
} from "@polywrap/test-env-js";
import {ensResolverPlugin} from "@polywrap/ens-resolver-plugin-js";
import {Connection, Connections, ethereumPlugin} from "@polywrap/ethereum-plugin-js";
import {ipfsPlugin} from "@polywrap/ipfs-plugin-js";
import {ipfsResolverPlugin} from "@polywrap/ipfs-resolver-plugin-js";

jest.setTimeout(20000000);

describe("sanity", () => {
  test("default client config", () => {
    const client = new PolywrapClient();

    expect(client.getRedirects()).toStrictEqual([
      {
        from: new Uri("wrap://ens/sha3.polywrap.eth"),
        to: new Uri(defaultWrappers.sha3)
      },
      {
        from: new Uri("wrap://ens/uts46.polywrap.eth"),
        to: new Uri(defaultWrappers.uts46)
      },
      {
        from: new Uri("wrap://ens/graph-node.polywrap.eth"),
        to: new Uri(defaultWrappers.graphNode)
      }
    ]);

    const expectedPlugins = [
      new Uri("wrap://ens/ipfs.polywrap.eth"),
      new Uri("wrap://ens/ens-resolver.polywrap.eth"),
      new Uri("wrap://ens/ethereum.polywrap.eth"),
      new Uri("wrap://ens/http.polywrap.eth"),
      new Uri("wrap://ens/http-resolver.polywrap.eth"),
      new Uri("wrap://ens/js-logger.polywrap.eth"),
      new Uri("wrap://ens/fs.polywrap.eth"),
      new Uri("wrap://ens/fs-resolver.polywrap.eth"),
      new Uri("wrap://ens/ipfs-resolver.polywrap.eth")
    ];
    const actualPlugins = client.getPlugins().map(x => x.uri);
    expect(expectedPlugins).toStrictEqual(actualPlugins);

    expect(client.getInterfaces()).toStrictEqual([
      {
        interface: coreInterfaceUris.uriResolver,
        implementations: [
          new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
          new Uri("wrap://ens/ens-resolver.polywrap.eth"),
          new Uri("wrap://ens/fs-resolver.polywrap.eth"),
          new Uri("wrap://ens/http-resolver.polywrap.eth")
        ]
      },
      {
        interface: coreInterfaceUris.logger,
        implementations: [new Uri("wrap://ens/js-logger.polywrap.eth")]
      }
    ]);
  });

  test("client noDefaults flag works as expected", async () => {
    let client = new PolywrapClient();
    expect(client.getPlugins().length !== 0).toBeTruthy();
    expect(client.getUriResolver()).toBeTruthy();

    client = new PolywrapClient({}, {});
    expect(client.getPlugins().length !== 0).toBeTruthy();
    expect(client.getUriResolver()).toBeTruthy();

    client = new PolywrapClient({}, { noDefaults: false });
    expect(client.getPlugins().length !== 0).toBeTruthy();
    expect(client.getUriResolver()).toBeTruthy();

    client = new PolywrapClient(
      { resolver: buildUriResolver([]) },
      { noDefaults: true }
    );

    expect(client.getPlugins().length === 0).toBeTruthy();
    expect(client.getUriResolver()).toBeTruthy();

    let message = "";
    try {
      client = new PolywrapClient({}, { noDefaults: true });
    } catch (e) {
      message = e.message;
    }

    expect(message).toBe("No URI resolver provided");
  });

  test("redirect registration", () => {
    const implementation1Uri = "wrap://ens/some-implementation1.eth";
    const implementation2Uri = "wrap://ens/some-implementation2.eth";

    const client = new PolywrapClient({
      redirects: [
        {
          from: implementation1Uri,
          to: implementation2Uri
        }
      ]
    });

    const redirects = client.getRedirects();

    expect(redirects).toEqual([
      {
        from: new Uri("wrap://ens/sha3.polywrap.eth"),
        to: new Uri(defaultWrappers.sha3)
      },
      {
        from: new Uri("wrap://ens/uts46.polywrap.eth"),
        to: new Uri(defaultWrappers.uts46)
      },
      {
        from: new Uri("wrap://ens/graph-node.polywrap.eth"),
        to: new Uri(defaultWrappers.graphNode)
      },
      {
        from: new Uri(implementation1Uri),
        to: new Uri(implementation2Uri)
      }
    ]);
  });

  test.only("validate requested uri is available", async () => {
    const fooPath = `${__dirname}/../utils/validate/wrapper-a`;
    const fooUri = `fs/${fooPath}/build`;
    const greetingPath = `${__dirname}/../utils/validate/wrapper-b`;
    const greetingUri = `fs/${greetingPath}/build`;

    // process.env = {
    //   ...process.env,
    //   IPFS_GATEWAY_URI: providers.ipfs,
    //   ENS_REG_ADDR: ensAddresses.ensAddress,
    //   ENS_REGISTRAR_ADDR: ensAddresses.registrarAddress,
    //   ENS_RESOLVER_ADDR: ensAddresses.resolverAddress,
    // };
    // await initTestEnvironment();
    // await buildWrapper(fooPath);
    // await buildWrapper(greetingPath);
    //
    // const { exitCode: code } = await runCLI(
    //   {
    //     args: ["deploy"],
    //     cwd: greetingPath,
    //     cli: `${__dirname}/../../../../cli/bin/polywrap`,
    //     env: process.env as Record<string, string>
    //   },
    // );
    //
    // if (code !== 0) {
    //   fail("Wrapper could not be deployed")
    // }

    const builder = new ClientConfigBuilder();

    builder.setResolver(new RecursiveResolver(
      new PackageToWrapperCacheResolver(new WrapperCache(), [
        new LegacyPluginsResolver(),
        new LegacyRedirectsResolver(),
        new ExtendableUriResolver()
      ])
    ));

    let client = new PolywrapClient(builder.build(), { noDefaults: true });
    let result = await client.validate(fooUri, {});

    expect(result.ok).toBeFalsy();
    let resultError = (result as { error: Error }).error;
    expect(resultError).toBeTruthy();
    expect(resultError.message).toContain("Error resolving URI");

    builder.addInterfaceImplementation(
      "wrap://ens/uri-resolver.core.polywrap.eth",
      "wrap://ens/fs-resolver.polywrap.eth"
    );
    builder.addPlugin(
      "wrap://ens/fs-resolver.polywrap.eth",
      fileSystemResolverPlugin({})
    );
    builder.addPlugin(
      "wrap://ens/fs.polywrap.eth",
      fileSystemPlugin({})
    );

    client = new PolywrapClient(builder.build(), { noDefaults: true });
    result = await client.validate(fooUri, {});

    expect(result.ok).toBeTruthy();

    result = await client.validate(greetingUri, {
      recursive: true
    })
    resultError = (result as { error: Error }).error;
    expect(result.ok).toBeFalsy();
    expect(resultError).toBeTruthy();
    expect(resultError.message).toContain("Error resolving URI");

    builder.addPlugin(
      "wrap://ens/ethereum.polywrap.eth",
      ethereumPlugin({
        connections: new Connections({
          networks: {
            testnet: new Connection({
              provider: providers.ethereum
            })
          },
          defaultNetwork: "testnet"
        })
      })
  )

    builder.addPlugin(
      "wrap://ens/ipfs.polywrap.eth",
      ipfsPlugin({})
    )

    builder.addEnv("wrap://ens/ipfs.polywrap.eth", {
      provider: providers.ipfs,
      fallbackProviders: defaultIpfsProviders
    })

    builder.addPlugin(
      "wrap://ens/ipfs-resolver.polywrap.eth",
      ipfsResolverPlugin({})
    )

    builder.addPlugin(
      "wrap://ens/ens-resolver.polywrap.eth",
      ensResolverPlugin({
        addresses: {
          testnet: ensAddresses.ensAddress
        }
      })
    )

    builder.addInterfaceImplementations(
      "wrap://ens/uri-resolver.core.polywrap.eth",
      [
        "wrap://ens/ens-resolver.polywrap.eth",
        "wrap://ens/ipfs-resolver.polywrap.eth",
      ]
    )


    client = new PolywrapClient(builder.build(), { noDefaults: true });

    result = await client.validate(greetingUri, {
      recursive: true,
      abi: true
    })

    expect(result.ok).toBeTruthy()


    const modifiedFooPath = `${__dirname}/../utils/validate/wrapper-c`;

    builder.addUriRedirect("wrap://ens/testnet/foo.eth", `wrap://fs/${modifiedFooPath}/build`)

    client = new PolywrapClient(builder.build(), { noDefaults: true });
    result = await client.validate(greetingUri, {
      abi: true
    })

    console.log({ result })
    expect(result.ok).toBeFalsy();
  });
});
