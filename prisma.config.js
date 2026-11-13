require('dotenv').config()
const { defineConfig } = require('prisma/config')

// The app's tables live in the "legacy" schema (see src/app/utils/prisma.ts);
// "public" belongs to another app. Point the Prisma CLI at "legacy" too, so
// migrate / db push / studio never touch the other app's tables.
function cliDatabaseUrl() {
  const raw = process.env.DATABASE_URL
  if (!raw) return raw
  const url = new URL(raw)
  url.searchParams.set('schema', 'legacy')
  return url.toString()
}

module.exports = defineConfig({
  datasource: {
    url: cliDatabaseUrl(),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --transpile-only seed/seed.ts',
  },
})
