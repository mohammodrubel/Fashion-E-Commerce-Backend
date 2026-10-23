require('dotenv').config()
const { defineConfig } = require('prisma/config')

module.exports = defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
})
