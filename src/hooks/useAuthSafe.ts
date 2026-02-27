/**
 * Safe auth hooks that work with or without ClerkProvider.
 * When Clerk key is not configured (e.g. EAS builds without .env),
 * these return safe defaults instead of crashing.
 */
import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/clerk-expo";

let _authEnabled = false;

export function setAuthEnabled(enabled: boolean) {
  _authEnabled = enabled;
}

export function useAuth() {
  if (!_authEnabled) {
    return { isSignedIn: false, userId: null, signOut: async () => {} };
  }
  return useClerkAuth();
}

export function useUser() {
  if (!_authEnabled) {
    return { user: null };
  }
  return useClerkUser();
}
