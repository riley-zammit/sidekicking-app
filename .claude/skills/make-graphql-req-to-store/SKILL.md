---
description: Making Direct GraphQL Requests to Shopify Admin API
globs: 
alwaysApply: false
---
---
description: 
globs: 
alwaysApply: false
---
# Making Direct GraphQL Requests to Shopify Admin API

This guide explains how to make GraphQL requests directly to Shopify's Admin API using credentials stored in a local app's database.

> **Important Note**: The AI assistant has access to Shopify Dev tools for documentation lookup. If you need information about API endpoints, schemas, or query structures, you can ask the assistant to:
> - Use the Shopify Dev MCP to search the GraphQL schema
> - Use the Shopify Dev MCP to find relevant documentation
> - Look up specific fields, mutations, or query structures
>
> These tools are valuable resources when constructing API requests and can help verify the correct structure before sending requests.

## Finding Your Local App credentials and Database

Use /sandbox-app as your playground app

1. Navigate to its prisma directory:
   ```bash
   cd ./apps/LOCAL_APP_NAME/prisma
   ```

2. Check for the SQLite database file:
   ```bash
   ls -la *.sqlite*
   ```
   Common database names include `dev.sqlite`, `development.sqlite`, or `data.sqlite`.

## Finding Database Credentials

The app uses SQLite for storing session data, including the Shopify access token:

1. Query the Session table to get the access token and shop URL:
   ```bash
   sqlite3 ./apps/LOCAL_APP_NAME/prisma/dev.sqlite "SELECT id, shop, accessToken FROM Session;"
   ```

2. This will return output in this format:
   ```
   offline_[shop-name].myshopify.com|[shop-name].myshopify.com|shpua_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

   The shop URL is the second field, and the access token is the third field.

## Making GraphQL Requests with curl

Once you have the shop URL and access token, you can make direct GraphQL requests using curl:

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-10/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { ... your query here ... }"}'
```

For better readability, pipe the output to `jq`:

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-10/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { ... your query here ... }"}' | jq
```

> **Note**: Always use the latest API version (currently 2025-10) to ensure access to the most recent features and improvements.

## Basic Examples

### Query Shop Information

Get basic information about the shop:

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-10/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { shop { id name email url primaryDomain { url host } plan { displayName } } }"}' | jq
```

### List Products

Get a list of the first 5 products:

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-10/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { products(first: 5) { edges { node { id title handle status variants(first: 1) { edges { node { id price } } } } } } }"}' | jq
```

### Create a Product

Create a new product:

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-04/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "query":"mutation productCreate($input: ProductInput!) { productCreate(input: $input) { product { id title variants(first: 5) { edges { node { id price } } } } userErrors { field message } } }",
    "variables": {
      "input": {
        "title": "New Test Product",
        "descriptionHtml": "<p>Test product description</p>",
        "productType": "Test",
        "vendor": "Test Vendor",
        "variants": [
          {
            "price": "19.99",
            "inventoryQuantities": {
              "availableQuantity": 100,
              "locationId": "gid://shopify/Location/YOUR_LOCATION_ID"
            }
          }
        ]
      }
    }
  }' | jq
```

## Advanced Examples

### Query Fulfillment Services

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-04/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"query GetFulfillmentServices { shop { fulfillmentServices { id type location { id name } serviceName fulfillmentOrdersOptIn callbackUrl permitsSkuSharing inventoryManagement } } }"}' | jq
```

### Query Store Locations

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-04/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"query GetLocations { locations(first: 10) { nodes { id name address { address1 address2 city zip province country } fulfillsOnlineOrders } } }"}' | jq
```

### Query Unfulfilled Orders

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-04/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"query GetUnfulfilledOrders { orders(first: 5, query: \"fulfillment_status:unfulfilled\") { nodes { id name displayFulfillmentStatus createdAt totalPriceSet { shopMoney { amount currencyCode } } } } }"}' | jq
```

### Create a Draft Order

This example shows how to create a draft order with a product assigned to a fulfillment service.
Note that this requires the `write_draft_orders` scope.

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-04/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "query":"mutation CreateDraftOrder($input: DraftOrderInput!) { draftOrderCreate(input: $input) { draftOrder { id order { id name } totalPrice lineItems(first: 1) { edges { node { id title quantity } } } } userErrors { field message } } }",
    "variables": {
      "input": {
        "lineItems": [
          {
            "variantId": "gid://shopify/ProductVariant/VARIANT_ID",
            "quantity": 1
          }
        ],
        "shippingLine": {
          "title": "Custom Shipping",
          "price": "10.00"
        },
        "tags": ["custom-fulfillment"],
        "customAttributes": [
          {
            "key": "fulfillment_service",
            "value": "Your Fulfillment Service"
          }
        ],
        "note": "Order to be fulfilled by custom fulfillment service"
      }
    }
  }' | jq
```

## Working with Variables

For queries with variables, include them in your request:

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-04/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"query GetOrder($id: ID!) { order(id: $id) { id name } }", "variables": {"id": "gid://shopify/Order/1234567890"}}' | jq
```

## Using Shopify Dev Tools for Schema Information

Remember that you can use the Shopify Dev tools to look up API documentation:

1. The AI assistant has access to the `mcp_Shopify_Dev_introspect_admin_schema` tool to search the GraphQL schema
2. The `mcp_Shopify_Dev_search_dev_docs` tool can be used to search Shopify documentation
3. You can ask the agent to search for specific query or mutation details

These tools can help you construct proper queries and understand available fields without having to guess the schema structure.

## Schema Exploration

You can use the GraphiQL interface included with most Shopify apps for schema exploration:
- GraphiQL URL: http://localhost:{PORT}/graphiql (check your app for the correct port)

Use GraphiQL to help construct queries that you can then execute via curl.

## Running Mutations

To create, update, or delete resources, use GraphQL mutations. For example, to register a fulfillment service:

```bash
curl -s -X POST "https://[shop-name].myshopify.com/admin/api/2025-04/graphql.json" \
  -H "X-Shopify-Access-Token: shpua_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation CreateFulfillmentService { fulfillmentServiceCreate(name: \"My Fulfillment Service\", callbackUrl: \"https://example.com/callback\", fulfillmentOrdersOptIn: true) { fulfillmentService { id serviceName } userErrors { field message } } }"}'
```

## Troubleshooting

If you encounter errors, check:

1. **Access Token Validity**: Ensure the access token hasn't expired
2. **API Version**: Confirm you're using a supported API version
3. **Permission Scopes**: Verify your app has the necessary scopes for the operation
4. **Field Names**: Confirm that the fields exist in the schema (use GraphiQL to check)
5. **No Local Apps**: If you don't have any local apps installed, you'll need to create one and install it on at least one Shopify store to get an access token

Remember that direct API access bypasses the app's error handling, so be careful with mutations that modify data.

## Finding Database in Alternative Locations

If you can't find the database in the standard location, try these alternatives:

1. Check the app's configuration files (e.g., `.env`) for database connection strings
2. Other common locations include:
   - `/.data/sqlite.db`
   - `db/development.sqlite3`

3. You can search for SQLite files in your app directory:
   ```bash
   find /sandbox-app -name "*.sqlite" -o -name "*.sqlite3" -o -name "*.db"
   ``` 