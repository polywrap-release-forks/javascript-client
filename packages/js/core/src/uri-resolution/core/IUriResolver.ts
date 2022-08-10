import { IUriResolutionStep, UriResolutionResult } from ".";
import { Uri, Client, WrapperCache } from "../..";

export interface IUriResolver<TError = undefined> {
  name: string;
  tryResolveToWrapper(
    uri: Uri,
    client: Client,
    cache: WrapperCache,
    resolutionPath: IUriResolutionStep<TError>[]
  ): Promise<UriResolutionResult<TError>>;
}
