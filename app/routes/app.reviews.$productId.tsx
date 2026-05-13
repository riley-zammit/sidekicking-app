import { useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { data, useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import db from "../db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const productId = Number(params.productId);
  if (!Number.isInteger(productId)) {
    throw data("Invalid product id", { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    throw data("Product not found", { status: 404 });
  }

  return { product };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const productId = Number(params.productId);
  if (!Number.isInteger(productId)) {
    throw data("Invalid product id", { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const reviewId = Number(formData.get("reviewId"));

  if (!Number.isInteger(reviewId)) {
    throw data("Invalid review id", { status: 400 });
  }

  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review || review.productId !== productId) {
    throw data("Review not found", { status: 404 });
  }

  if (intent === "save-reply") {
    const reply = String(formData.get("reply") ?? "").trim();
    if (!reply) {
      return data({ error: "Reply cannot be empty" }, { status: 400 });
    }
    await db.review.update({
      where: { id: reviewId },
      data: { reply, repliedAt: new Date() },
    });
    return { ok: true };
  }

  if (intent === "delete-reply") {
    await db.review.update({
      where: { id: reviewId },
      data: { reply: null, repliedAt: null },
    });
    return { ok: true };
  }

  throw data("Unknown intent", { status: 400 });
};

function ReviewCard({
  review,
}: {
  review: {
    id: number;
    reviewerName: string;
    reviewerEmail: string | null;
    rating: number;
    body: string;
    reply: string | null;
    repliedAt: Date | string | null;
    createdAt: Date | string;
  };
}) {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isSubmitting = fetcher.state !== "idle";
  const [replyText, setReplyText] = useState(review.reply ?? "");

  const saveReply = () => {
    fetcher.submit(
      {
        intent: "save-reply",
        reviewId: String(review.id),
        reply: replyText,
      },
      { method: "post" },
    );
  };

  const deleteReply = () => {
    fetcher.submit(
      {
        intent: "delete-reply",
        reviewId: String(review.id),
      },
      { method: "post" },
    );
  };

  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
      background="subdued"
    >
      <s-stack direction="block" gap="tight">
        <s-heading level={3}>{review.reviewerName}</s-heading>
        <s-text>Rating: {review.rating}/5</s-text>
        {review.reviewerEmail && (
          <s-text>Email: {review.reviewerEmail}</s-text>
        )}
        <s-text>{review.body}</s-text>
        <s-text>{new Date(review.createdAt).toLocaleDateString()}</s-text>

        <s-divider />

        {review.reply && (
          <s-box padding="base" borderRadius="base" background="base">
            <s-stack direction="block" gap="tight">
              <s-heading level={4}>Your reply</s-heading>
              <s-text>{review.reply}</s-text>
              {review.repliedAt && (
                <s-text>
                  Replied {new Date(review.repliedAt).toLocaleDateString()}
                </s-text>
              )}
            </s-stack>
          </s-box>
        )}

        <s-stack direction="block" gap="tight">
          <s-text-area
            label={review.reply ? "Edit reply" : "Write a reply"}
            value={replyText}
            onInput={(event: Event) => {
              const target = event.currentTarget as HTMLElement & {
                value: string;
              };
              setReplyText(target.value);
            }}
            rows={3}
          />
          {fetcher.data?.error && (
            <s-text tone="critical">{fetcher.data.error}</s-text>
          )}
          <s-stack direction="inline" gap="tight">
            <s-button
              onClick={saveReply}
              disabled={isSubmitting || replyText.trim().length === 0}
            >
              {review.reply ? "Update reply" : "Submit reply"}
            </s-button>
            {review.reply && (
              <s-button
                onClick={deleteReply}
                variant="secondary"
                tone="critical"
                disabled={isSubmitting}
              >
                Delete reply
              </s-button>
            )}
          </s-stack>
        </s-stack>
      </s-stack>
    </s-box>
  );
}

export default function ProductReviews() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <s-page
      heading={`Reviews for ${product.title}`}
      backAction={{ content: "Products", href: "/app" }}
    >
      <s-section
        heading={`${product.reviews.length} review${product.reviews.length === 1 ? "" : "s"}`}
      >
        {product.reviews.length > 0 ? (
          <s-stack direction="block" gap="base">
            {product.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </s-stack>
        ) : (
          <s-paragraph>No reviews yet for this product.</s-paragraph>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
