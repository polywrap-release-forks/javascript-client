import { PolywrapClient, Uri } from "../..";
import {
  Connection,
  Connections,
  ethereumPlugin,
} from "@polywrap/ethereum-plugin-js";
import { ipfsPlugin } from "@polywrap/ipfile-system-plugin-js";
import { fileSystemPlugin } from "@polywrap/file-system-plugin-js";
import { fileSystemResolverPlugin } from "@polywrap/fs-resolver-plugin-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";
import { ipfsResolverPlugin } from "@polywrap/ipfs-resolver-plugin-js";
import {
  PackageToWrapperCacheResolver,
  RecursiveResolver,
  WrapperCache,
} from "@polywrap/uri-resolvers-js";
import { ExtendableUriResolver } from "@polywrap/uri-resolver-extensions-js";
import { defaultInterfaces } from "@polywrap/client-config-builder-js";
import { ETH_ENS_IPFS_MODULE_CONSTANTS } from "@polywrap/cli-js";

export const getClientWithEnsAndIpfs = () => {
  const connections: Connections = new Connections({
    networks: {
      testnet: new Connection({
        provider: ETH_ENS_IPFS_MODULE_CONSTANTS.ethereumProvider,
      }),
    },
    defaultNetwork: "testnet",
  });
  return new PolywrapClient<string>(
    {
      envs: [
        {
          uri: "wrap://ens/ipfs.polywrap.eth",
          env: {
            provider: ETH_ENS_IPFS_MODULE_CONSTANTS.ipfsProvider,
          },
        },
      ],
      interfaces: [
        {
          interface: ExtendableUriResolver.extInterfaceUri.uri,
          implementations: [
            "wrap://ens/ipfs-resolver.polywrap.eth",
            "wrap://ens/ens-resolver.polywrap.eth",
            "wrap://ens/fs-resolver.polywrap.eth",
          ],
        },
      ],
      resolver: RecursiveResolver.from(
        PackageToWrapperCacheResolver.from(
          [
            {
              uri: Uri.from("wrap://ens/ethereum.polywrap.eth"),
              package: ethereumPlugin({ connections }),
            },
            {
              uri: Uri.from("wrap://ens/ens-resolver.polywrap.eth"),
              package: ensResolverPlugin({
                addresses: {
                  testnet:
                    ETH_ENS_IPFS_MODULE_CONSTANTS.ensAddresses.ensAddress,
                },
              }),
            },
            {
              uri: Uri.from("wrap://ens/ipfs.polywrap.eth"),
              package: ipfsPlugin({}),
            },
            {
              uri: Uri.from("wrap://ens/ipfs-resolver.polywrap.eth"),
              package: ipfsResolverPlugin({}),
            },
            {
              uri: Uri.from(defaultInterfaces.fileSystem),
              package: fileSystemPlugin({}),
            },
            {
              uri: Uri.from("wrap://ens/fs-resolver.polywrap.eth"),
              package: fileSystemResolverPlugin({}),
            },
            new ExtendableUriResolver(),
          ],
          new WrapperCache()
        )
      ),
    },
    {
      noDefaults: true,
    }
  );
};
