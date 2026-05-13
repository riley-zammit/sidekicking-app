import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const productCount = await db.product.count();

  if (productCount === 0) {
    const response = await admin.graphql(
      `#graphql
        query GetProducts {
          products(first: 10) {
            edges {
              node {
                id
                title
                handle
                description
                vendor
                status
                featuredImage {
                  url
                }
              }
            }
          }
        }`,
    );

    const responseJson = await response.json();
    const products = responseJson.data?.products?.edges || [];

    for (const edge of products) {
      const node = edge.node;
      await db.product.create({
        data: {
          shopifyId: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description || null,
          vendor: node.vendor || null,
          status: node.status || null,
          imageUrl: node.featuredImage?.url || null,
        },
      });
    }
  }

  const allProducts = await db.product.findMany({
    include: {
      reviews: true,
    },
  });

  return { products: allProducts };
};


export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Synced Products">
      <s-section heading="Products from your store">
        {products && products.length > 0 ? (
          <s-stack direction="block" gap="base">
            {products.map((product) => (
              <s-box
                key={product.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-stack direction="block" gap="tight">
                  <s-heading level={3}>{product.title}</s-heading>
                  <s-text>Handle: {product.handle}</s-text>
                  {product.vendor && <s-text>Vendor: {product.vendor}</s-text>}
                  {product.status && <s-text>Status: {product.status}</s-text>}
                  {product.description && (
                    <s-text>
                      Description:{" "}
                      {product.description.substring(0, 100)}
                      {product.description.length > 100 ? "..." : ""}
                    </s-text>
                  )}
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      style={{ maxWidth: "200px", height: "auto" }}
                    />
                  )}
                  <s-link href={`/app/reviews/${product.id}`}>
                    Reviews: {product.reviews?.length || 0}
                  </s-link>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        ) : (
          <s-paragraph>No products synced yet.</s-paragraph>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
