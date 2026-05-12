import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/index.js' {
  interface SearchInput {
    /**
     * Search query string
     */
    query?: string;
    /**
     * Cursor for pagination - returns elements after this cursor
     */
    after?: string;
    /**
     * Number of results to return (default: 10)
     */
    first?: number;
    [k: string]: unknown;
  }

  interface SearchOutput {
    results?: {
      /**
       * Unique identifier for the result
       */
      id: string;
      /**
       * The type/category of the result
       */
      type: string;
      /**
       * Display title for the result
       */
      title?: string;
      [k: string]: unknown;
    }[];
    pageInfo?: {
      /**
       * Whether there are more results available
       */
      hasNextPage?: boolean;
      /**
       * Whether there are previous results available
       */
      hasPreviousPage?: boolean;
      /**
       * Cursor for the first item in results
       */
      startCursor?: string;
      /**
       * Cursor for the last item in results
       */
      endCursor?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }

  interface GetProductMetafieldsInput {
    [k: string]: unknown;
  }

  interface GetProductMetafieldsOutput {
    product?: {
      /**
       * The product ID
       */
      id?: string;
      /**
       * The product title
       */
      title?: string;
      metafield?: {
        /**
         * The metafield namespace
         */
        namespace?: string;
        /**
         * The metafield key
         */
        key?: string;
        /**
         * The metafield value
         */
        value?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    /**
     * Error message if the request failed
     */
    error?: string;
    [k: string]: unknown;
  }

  interface GetShopMetafieldsInput {
    [k: string]: unknown;
  }

  interface GetShopMetafieldsOutput {
    metafield?: {
      /**
       * The metafield namespace
       */
      namespace?: string;
      /**
       * The metafield key
       */
      key?: string;
      /**
       * The metafield value
       */
      value?: string;
      [k: string]: unknown;
    };
    /**
     * Error message if the request failed
     */
    error?: string;
    [k: string]: unknown;
  }

  interface GetProductMetafieldsByIdInput {
    [k: string]: unknown;
  }

  interface GetProductMetafieldsByIdOutput {
    product?: {
      /**
       * The product GID
       */
      id?: string;
      /**
       * The product title
       */
      title?: string;
      metafield?: {
        /**
         * The metafield namespace
         */
        namespace?: string;
        /**
         * The metafield key
         */
        key?: string;
        /**
         * The metafield value
         */
        value?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    /**
     * Error message if the request failed
     */
    error?: string;
    [k: string]: unknown;
  }

  interface ShopifyTools {
    /**
     * Search for data from this app's external data source
     */
    register(
      name: 'search',
      handler: (input: SearchInput) => SearchOutput | Promise<SearchOutput>,
    );
    /**
     * Fetch the metafield for the product with handle 'button-up-flounce-sleeve-shirt'
     */
    register(
      name: 'get_product_metafields',
      handler: (
        input: GetProductMetafieldsInput,
      ) => GetProductMetafieldsOutput | Promise<GetProductMetafieldsOutput>,
    );
    /**
     * Fetch the sidekicking.test_key metafield from the shop
     */
    register(
      name: 'get_shop_metafields',
      handler: (
        input: GetShopMetafieldsInput,
      ) => GetShopMetafieldsOutput | Promise<GetShopMetafieldsOutput>,
    );
    /**
     * Fetch the sidekicking.test_key metafield for product
     */
    register(
      name: 'get_product_metafields_by_id',
      handler: (
        input: GetProductMetafieldsByIdInput,
      ) =>
        | GetProductMetafieldsByIdOutput
        | Promise<GetProductMetafieldsByIdOutput>,
    );
  }

  const shopify: import('@shopify/ui-extensions/admin.app.tools.data').Api & {
    tools: ShopifyTools;
  };
  const globalThis: { shopify: typeof shopify };
}
