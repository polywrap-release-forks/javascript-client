/* eslint-disable @typescript-eslint/naming-convention */
/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Web3ApiManifest {
  /**
   * Polywrap manifest format version
   */
  format: "0.0.1-prealpha.2";
  /**
   * Reference to the repository holding source code.
   */
  repository?: string;
  /**
   * Path to the customized build manifest file.
   */
  build?: string;
  /**
   * Language in which the source code is written.
   */
  language: string;
  /**
   * Modules of Polywrap schema and implementation.
   */
  modules: {
    /**
     * Module for mutation operations.
     */
    mutation?: {
      /**
       * Path to graphql schema.
       */
      schema: string;
      /**
       * Path to Polywrap implementation.
       */
      module: string;
    };
    /**
     * Module for query operations.
     */
    query?: {
      /**
       * Path to graphql schema.
       */
      schema: string;
      /**
       * Path to Polywrap implementation.
       */
      module: string;
    };
  };
  /**
   * Redirects enabling the import of plugins.
   */
  import_redirects?: {
    /**
     * URI resolving to the plugin schema.
     */
    uri: string;
    /**
     * Graphql schema for imported plugin.
     */
    schema: string;
  }[];
  __type: "Web3ApiManifest";
}
