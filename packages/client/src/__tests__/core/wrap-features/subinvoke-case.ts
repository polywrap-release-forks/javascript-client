import { GetPathToTestWrappers } from "@polywrap/test-cases";
import { PolywrapClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { PolywrapClient } from "../../../PolywrapClient";
import { ResultOk } from "@polywrap/result";

export const subinvokeCase = (implementation: string) => {
  describe("wrapper subinvocation", () => {
    test(implementation, async () => {
      const subinvokeUri = `file/${GetPathToTestWrappers()}/subinvoke/00-subinvoke/implementations/${implementation}`;
      const wrapperUri = `file/${GetPathToTestWrappers()}/subinvoke/01-invoke/implementations/${implementation}`;

      const config = new PolywrapClientConfigBuilder()
        .addDefaults()
        .setRedirect("ens/imported-subinvoke.eth", subinvokeUri)
        .build();
      const client = new PolywrapClient(config);

      const response = await client.invoke({
        uri: wrapperUri,
        method: "addAndIncrement",
        args: {
          a: 1,
          b: 1,
        },
      });

      expect(response).toEqual(ResultOk(3));
    });
  });
};
