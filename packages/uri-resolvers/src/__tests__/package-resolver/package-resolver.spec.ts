import { Uri, UriResolutionContext } from "@polywrap/core-js";
import { expectHistory } from "../helpers/expectHistory";
import { PolywrapCoreClient } from "@polywrap/core-client-js";
import { PackageResolver } from "../../packages";
import { PluginPackage } from "@polywrap/plugin-js";
import { ResultOk } from "@polywrap/result";

jest.setTimeout(20000);

describe("PackageResolver", () => {
  it("can resolve a package", async () => {
    const uri = new Uri("test/package");

    const client = new PolywrapCoreClient({
      resolver: new PackageResolver(
        Uri.from("test/package"),
        PluginPackage.from(() => ({}))
      ),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "package-resolver",
      "can-resolve-a-package"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "package",
        uri: {
          uri: "wrap://test/package",
        },
      })
    );
  });

  it("does not resolve a package when not a match", async () => {
    const uri = new Uri("test/not-a-match");

    const client = new PolywrapCoreClient({
      resolver: new PackageResolver(
        Uri.from("test/package"),
        PluginPackage.from(() => ({}))
      ),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "package-resolver",
      "not-a-match"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "uri",
        uri: {
          uri: "wrap://test/not-a-match",
        },
      })
    );
  });
});
