import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const jwtSecret = process.env.JWT_SECRET
const cookieSecret = process.env.COOKIE_SECRET

if (process.env.NODE_ENV === 'production' && (!jwtSecret || !cookieSecret)) {
  throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET and COOKIE_SECRET must be set in production environment!')
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3001,http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:3001",
      authCors: process.env.AUTH_CORS || "http://localhost:9000,http://localhost:3001",
      jwtSecret: jwtSecret || "supersecret_naaz_jwt_token_key_2026",
      cookieSecret: cookieSecret || "supersecret_naaz_cookie_token_key_2026",
    }
  },
  admin: {
    disable: false
  }
})
