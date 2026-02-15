import { createAuthClient } from "better-auth/client";
import { 
  usernameClient,
  organizationClient,
  adminClient,
  twoFactorClient
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8787",
  plugins: [
    usernameClient(),
    organizationClient(),
    adminClient(),
    passkeyClient(),
    twoFactorClient(),
  ],
});

export type AuthClient = typeof authClient;
