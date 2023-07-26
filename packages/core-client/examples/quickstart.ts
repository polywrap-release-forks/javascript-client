import { PolywrapCoreClient } from "../build";

import { PolywrapClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { Uri } from "@polywrap/core-js";

export function instantiate(): PolywrapCoreClient {
  // $start: quickstart-instantiate
  const config = new PolywrapClientConfigBuilder().addDefaults().build();

  const client = new PolywrapCoreClient(config);
  // $end

  return client;
}

export async function invoke(): Promise<any> {
  const config = new PolywrapClientConfigBuilder().addDefaults().build();

  const client = new PolywrapCoreClient(config);

  // $start: quickstart-invoke
  const result = await client.invoke({
    uri: Uri.from("wrapscan.io/polywrap/logging@1.0"),
    method: "info",
    args: {
      message: "Hello World!",
    },
  });

  if (!result.ok) throw result.error;

  const value = result.value;
  // $end
  return value;
}
