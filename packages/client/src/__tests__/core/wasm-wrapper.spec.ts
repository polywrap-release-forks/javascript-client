import { msgpackEncode } from "@polywrap/msgpack-js";
import { GetPathToTestWrappers } from "@polywrap/test-cases";
import fs from "fs";
import { Uri, PolywrapClient, IWrapPackage } from "../..";
import { WrapManifest } from "@polywrap/wrap-manifest-types-js";
import { PluginModule, PluginPackage } from "@polywrap/plugin-js";
import { UriResolver } from "@polywrap/uri-resolvers-js";
import { PolywrapClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { mockPluginRegistration, ErrResult } from "../helpers";
import { ResultOk } from "@polywrap/result";

jest.setTimeout(200000);

const wrapperPath = `${GetPathToTestWrappers()}/subinvoke/00-subinvoke/implementations/rs`;
const wrapperUri = new Uri(`fs/${wrapperPath}`);

describe("wasm-wrapper", () => {
  const mockPlugin = (): IWrapPackage => {
    class MockPlugin extends PluginModule<{}> {
      add(_: unknown): string {
        return "plugin response";
      }
    }

    return new PluginPackage(new MockPlugin({}), {} as WrapManifest);
  };

  test("can invoke with string URI", async () => {
    const client = new PolywrapClient();
    const result = await client.invoke<number>({
      uri: wrapperUri.uri,
      method: "add",
      args: {
        a: 1,
        b: 1
      },
    });
    expect(result).toStrictEqual(ResultOk(2));
  });

  test("can invoke with typed URI", async () => {
    const client = new PolywrapClient();
    const result = await client.invoke<number, Uri>({
      uri: wrapperUri,
      method: "add",
      args: {
        a: 1,
        b: 1
      },
    });

    expect(result).toStrictEqual(ResultOk(2));
  });

  test("invoke with decode defaulted to true works as expected", async () => {
    const client = new PolywrapClient();
    const result = await client.invoke<number>({
      uri: wrapperUri.uri,
      method: "add",
      args: {
        a: 1,
        b: 1
      },
    });

    expect(result).toStrictEqual(ResultOk(2));
  });

  test("invoke with decode set to false works as expected", async () => {
    const client = new PolywrapClient();
    const result = await client.invoke({
      uri: wrapperUri,
      method: "add",
      args: {
        a: 1,
        b: 1
      },
      encodeResult: true,
    });

    expect(result).toEqual(ResultOk(msgpackEncode(2)));
  });

  it("should invoke wrapper with custom redirects", async () => {
    const config = new PolywrapClientConfigBuilder()
      .addDefaults()
      .setRedirect(wrapperUri.uri, "wrap://authority/mock.polywrap")
      .setPackage("wrap://authority/mock.polywrap", mockPlugin())
      .build();
    const client = new PolywrapClient(config);

    const result = await client.invoke({
      uri: wrapperUri,
      method: "add",
      args: {
        a: 1,
        b: 1
      },
    });

    expect(result).toEqual(ResultOk("plugin response"));
  });

  it("should allow clone + reconfigure of redirects", async () => {
    let builder = new PolywrapClientConfigBuilder()
      .add({
        packages: { "wrap://authority/mock.polywrap": mockPlugin() },
      })
      .addDefaults();

    const client = new PolywrapClient(builder.build());

    const clientResult = await client.invoke({
      uri: wrapperUri.uri,
      method: "add",
      args: {
        a: 1,
        b: 1
      },
    });

    expect(clientResult).toEqual(ResultOk(2));

    const redirects = {
      [wrapperUri.uri]: "wrap://authority/mock.polywrap",
    };

    builder = builder.add({ redirects });

    const newClient = new PolywrapClient(builder.build());

    const newClientResult = await newClient.invoke({
      uri: wrapperUri.uri,
      method: "add",
      args: {
        a: 1,
        b: 1
      },
    });

    expect(newClientResult).toEqual(ResultOk("plugin response"));
  });

  test("get file from wrapper", async () => {
    const client = new PolywrapClient();

    const expectedManifest = new Uint8Array(
      await fs.promises.readFile(`${wrapperPath}/wrap.info`)
    );

    const receivedManifestResult = await client.getFile(wrapperUri, {
      path: "./wrap.info",
    });
    expect(receivedManifestResult).toEqual(ResultOk(expectedManifest));

    const expectedWasmModule = new Uint8Array(
      await fs.promises.readFile(`${wrapperPath}/wrap.wasm`)
    );

    const receivedWasmModuleResult = await client.getFile(wrapperUri, {
      path: "./wrap.wasm",
    });
    expect(receivedWasmModuleResult).toEqual(ResultOk(expectedWasmModule));

    const pluginClient = new PolywrapClient({
      resolver: UriResolver.from([
        mockPluginRegistration("authority/mock-plugin"),
      ]),
    });

    let pluginGetFileResult = await pluginClient.getFile(
      "authority/mock-plugin",
      {
        path: "./index.js",
      }
    );

    pluginGetFileResult = pluginGetFileResult as ErrResult;
    expect(pluginGetFileResult.error?.message).toContain(
      "client.getFile(...) is not implemented for Plugins."
    );
  });
});
