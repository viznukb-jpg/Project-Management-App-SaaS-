interface CookieStore {
  get(name: string): { value: string } | undefined;
}

export function getTokenFromCookies(cookies: CookieStore): string | undefined {
  return (
    cookies.get('authjs.session-token')?.value ||
    cookies.get('__Secure-authjs.session-token')?.value ||
    cookies.get('next-auth.session-token')?.value ||
    cookies.get('__Secure-next-auth.session-token')?.value
  );
}
