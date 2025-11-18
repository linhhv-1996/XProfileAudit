// File: src/hooks.server.ts
import { adminAuth } from '$lib/server/firebase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get('session');

  event.locals.user = null;

  if (sessionCookie) {
    try {
      // Verify cookie trên server
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      
      // Gán thông tin user vào locals để dùng ở mọi nơi (API, Page)
      event.locals.user = {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        picture: decodedClaims.picture
      };
    } catch (e) {
      // Cookie hết hạn hoặc fake -> Xóa đi
      event.locals.user = null;
    }
  }

  return resolve(event);
};
