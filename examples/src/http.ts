import { PolywrapClient, PolywrapClientConfigBuilder } from "@polywrap/client-js";
import { httpPlugin } from "@polywrap/http-plugin-js"
import { Uri } from "@polywrap/core-js";

interface Response {
  status: Number
  statusText: String
  headers: Map<String, String> | undefined
  body: String | undefined
}

const main = async () => {
  const { uri } = Uri.from("plugin/http")
  const builder = new PolywrapClientConfigBuilder()
  builder.setPackage(uri, httpPlugin({}))
  const client = new PolywrapClient(builder.build())

  const getResult = await client.invoke<Response>({
    uri,
    method: "get",
    args: {
      url: "https://httpbin.org/get"
    }
  })

  if (!getResult.ok) {
    throw Error("Get method error: " + getResult.error)
  }
  console.log("Get method response: ", getResult.value)

  const postResult = await client.invoke<Response>({
    uri,
    method: "post",
    args: {
      url: "https://httpbin.org/post",
      request: {
        body: JSON.stringify({ item: "Hello world!" }),
        responseType: "TEXT"
      }
    }
  })

  if (!postResult.ok) {
    throw Error("Post method error: " + postResult.error)
  }
  console.log("Post method response: ", postResult.value)
}

main().then().catch(e => {
  console.error("Error in HTTP example: ", e)
})