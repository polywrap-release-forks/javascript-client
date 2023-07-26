import {
  getImplementations,
  Uri,
  IUriRedirect,
  UriPackageOrWrapper,
} from "../";
import { CoreClient, UriMap } from "../types";
import { Result, ResultOk } from "@polywrap/result";

const getClient = (redirects: IUriRedirect[]): CoreClient => {
  return {
    tryResolveUri: async ({
      uri,
    }: {
      uri: Uri;
    }): Promise<Result<UriPackageOrWrapper, unknown>> => {
      while (true) {
        const redirect = redirects.find((x) => uri.uri === x.from.uri);
        if (redirect) {
          uri = redirect.to;
        } else {
          return ResultOk({
            type: "uri",
            uri,
          });
        }
      }
    },
  } as CoreClient;
};

describe("getImplementations", () => {
  it("works with complex redirects", async () => {
    const interface1Uri = "wrap://authority/some-interface1";
    const interface2Uri = "wrap://authority/some-interface2";
    const interface3Uri = "wrap://authority/some-interface3";

    const implementation1Uri = "wrap://authority/some-implementation";
    const implementation2Uri = "wrap://authority/some-implementation2";
    const implementation3Uri = "wrap://authority/some-implementation3";

    const redirects: IUriRedirect[] = [
      {
        from: new Uri(interface1Uri),
        to: new Uri(interface2Uri),
      },
      {
        from: new Uri(implementation1Uri),
        to: new Uri(implementation2Uri),
      },
      {
        from: new Uri(implementation2Uri),
        to: new Uri(implementation3Uri),
      },
    ];

    const interfaces: UriMap<readonly Uri[]> = new UriMap([
      [
        Uri.from(interface1Uri),
        [Uri.from(implementation1Uri), Uri.from(implementation2Uri)],
      ],
      [Uri.from(interface2Uri), [Uri.from(implementation3Uri)]],
      [Uri.from(interface3Uri), [Uri.from(implementation3Uri)]],
    ]);

    const getImplementationsResult1 = await getImplementations(
      new Uri(interface1Uri),
      interfaces,
      getClient(redirects)
    );
    const getImplementationsResult2 = await getImplementations(
      new Uri(interface2Uri),
      interfaces,
      getClient(redirects)
    );
    const getImplementationsResult3 = await getImplementations(
      new Uri(interface3Uri),
      interfaces,
      getClient(redirects)
    );

    expect(getImplementationsResult1).toEqual(
      ResultOk([
        new Uri(implementation1Uri),
        new Uri(implementation2Uri),
        new Uri(implementation3Uri),
      ])
    );

    expect(getImplementationsResult2).toEqual(
      ResultOk([
        new Uri(implementation1Uri),
        new Uri(implementation2Uri),
        new Uri(implementation3Uri),
      ])
    );

    expect(getImplementationsResult3).toEqual(
      ResultOk([new Uri(implementation3Uri)])
    );
  });

  it("interface implementations are not redirected", async () => {
    const interface1Uri = "wrap://authority/some-interface1";

    const implementation1Uri = "wrap://authority/some-implementation";
    const implementation2Uri = "wrap://authority/some-implementation2";

    const redirects: IUriRedirect[] = [
      {
        from: new Uri(implementation1Uri),
        to: new Uri(implementation2Uri),
      },
    ];

    const interfaces: UriMap<readonly Uri[]> = new UriMap([
      [Uri.from(interface1Uri), [Uri.from(implementation1Uri)]],
    ]);

    const result = await getImplementations(
      new Uri(interface1Uri),
      interfaces,
      getClient(redirects)
    );

    expect(result).toEqual(ResultOk([new Uri(implementation1Uri)]));
  });
});
