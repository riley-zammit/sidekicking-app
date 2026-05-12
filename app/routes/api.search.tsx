import type { LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("RECEIVED SEARCH REQUEST");

  try {
    await authenticate.admin(request);
  } catch (error) {
    // If auth throws a Response (redirect), add CORS headers so the browser
    // doesn't block it before the extension can see the status.
    if (error instanceof Response) {
      const headers = new Headers(error.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        headers.set(key, value);
      }
      throw new Response(error.body, {
        status: error.status,
        statusText: error.statusText,
        headers,
      });
    }
    // For non-Response errors, return a proper CORS error response
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }

  const results = [
    { id: "1", type: "product", title: "Sample Product 1" },
    { id: "2", type: "product", title: "Sample Product 2" },
    { id: "3", type: "product", title: "Sample Product 3" },
    { id: "4", type: "product", title: "Sample Product 4" },
    { id: "5", type: "product", title: "Sample Product 5" },
  ];

  return Response.json(
    {
      results,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "1",
        endCursor: "5",
      },
    },
    { headers: corsHeaders },
  );
};
