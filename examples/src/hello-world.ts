import {
  PolywrapClient,
  PolywrapClientConfigBuilder,
} from "@polywrap/client-js";
// import { loggerPlugin } from "@polywrap/logger-plugin-js";
import { Uri } from "@polywrap/core-js";

const main = async () => {
  // const { uri: pluginPackageUri } = Uri.from("wrapscan.io/polywrap/logger@1.0");
  const { uri: wrapUri } = Uri.from("wrapscan.io/polywrap/logging@1.0.0");
  const builder = new PolywrapClientConfigBuilder();
  builder.addBundle("sys");
  const client = new PolywrapClient(builder.build());

  const result = await client.invoke<boolean>({
    uri: wrapUri,
    method: "info",
    args: {
      message: "Hello from hello world wrap!",
    },
  });

  if (!result.ok) {
    throw Error("Log message error: " + result.error);
  }
};

main()
  .then()
  .catch((e) => {
    console.error("Error in Hello World example: ", e);
  });
