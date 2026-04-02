import { cookies } from 'next/headers';
import type { CookieMethodsServer } from '@supabase/ssr';

export async function getSupabaseCookies(): Promise<CookieMethodsServer> {
  const cookieStore = await cookies();
  
  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch (error) {
        // The `setAll` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing user sessions.
        // We log it at debug level to avoid silent failures while preventing noise.
        console.debug('Failed to set cookie from Server Component:', error);
      }
    },
  };
}
