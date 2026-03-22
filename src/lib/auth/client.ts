import { createAuthClient } from 'better-auth/react';
import { phoneNumberClient, usernameClient, adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.BETTER_AUTH_URL,
  plugins: [phoneNumberClient(), usernameClient(), adminClient()],
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
