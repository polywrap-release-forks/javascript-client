import { UriResolverInterface } from "../../../interfaces";
import { Uri, WrapperCache, Client, Invoker } from "../../../types";
import { UriResolver, UriResolutionStep, ResolveUriResult } from "../../core";
import { CreateWrapperFunc } from "./types/CreateWrapperFunc";
import { getEnvFromUriOrResolutionPath } from "../getEnvFromUriOrResolutionPath";

import {
  DeserializeManifestOptions,
  deserializeWrapManifest,
} from "@polywrap/wrap-manifest-types-js";
import { Tracer } from "@polywrap/tracing-js";

export class UriResolverWrapper implements UriResolver<void> {
  constructor(
    public readonly implementationUri: Uri,
    private readonly createWrapper: CreateWrapperFunc,
    private readonly deserializeOptions?: DeserializeManifestOptions
  ) {}

  public get name(): string {
    return UriResolverWrapper.name;
  }

  async tryResolveToWrapper(
    uri: Uri,
    client: Client,
    cache: WrapperCache,
    resolutionPath: UriResolutionStep[]
  ): Promise<ResolveUriResult<void>> {
    const result = await tryResolveUriWithImplementation(
      uri,
      this.implementationUri,
      client
    );

    if (!result) {
      return {
        uri,
      };
    }

    if (result.uri) {
      return {
        uri: new Uri(result.uri),
      };
    } else if (result.manifest) {
      // We've found our manifest at the current implementation,
      // meaning the URI resolver can also be used as an Wrapper resolver
      const manifest = await deserializeWrapManifest(
        result.manifest,
        this.deserializeOptions
      );

      const environment = getEnvFromUriOrResolutionPath(
        uri,
        resolutionPath,
        client
      );
      const wrapper = this.createWrapper(
        uri,
        manifest,
        this.implementationUri.uri,
        environment
      );

      return {
        uri,
        wrapper,
      };
    }

    return {
      uri,
    };
  }
}

const tryResolveUriWithImplementation = async (
  uri: Uri,
  implementationUri: Uri,
  invoker: Invoker
): Promise<UriResolverInterface.MaybeUriOrManifest | undefined> => {
  const { data } = await UriResolverInterface.module.tryResolveUri(
    invoker,
    implementationUri,
    uri
  );

  // If nothing was returned, the URI is not supported
  if (!data || (!data.uri && !data.manifest)) {
    Tracer.addEvent("continue", implementationUri.uri);
    return undefined;
  }

  return data;
};
