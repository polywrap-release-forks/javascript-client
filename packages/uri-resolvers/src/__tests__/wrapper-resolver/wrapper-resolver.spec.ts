import { Uri, UriResolutionContext } from "@polywrap/core-js";
import { expectHistory } from "../helpers/expectHistory";
import { PolywrapCoreClient } from "@polywrap/core-client-js";
import { PluginPackage } from "@polywrap/plugin-js";
import { WrapperResolver } from "../../wrappers";
import { ResultOk } from "@polywrap/result";

jest.setTimeout(20000);

describe("WrapperResolver", () => {
  it("can resolve a wrapper", async () => {
    const uri = new Uri("test/wrapper");

    let wrapperResult = await PluginPackage.from(() => ({})).createWrapper();
    if (!wrapperResult.ok) {
      throw wrapperResult.error;
    }

    const client = new PolywrapCoreClient({
      resolver: new WrapperResolver(
        Uri.from("test/wrapper"),
        wrapperResult.value
      ),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-resolver",
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

  it("does not resolve a wrapper when not a match", async () => {
    const uri = new Uri("test/not-a-match");

    let wrapperResult = await PluginPackage.from(() => ({})).createWrapper();
    if (!wrapperResult.ok) {
      throw wrapperResult.error;
    }

    const client = new PolywrapCoreClient({
      resolver: new WrapperResolver(
        Uri.from("test/wrapper"),
        wrapperResult.value
      ),
    });

    let resolutionContext = new UriResolutionContext();
    let result = await client.tryResolveUri({ uri, resolutionContext });

    await expectHistory(
      resolutionContext.getHistory(),
      "wrapper-resolver",
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
