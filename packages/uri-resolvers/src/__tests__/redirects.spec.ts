import { Uri, CoreClient, UriResolutionContext } from "@polywrap/core-js";
import { ResultErr, ResultOk } from "@polywrap/result";
import { InfiniteLoopError, RecursiveResolver, UriResolver } from "../helpers";
import { StaticResolver } from "../static";

describe("redirects", () => {
  it("sanity - UriResolver", async () => {
    const uri1 = Uri.from("wrap://authority/some-uri1");
    const uri2 = Uri.from("wrap://authority/some-uri2");
    const resolver = UriResolver.from([{ from: uri1, to: uri2 }]);

    const redirectsResult = await resolver.tryResolveUri(
      uri1,
      {} as CoreClient,
      new UriResolutionContext()
    );

    expect(redirectsResult).toMatchObject(
      ResultOk({
        type: "uri",
        uri: {
          uri: uri2.uri,
        },
      })
    );
  });

  it("sanity - StaticResolver", async () => {
    const uri1 = Uri.from("wrap://authority/some-uri1");
    const uri2 = Uri.from("wrap://authority/some-uri2");
    const resolver = StaticResolver.from([{ from: uri1, to: uri2 }]);

    const redirectsResult = await resolver.tryResolveUri(
      uri1,
      {} as CoreClient,
      new UriResolutionContext()
    );

    expect(redirectsResult).toMatchObject(
      ResultOk({
        type: "uri",
        uri: {
          uri: uri2.uri,
        },
      })
    );
  });

  it("works with the redirect stack overrides - RecursiveResolver", async () => {
    const uri1 = Uri.from("wrap://authority/some-uri1");
    const uri2 = Uri.from("wrap://authority/some-uri2");
    const uri3 = Uri.from("wrap://authority/some-uri3");

    const resolver = RecursiveResolver.from([
      {
        from: uri1,
        to: uri2,
      },
      {
        from: uri2,
        to: uri3,
      },
    ]);

    const redirectsResult = await resolver.tryResolveUri(
      uri1,
      {} as CoreClient,
      new UriResolutionContext()
    );

    expect(redirectsResult).toMatchObject(
      ResultOk({
        type: "uri",
        uri: {
          uri: uri3.uri,
        },
      })
    );
  });

  it("works with the redirect stack overrides - RecursiveResolver with StaticResolver", async () => {
    const uri1 = Uri.from("wrap://authority/some-uri1");
    const uri2 = Uri.from("wrap://authority/some-uri2");
    const uri3 = Uri.from("wrap://authority/some-uri3");

    const resolver = RecursiveResolver.from(
      StaticResolver.from([
        {
          from: uri1,
          to: uri2,
        },
        {
          from: uri2,
          to: uri3,
        },
      ])
    );

    const redirectsResult = await resolver.tryResolveUri(
      uri1,
      {} as CoreClient,
      new UriResolutionContext()
    );

    expect(redirectsResult).toMatchObject(
      ResultOk({
        type: "uri",
        uri: {
          uri: uri3.uri,
        },
      })
    );
  });

  it("can not redirect to self - RecursiveResolver", async () => {
    const uri1 = Uri.from("wrap://authority/some-uri1");
    const uri2 = Uri.from("wrap://authority/some-uri2");

    const resolver = RecursiveResolver.from([
      {
        from: uri1,
        to: uri2,
      },
      {
        from: uri2,
        to: uri1,
      },
    ]);

    const redirectsResult = await resolver.tryResolveUri(
      uri1,
      {} as CoreClient,
      new UriResolutionContext()
    );

    expect(redirectsResult).toMatchObject(ResultErr({}));

    !redirectsResult.ok &&
      expect((redirectsResult.error as InfiniteLoopError).message).toContain(
        "An infinite loop was detected while resolving the URI"
      );
  });

  it("can not redirect to self - RecursiveResolver with StaticResolver", async () => {
    const uri1 = Uri.from("wrap://authority/some-uri1");
    const uri2 = Uri.from("wrap://authority/some-uri2");

    const resolver = RecursiveResolver.from(
      StaticResolver.from([
        {
          from: uri1,
          to: uri2,
        },
        {
          from: uri2,
          to: uri1,
        },
      ])
    );

    const redirectsResult = await resolver.tryResolveUri(
      uri1,
      {} as CoreClient,
      new UriResolutionContext()
    );

    expect(redirectsResult).toMatchObject(ResultErr({}));

    !redirectsResult.ok &&
      expect((redirectsResult.error as InfiniteLoopError).message).toContain(
        "An infinite loop was detected while resolving the URI"
      );
  });
});
