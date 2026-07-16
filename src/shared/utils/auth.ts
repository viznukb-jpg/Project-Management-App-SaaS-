interface CookieStore {
  get(name: string): { value: string } | undefined;
}

/**
 * Extracts the NextAuth / Auth.js session token from cookie store.
 * Works both with request.cookies in Middleware and cookies() in Server Components.
 */
export function getTokenFromCookies(cookies: CookieStore): string | undefined {
  return (
    cookies.get('authjs.session-token')?.value ||
    cookies.get('__Secure-authjs.session-token')?.value ||
    cookies.get('next-auth.session-token')?.value ||
    cookies.get('__Secure-next-auth.session-token')?.value
  );
}
