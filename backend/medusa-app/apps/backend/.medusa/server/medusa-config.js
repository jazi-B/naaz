"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
const jwtSecret = process.env.JWT_SECRET;
const cookieSecret = process.env.COOKIE_SECRET;
if (process.env.NODE_ENV === 'production' && (!jwtSecret || !cookieSecret)) {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET and COOKIE_SECRET must be set in production environment!');
}
module.exports = (0, utils_1.defineConfig)({
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
        disable: false,
        vite: () => ({
            server: {
                allowedHosts: true,
            },
        }),
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFFakUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFBO0FBQ3hDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFBO0FBRTlDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxJQUFJLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO0lBQzNFLE1BQU0sSUFBSSxLQUFLLENBQUMsOEZBQThGLENBQUMsQ0FBQTtBQUNqSCxDQUFDO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFBLG9CQUFZLEVBQUM7SUFDNUIsYUFBYSxFQUFFO1FBQ2IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUNyQyxJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksNkNBQTZDO1lBQ2xGLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSw2Q0FBNkM7WUFDbEYsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLDZDQUE2QztZQUNoRixTQUFTLEVBQUUsU0FBUyxJQUFJLHFDQUFxQztZQUM3RCxZQUFZLEVBQUUsWUFBWSxJQUFJLHdDQUF3QztTQUN2RTtLQUNGO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNYLE1BQU0sRUFBRTtnQkFDTixZQUFZLEVBQUUsSUFBSTthQUNuQjtTQUNGLENBQUM7S0FDSDtDQUNGLENBQUMsQ0FBQSJ9