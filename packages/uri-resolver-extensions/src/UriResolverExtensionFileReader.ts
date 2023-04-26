import {
  CoreClient,
  combinePaths,
  InvokeOptions,
  InvokeResult,
  Uri,
  UriResolverInterface,
  Wrapper,
} from "@polywrap/core-js";
import { IFileReader } from "@polywrap/wasm-js";
import { Result, ResultErr } from "@polywrap/result";

// $start: UriResolverExtensionFileReader
/** An IFileReader that reads files by invoking URI Resolver Extension wrappers */
export class UriResolverExtensionFileReader implements IFileReader /* $ */ {

  private _fileCache: Map<
    string,
    Promise<Result<Uint8Array, Error>>
  > = new Map();

  // $start: UriResolverExtensionFileReader-constructor
  /**
   * Construct a UriResolverExtensionFileReader
   *
   * @param _resolverExtensionUri - URI of the URI Resolver Extension wrapper
   * @param _wrapperUri - URI of the wrap package to read from
   * @param _client - A CoreClient instance
   * */
  constructor(
    private readonly _resolverExtensionUri: Uri,
    private readonly _wrapperUri: Uri,
    private readonly _client: CoreClient
  ) /* $ */ {}

  // $start: UriResolverExtensionFileReader-readFile
  /**
   * Read a file
   *
   * @param filePath - the file's path from the wrap package root
   *
   * @returns a Result containing a buffer if successful, or an error
   * */
  async readFile(filePath: string): Promise<Result<Uint8Array, Error>> /* $ */ {
    const path = combinePaths(this._wrapperUri.path, filePath);

    // If the file has already been requested
    const existingFile = this._fileCache.get(path);

    if (existingFile) {
      return existingFile;
    }

    // else, create a new read file request
    const getFileRequest = new Promise<Result<Uint8Array, Error>>(
      async (resolve) => {
        const result = await UriResolverInterface.module.getFile(
          {
            invoke: <TData = unknown>(
              options: InvokeOptions
            ): Promise<InvokeResult<TData>> => this._client.invoke<TData>(options),
            invokeWrapper: <TData = unknown>(
              options: InvokeOptions & { wrapper: Wrapper }
            ): Promise<InvokeResult<TData>> =>
              this._client.invokeWrapper<TData>(options),
          },
          this._resolverExtensionUri,
          path
        );
        if (!result.ok) {
          resolve(result);
        } else if (!result.value) {
          resolve(ResultErr(
            new Error(
              `File not found at ${path} using resolver ${this._resolverExtensionUri.uri}`
            )
          ));
        } else {
          resolve({
            value: result.value,
            ok: true,
          });
        }
      }
    );

    this._fileCache.set(path, getFileRequest);

    return getFileRequest;
  }
}
