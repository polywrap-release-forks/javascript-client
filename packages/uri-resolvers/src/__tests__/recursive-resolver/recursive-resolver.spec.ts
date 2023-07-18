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
import { PolywrapCoreClient } from "@polywrap/core-client-js";
import { RecursiveResolver } from "../../helpers";
import { ResultErr, ResultOk } from "@polywrap/result";

jest.setTimeout(20000);

class SimpleRedirectResolver implements IUriResolver<Error> {
  async tryResolveUri(
    uri: Uri,
    client: CoreClient,
    resolutionContext: IUriResolutionContext
  ): Promise<Result<UriPackageOrWrapper, Error>> {
    let result: Result<UriPackageOrWrapper, Error>;

    switch (uri.uri) {
      case "wrap://test/1":
        result = UriResolutionResult.ok(Uri.from("test/2"));
        break;
      case "wrap://test/2":
        result = UriResolutionResult.ok(Uri.from("test/3"));
        break;
      case "wrap://test/3":
        result = UriResolutionResult.ok(Uri.from("test/4"));
        break;
      default:
        result = UriResolutionResult.ok(uri);
    }

    resolutionContext.trackStep({
      sourceUri: uri,
      result,
      description: "SimpleRedirectResolver",
    });

    return result;
  }
}

class InfiniteRedirectResolver implements IUriResolver<Error> {
  async tryResolveUri(
    uri: Uri,
    client: CoreClient,
    resolutionContext: IUriResolutionContext
  ): Promise<Result<UriPackageOrWrapper, Error>> {
    let result: Result<UriPackageOrWrapper, Error>;

    switch (uri.uri) {
      case "wrap://test/1":
        result = UriResolutionResult.ok(Uri.from("test/2"));
        break;
      case "wrap://test/2":
        result = UriResolutionResult.ok(Uri.from("test/3"));
        break;
      case "wrap://test/3":
        result = UriResolutionResult.ok(Uri.from("test/1"));
        break;
      default:
        result = UriResolutionResult.ok(uri);
    }

    resolutionContext.trackStep({
      sourceUri: uri,
      result,
      description: "InfiniteRedirectResolver",
    });

    return result;
  }
}

describe("RecursiveResolver", () => {
  it("can recursively resolve a URI", async () => {
    const uri = new Uri("test/1");

    const client = new PolywrapCoreClient({
      resolver: RecursiveResolver.from(new SimpleRedirectResolver()),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "recursive-resolver",
      "can-recursively-resolve-uri"
    );

    expect(result).toMatchObject(
      ResultOk({
        type: "uri",
        uri: {
          uri: "wrap://test/4",
        },
      })
    );
  });

  it("does not resolve a uri when not a match", async () => {
    const uri = new Uri("test/not-a-match");

    const client = new PolywrapCoreClient({
      resolver: RecursiveResolver.from(new SimpleRedirectResolver()),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "recursive-resolver",
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

  it("should raise an error if infinite loop detected during URI Resolution", async () => {
    const uri = new Uri("test/1");

    const client = new PolywrapCoreClient({
      resolver: RecursiveResolver.from(new InfiniteRedirectResolver()),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "recursive-resolver",
      "infinite-loop"
    );

    expect(result).toMatchObject(ResultErr({}));

    // @ts-ignore
    expect(result.error!.message).toMatch(
      "An infinite loop was detected while resolving the URI: wrap://test/1"
    );
  });
});
