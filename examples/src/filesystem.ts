import {
  PolywrapClient,
  PolywrapClientConfigBuilder,
} from "@polywrap/client-js";
import { httpPlugin } from "@polywrap/http-plugin-js";
import { Uri } from "@polywrap/core-js";

const main = async () => {
  const { uri } = Uri.from("plugin/http");
  const builder = new PolywrapClientConfigBuilder();
  builder.setPackage(uri, httpPlugin({}));
  const client = new PolywrapClient(builder.build());

  const filePath = "./fs-example.txt";
  const data = "Hello world!";

  const writeFile = await client.invoke<boolean>({
    uri: uri,
    method: "writeFile",
    args: {
      path: filePath,
      data: new TextEncoder().encode(data),
    },
  });

  if (!writeFile.ok) {
    throw Error("Error writing file: " + writeFile.error);
  }

  console.log("File created!");

  const readFile = await client.invoke<Uint8Array>({
    uri,
    method: "readFile",
    args: {
      path: filePath,
    },
  });

  if (!readFile.ok) {
    throw Error("Error read file: " + readFile.error);
  }

  const decodedContent = new TextDecoder().decode(readFile.value);
  console.log("Content from file: " + decodedContent);

  const removeFile = await client.invoke<boolean>({
    uri,
    method: "rm",
    args: {
      path: filePath,
    },
  });

  if (!removeFile.ok) {
    throw Error("Error removing file file: " + removeFile.error);
  }

  console.log("File removed!");
};

main()
  .then()
  .catch((e) => {
    console.error("Error in file system example: ", e);
  });
