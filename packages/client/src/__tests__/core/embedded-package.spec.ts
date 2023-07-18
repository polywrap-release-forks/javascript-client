import fs from "fs";
import path from "path";
import { GetPathToTestWrappers } from "@polywrap/test-cases";
import { InMemoryFileReader, WasmPackage } from "@polywrap/wasm-js";
import { IWrapPackage } from "@polywrap/core-js";
import { Result, ResultErr, ResultOk } from "@polywrap/result";
import { PolywrapClient } from "../../PolywrapClient";
import { PolywrapClientConfigBuilder } from "@polywrap/client-config-builder-js";

jest.setTimeout(200000);

const wrapperPath = `${GetPathToTestWrappers()}/subinvoke/00-subinvoke/implementations/as`;
const wrapperUri = `fs/${wrapperPath}`;

describe("Embedded package", () => {
  it("can invoke an embedded package", async () => {
    const manifestBuffer = fs.readFileSync(path.join(wrapperPath, "wrap.info"));
    const wasmModuleBuffer = fs.readFileSync(
      path.join(wrapperPath, "wrap.wasm")
    );

    let wrapPackage = WasmPackage.from(manifestBuffer, wasmModuleBuffer);
    const config = new PolywrapClientConfigBuilder()
      .addDefaults()
      .setPackage(wrapperUri, wrapPackage)
      .build();
    const client = new PolywrapClient(config);

    const result = await client.invoke<string>({
      uri: wrapperUri,
      method: "add",
      args: {
        a: 1,
        b: 1,
      },
    });

    expect(result).toStrictEqual(ResultOk(2));
  });

  it("can get a file from wrapper", async () => {
    const manifestBuffer = fs.readFileSync(path.join(wrapperPath, "wrap.info"));
    const wasmModuleBuffer = fs.readFileSync(
      path.join(wrapperPath, "wrap.wasm")
    );
    const testFilePath = "hello.txt";
    const testFileText = "Hello Test!";

    const wrapPackage = WasmPackage.from(manifestBuffer, wasmModuleBuffer, {
      readFile: async (filePath): Promise<Result<Uint8Array, Error>> => {
        if (filePath === testFilePath) {
          return ResultOk(Buffer.from(testFileText, "utf-8"));
        } else {
          return ResultErr(new Error(`File not found: ${filePath}`));
        }
      },
    });

    await testEmbeddedPackageWithFile(wrapPackage, testFilePath, testFileText);
  });

  it("can add embedded wrapper through file reader", async () => {
    const manifestBuffer = fs.readFileSync(path.join(wrapperPath, "wrap.info"));
    const wasmModuleBuffer = fs.readFileSync(
      path.join(wrapperPath, "wrap.wasm")
    );
    const testFilePath = "hello.txt";
    const testFileText = "Hello Test!";

    const wrapPackage = WasmPackage.from({
      readFile: async (filePath): Promise<Result<Uint8Array, Error>> => {
        if (filePath === testFilePath) {
          return ResultOk(Buffer.from(testFileText, "utf-8"));
        } else if (filePath === "wrap.info") {
          return ResultOk(manifestBuffer);
        } else if (filePath === "wrap.wasm") {
          return ResultOk(wasmModuleBuffer);
        } else {
          return ResultErr(new Error(`File not found: ${filePath}`));
        }
      },
    });

    await testEmbeddedPackageWithFile(wrapPackage, testFilePath, testFileText);
  });

  it("can add embedded wrapper with async wrap manifest", async () => {
    const manifestBuffer = fs.readFileSync(path.join(wrapperPath, "wrap.info"));
    const wasmModuleBuffer = fs.readFileSync(
      path.join(wrapperPath, "wrap.wasm")
    );
    const testFilePath = "hello.txt";
    const testFileText = "Hello Test!";

    const wrapPackage = WasmPackage.from(
      InMemoryFileReader.fromWasmModule(wasmModuleBuffer, {
        readFile: async (filePath): Promise<Result<Uint8Array, Error>> => {
          if (filePath === testFilePath) {
            return ResultOk(Buffer.from(testFileText, "utf-8"));
          } else if (filePath === "wrap.info") {
            return ResultOk(manifestBuffer);
          } else {
            return ResultErr(new Error(`File not found: ${filePath}`));
          }
        },
      })
    );

    await testEmbeddedPackageWithFile(wrapPackage, testFilePath, testFileText);
  });

  it("can add embedded wrapper with async wasm module", async () => {
    const manifestBuffer = fs.readFileSync(path.join(wrapperPath, "wrap.info"));
    const wasmModuleBuffer = fs.readFileSync(
      path.join(wrapperPath, "wrap.wasm")
    );
    const testFilePath = "hello.txt";
    const testFileText = "Hello Test!";

    const wrapPackage = WasmPackage.from(manifestBuffer, {
      readFile: async (filePath): Promise<Result<Uint8Array, Error>> => {
        if (filePath === testFilePath) {
          return ResultOk(Buffer.from(testFileText, "utf-8"));
        } else if (filePath === "wrap.wasm") {
          return ResultOk(wasmModuleBuffer);
        } else {
          return ResultErr(new Error(`File not found: ${filePath}`));
        }
      },
    });

    await testEmbeddedPackageWithFile(wrapPackage, testFilePath, testFileText);
  });
});

const testEmbeddedPackageWithFile = async (
  wrapPackage: IWrapPackage,
  filePath: string,
  fileText: string
) => {
  const config = new PolywrapClientConfigBuilder()
    .addDefaults()
    .setPackage(wrapperUri, wrapPackage)
    .build();

  const client = new PolywrapClient(config);

  const expectedManifest = await fs.promises.readFile(
    `${wrapperPath}/wrap.info`
  );
  const receivedManifestResult = await client.getFile(wrapperUri, {
    path: "wrap.info",
  });
  expect(receivedManifestResult).toEqual(ResultOk(expectedManifest))

  const expectedWasmModule = await fs.promises.readFile(
    `${wrapperPath}/wrap.wasm`
  );
  const receivedWasmModuleResult = await client.getFile(wrapperUri, {
    path: "wrap.wasm",
  });
  expect(receivedWasmModuleResult).toEqual(ResultOk(expectedWasmModule))


  const receivedHelloFileResult = await client.getFile(wrapperUri, {
    path: filePath,
    encoding: "utf-8",
  });
  expect(receivedHelloFileResult).toEqual(ResultOk(fileText))
};
