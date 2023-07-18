import {
  IWrapPackage,
  Uri,
  UriResolutionContext,
  Wrapper,
} from "@polywrap/core-js";
import { expectHistory } from "../helpers/expectHistory";
import { PolywrapCoreClient } from "@polywrap/core-client-js";
import { StaticResolver } from "../../static";
import { ResultOk } from "@polywrap/result";

jest.setTimeout(20000);

describe("StaticResolver", () => {
  it("can redirect a uri", async () => {
    const uri = new Uri("test/from");

    const client = new PolywrapCoreClient({
      resolver: StaticResolver.from([
        {
          from: Uri.from("test/from"),
          to: Uri.from("test/to"),
        },
      ]),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "static-resolver",
      "can-redirect-a-uri"
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

  it("can resolve a package", async () => {
    const uri = new Uri("test/package");

    const client = new PolywrapCoreClient({
      resolver: StaticResolver.from([
        {
          uri: Uri.from("test/package"),
          package: {} as IWrapPackage,
        },
      ]),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "static-resolver",
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

  it("can resolve a wrapper", async () => {
    const uri = new Uri("test/wrapper");

    const client = new PolywrapCoreClient({
      resolver: StaticResolver.from([
        {
          uri: Uri.from("test/wrapper"),
          wrapper: {} as Wrapper,
        },
      ]),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "static-resolver",
      "can-resolve-a-wrapper"
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

  it("can not resolve unregistered uri", async () => {
    const uri = new Uri("test/not-a-match");

    const client = new PolywrapCoreClient({
      resolver: StaticResolver.from([]),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "static-resolver",
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
