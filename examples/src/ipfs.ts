import {
  PolywrapClient,
  PolywrapClientConfigBuilder,
} from "@polywrap/client-js";
import { Uri } from "@polywrap/core-js";

const main = async () => {
  const { uri } = Uri.from("wrapscan.io/polywrap/ipfs-http-client@1.0");
  const ipfsProvider = "http://localhost:5001";
  const builder = new PolywrapClientConfigBuilder();
  builder.addBundle("sys");
  const client = new PolywrapClient(builder.build());

  const fileName = "hello-world.txt";
  const fileData = "Hello world!!!";
  const addFileResult = await client.invoke<{ hash: String }>({
    uri,
    method: "addFile",
    args: {
      data: {
        name: fileName,
        data: new TextEncoder().encode(fileData),
      },
      ipfsProvider,
    },
  });

  if (!addFileResult.ok) {
    throw Error("Add file method error: " + addFileResult.error);
  }
  console.log("File added!");
  console.log("Fetching from IPFS provider...");
  const catResult = await client.invoke<Uint8Array>({
    uri,
    method: "cat",
    args: {
      cid: addFileResult.value.hash,
      ipfsProvider,
    },
  });

  if (!catResult.ok) {
    throw Error("Cat method error: " + catResult.error);
  }

  console.log("Cat result: " + new TextDecoder().decode(catResult.value));
};

main()
  .then()
  .catch((e) => {
    console.error("Error in IPFS example: ", e);
  });
