#!/usr/bin/env bash
# Seed reviews for each product using Claude Haiku to generate review text.

set -euo pipefail

DB="./prisma/dev.sqlite"
# Reviews per product will be randomized 1–10 per product

if [[ ! -f "$DB" ]]; then
  echo "Database not found at $DB"
  exit 1
fi

products=$(sqlite3 "$DB" "SELECT id, title FROM Product;")

if [[ -z "$products" ]]; then
  echo "No products found. Sync products first."
  exit 1
fi

sentiments=("negative" "neutral" "positive")

# Reviewer pool with emails
reviewer_names=("Alex J." "Sam K." "Jordan M." "Taylor R." "Casey L." "Morgan P." "Drew T." "Quinn H." "Avery S." "Blake N.")
reviewer_emails=("alex.j@example.com" "sam.k@example.com" "jordan.m@example.com" "taylor.r@example.com" "casey.l@example.com" "morgan.p@example.com" "drew.t@example.com" "quinn.h@example.com" "avery.s@example.com" "blake.n@example.com")

echo "Seeding reviews..."

while IFS='|' read -r product_id product_title; do
  reviews_count=$((RANDOM % 10 + 1))
  echo "  Product: $product_title (id=$product_id) — $reviews_count reviews"

  for i in $(seq 1 $reviews_count); do
    sentiment_idx=$((RANDOM % 3))
    sentiment="${sentiments[$sentiment_idx]}"

    case "$sentiment" in
      negative) rating=$((RANDOM % 2 + 1)) ;;  # 1 or 2
      neutral)  rating=3 ;;
      positive) rating=$((RANDOM % 2 + 4)) ;;  # 4 or 5
    esac

    review_body=$(claude --model haiku -p \
      "Write a short, authentic customer review (1-2 sentences) for a product called \"$product_title\". Sentiment: $sentiment. Rating: $rating/5. Just the review text, nothing else." \
      < /dev/null)

    reviewer_idx=$((RANDOM % ${#reviewer_names[@]}))
    reviewer="${reviewer_names[$reviewer_idx]}"
    email="${reviewer_emails[$reviewer_idx]}"

    body_file=$(mktemp)
    printf '%s' "$review_body" > "$body_file"
    safe_reviewer="${reviewer//\'/\'\'}"

    sqlite3 "$DB" "INSERT INTO Review (productId, reviewerName, reviewerEmail, rating, body, createdAt, updatedAt)
      VALUES ($product_id, '$safe_reviewer', '$email', $rating, CAST(readfile('$body_file') AS TEXT), datetime('now'), datetime('now'));"
    rm -f "$body_file"

    echo "    [${i}] ${reviewer} <${email}> (${rating} stars, ${sentiment}): ${review_body:0:60}..."
  done
done <<< "$products"

echo "Done."
