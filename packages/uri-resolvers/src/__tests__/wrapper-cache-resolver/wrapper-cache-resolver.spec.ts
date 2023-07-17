import {
  CoreClient,
  IUriResolutionContext,
  IUriResolver,
  Result,
  Uri,
  UriPackageOrWrapper,
  UriResolutionContext,
  UriResolutionResult,
} from "@polywrap/core-js";
import { expectHistory } from "../helpers/expectHistory";
import { RecursiveResolver } from "../../helpers";
import { PolywrapCoreClient } from "@polywrap/core-client-js";
import { PluginPackage } from "@polywrap/plugin-js";
import { WrapperCache, WrapperCacheResolver } from "../../cache";
import { ResultOk } from "@polywrap/result";

jest.setTimeout(20000);

class TestResolver implements IUriResolver<Error> {
  async tryResolveUri(
    uri: Uri,
    client: CoreClient,
    resolutionContext: IUriResolutionContext
  ): Promise<Result<UriPackageOrWrapper, Error>> {
    let result: Result<UriPackageOrWrapper, Error>;

    switch (uri.uri) {
      case "wrap://test/package":
        result = UriResolutionResult.ok(
          Uri.from("test/package"),
          PluginPackage.from(() => ({}))
        );
        break;
      case "wrap://test/wrapper":
        let wrapperResult = await PluginPackage.from(
          () => ({})
        ).createWrapper();
        if (!wrapperResult.ok) {
          throw wrapperResult.error;
        }

        result = UriResolutionResult.ok(
          Uri.from("test/wrapper"),
          wrapperResult.value
        );
        break;
      case "wrap://test/from":
        result = UriResolutionResult.ok(Uri.from("test/to"));
        break;
      case "wrap://test/A":
        result = UriResolutionResult.ok(Uri.from("test/B"));
        break;
      case "wrap://test/B":
        result = UriResolutionResult.ok(Uri.from("test/wrapper"));
        break;
      default:
        throw new Error(`Unexpected URI: ${uri.uri}`);
    }

    resolutionContext.trackStep({
      sourceUri: uri,
      result,
      description: "TestResolver",
    });

    return result;
  }
}

describe("WrapperCacheResolver", () => {
  it("caches a resolved wrapper", async () => {
    const uri = new Uri("test/wrapper");

    const cache = new WrapperCache();
    const client = new PolywrapCoreClient({
      resolver: WrapperCacheResolver.from(new TestResolver(), cache),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "wrapper-without-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "wrapper",
        uri: {
          uri: "wrap://test/wrapper",
        },
      })
    );

    resolutionContext = new UriResolutionContext();
    result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "wrapper-with-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "wrapper",
        uri: {
          uri: "wrap://test/wrapper",
        },
      })
    );
  });

  it("does not cache a URI", async () => {
    const uri = new Uri("test/from");

    const client = new PolywrapCoreClient({
      resolver: WrapperCacheResolver.from(
        new TestResolver(),
        new WrapperCache()
      ),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "uri-without-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "uri",
        uri: {
          uri: "wrap://test/to",
        },
      })
    );

    resolutionContext = new UriResolutionContext();
    result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "uri-without-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "uri",
        uri: {
          uri: "wrap://test/to",
        },
      })
    );
  });

  it("does not cache a package", async () => {
    const uri = new Uri("test/package");

    const client = new PolywrapCoreClient({
      resolver: WrapperCacheResolver.from(
        new TestResolver(),
        new WrapperCache()
      ),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "package-without-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "package",
        uri: {
          uri: "wrap://test/package",
        },
      })
    );

    resolutionContext = new UriResolutionContext();
    result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "package-without-cache"
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

  it("caches the whole resolution path", async () => {
    const cache = new WrapperCache();
    const client = new PolywrapCoreClient({
      resolver: RecursiveResolver.from(
        WrapperCacheResolver.from(new TestResolver(), cache)
      ),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({
      uri: Uri.from("test/A"),
      resolutionContext,
    });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "resolution-path-without-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "wrapper",
        uri: {
          uri: "wrap://test/wrapper",
        },
      })
    );

    resolutionContext = new UriResolutionContext();
    result = await client.tryResolveUri({
      uri: Uri.from("test/A"),
      resolutionContext,
    });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "resolution-path-A-with-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "wrapper",
        uri: {
          uri: "wrap://test/A",
        },
      })
    );

    resolutionContext = new UriResolutionContext();
    result = await client.tryResolveUri({
      uri: Uri.from("test/B"),
      resolutionContext,
    });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "resolution-path-B-with-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "wrapper",
        uri: {
          uri: "wrap://test/B",
        },
      })
    );

    resolutionContext = new UriResolutionContext();
    result = await client.tryResolveUri({
      uri: Uri.from("test/wrapper"),
      resolutionContext,
    });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-cache-resolver",
      "resolution-path-wrapper-with-cache"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "wrapper",
        uri: {
          uri: "wrap://test/wrapper",
        },
      })
    );
  });
});
