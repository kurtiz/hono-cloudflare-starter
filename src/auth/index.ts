import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {createDB} from "../db";
import * as schema from "../db/schema/auth";
import {
    username,
    organization,
    admin,
    twoFactor
} from "better-auth/plugins";
import {passkey} from "@better-auth/passkey";

export function createAuth(connectionString: string) {
    const db = createDB(connectionString);

    return betterAuth({
        database: drizzleAdapter(db, {
            provider: "pg",
            schema: schema
        }),

        // Email & Password Configuration
        emailAndPassword: {
            enabled: true,
            sendResetPassword: async (data, request) => {
                // TODO: Implement email sending (SendGrid, Resend, etc.)
                console.log("Reset password email:", data);
            },
        },

        // Email Verification
        emailVerification: {
            sendOnSignUp: true,
            sendVerificationEmail: async (data, request) => {
                // TODO: Implement email verification
                console.log("Verification email:", data);
            },
        },

        // Social Providers
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
            linkedin: {
                clientId: process.env.LINKEDIN_CLIENT_ID!,
                clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            },
        },

        // Plugins
        plugins: [
            // Username plugin - allows users to have unique usernames
            username(),

            // Organization plugin - for teams/communities
            organization({
                allowUserToCreateOrganization: true,
            }),

            // Admin plugin - for user management
            admin(),

            // Passkey plugin - for passwordless authentication
            passkey(),

            // Two-factor authentication
            twoFactor({
                otpOptions: {
                    async sendOTP({user, otp}) {
                        // TODO: Implement OTP sending
                        console.log("2FA OTP for", user.email, ":", otp);
                    },
                },
            }),
        ],

        // Session Configuration
        session: {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 24, // 1 day
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60, // 5 minutes
            },
        },

        // Advanced Configuration
        advanced: {
            useSecureCookies: process.env.NODE_ENV === "production",
            crossSubDomainCookies: {
                enabled: true,
            },
        },

        // Trusted Origins (CORS)
        trustedOrigins: [
            "http://localhost:3000",     // Local development
            "http://localhost:5173",     // Vite default
            "http://localhost:19006",    // Expo web
            process.env.FRONTEND_URL!,   // Production web
            process.env.EXPO_APP_URL!,   // Production mobile
        ].filter(Boolean),

        // Rate Limiting
        rateLimit: {
            enabled: true,
            window: 60, // 1 minute window
            max: 100,   // 100 requests per window
            storage: "database",
        },

        // Account Configuration
        account: {
            accountLinking: {
                enabled: true,
                trustedProviders: ["google", "linkedin"],
            },
        },

        // User Configuration
        user: {
            changeEmail: {
                enabled: true,
                sendChangeEmailVerification: async (data) => {
                    console.log("Change email verification:", data);
                },
            },
            deleteUser: {
                enabled: true,
            },
        },
    });
}

export type Auth = ReturnType<typeof createAuth>;

// Default auth instance for better-auth CLI and general use
const auth = createAuth(process.env.DATABASE_URL || "");
export {auth};
export default auth;
