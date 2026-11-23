# Sidekicking

Sidekicking is a prototype Shopify app for managing product reviews and making review workflows available to Shopify Sidekick.

## What it does

- Installs as an embedded Shopify admin app.
- Imports the first 10 products from the connected store into a local SQLite database.
- Displays reviews for each imported product.
- Lets merchants create, update, and delete replies to reviews.
- Declares Sidekick capabilities for searching and managing product reviews and replies.
- Includes a sample authenticated search endpoint at `/api/search`.

> This is an early prototype. Reviews are currently stored locally and can be generated with the included seed script; they are not synced from a production review provider.

## Stack

- Shopify App React Router
- React Router 7
- Polaris web components
- Prisma 7
- SQLite
- TypeScript and Vite

## Local development

### Prerequisites

- Node.js `20.19+` or `22.12+`
- [pnpm](https://pnpm.io/)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- A Shopify development store

### Setup

```sh
git clone https://github.com/riley-zammit/sidekicking-app.git
cd sidekicking-app
pnpm install
printf 'DATABASE_URL="file:./prisma/dev.sqlite"\n' > .env
pnpm dev
```

Shopify CLI will prompt you to select or create an app and development store. Open the app once after installation to import products.

### Seed sample reviews

The seed script requires `sqlite3` and an authenticated [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) installation. It generates 1–10 sample reviews for every imported product.

```sh
./scripts/seed-reviews.sh
```

## Useful commands

```sh
pnpm dev        # Run through Shopify CLI
pnpm typecheck  # Generate route types and run TypeScript
pnpm lint       # Run ESLint
pnpm build      # Create a production build
pnpm migrate    # Create/apply a development Prisma migration
pnpm deploy     # Deploy Shopify app configuration
```

## Project structure

```text
app/routes/app._index.tsx              Product import and list
app/routes/app.reviews.$productId.tsx  Review and reply management
app/routes/api.search.tsx              Sample authenticated search endpoint
prisma/schema.prisma                   Session, product, and review models
scripts/seed-reviews.sh                AI-generated sample review data
shopify.app.toml                       Shopify and Sidekick configuration
```
